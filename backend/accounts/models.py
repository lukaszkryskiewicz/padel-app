from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class CustomUser(AbstractUser):
    class UserTypeChoices(models.TextChoices):
        USER = "USER", _("User")
        CLUB = "CLUB", _("Club")

    email = models.EmailField(unique=True)
    user_type = models.CharField(choices=UserTypeChoices, default=UserTypeChoices.USER)
    club_name = models.CharField(max_length=100, blank=True, null=True, help_text='Club name')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def is_club_user(self):
        return self.user_type == 'club'

    def __str__(self):
        return f"{self.username} ({self.user_type})"