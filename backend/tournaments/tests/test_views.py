from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from backend.tournaments.models import Tournament, Player, Court


class TournamentViewTests(APITestCase):
    def setUp(self):
        """Prepare sample tournament data with players for POST requests."""
        self.tournament_data = {
            "title": "API Test Tournament",
            "format": "AMERICANO",
            "result_sorting": "WINS",
            "team_format": "PLAYER",
            "final_match": 1,
            "points_per_match": 21,
            "players": [
                {"name": "Ania"},
                {"name": "Bartek"},
                {"name": "Celina"},
                {"name": "Dawid"},
            ],
            "courts": [
                {
                    "name": "Central Court",
                    "number": 1
                 },
            ]
        }

    def create_tournament(self):
        """
        Helper function to create a tournament via POST request
        and return the response object.
        """
        url = reverse('tournament-list-create')
        return self.client.post(url, self.tournament_data, format='json')

    def test_create_tournament(self):
        """Should successfully create a tournament with 4 players."""
        response = self.create_tournament()
        print(response)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tournament.objects.count(), 1)
        self.assertEqual(Player.objects.count(), 4)
        self.assertEqual(Court.objects.count(), 1)

    def test_get_tournament_list(self):
        """Should return a list of existing tournaments."""
        self.create_tournament()
        url = reverse('tournament-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)