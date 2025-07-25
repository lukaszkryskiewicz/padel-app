from django.test import TestCase

from backend.tournaments.factories.tournament_factories import TournamentFactory, PlayerFactory, \
    TournamentWithRelationsFactory
from backend.tournaments.logic.americano_single import generate_americano_round
from backend.tournaments.models import Tournament, Player, Match, MatchPlayer
from backend.tournaments.serializers import TournamentCreateSerializer, TournamentSerializer, MatchSerializer, \
    MatchUpdateSerializer, RoundResultsSerializer


class TournamentCreateSerializerTest(TestCase):
    def setUp(self):
        self.data = {
            "title": "Testowe",
            "format": Tournament.TournamentFormat.AMERICANO,
            "status": Tournament.TournamentStatus.NEW,
            "result_sorting": Tournament.ResultSorting.WINS,
            "team_format": Tournament.TeamFormat.PLAYER,
            "final_match": Tournament.FinalMatch.ONE_THREE_VS_TWO_FOUR,
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

    """Tests for the TournamentCreateSerializer validating tournament creation and player handling."""
    def test_create_tournament_with_valid_data(self):
        """Should create tournament and players when valid data is provided."""
        serializer = TournamentCreateSerializer(data=self.data)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        tournament = serializer.save()

        self.assertEqual(tournament.title, "Testowe")
        self.assertEqual(tournament.format, Tournament.TournamentFormat.AMERICANO)
        self.assertEqual(tournament.points_per_match, 21)

        players = Player.objects.filter(tournament=tournament)
        self.assertEqual(players.count(), 4)
        self.assertQuerySetEqual(
            players.values_list('name', flat=True).order_by('name'),
            ["Ania", "Bartek", "Celina", "Dawid"]
        )


    def test_duplicate_player_names(self):
        """Should raise validation error when player names are not unique."""
        self.data['players'][2]['name'] = "Ania"

        serializer = TournamentCreateSerializer(data=self.data)
        self.assertFalse(serializer.is_valid())

        self.assertIn("players", serializer.errors)
        self.assertEqual(
            serializer.errors["players"][0],
            "Player names must be unique within a tournament."
        )

    def test_empty_player_list(self):
        """Should raise validation error when no players are provided."""
        self.data['players'] = []

        serializer = TournamentCreateSerializer(data=self.data)
        self.assertFalse(serializer.is_valid())

        self.assertIn("players", serializer.errors)

    def test_wrong_tournament_format(self):
        """Should raise validation error for unsupported tournament format."""
        self.data['format'] = 'WrongFormat'

        serializer = TournamentCreateSerializer(data=self.data)
        self.assertFalse(serializer.is_valid())

        self.assertIn("format", serializer.errors)
        self.assertIn("is not a valid choice", serializer.errors["format"][0])

    def test_rejects_too_low_values_for_courts_and_points(self):
        """Should reject tournaments with courts/points values below minimum allowed."""
        self.data['points_per_match'] = 0
        self.data['courts'] = []

        serializer = TournamentCreateSerializer(data=self.data)
        self.assertFalse(serializer.is_valid())

        self.assertIn("courts", serializer.errors)
        self.assertIn("points_per_match", serializer.errors)

        self.assertIn("Ensure this field has at least 1 elements.", serializer.errors["courts"]['non_field_errors'][0])
        self.assertIn("Ensure this value is greater than or equal to 1.", serializer.errors["points_per_match"][0])

    def test_rejects_too_high_values_for_points(self):
        """Should reject tournaments with points values above maximum allowed."""
        self.data['points_per_match'] = 60

        serializer = TournamentCreateSerializer(data=self.data)
        self.assertFalse(serializer.is_valid())

        self.assertIn("points_per_match", serializer.errors)
        self.assertIn("Ensure this value is less than or equal to 50.", serializer.errors["points_per_match"][0])

class TournamentSerializerTest(TestCase):
    """Tests for TournamentSerializer that includes player serialization."""
    def setUp(self):
        self.tournament = TournamentFactory()

    def test_serialization_without_players(self):
        """Ensure players field is an empty list when no players are present."""
        serializer = TournamentSerializer(self.tournament)

        self.assertEqual(serializer.data['players'], [])

    def test_serialization_with_players(self):
        """Should serialize tournament with player details embedded."""
        players = PlayerFactory.create_batch(2, tournament=self.tournament)
        serializer = TournamentSerializer(self.tournament)

        expected_data = {
            'id': self.tournament.id,
            'title': self.tournament.title,
            'status': self.tournament.status,
            'number_of_rounds': self.tournament.number_of_rounds,
            'final_round': self.tournament.final_round,
            'format': self.tournament.format,
            'result_sorting': self.tournament.result_sorting,
            'team_format': self.tournament.team_format,
            'final_match': self.tournament.final_match,
            'points_per_match': self.tournament.points_per_match,
            'created_at': serializer.data['created_at'],
            'players': [
                {
                    'id': player.id,
                    'name': player.name,
                    'tournament': self.tournament.id
                }
                for player in players
            ],
            'courts': []
        }

        self.assertEqual(serializer.data, expected_data)

class TestMatchSerializer(TestCase):
    """Tests for serializing Match objects and related player-team structure."""
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=12, courts=3)

        generate_americano_round(self.tournament)

    def test_serializer_structure(self):
        """Should return correct field structure and valid teams for single match."""
        match = Match.objects.filter(tournament = self.tournament).first()
        serializer = MatchSerializer(match)

        data = serializer.data

        expected_fields = [
            "id",
            "round_number",
            "court",
            "team_1_score",
            "team_2_score",
            "played",
            "players"
        ]

        for field in expected_fields:
            self.assertIn(field, data)

        self.assertEqual(len(data["players"]), 4)
        teams = [player["team"] for player in data["players"]]
        self.assertEqual(teams.count(MatchPlayer.TeamChoices.TEAM1), 2)
        self.assertEqual(teams.count(MatchPlayer.TeamChoices.TEAM2), 2)

    def test_match_players(self):
        """Should return exactly 4 players per match, divided into two teams."""
        # generate more matches
        generate_americano_round(self.tournament)
        matches = list(Match.objects.filter(tournament=self.tournament))

        self.assertEqual(len(matches), 6)

        for match in matches:
            serializer = MatchSerializer(match)
            data = serializer.data

            self.assertEqual(len(data["players"]), 4)
            teams = [player["team"] for player in data["players"]]
            self.assertEqual(teams.count(MatchPlayer.TeamChoices.TEAM1), 2)
            self.assertEqual(teams.count(MatchPlayer.TeamChoices.TEAM2), 2)

    def test_match_serializer_without_scores(self):
        """Should serialize match with null scores and played=False by default."""
        match = Match.objects.filter(tournament=self.tournament).first()
        serializer = MatchSerializer(match)
        data = serializer.data

        self.assertIsNone(data["team_1_score"])
        self.assertIsNone(data["team_2_score"])
        self.assertFalse(data["played"])

