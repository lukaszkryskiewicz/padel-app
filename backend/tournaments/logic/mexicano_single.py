import random

from backend.tournaments.logic.americano_single import generate_americano_round
from backend.tournaments.logic.ranking import get_simplified_ranking
from backend.tournaments.models import Tournament, Player, Match, MatchPlayer


def generate_mexicano_round(tournament):
    # first round is always americano !!
    if tournament.status == Tournament.TournamentStatus.NEW:
        generate_americano_round(tournament)
        return

    all_courts = list(tournament.courts.all())
    current_round = tournament.number_of_rounds + 1

    ranking = get_simplified_ranking(tournament.id)
    player_ids_in_order = [player['id'] for player in ranking]

    players_dict = Player.objects.in_bulk(player_ids_in_order)
    players = [players_dict[pid] for pid in player_ids_in_order]

    for i in range(0, len(players), 4):
        group = players[i: i + 4]
        random.shuffle(group)

        match = Match.objects.create(
            tournament=tournament,
            round_number=current_round,
            court=all_courts[(i // 4)],
            played=False,
        )

        for player in group[:2]:
            MatchPlayer.objects.create(
                match=match,
                player=player,
                team='team1'
            )
        for player in group[2:]:
            MatchPlayer.objects.create(
                match=match,
                player=player,
                team='team2'
            )

    tournament.number_of_rounds = current_round
    tournament.save(update_fields=['number_of_rounds'])

