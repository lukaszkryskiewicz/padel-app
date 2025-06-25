from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

class Tournament(models.Model):
    TOURNAMENT_FORMATS = [('Americano', 'Americano'), ('Mexicano', 'Mexicano')]

    title = models.CharField(max_length=30, default='Padel Tournament')
    format = models.CharField(max_length=20, choices=TOURNAMENT_FORMATS)
    number_of_courts = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(25)]
    )
    points_per_match = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(50)]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.title} ({self.created_at})'

class Player(models.Model):
    name = models.CharField(max_length=30)
    tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE, related_name='players')

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['name', 'tournament'],
                name='unique_player_name_per_tournament'
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.tournament.title})"

class Match(models.Model):
    tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE, related_name='matches')

    round_number = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(25)]
    )
    court_number = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(25)]
    )

    team_1_score = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(50)],
        null = True, blank = True
    )

    team_2_score = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(50)],
        null = True, blank = True
    )

    played = models.BooleanField(default=False)

    players = models.ManyToManyField(
        'Player',
        through='MatchPlayer',
        related_name='matches'
    )

    def __str__(self):
        return f"Match R{self.round_number} on Court {self.court_number} (Tournament: {self.tournament.title})"

# implemented to easily get teams of a match and sum points of a player
class MatchPlayer(models.Model):
    TEAM_CHOICES = [('team1', 'Team 1'), ('team2', 'Team 2')]

    match = models.ForeignKey('Match', on_delete=models.CASCADE)
    player = models.ForeignKey('Player', on_delete=models.CASCADE)
    team = models.CharField(max_length=10, choices=TEAM_CHOICES)

    class Meta:
        # player cannot play twice in the same match !
        unique_together = ('match', 'player')

    def __str__(self):
        return f"{self.player.name} in {self.match} ({self.team})"