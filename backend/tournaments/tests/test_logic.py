from unittest import TestCase

from backend.tournaments.factories.tournament_factories import TournamentWithRelationsFactory, PlayerFactory, MatchPlayerFactory
from backend.tournaments.logic.americano_single import generate_americano_round
from backend.tournaments.logic.final_round import generate_final_round
from backend.tournaments.logic.ranking import create_ranking_snapshots, get_simplified_ranking, get_tournament_ranking
from backend.tournaments.models import Tournament, Player, Match, MatchPlayer, RankingSnapshot


class AmericanoLogicTest(TestCase):
    """
    Tests for core Americano tournament logic: round generation, player assignment,
    correct team balancing, and tournament status/round incrementation.
    """
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(courts=3)

        for i in range(12):
            PlayerFactory(name=f"Gracz{i + 1}", tournament=self.tournament)


    def test_generating_correct_number_of_matches_and_players_in_1st_round(self):
        """
        Should generate 3 matches (one per court) with 4 players each and increment number_of_rounds.
        """
        generate_americano_round(self.tournament)

        matches = Match.objects.filter(tournament=self.tournament)
        self.assertEqual(matches.count(), 3)
        for match in matches:
            self.assertEqual(match.round_number, 1)

        players_in_matches = MatchPlayer.objects.filter(match__in=matches)
        self.assertEqual(players_in_matches.count(), 12)

        self.assertEqual(self.tournament.number_of_rounds, 1)

    def test_each_match_has_4_players_divided_into_two_teams(self):
        """
        Each match should have exactly 4 players, with 2 per team after two rounds are generated.
        """
        # generate two rounds
        generate_americano_round(self.tournament)
        generate_americano_round(self.tournament)

        matches = Match.objects.filter(tournament=self.tournament)
        for match in matches:
            self.assertEqual(match.players.count(), 4)

            teams = list(MatchPlayer.objects.filter(match=match).values_list("team", flat=True))
            self.assertEqual(teams.count(MatchPlayer.TeamChoices.TEAM1), 2)
            self.assertEqual(teams.count(MatchPlayer.TeamChoices.TEAM2), 2)

    def test_if_round_number_increments(self):
        """
        Each call to generate_americano_round should increment number_of_rounds and create matches accordingly.
        """
        for i in range(1 , 11):
            generate_americano_round(self.tournament)

            matches = Match.objects.filter(tournament=self.tournament, round_number=i)
            self.assertEqual(matches.count(), 3)

            self.assertEqual(Match.objects.filter(tournament=self.tournament).count(), 3 * i)
            self.assertEqual(self.tournament.number_of_rounds, i)

    def test_when_players_number_is_lower_than_4_or_not_divisable_by_4(self):
        """
        Should not generate matches if there are less than 4 players or the count is not divisible by 4.
        """
        Player.objects.filter(tournament=self.tournament).delete()

        for i in range(11):
            Player.objects.create(name=f"Gracz{i + 1}", tournament=self.tournament)
            if Player.objects.filter(tournament=self.tournament).count() % 4 != 0:
                generate_americano_round(self.tournament)

        self.assertEqual(Player.objects.filter(tournament=self.tournament).count(), 11)
        self.assertEqual(Match.objects.filter(tournament=self.tournament).count(), 0)
        self.assertEqual(MatchPlayer.objects.filter(match__tournament=self.tournament).count(), 0)

    def test_generate_round_updates_status(self):
        """
        Should update tournament status to IN_PROGRESS after generating the first round.
        """
        tournament = TournamentWithRelationsFactory(players=4, courts=1, matches=0,
                                                    status=Tournament.TournamentStatus.NEW)

        generate_americano_round(tournament)
        tournament.refresh_from_db()

        self.assertEqual(tournament.status, Tournament.TournamentStatus.IN_PROGRESS)
        self.assertEqual(tournament.number_of_rounds, 1)

