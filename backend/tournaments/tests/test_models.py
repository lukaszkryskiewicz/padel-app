from django.test import TestCase
from backend.tournaments.models import Tournament, Player
from django.db import IntegrityError

class TournamentModelTest(TestCase):
    def test_create_tournament_successfully(self):
        tournament = Tournament.objects.create(
            title="Test Tournament",
            format="Americano",
            number_of_courts=4,
            points_per_match=21
        )
        self.assertEqual(tournament.title, "Test Tournament")
        self.assertEqual(tournament.format, "Americano")
        self.assertEqual(tournament.number_of_courts, 4)
        self.assertEqual(tournament.points_per_match, 21)

class PlayerModelTest(TestCase):
    def setUp(self):
        self.tournament = Tournament.objects.create(
            title="Player Test Tournament",
            format="Americano",
            number_of_courts=4,
            points_per_match=21
        )
    def test_create_player_successfully(self):
        player = Player.objects.create(
            name = 'Testowy',
            tournament = self.tournament
        )
        self.assertEqual(player.name, 'Testowy')
        self.assertEqual(player.tournament, self.tournament)

    def test_players_name_duplicate(self):
        Player.objects.create(tournament=self.tournament, name="Testowy2")
        with self.assertRaises(IntegrityError):
            Player.objects.create(tournament=self.tournament, name="Testowy2")

    def test_same_players_in_different_tournaments(self):
        tournament = Tournament.objects.create(
            title="Player Test Tournament2",
            format="Mexicao",
            number_of_courts=4,
            points_per_match=21
        )

        Player.objects.create(tournament=self.tournament, name="Testowy3")
        try:
            Player.objects.create(tournament=tournament, name="Testowy3")
        except IntegrityError:
            self.fail("Should allow same player name in different tournaments")