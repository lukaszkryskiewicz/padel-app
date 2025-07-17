from django.core.exceptions import ValidationError
from django.test import TestCase

from backend.tournaments.factories.tournament_factories import TournamentFactory, TournamentWithRelationsFactory, \
    MatchFactory, MatchPlayerFactory
from backend.tournaments.models import Tournament, Player, Match, MatchPlayer, Court
from django.db import IntegrityError

class TournamentModelTest(TestCase):
    def test_create_tournament_successfully(self):
        """Should create a Tournament instance with valid data and default settings."""
        tournament = Tournament.objects.create(
            title="Test Tournament",
            format=Tournament.TournamentFormat.AMERICANO,
            result_sorting = Tournament.ResultSorting.POINTS,
            team_format = Tournament.TeamFormat.PLAYER,
            final_match = Tournament.FinalMatch.ONE_FOUR_VS_TWO_THREE,
            points_per_match=21
        )
        self.assertEqual(tournament.title, "Test Tournament")
        self.assertEqual(tournament.format, Tournament.TournamentFormat.AMERICANO)
        self.assertEqual(tournament.result_sorting, Tournament.ResultSorting.POINTS)
        self.assertEqual(tournament.team_format, Tournament.TeamFormat.PLAYER)
        self.assertEqual(tournament.final_match, Tournament.FinalMatch.ONE_FOUR_VS_TWO_THREE)
        self.assertEqual(tournament.points_per_match, 21)

    def test_tournament_str_returns_title_and_date(self):
        """Should return tournament title and created_at in __str__."""
        tournament = Tournament.objects.create(
            title="Example",
            format=Tournament.TournamentFormat.AMERICANO,
            result_sorting=Tournament.ResultSorting.POINTS,
            team_format=Tournament.TeamFormat.PLAYER,
            final_match=Tournament.FinalMatch.ONE_FOUR_VS_TWO_THREE,
            points_per_match=21
        )
        self.assertIn("Example", str(tournament))

    def test_rounds_field_updates(self):
        """Should update rounds field after incrementation"""
        tournament = TournamentFactory(rounds=2)
        self.assertEqual(tournament.rounds, 2)

        tournament.rounds += 1
        tournament.save()
        tournament.refresh_from_db()
        self.assertEqual(tournament.rounds, 3)

class PlayerModelTest(TestCase):
    def setUp(self):
        self.tournament = TournamentFactory()

    def test_create_player_successfully(self):
        """Should successfully create a Player linked to a Tournament."""
        player = Player.objects.create(
            name = 'Testowy',
            tournament = self.tournament
        )
        self.assertEqual(player.name, 'Testowy')
        self.assertEqual(player.tournament, self.tournament)

    def test_players_name_duplicate(self):
        """Should raise IntegrityError when two players in the same tournament share the same name."""
        Player.objects.create(tournament=self.tournament, name="Testowy2")
        with self.assertRaises(IntegrityError):
            Player.objects.create(tournament=self.tournament, name="Testowy2")

    def test_same_players_in_different_tournaments(self):
        """Should allow players with the same name in different tournaments."""
        tournament = TournamentFactory()

        Player.objects.create(tournament=self.tournament, name="Testowy3")
        try:
            Player.objects.create(tournament=tournament, name="Testowy3")
        except IntegrityError:
            self.fail("Should allow same player name in different tournaments")

    def test_player_str_returns_name_and_tournament_title(self):
        """Should return player name and tournament title in __str__."""
        player = Player.objects.create(name="Ania", tournament=self.tournament)
        self.assertIn("Ania", str(player))
        self.assertIn(self.tournament.title, str(player))

class MatchModelTest(TestCase):
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=4, courts=1)
        self.court = self.tournament.courts.first()

    def test_valid_match_passes_validation(self):
        """Should pass model-level validation with correct values."""
        match = MatchFactory(tournament=self.tournament)
        try:
            match.full_clean()
        except ValidationError:
            self.fail("Valid match should not raise ValidationError")

    def test_invalid_round_value(self):
        """Should raise error if round_number is out of allowed range."""
        match = MatchFactory (tournament=self.tournament, round_number=28)
        with self.assertRaises(ValidationError):
            match.full_clean()

    def test_invalid_team_scores(self):
        """Should raise error if team scores are below 0 or above 50."""
        match = Match(
            tournament=self.tournament,
            round_number=2,
            team_1_score=-100,  # below range
            team_2_score=55,  # above range
            played=True,
            court=self.court
        )
        with self.assertRaises(ValidationError):
            match.full_clean()

    def test_match_str_returns_round_info(self):
        """Should return round number in __str__."""
        match = MatchFactory(tournament=self.tournament, round_number=1)
        self.assertIn("R1", str(match))