class TestGenerateFinalRound(TestCase):
    """
    Tests for generating the final round with correct player pairings
    according to the defined pairing logic for each final_match type.
    """
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=4, courts=1, matches=1)
        self.tournament.save()

        # Save round for snapshot
        self.match = self.tournament.matches.first()
        self.match.team_1_score = 21
        self.match.team_2_score = 19
        self.match.played = True
        self.match.save()

        self.pairing_logic = {
        1: [(0, 'team1'), (2, 'team1'), (1, 'team2'), (3, 'team2')],
        2: [(0, 'team1'), (1, 'team1'), (2, 'team2'), (3, 'team2')],
        3: [(0, 'team1'), (3, 'team1'), (1, 'team2'), (2, 'team2')],
    }

        players = list(self.tournament.players.all())
        MatchPlayer.objects.filter(match=self.match).delete()
        MatchPlayerFactory(match=self.match, player=players[0], team=MatchPlayer.TeamChoices.TEAM1)
        MatchPlayerFactory(match=self.match, player=players[1], team=MatchPlayer.TeamChoices.TEAM1)
        MatchPlayerFactory(match=self.match, player=players[2], team=MatchPlayer.TeamChoices.TEAM2)
        MatchPlayerFactory(match=self.match, player=players[3], team=MatchPlayer.TeamChoices.TEAM2)

        create_ranking_snapshots(self.tournament.id, self.match.round_number)

    def test_final_round_pairing_logic(self):
        """
        Should assign players to teams in the final match according to the defined pairing logic.
        """
        ranking = get_simplified_ranking(self.tournament.id)
        ranking_ids = [r['id'] for r in ranking]

        expected_pairing = self.pairing_logic[self.tournament.final_match]
        generate_final_round(self.tournament)

        final_match = Match.objects.get(tournament=self.tournament, round_number=self.tournament.final_round)

        match_players = MatchPlayer.objects.filter(match=final_match)
        # creates dict: player_id -> team
        actual_teams = {mp.player.id: mp.team for mp in match_players}

        for idx, team in expected_pairing:
            player_id = ranking_ids[idx]
            assert actual_teams[player_id] == team, f"Player {player_id} expected in {team}, got {actual_teams[player_id]}"

        teams = [mp.team for mp in match_players]
        assert teams.count('team1') == 2
        assert teams.count('team2') == 2

    def test_generate_final_round_creates_new_match(self):
        """
        Should create a new final round match with 4 players and 2 per team; round numbers must increment.
        """
        num_rounds_before = self.tournament.number_of_rounds
        generate_final_round(self.tournament)
        self.tournament.refresh_from_db()

        self.assertEqual(self.tournament.number_of_rounds, num_rounds_before + 1)
        self.assertEqual(self.tournament.number_of_rounds, self.tournament.final_round)

        new_round_matches = Match.objects.filter(tournament=self.tournament, round_number=self.tournament.final_round)
        self.assertEqual(new_round_matches.count(), 1)

        self.assertEqual(new_round_matches.first().players.count(), 4)

        teams = list(MatchPlayer.objects.filter(match=new_round_matches.first()).values_list("team", flat=True))
        self.assertEqual(teams.count(MatchPlayer.TeamChoices.TEAM1), 2)
        self.assertEqual(teams.count(MatchPlayer.TeamChoices.TEAM2), 2)

class TestRankingLogic(TestCase):
    """
    Tests for tournament ranking aggregation and snapshot logic.
    """
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=4, courts=1, matches=1)
        self.match = self.tournament.matches.first()

        self.match.team_1_score = 10
        self.match.team_2_score = 20
        self.match.played = True
        self.match.save()

        players = list(self.tournament.players.all())
        MatchPlayer.objects.filter(match=self.match).delete()
        MatchPlayerFactory(match=self.match, player=players[0], team=MatchPlayer.TeamChoices.TEAM1)
        MatchPlayerFactory(match=self.match, player=players[1], team=MatchPlayer.TeamChoices.TEAM1)
        MatchPlayerFactory(match=self.match, player=players[2], team=MatchPlayer.TeamChoices.TEAM2)
        MatchPlayerFactory(match=self.match, player=players[3], team=MatchPlayer.TeamChoices.TEAM2)

        create_ranking_snapshots(self.tournament.id, self.match.round_number)

    def test_get_tournament_ranking(self):
        """
        Should return detailed tournament ranking including id, total_points, rounds and win/loss record.
        """
        ranking = get_tournament_ranking(self.tournament.id)

        self.assertEqual(len(ranking), 4)

        player_test = ranking[0]
        self.assertIn("id", player_test)
        self.assertIn("total_points", player_test)
        self.assertIn("rounds", player_test)
        self.assertIn("win_loss_record", player_test)

    def test_get_simplified_ranking(self):
        """
        Should return simplified ranking containing only player IDs.
        """
        simplified = get_simplified_ranking(self.tournament.id)
        self.assertTrue(isinstance(simplified, list))
        self.assertEqual(len(simplified), 4)
        self.assertIn("id", simplified[0])

    def test_create_ranking_snapshots(self):
        """
        Should create ranking snapshots for each player in the match, including winner flags.
        """
        # delete current snapshot
        RankingSnapshot.objects.all().delete()
        create_ranking_snapshots(self.tournament.id, self.match.round_number)
        snapshots = RankingSnapshot.objects.filter(tournament=self.tournament)

        self.assertEqual(snapshots.count(), 4)

        winners = snapshots.filter(is_winner=True)
        self.assertEqual(winners.count(), 2)