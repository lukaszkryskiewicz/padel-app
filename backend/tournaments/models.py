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