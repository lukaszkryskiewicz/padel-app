import random
from backend.tournaments.models import Match, MatchPlayer


def generate_americano_round(tournament):
    all_players = list(tournament.players.all())
    played_rounds = tournament.matches.values_list('round_number', flat=True)
    current_round = max(played_rounds) + 1 if played_rounds else 1

    if len(all_players) < 4 or len(all_players) % 4 != 0:
        return

    random.shuffle(all_players)

    # divide players into 4 players groups
    for i in range (0, len(all_players), 4):
        group = all_players[i : i + 4]

        match = Match.objects.create(
            tournament=tournament,
            round_number=current_round,
            court_number=(i // 4) + 1,
            played=False,
        )

        for player in group[:2]:
            MatchPlayer.objects.create(
                match = match,
                player = player,
                team = 'team1'
            )
        for player in group[2:]:
            MatchPlayer.objects.create(
                match=match,
                player=player,
                team='team2'
            )


