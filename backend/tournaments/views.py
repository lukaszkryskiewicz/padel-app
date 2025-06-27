from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from django.db.models import Max

from .models import Tournament, Match
from .serializers import TournamentSerializer, MatchUpdateSerializer, RoundResultsSerializer, \
    TournamentCreateSerializer, MatchSerializer


class TournamentListCreateView(generics.ListCreateAPIView):
    """
     GET: Returns a list of all tournaments.
     POST: Creates a new tournament with a list of players.
     """
    queryset = Tournament.objects.all()
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TournamentCreateSerializer
        return TournamentSerializer


class TournamentRetriveView(generics.RetrieveAPIView):
    """
    GET: Retrieves the details of a single tournament by its ID.
    """
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

class MatchListView(generics.ListAPIView):
    """
    GET: Returns a list of all matches for a given tournament ID.
    """
    serializer_class = MatchSerializer

    def get_queryset(self):
        tournament_id = self.kwargs['tournament_id']
        return Match.objects.filter(tournament_id=tournament_id)

class CurrentRoundMatchesView(generics.ListAPIView):
    """
    GET: Returns all matches from the current round of a specific tournament.
    """
    serializer_class = MatchSerializer

    def get_queryset(self):
        tournament_id = self.kwargs['tournament_id']
        matches = Match.objects.filter(tournament_id=tournament_id)
        latest_round = matches.aggregate(max_round=Max('round_number'))['max_round']
        return matches.filter(round_number=latest_round) if latest_round else Match.objects.none()

class MatchUpdateView(generics.UpdateAPIView):
    """
    PATCH: Updates a single match (e.g., scores or played status).
    """
    queryset = Match.objects.all()
    serializer_class = MatchUpdateSerializer

class RoundResultsUpdateView(generics.GenericAPIView):
    """
    PATCH: Updates multiple match results for one round in a tournament.
    Expects a list of match results in the request body.
    """
    serializer_class = RoundResultsSerializer

    def patch(self, request, tournament_id, *args, **kwargs):
        tournament = get_object_or_404(Tournament, pk=tournament_id)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        for result in serializer.validated_data['results']:
            match = get_object_or_404(Match, pk=result['match_id'], tournament=tournament)
            match.team_1_score = result['team_1_score']
            match.team_2_score = result['team_2_score']
            match.played = result['played']
            match.save()

        return Response({"status": "round results updated"}, status=status.HTTP_200_OK)
