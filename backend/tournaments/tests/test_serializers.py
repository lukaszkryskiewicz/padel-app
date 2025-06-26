from django.test import TestCase

from backend.tournaments.logic.americano_single import generate_americano_round
from backend.tournaments.models import Tournament, Player, Match
from backend.tournaments.serializers import TournamentCreateSerializer, TournamentSerializer, MatchSerializer


class TournamentCreateSerializerTest(TestCase):
    def test_create_tournament_with_valid_data(self):
        data = {
            "title": "Testowe",
            "format": "Americano",
            "number_of_courts": 3,
            "points_per_match": 21,
            "players": [
                {"name": "Ania"},
                {"name": "Bartek"},
                {"name": "Celina"},
                {"name": "Dawid"},
            ]
        }

        serializer = TournamentCreateSerializer(data=data)

        # validating data
        self.assertTrue(serializer.is_valid(), serializer.errors)
        # saving to db
        tournament = serializer.save()

        self.assertEqual(tournament.title, "Testowe")
        self.assertEqual(tournament.format, "Americano")
        self.assertEqual(tournament.number_of_courts, 3)
        self.assertEqual(tournament.points_per_match, 21)

        # getting players form db, checking number and names
        players = Player.objects.filter(tournament=tournament)
        self.assertEqual(players.count(), 4)
        player_names = [p.name for p in players]
        self.assertIn("Ania", player_names)
        self.assertIn("Dawid", player_names)

    def test_duplicate_player_names(self):
        data = {
            "title": "Testowe",
            "format": "Americano",
            "number_of_courts": 3,
            "points_per_match": 21,
            "players": [
                {"name": "Ania"},
                {"name": "Celina"},
                {"name": "Ania"},
                {"name": "Dawid"},
            ]
        }

        serializer = TournamentCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())

        self.assertIn("players", serializer.errors)
        self.assertEqual(
            serializer.errors["players"][0],
            "Player names must be unique within a tournament."
        )

    def test_empty_player_list(self):
        data = {
            "title": "Testowe",
            "format": "Americano",
            "number_of_courts": 3,
            "points_per_match": 21,
            "players": []
        }

        serializer = TournamentCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())

        self.assertIn("players", serializer.errors)

    def test_wrong_tournament_format(self):
        data = {
            "title": "Testowe",
            "format": "WrongFormat",
            "number_of_courts": 3,
            "points_per_match": 21,
            "players": [
                {"name": "Ania"},
                {"name": "Celina"},
                {"name": "Ania"},
                {"name": "Dawid"},
            ]
        }

        serializer = TournamentCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())

        self.assertIn("format", serializer.errors)
        self.assertIn("is not a valid choice", serializer.errors["format"][0])

    def test_rejects_too_low_values_for_courts_and_points(self):
        data = {
            "title": "Testowe",
            "format": "WrongFormat",
            "number_of_courts": 0,
            "points_per_match": 0,
            "players": [
                {"name": "Ania"},
                {"name": "Celina"},
                {"name": "Ania"},
                {"name": "Dawid"},
            ]
        }

        serializer = TournamentCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())

        self.assertIn("number_of_courts", serializer.errors)
        self.assertIn("points_per_match", serializer.errors)

        self.assertIn("Ensure this value is greater than or equal to 1.", serializer.errors["number_of_courts"][0])
        self.assertIn("Ensure this value is greater than or equal to 1.", serializer.errors["points_per_match"][0])

    def test_rejects_too_high_values_for_courts_and_points(self):
        data = {
            "title": "Testowe",
            "format": "WrongFormat",
            "number_of_courts": 100,
            "points_per_match": 60,
            "players": [
                {"name": "Ania"},
                {"name": "Celina"},
                {"name": "Ania"},
                {"name": "Dawid"},
            ]
        }

        serializer = TournamentCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())

        self.assertIn("number_of_courts", serializer.errors)
        self.assertIn("points_per_match", serializer.errors)

        self.assertIn("Ensure this value is less than or equal to 25.", serializer.errors["number_of_courts"][0])
        self.assertIn("Ensure this value is less than or equal to 50.", serializer.errors["points_per_match"][0])

class TournamentSerializerTest(TestCase):
    def setUp(self):
        self.tournament = Tournament.objects.create(
            title="Turniej testowy",
            format="Americano",
            number_of_courts=2,
            points_per_match=21
        )

    def test_serialization_without_players(self):
        """Ensure players field is an empty list when no players are present."""
        serializer = TournamentSerializer(self.tournament)

        self.assertEqual(serializer.data['players'], [])


    def test_serialization_with_players(self):
        player_1 = Player.objects.create(name="Ania", tournament=self.tournament)
        player_2 = Player.objects.create(name="Robert", tournament=self.tournament)

        serializer = TournamentSerializer(self.tournament)

        expected_data = {
            'id': self.tournament.id,
            'title': "Turniej testowy",
            'format': "Americano",
            'number_of_courts': 2,
            'points_per_match': 21,
            'created_at': serializer.data['created_at'],
            'players': [
                {
                "id": player_1.id,
                "name": "Ania",
                "tournament": self.tournament.id
                },
                {
                    "id": player_2.id,
                    "name": "Robert",
                    "tournament": self.tournament.id
                }
            ]
        }

        self.assertEqual(serializer.data, expected_data)


class TestMatchSerializer(TestCase):
    def setUp(self):

        self.tournament = Tournament.objects.create(
            title="Turniej testowy",
            format="Americano",
            number_of_courts=1,
            points_per_match=21,
        )

        player_names = ["Ania", "Celina", "Roman", "Dawid", "Robert", "Olga", "Ela", "Piotr"]
        for name in player_names:
            Player.objects.create(name=name, tournament=self.tournament)

        generate_americano_round(self.tournament)

    def test_serializer_structure(self):
        match = Match.objects.filter(tournament = self.tournament).first()
        serializer = MatchSerializer(match)

        data = serializer.data

        expected_fields = [
            "id",
            "round_number",
            "court_number",
            "team_1_score",
            "team_2_score",
            "played",
            "players"
        ]

        for field in expected_fields:
            self.assertIn(field, data)

        self.assertEqual(len(data["players"]), 4)
        teams = [player["team"] for player in data["players"]]
        self.assertEqual(teams.count("team1"), 2)
        self.assertEqual(teams.count("team2"), 2)

    def test_match_players(self):
        # generate more matches
        generate_americano_round(self.tournament)
        matches = list(Match.objects.filter(tournament=self.tournament))

        self.assertEqual(len(matches), 4)

        for match in matches:
            serializer = MatchSerializer(match)
            data = serializer.data

            self.assertEqual(len(data["players"]), 4)
            teams = [player["team"] for player in data["players"]]
            self.assertEqual(teams.count("team1"), 2)
            self.assertEqual(teams.count("team2"), 2)


    def test_match_serializer_without_scores(self):
        match = Match.objects.filter(tournament=self.tournament).first()
        serializer = MatchSerializer(match)
        data = serializer.data

        self.assertIsNone(data["team_1_score"])
        self.assertIsNone(data["team_2_score"])
        self.assertFalse(data["played"])
