from rest_framework import serializers

from backend.tournaments.models import Player, Tournament
from django.db import transaction, IntegrityError


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id','name', 'tournament']

class PlayerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['name']


class TournamentSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True, read_only=True)

    class Meta:
        model = Tournament
        fields = ['id', 'title', 'format', 'number_of_courts', 'points_per_match', 'created_at', 'players']


class TournamentCreateSerializer(serializers.ModelSerializer):
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