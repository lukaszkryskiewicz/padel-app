from django.test import TestCase
from rest_framework import serializers

from backend.tournaments.models import Tournament, Player
from backend.tournaments.serializers import TournamentCreateSerializer
from django.db.utils import IntegrityError
from unittest.mock import patch

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
