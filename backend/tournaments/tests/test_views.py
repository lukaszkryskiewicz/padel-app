from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from backend.tournaments.models import Tournament, Player, Court, MatchPlayer
from backend.tournaments.factories.tournament_factories import (
    TournamentFactory, MatchPlayerFactory,
    MatchFactory, TournamentWithRelationsFactory
)


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
                {"name": "Central Court", "number": 1},
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


class TournamentRetrieveViewTests(APITestCase):
    """
    Tests for retrieving single tournament details by ID.
    """
    def setUp(self):
        self.tournament = TournamentFactory()

    def test_get_tournament_detail(self):
        """Should retrieve the details of a tournament by its ID."""
        url = reverse('tournament-retrieve', args=[self.tournament.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.tournament.id)


class MatchListViewTests(APITestCase):
    """
    Tests for listing matches for a given tournament via API.
    """
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=8, courts=2)
        self.match = MatchFactory(tournament=self.tournament, court=self.tournament.courts.first(), round_number=1)

    def test_get_matches_for_tournament(self):
        """Should list all matches for a given tournament."""
        url = reverse('match-list', args=[self.tournament.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.match.id)

class CurrentRoundMatchesViewTests(APITestCase):
    """
    Tests for retrieving matches from the current (latest) round for a tournament.
    """
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=8, courts=2)
        self.match = MatchFactory(tournament=self.tournament, court=self.tournament.courts.first())

    def test_get_matches_from_current_round(self):
        """Should return all matches from the current round for a given tournament."""
        url = reverse('current-round-matches', args=[self.tournament.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        self.tournament.refresh_from_db()
        self.assertEqual(response.data[0]['round_number'], self.match.round_number)

class SingleRoundMatchesViewTests(APITestCase):
    """
    Tests for retrieving matches for a specific round in a tournament.
    """
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=8, courts=2)
        self.match = MatchFactory(tournament=self.tournament, court=self.tournament.courts.first(), round_number=2)

    def test_get_matches_from_single_round(self):
        """Should return all matches from a given round number."""
        url = reverse('single-round-matches', args=[self.tournament.id, 2])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['round_number'], 2)


class MatchUpdateViewTests(APITestCase):
    """Tests for updating a single match via PATCH."""
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=4, courts=1)
        self.match = MatchFactory(
            tournament=self.tournament,
            court=self.tournament.courts.first(),
            round_number=1,
            played=False
        )

    def test_patch_single_match(self):
        """Should successfully update a match's result and mark as played."""
        url = reverse('single-match-update', args=[self.tournament.id, self.match.round_number])
        payload = {
            "id": self.match.id,
            "team_1_score": 20,
            "team_2_score": 18,
            "played": True,
            "updated_at": self.match.updated_at.isoformat(),
        }
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.match.refresh_from_db()
        self.assertTrue(self.match.played)
        self.assertEqual(self.match.team_1_score, 20)


class RoundResultsUpdateViewTests(APITestCase):
    """Tests for batch updating results for all matches in a round."""
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=4, courts=1, matches=1)
        self.match = self.tournament.matches.first()

    def test_patch_round_results(self):
        """Should update results for all matches in a round and mark as played."""
        url = reverse('round-results-update', args=[self.tournament.id, self.match.round_number])
        payload = {
            "results": [{
                "match_id": self.match.id,
                "team_1_score": 21,
                "team_2_score": 19,
                "played": True,
                "updated_at": self.match.updated_at.isoformat()
            }]
        }
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.match.refresh_from_db()
        self.assertTrue(self.match.played)
        self.assertEqual(self.match.team_1_score, 21)


class GenerateRoundViewTests(APITestCase):
    """Tests for generating a new round in a tournament"""
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=4, courts=1)

    def test_generate_round(self):
        """Should create a new round in the tournament (americano logic)."""
        url = reverse('generate-round', args=[self.tournament.id])
        payload = {"is_final": False}
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.tournament.refresh_from_db()
        self.assertGreaterEqual(self.tournament.number_of_rounds, 1)


class TournamentRankingViewTests(APITestCase):
    """
    Tests for retrieving the ranking of players for a tournament.
    """
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=4, courts=1, matches=1)

        #add score so that ranking is not empty
        self.match = self.tournament.matches.first()
        players = list(self.tournament.players.all())
        MatchPlayerFactory(match=self.match, player=players[0], team=MatchPlayer.TeamChoices.TEAM1)
        MatchPlayerFactory(match=self.match, player=players[1], team=MatchPlayer.TeamChoices.TEAM1)
        MatchPlayerFactory(match=self.match, player=players[2], team=MatchPlayer.TeamChoices.TEAM2)
        MatchPlayerFactory(match=self.match, player=players[3], team=MatchPlayer.TeamChoices.TEAM2)

        url = reverse('round-results-update', args=[self.tournament.id, self.match.round_number])
        payload = {
            "results": [{
                "match_id": self.match.id,
                "team_1_score": 5,
                "team_2_score": 16,
                "played": True,
                "updated_at": self.match.updated_at.isoformat(),
            }]
        }
        response = self.client.patch(url, payload, format='json')
        assert response.status_code == status.HTTP_200_OK

    def test_get_ranking(self):
        """Should return the player ranking for the tournament."""
        url = reverse('tournament-ranking', args=[self.tournament.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(isinstance(response.data, list))
        self.assertTrue(len(response.data) > 0)


class FinishTournamentViewTests(APITestCase):
    """
    Tests for marking a tournament as finished via PATCH endpoint.
    """
    def setUp(self):
        self.tournament = TournamentFactory()

    def test_finish_tournament(self):
        """Should update the tournament status to FINISHED."""
        url = reverse('finish-tournament', args=[self.tournament.id])
        response = self.client.patch(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.tournament.refresh_from_db()
        self.assertEqual(self.tournament.status, Tournament.TournamentStatus.FINISHED)