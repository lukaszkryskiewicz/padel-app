from rest_framework import serializers

from backend.tournaments.models import Player, Tournament, Match, MatchPlayer
from django.db import transaction, IntegrityError


class PlayerSerializer(serializers.ModelSerializer):
    """Serializer for displaying player information in a tournament."""

    class Meta:
        model = Player
        fields = ['id','name', 'tournament']

class PlayerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating players during tournament creation."""

    class Meta:
        model = Player
        fields = ['name']


class TournamentSerializer(serializers.ModelSerializer):
    """Serializer for displaying tournament details along with players."""

    players = PlayerSerializer(many=True, read_only=True)

    class Meta:
        model = Tournament
        fields = ['id', 'title', 'format', 'number_of_courts', 'points_per_match', 'created_at', 'players']


class TournamentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a tournament with an initial list of players.
    Validates that player names are unique within the tournament.
    """

    players = PlayerCreateSerializer(many=True, min_length=1)

    class Meta:
        model = Tournament
        fields = ['title', 'format', 'number_of_courts', 'points_per_match', 'players']

    def validate(self, data):
        names = [player['name'] for player in data['players']]
        if len(names) != len(set(names)):
            raise serializers.ValidationError({
                "players": "Player names must be unique within a tournament."
            })
        return data

    def create(self, validated_data):
        players_data = validated_data.pop('players')

        # double check for duplicates - editing players will be possible
        try:
            with transaction.atomic():
                tournament = Tournament.objects.create(**validated_data)

                for player_data in players_data:
                    Player.objects.create(tournament=tournament, **player_data)

        except IntegrityError:
            raise serializers.ValidationError(
                {"error": "Duplicate player names in tournament (DB-level)"}
            )

        return tournament

class MatchPlayerSerializer(serializers.ModelSerializer):
    """Serializer for displaying a player's team in a specific match."""

    name = serializers.CharField(source = 'player.name')

    class Meta:
        model = MatchPlayer
        fields = ['id', 'name', 'team']

class MatchSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying match details including player-team assignments.
    Used to show matches on the frontend.
    """

    players = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ['id','round_number', 'court_number',
                  'team_1_score', 'team_2_score', 'played', 'players']

    def get_players(self, obj):
        match_players = MatchPlayer.objects.filter(match=obj).select_related('player')
        return MatchPlayerSerializer(match_players, many=True).data

class MatchUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating a single match result (used in PATCH/PUT)."""

    class Meta:
        model = Match
        fields = ['id', 'team_1_score', 'team_2_score', 'played']

class SingleMatchUpdateSerializer(serializers.Serializer):
    """
    Validates input for a single match when updating a full round of matches.
    Ensures both scores are provided if the match is marked as played.
    """

    match_id = serializers.IntegerField()
    team_1_score = serializers.IntegerField(required=False, allow_null=True)
    team_2_score = serializers.IntegerField(required=False, allow_null=True)
    played = serializers.BooleanField()

    def validate(self, data):
        if data.get('played') and (
                data.get('team_1_score') is None or data.get('team_2_score') is None
        ):
            raise serializers.ValidationError("Both scores must be provided if the match is marked as played.")
        return data

class RoundResultsSerializer(serializers.Serializer):
    """
    Serializer for validating multiple match results (one round).

    Wraps a list of single match updates and ensures that at least one result is provided.
    Each item is validated by SingleMatchUpdateSerializer.
    """
    results = SingleMatchUpdateSerializer(many=True)

    def validate_results(self, data):
        if not data:
            raise serializers.ValidationError("You must provide at least one match result.")
        return data