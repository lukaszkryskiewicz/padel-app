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