class TestMatchUpdateSerializer(TestCase):
    """Tests for updating single match results using MatchUpdateSerializer."""
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=4, courts=1)

        generate_americano_round(self.tournament)
        self.match = Match.objects.filter(tournament=self.tournament).first()

    def test_correct_played_flag_and_score(self):
        """Should accept and save valid scores when match is played."""
        data = {
            "id": self.match.id,
            "team_1_score": 21,
            "team_2_score": 17,
            "played": True
        }

        serializer = MatchUpdateSerializer(self.match, data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        updated_match = serializer.save()
        self.assertEqual(updated_match.team_1_score, 21)
        self.assertEqual(updated_match.team_2_score, 17)
        self.assertTrue(updated_match.played)

    def test_correct_played_flag_score_missing(self):
        """Should reject if played=True but one or both scores are missing."""
        data = {
            "id": self.match.id,
            "team_1_score": 21,
            "team_2_score": None,
            "played": True
        }
        serializer = MatchUpdateSerializer(self.match, data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)
        self.assertIn("Both scores must be provided", str(serializer.errors["non_field_errors"][0]))

        data['team_1_score'] = None

        serializer = MatchUpdateSerializer(self.match, data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)
        self.assertIn("Both scores must be provided", str(serializer.errors["non_field_errors"][0]))

    def test_not_played_flag_does_not_require_scores(self):
        """Should allow played=False without requiring scores."""
        data = {
            "id": self.match.id,
            "played": False
        }
        serializer = MatchUpdateSerializer(self.match, data=data, partial=True)
        self.assertTrue(serializer.is_valid())

    def test_invalid_score_type(self):
        """Should raise validation error when score is not an integer."""
        data = {
            "id": self.match.id,
            "team_1_score": "abc",
            "team_2_score": 18,
            "played": True
        }
        serializer = MatchUpdateSerializer(self.match, data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("team_1_score", serializer.errors)

class TestRoundResultsSerializer(TestCase):
    """Tests for RoundResultsSerializer to validate multiple match results submission."""
    def setUp(self):
        self.tournament = TournamentWithRelationsFactory(players=12, courts=3)

        generate_americano_round(self.tournament)
        self.matches = Match.objects.filter(tournament=self.tournament)
        self.results = self.build_valid_results()

    def build_valid_results(self):
        return [{
            "match_id": match.id,
            "team_1_score": 21,
            "team_2_score": 17,
            "played": True,
            "updated_at": match.updated_at.isoformat()
        } for match in self.matches]

    def test_correct_data(self):
        """Should validate successfully when all matches are played and scored."""
        serializer = RoundResultsSerializer(data={'results': self.results})
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_blank_single_result(self):
        """Should raise validation error when one match lacks a score."""
        self.results[1]['team_1_score'] = None

        serializer = RoundResultsSerializer(data={'results': self.results})
        self.assertFalse(serializer.is_valid())

        self.assertIn("results", serializer.errors)
        self.assertIn(
            "Both scores must be provided if the match is marked as played.",
            serializer.errors["results"][1]['non_field_errors']
        )

    def test_invalid_data_type_single_result(self):
        """Should raise validation error when score is of invalid type."""
        self.results[2]['team_1_score'] = 'abc'

        serializer = RoundResultsSerializer(data={'results': self.results})
        self.assertFalse(serializer.is_valid())

        self.assertIn("results", serializer.errors)
        self.assertIn("team_1_score", serializer.errors['results'][2])

    def test_invalid_played_flag(self):
        """Should reject data if any match is not marked as played."""
        self.results[2]['played'] = False

        serializer = RoundResultsSerializer(data={'results': self.results})
        self.assertFalse(serializer.is_valid())

        self.assertIn("results", serializer.errors)
        self.assertIn(
            "All matches must be marked as played.",
            serializer.errors["results"],
        )

    def test_empty_results(self):
        """Should raise validation error if no results are provided."""
        self.results = []

        serializer = RoundResultsSerializer(data={'results': self.results})
        self.assertFalse(serializer.is_valid())

        self.assertIn("results", serializer.errors)
        self.assertIn(
            "You must provide at least one match result.",
            serializer.errors["results"],
        )
