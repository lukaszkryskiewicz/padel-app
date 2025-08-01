from django.contrib import admin
from .models import Tournament, Player, Match, MatchPlayer, Court

admin.site.register(Tournament)
admin.site.register(Player)
admin.site.register(Match)
admin.site.register(MatchPlayer)
admin.site.register(Court)