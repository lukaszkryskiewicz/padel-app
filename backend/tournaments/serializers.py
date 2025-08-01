from rest_framework import serializers

from backend.tournaments.logic.americano_single import generate_americano_round
from backend.tournaments.logic.final_round import generate_final_round
from backend.tournaments.logic.mexicano_single import generate_mexicano_round
from backend.tournaments.models import Player, Tournament, Match, MatchPlayer, Court, RankingSnapshot
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

class CourtSerializer(serializers.ModelSerializer):
    """Serializer for displaying Court information in a tournament."""

    class Meta:
        model = Court
        fields = ['id','name','number','tournament']

class CourtCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating courts during tournament creation."""

    class Meta:
        model = Court
        fields = ['name', 'number']


class TournamentSerializer(serializers.ModelSerializer):
    """Serializer for displaying tournament details along with players."""

    players = PlayerSerializer(many=True, read_only=True)
    courts = CourtSerializer(many=True, read_only=True)

    class Meta:
        model = Tournament
        fields = ['id', 'status', 'number_of_rounds', 'final_round', 'title', 'format', 'result_sorting', 'team_format', 'final_match',
                  'points_per_match', 'created_at', 'players', 'courts']


class TournamentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a tournament with an initial list of players.
    Validates that player names are unique within the tournament.
    """

    players = PlayerCreateSerializer(many=True, min_length=1)
    courts = CourtCreateSerializer(many=True, min_length=1)

    class Meta:
        model = Tournament
        fields = ['title', 'format', 'result_sorting', 'team_format', 'final_match',
                  'points_per_match', 'players', 'courts']

    def validate(self, data):
        names = [player['name'] for player in data['players']]
        courts_names = [court['name'] for court in data['courts']]
        courts_numbers = [court['number'] for court in data['courts']]

        if len(names) != len(set(names)):
            raise serializers.ValidationError({
                "players": "Player names must be unique within a tournament."
            })

        if len(courts_names) != len(set(courts_names)) or len(courts_numbers) != len(set(courts_numbers)):
            raise serializers.ValidationError({
                "players": "Courts names and numbers must be unique within a tournament."
            })

        return data

    def create(self, validated_data):
        players_data = validated_data.pop('players')
        courts_data = validated_data.pop('courts')

        # double check for duplicates - editing players will be possible
        try:
            with transaction.atomic():
                tournament = Tournament.objects.create(**validated_data)

                for player_data in players_data:
                    Player.objects.create(tournament=tournament, **player_data)

                for court_data in courts_data:
                    Court.objects.create(tournament=tournament, **court_data)

        except IntegrityError:
            raise serializers.ValidationError(
                {"error": "Duplicate player names or court names/number in tournament (DB-level)"}
            )

        return tournament

class MatchPlayerSerializer(serializers.ModelSerializer):
    """Serializer for displaying a player's team in a specific match."""

    name = serializers.CharField(source = 'player.name')
    player_id = serializers.CharField(source = 'player.id')

    class Meta:
        model = MatchPlayer
        fields = ['id', 'name', 'player_id', 'team']

class MatchSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying match details including player-team assignments.
    Used to show matches on the frontend.
    """

    players = serializers.SerializerMethodField()
    court = CourtSerializer(read_only=True)

    class Meta:
        model = Match
        fields = ['id','round_number', 'court',
                  'team_1_score', 'team_2_score', 'played', 'players', 'updated_at']
        read_only_fields = ['updated_at']

    def get_players(self, obj):
        match_players = MatchPlayer.objects.filter(match=obj).select_related('player')
        return MatchPlayerSerializer(match_players, many=True).data

class MatchUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating a single match result (used in PATCH/PUT)."""

    class Meta:
        model = Match
        fields = ['id', 'team_1_score', 'team_2_score', 'played', 'updated_at']

    def validate(self, data):
        # Check that if played=True, both scores are provided
        if data.get('played'):
            if data.get('team_1_score') is None or data.get('team_2_score') is None:
                raise serializers.ValidationError({"non_field_errors": ["Both scores must be provided if the match is marked as played."]})
        return data

class SingleMatchUpdateSerializer(serializers.Serializer):
    """
    Validates input for a single match when updating a full round of matches.
    Ensures both scores are provided if the match is marked as played.
    """

    match_id = serializers.IntegerField()
    team_1_score = serializers.IntegerField(required=False, allow_null=True)
    team_2_score = serializers.IntegerField(required=False, allow_null=True)
    played = serializers.BooleanField()
    updated_at = serializers.DateTimeField()

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

        for result in data:
            if not result.get('played'):
                raise serializers.ValidationError("All matches must be marked as played.")
            if result.get('team_1_score') is None or result.get('team_2_score') is None:
                raise serializers.ValidationError("All played matches must have both scores.")

        return data

class GenerateRoundSerializer(serializers.Serializer):
    is_final = serializers.BooleanField(default=False)

    def validate_tournament_id(self, data):
        tournament = self.context.get('tournament')
        if not tournament:
            raise serializers.ValidationError("Tournament not found.")
        if tournament.status == Tournament.TournamentStatus.FINISHED:
            raise serializers.ValidationError("Tournament is marked as finished!")
        # check if there are 4 players and minimum one court
        if tournament.players.count() < 4 or tournament.players.count() % 4 != 0:
            raise serializers.ValidationError("Liczba graczy musi być wielokrotnością 4.")
        if tournament.courts.count() < 1:
            raise serializers.ValidationError("Brak dostępnych kortów.")
        return data

    def create(self, validated_data):
        tournament = self.context['tournament']
        is_final = validated_data.get('is_final', False)
        if is_final:
            generate_final_round(tournament)
        elif tournament.format == Tournament.TournamentFormat.AMERICANO:
            generate_americano_round(tournament)
        elif tournament.format == Tournament.TournamentFormat.MEXICANO:
            generate_mexicano_round(tournament)
        return tournament  # return tournament with new round

class RankingSnapshotSerializer(serializers.ModelSerializer):

    name = serializers.CharField(source='player.name')

    class Meta:
        model = RankingSnapshot
        fields = ['name', 'round_number', 'points', 'is_winner']

class PlayerRoundResultSerializer(serializers.Serializer):
    round_number = serializers.IntegerField()
    points = serializers.IntegerField()
    is_winner = serializers.BooleanField()

class WinLossRecordSerializer(serializers.Serializer):
    win = serializers.IntegerField()
    draw = serializers.IntegerField()
    loss = serializers.IntegerField()

class PlayerRankingSerializer(serializers.Serializer):

    id = serializers.CharField()
    name = serializers.CharField()
    rounds = PlayerRoundResultSerializer(many=True)
    total_points = serializers.IntegerField()
    total_matches = serializers.IntegerField()
    win_loss_record = WinLossRecordSerializer()
    win_rate = serializers.IntegerField()

