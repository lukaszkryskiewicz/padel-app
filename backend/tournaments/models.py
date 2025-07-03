from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

class Tournament(models.Model):
    class TournamentFormat(models.TextChoices):
        AMERICANO = "AMERICANO", _("Americano")
        MEXICANO = "MEXICANO", _("Mexicano")

    class ResultSorting(models.TextChoices):
        WINS = "WINS", _('Wins')
        POINTS = "POINTS", _('Points')

    class TeamFormat(models.TextChoices):
        PLAYER = 'PLAYER', _('Player')
        PAIR = 'PAIR', _('Pair')

    class FinalMatch(models.IntegerChoices):
        ONE_THREE_VS_TWO_FOUR = 1, "1 & 3 vs 2 & 4"
        ONE_TWO_VS_THREE_FOUR = 2, "1 & 2 vs 3 & 4"
        ONE_FOUR_VS_TWO_THREE = 3, "1 & 4 vs 2 & 3"

    title = models.CharField(max_length=30, default='Padel Tournament')
    format = models.CharField(max_length=20, choices=TournamentFormat.choices)
    result_sorting = models.CharField(max_length=20, choices=ResultSorting.choices)
    team_format = models.CharField(max_length=20, choices=TeamFormat.choices)
    final_match = models.CharField(max_length=20, choices=FinalMatch.choices)
    points_per_match = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(50)]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.title} ({self.created_at})'

class Court(models.Model):
    name = models.CharField(max_length=30)
    number = models.PositiveIntegerField(null=True, blank=True)
    tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE, related_name='courts')

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['number', 'tournament'],
                name='unique_court_number_per_tournament'
            ),
            models.UniqueConstraint(
                fields=['name', 'tournament'],
                name='unique_court_name_per_tournament'
            ),
        ]

    def __str__(self):
        display_name = f"Court {self.number}" if self.number else self.name
        return f"{display_name} ({self.tournament.title})"

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
    court = models.ForeignKey('Court', on_delete=models.PROTECT, related_name='matches')

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
        return f"Match R{self.round_number} on Court {self.court} (Tournament: {self.tournament.title})"

# implemented to easily get teams of a match and sum points of a player
class MatchPlayer(models.Model):
    class TeamChoices(models.TextChoices):
        TEAM1 = 'team1', 'Team 1'
        TEAM2 = 'team2', 'Team 2'


    match = models.ForeignKey('Match', on_delete=models.CASCADE)
    player = models.ForeignKey('Player', on_delete=models.CASCADE)
    team = models.CharField(max_length=10, choices=TeamChoices.choices)

    class Meta:
        # player cannot play twice in the same match !
        constraints = [
            models.UniqueConstraint(
                fields=['match', 'player'],
                name='unique_player_per_match'
            )
        ]

    def __str__(self):
        return f"{self.player.name} in {self.match} ({self.team})"