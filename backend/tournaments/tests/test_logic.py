from unittest import TestCase

from backend.tournaments.factories.tournament_factories import TournamentWithRelationsFactory
from backend.tournaments.logic.americano_single import generate_americano_round
from backend.tournaments.models import Tournament, Player, Match, MatchPlayer


class AmericanoLogicTest(TestCase):
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(courts=3)

        for i in range(12):
            Player.objects.create(name=f"Gracz{i + 1}", tournament=self.tournament)


    def test_generating_correct_number_of_matches_and_players_in_1st_round(self):
        generate_americano_round(self.tournament)

        matches = Match.objects.filter(tournament=self.tournament)
        self.assertEqual(matches.count(), 3)
        for match in matches:
            self.assertEqual(match.round_number, 1)

        players_in_matches = MatchPlayer.objects.filter(match__in=matches)
        self.assertEqual(players_in_matches.count(), 12)

        self.assertEqual(self.tournament.number_of_rounds, 1)

    def test_each_match_has_4_players_divided_into_two_teams(self):
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
        for i in range(1 , 11):
            generate_americano_round(self.tournament)

            matches = Match.objects.filter(tournament=self.tournament, round_number=i)
            self.assertEqual(matches.count(), 3)

            self.assertEqual(Match.objects.filter(tournament=self.tournament).count(), 3 * i)
            self.assertEqual(self.tournament.number_of_rounds, i)

    def test_when_players_number_is_lower_than_4_or_not_divisable_by_4(self):
        Player.objects.filter(tournament=self.tournament).delete()

        for i in range(11):
            Player.objects.create(name=f"Gracz{i + 1}", tournament=self.tournament)
            if Player.objects.filter(tournament=self.tournament).count() % 4 != 0:
                generate_americano_round(self.tournament)

        self.assertEqual(Player.objects.filter(tournament=self.tournament).count(), 11)
        self.assertEqual(Match.objects.filter(tournament=self.tournament).count(), 0)
        self.assertEqual(MatchPlayer.objects.filter(match__tournament=self.tournament).count(), 0)

    def test_generate_round_updates_status(self):
        tournament = TournamentWithRelationsFactory(players=4, courts=1, matches=0,
                                                    status=Tournament.TournamentStatus.NEW)

        generate_americano_round(tournament)
        tournament.refresh_from_db()

        self.assertEqual(tournament.status, Tournament.TournamentStatus.IN_PROGRESS)
        self.assertEqual(tournament.number_of_rounds, 1)