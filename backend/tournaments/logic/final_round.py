from backend.tournaments.logic.ranking import get_simplified_ranking
from backend.tournaments.models import Match, MatchPlayer, Player


def create_match_player(player, team, match):
    MatchPlayer.objects.create(
        match=match,
        player=player,
        team=team
    )

def generate_final_round(tournament):
    """
    Creates final round matches based on total tournament points
    and tournament.final_match logic.
    """
    ranking = get_simplified_ranking(tournament.id)
    player_ids_in_order = [player['id'] for player in ranking]

    players_dict = Player.objects.in_bulk(player_ids_in_order)
    players = [players_dict[pid] for pid in player_ids_in_order]

    all_courts = list(tournament.courts.all())
    current_round = tournament.number_of_rounds + 1

    pairing_logic = {
        1: [(0, 'team1'), (2, 'team1'), (1, 'team2'), (3, 'team2')],
        2: [(0, 'team1'), (1, 'team1'), (2, 'team2'), (3, 'team2')],
        3: [(0, 'team1'), (3, 'team1'), (1, 'team2'), (2, 'team2')],
    }

    for i in range (0, len(players), 4):
        group = players[i : i + 4]
        match = Match.objects.create(
            tournament=tournament,
            round_number=current_round,
            court=all_courts[(i // 4)],
            played=False,
        )

        for idx, team in pairing_logic[int(tournament.final_match)]:
            create_match_player(player=group[idx], team=team, match=match)

    tournament.number_of_rounds = current_round
    tournament.final_round = current_round
    tournament.save(update_fields=['number_of_rounds', 'final_round'])