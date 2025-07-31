from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from rest_framework import generics, status
from rest_framework.response import Response
from django.db.models import Max

from .logic.ranking import get_tournament_ranking, create_ranking_snapshots
from .models import Tournament, Match
from .serializers import TournamentSerializer, MatchUpdateSerializer, RoundResultsSerializer, \
    TournamentCreateSerializer, MatchSerializer, GenerateRoundSerializer, PlayerRankingSerializer


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

    def create(self, request, *args, **kwargs):
        # Validate and creates object
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tournament = serializer.save()

        # Serialize new object and return to frontend
        output_serializer = TournamentSerializer(tournament, context=self.get_serializer_context())
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


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

class SingleRoundMatchesView(generics.ListAPIView):
    """
    GET: Returns all matches from the current round of a specific tournament.
    """
    serializer_class = MatchSerializer

    def get_queryset(self):
        tournament_id = self.kwargs['tournament_id']
        round_id = self.kwargs['round_id']
        matches = Match.objects.filter(tournament_id=tournament_id)
        return matches.filter(round_number=round_id)


class MatchUpdateView(generics.UpdateAPIView):
    """
    PATCH: Updates a single match (e.g., scores or played status).
    """
    queryset = Match.objects.all()
    serializer_class = MatchUpdateSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user_updated_at = request.data.get('updated_at')

        if user_updated_at:
            #check without microsecond to avoid conflicts
            db_time = instance.updated_at.replace(microsecond=0)
            req_time = parse_datetime(user_updated_at).replace(microsecond=0)
            if db_time != req_time:
                return Response(
                {"detail": "Conflict: Match has been updated in the meantime", "match_id": instance.id},
                status=status.HTTP_409_CONFLICT
            )

        return super().update(request, *args,**kwargs)


class RoundResultsUpdateView(generics.GenericAPIView):
    """
    PATCH: Updates multiple match results for one round in a tournament.
    Expects a list of match results in the request body.
    """
    serializer_class = RoundResultsSerializer

    def patch(self, request, tournament_id,round_id, *args, **kwargs):
        tournament = get_object_or_404(Tournament, pk=tournament_id)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # checks if all matches belongs to the updated round
        match_ids = [result['match_id'] for result in serializer.validated_data['results']]
        invalid_matches = Match.objects.filter(
            id__in=match_ids
        ).exclude(
            tournament=tournament,
            round_number=round_id
        )

        if invalid_matches.exists():
            invalid_ids = list(invalid_matches.values_list('id', flat=True))
            return Response(
                {
                    "error": "One or more matches do not belong to the specified round.",
                    "invalid_match_ids": invalid_ids,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        conflict_matches = []
        for result in serializer.validated_data['results']:
            match = get_object_or_404(Match, pk=result['match_id'], tournament=tournament)
            user_update_at = result.get('updated_at')
            if user_update_at and str(user_update_at) != str(match.updated_at):
                conflict_matches.append(match.id)


        if conflict_matches:
            return Response(
                {
                    "error": "One or more matches have been updated by another user.",
                    "conflict_match_ids": conflict_matches,
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        for result in serializer.validated_data['results']:
            match = get_object_or_404(Match, pk=result['match_id'], tournament=tournament)
            match.team_1_score = result['team_1_score']
            match.team_2_score = result['team_2_score']
            match.played = result['played']
            match.save()

        create_ranking_snapshots(tournament.id, round_id)

        return Response({"status": "round results updated"}, status=status.HTTP_200_OK)

class GenerateRoundView(generics.CreateAPIView):
    serializer_class = GenerateRoundSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        tournament = get_object_or_404(Tournament, pk=self.kwargs['tournament_id'])
        context['tournament'] = tournament
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tournament = serializer.save()
        return Response(
            {"detail": "Runda została wygenerowana.", "tournament_id": tournament.id},
            status=status.HTTP_201_CREATED
        )

class TournamentRankingView(generics.ListAPIView):
    """
    GET: Returns aggregated ranking for all players in a tournament.
    """
    serializer_class = PlayerRankingSerializer

    def get_queryset(self):
        tournament_id = self.kwargs["tournament_id"]
        tournament = get_object_or_404(Tournament, pk=tournament_id)
        return get_tournament_ranking(tournament.id)

class FinishTournamentView(generics.UpdateAPIView):
    """
    PATCH: Changes the tournament status  finished.
    """
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

    def patch(self, request, *args, **kwargs):
        tournament_id = self.kwargs.get('tournament_id')
        tournament = get_object_or_404(Tournament, pk=tournament_id)
        tournament.status = Tournament.TournamentStatus.FINISHED
        tournament.save(update_fields=['status'])
        return Response({"detail": "Tournament marked as finished."}, status=200)