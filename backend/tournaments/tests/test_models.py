from django.core.exceptions import ValidationError
from django.test import TestCase

from backend.tournaments.models import Tournament, Player, Match, MatchPlayer
from django.db import IntegrityError

class TournamentModelTest(TestCase):
    def test_create_tournament_successfully(self):
        """Should create a Tournament instance with valid data and default settings."""
        tournament = Tournament.objects.create(
            title="Test Tournament",
            format=Tournament.TournamentFormat.AMERICANO,
            number_of_courts=4,
            points_per_match=21
        )
        self.assertEqual(tournament.title, "Test Tournament")
        self.assertEqual(tournament.format, Tournament.TournamentFormat.AMERICANO)
        self.assertEqual(tournament.number_of_courts, 4)
        self.assertEqual(tournament.points_per_match, 21)

    def test_tournament_str_returns_title_and_date(self):
        """Should return tournament title and created_at in __str__."""
        tournament = Tournament.objects.create(
            title="Example",
            format=Tournament.TournamentFormat.AMERICANO,
            number_of_courts=2,
            points_per_match=21
        )
        self.assertIn("Example", str(tournament))

class PlayerModelTest(TestCase):
    def setUp(self):
        self.tournament = Tournament.objects.create(
            title="Player Test Tournament",
            format=Tournament.TournamentFormat.AMERICANO,
            number_of_courts=4,
            points_per_match=21
        )
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
        tournament = Tournament.objects.create(
            title="Player Test Tournament2",
            format=Tournament.TournamentFormat.MEXICANO,
            number_of_courts=4,
            points_per_match=21
        )

        Player.objects.create(tournament=self.tournament, name="Testowy3")
        try:
            Player.objects.create(tournament=tournament, name="Testowy3")
        except IntegrityError:
            self.fail("Should allow same player name in different tournaments")

    def test_player_str_returns_name_and_tournament_title(self):
        """Should return player name and tournament title in __str__."""
        tournament = Tournament.objects.create(title="Str Test", format=Tournament.TournamentFormat.AMERICANO, number_of_courts=1, points_per_match=21)
        player = Player.objects.create(name="Ania", tournament=tournament)
        self.assertIn("Ania", str(player))
        self.assertIn("Str Test", str(player))

class MatchModelTest(TestCase):
    def setUp(self):
        self.tournament = Tournament.objects.create(
            title="Match Test Tournament",
            format=Tournament.TournamentFormat.AMERICANO,
            number_of_courts=4,
            points_per_match=21
        )

        player_names = ["Ania", "Celina", "Roman", "Dawid"]
        for name in player_names:
            Player.objects.create(name=name, tournament=self.tournament)

    def test_valid_match_passes_validation(self):
        """Should pass model-level validation with correct values."""
        match = Match(
            tournament=self.tournament,
            round_number=2,
            court_number=2,
            team_1_score=20,
            team_2_score=18,
            played=True
        )
        try:
            match.full_clean()
        except ValidationError:
            self.fail("Valid match should not raise ValidationError")

    def test_invalid_round_and_court_values(self):
        """Should raise error if round_number or court_number out of allowed range."""

        match = Match(
            tournament=self.tournament,
            round_number=28,
            court_number=0,
        )

        with self.assertRaises(ValidationError):
            match.full_clean()

    def test_invalid_team_scores(self):
        """Should raise error if team scores are below 0 or above 50."""
        match = Match(
            tournament=self.tournament,
            round_number=2,
            court_number=2,
            team_1_score=-1,
            team_2_score=55,
            played=True
        )

        with self.assertRaises(ValidationError):
            match.full_clean()

    def test_match_str_returns_round_and_court_info(self):
        """Should return round number and court number in __str__."""
        tournament = Tournament.objects.create(title="Str Test", format=Tournament.TournamentFormat.AMERICANO, number_of_courts=1, points_per_match=21)
        match = Match.objects.create(tournament=tournament, round_number=1, court_number=2)
        self.assertIn("R1", str(match))
        self.assertIn("Court 2", str(match))