class MatchPlayerModelTest(TestCase):
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=4, courts=1)
        self.court = self.tournament.courts.first()
        self.match = MatchFactory(tournament=self.tournament, court=self.court, played=True)
        self.players = list(self.tournament.players.all())

    def test_valid_match_with_four_players(self):
        """Should assign exactly 4 players to a match, 2 per team."""

        for i, player in enumerate(self.players):
            team = MatchPlayer.TeamChoices.TEAM1 if i < 2 else MatchPlayer.TeamChoices.TEAM2
            MatchPlayerFactory(match=self.match, player=player, team=team)
        self.assertEqual(self.match.players.count(), 4)

        team1_players = MatchPlayer.objects.filter(match=self.match, team=MatchPlayer.TeamChoices.TEAM1).count()
        team2_players = MatchPlayer.objects.filter(match=self.match, team=MatchPlayer.TeamChoices.TEAM2).count()

        self.assertEqual(team1_players, 2)
        self.assertEqual(team2_players, 2)

    def test_invalid_team_value_raises_validation_error(self):
        """Should raise ValidationError when the 'team' field has an invalid value."""
        match_player = MatchPlayer(match=self.match, player=self.players[2], team="wrong_format")

        with self.assertRaisesMessage(ValidationError, "is not a valid choice"):
            match_player.full_clean()

    def test_not_unique_team_members(self):
        """Should raise IntegrityError if the same player is assigned to the same match more than once."""
        MatchPlayer.objects.create(match=self.match, player=self.players[2], team=MatchPlayer.TeamChoices.TEAM1)

        # unique together is checked while saving to db, so full.clean() won't work
        with self.assertRaises(IntegrityError):
            MatchPlayer.objects.create(match=self.match, player=self.players[2], team=MatchPlayer.TeamChoices.TEAM2)

    def test_same_player_can_participate_in_different_matches(self):
        """Should allow the same player to participate in multiple matches within a tournament."""
        another_match = MatchFactory(tournament=self.tournament, court=self.court)

        MatchPlayer.objects.create(match=self.match, player=self.players[1], team=MatchPlayer.TeamChoices.TEAM1)

        try:
            MatchPlayer.objects.create(match=another_match, player=self.players[1], team=MatchPlayer.TeamChoices.TEAM2)
        except IntegrityError:
            self.fail("Player should be allowed to participate in different matches.")

    def test_match_player_str_displays_player_and_team(self):
        """Should include player name and team in MatchPlayer __str__."""
        mp = MatchPlayer.objects.create(match=self.match, player=self.players[0], team=MatchPlayer.TeamChoices.TEAM1)
        self.assertIn(self.players[0].name, str(mp))
        self.assertIn(MatchPlayer.TeamChoices.TEAM1, str(mp))

class RelationshipTest(TestCase):
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=4, courts=1, matches=1)
        self.court = self.tournament.courts.first()
        self.players = list(self.tournament.players.all())
        self.match = self.tournament.matches.first()


    def test_tournament_related_players(self):
        """Should access players through tournament.players related_name."""
        for player in self.players:
            self.assertIn(player, self.tournament.players.all())

    def test_tournament_related_matches(self):
        """Should access matches through tournament.matches related_name."""
        self.assertIn(self.match, self.tournament.matches.all())

    def test_player_related_matches(self):
        """Should access matches through player.matches related_name (via MatchPlayer)."""
        player = self.players[0]
        MatchPlayer.objects.create(match=self.match, player=player, team=MatchPlayer.TeamChoices.TEAM1)
        self.assertIn(self.match, player.matches.all())

class CascadeDeleteTest(TestCase):
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=4, courts=1, matches=1)
        self.court = self.tournament.courts.first()
        self.player = self.tournament.players.first()
        self.match = self.tournament.matches.first()
        MatchPlayerFactory(match=self.match, player=self.player, team=MatchPlayer.TeamChoices.TEAM1)

    def test_deleting_tournament_deletes_players_matches_courts_and_matchplayers(self):
        """Deleting a tournament should also delete its players, matches, courts and match players."""
        self.tournament.delete()

        self.assertEqual(Tournament.objects.count(), 0)
        self.assertEqual(Court.objects.count(),0)
        self.assertEqual(Player.objects.count(), 0)
        self.assertEqual(Match.objects.count(), 0)
        self.assertEqual(MatchPlayer.objects.count(), 0)