class MatchPlayerModelTest(TestCase):
    def setUp(self):
        self.tournament = Tournament.objects.create(
            title="Match Player Test Tournament",
            format=Tournament.TournamentFormat.AMERICANO,
            number_of_courts=4,
            points_per_match=21
        )

        self.player1 = Player.objects.create(name="Ania", tournament=self.tournament)
        self.player2 = Player.objects.create(name="Basia", tournament=self.tournament)
        self.player3 = Player.objects.create(name="Celina", tournament=self.tournament)
        self.player4 = Player.objects.create(name="Dawid", tournament=self.tournament)

        self.match = Match.objects.create(
            tournament=self.tournament,
            round_number=1,
            court_number=1
        )



    def test_valid_match_with_four_players(self):
        """Should assign exactly 4 players to a match, 2 per team."""
        MatchPlayer.objects.create(match=self.match, player=self.player1, team=MatchPlayer.TeamChoices.TEAM1)
        MatchPlayer.objects.create(match=self.match, player=self.player2, team=MatchPlayer.TeamChoices.TEAM1)
        MatchPlayer.objects.create(match=self.match, player=self.player3, team=MatchPlayer.TeamChoices.TEAM2)
        MatchPlayer.objects.create(match=self.match, player=self.player4, team=MatchPlayer.TeamChoices.TEAM2)

        players = self.match.players.all()
        self.assertEqual(players.count(), 4)

        team1_players = MatchPlayer.objects.filter(match=self.match, team=MatchPlayer.TeamChoices.TEAM1).count()
        team2_players = MatchPlayer.objects.filter(match=self.match, team=MatchPlayer.TeamChoices.TEAM2).count()

        self.assertEqual(team1_players, 2)
        self.assertEqual(team2_players, 2)

    def test_invalid_team_value_raises_validation_error(self):
        """Should raise ValidationError when the 'team' field has an invalid value."""
        match_player = MatchPlayer(match=self.match, player=self.player2, team="wrong_format")

        with self.assertRaisesMessage(ValidationError, "is not a valid choice"):
            match_player.full_clean()

    def test_not_unique_team_members(self):
        """Should raise IntegrityError if the same player is assigned to the same match more than once."""
        MatchPlayer.objects.create(match=self.match, player=self.player2, team=MatchPlayer.TeamChoices.TEAM1)

        # unique together is checked while saving to db, so full.clean() won't work
        with self.assertRaises(IntegrityError):
            MatchPlayer.objects.create(match=self.match, player=self.player2, team=MatchPlayer.TeamChoices.TEAM2)

    def test_same_player_can_participate_in_different_matches(self):
        """Should allow the same player to participate in multiple matches within a tournament."""
        another_match = Match.objects.create(
            tournament=self.tournament,
            round_number=2,
            court_number=1
        )

        MatchPlayer.objects.create(match=self.match, player=self.player1, team=MatchPlayer.TeamChoices.TEAM1)

        try:
            MatchPlayer.objects.create(match=another_match, player=self.player1, team=MatchPlayer.TeamChoices.TEAM2)
        except IntegrityError:
            self.fail("Player should be allowed to participate in different matches.")

    def test_match_player_str_displays_player_and_team(self):
        """Should include player name and team in MatchPlayer __str__."""
        tournament = Tournament.objects.create(title="Team Test", format=Tournament.TournamentFormat.AMERICANO, number_of_courts=1, points_per_match=21)
        player = Player.objects.create(name="Ewa", tournament=tournament)
        match = Match.objects.create(tournament=tournament, round_number=1, court_number=1)
        mp = MatchPlayer.objects.create(match=match, player=player, team=MatchPlayer.TeamChoices.TEAM1)
        self.assertIn("Ewa", str(mp))
        self.assertIn(MatchPlayer.TeamChoices.TEAM1, str(mp))

class RelationshipTest(TestCase):
    def setUp(self):
        self.tournament = Tournament.objects.create(title="Rel Test", format=Tournament.TournamentFormat.AMERICANO, number_of_courts=1, points_per_match=21)
        self.player = Player.objects.create(name="Zosia", tournament=self.tournament)
        self.match = Match.objects.create(tournament=self.tournament, round_number=1, court_number=1)

    def test_tournament_related_players(self):
        """Should access players through tournament.players related_name."""
        self.assertIn(self.player, self.tournament.players.all())

    def test_tournament_related_matches(self):
        """Should access matches through tournament.matches related_name."""
        self.assertIn(self.match, self.tournament.matches.all())

    def test_player_related_matches(self):
        """Should access matches through player.matches related_name (via MatchPlayer)."""
        MatchPlayer.objects.create(match=self.match, player=self.player, team=MatchPlayer.TeamChoices.TEAM1)
        self.assertIn(self.match, self.player.matches.all())

class CascadeDeleteTest(TestCase):
    def setUp(self):
        self.tournament = Tournament.objects.create(
            title="Cascade Test",
            format=Tournament.TournamentFormat.AMERICANO,
            number_of_courts=1,
            points_per_match=21
        )
        self.player = Player.objects.create(name="Jan", tournament=self.tournament)
        self.match = Match.objects.create(tournament=self.tournament, round_number=1, court_number=1)
        MatchPlayer.objects.create(match=self.match, player=self.player, team=MatchPlayer.TeamChoices.TEAM1)

    def test_deleting_tournament_deletes_players_matches_and_matchplayers(self):
        """Deleting a tournament should also delete its players, matches, and match players."""
        self.tournament.delete()

        self.assertEqual(Tournament.objects.count(), 0)
        self.assertEqual(Player.objects.count(), 0)
        self.assertEqual(Match.objects.count(), 0)
        self.assertEqual(MatchPlayer.objects.count(), 0)