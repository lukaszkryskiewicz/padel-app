from collections import defaultdict

from backend.tournaments.models import RankingSnapshot, Match, MatchPlayer

def get_simplified_ranking(tournament_id):
    """
        Returns players ranking in tournament for final round_generation or mexicano round:
        [
            {
                "id": xxx,
            },
            ...
        ]
        """

    ranking = get_tournament_ranking(tournament_id)
    return [ {"id": player["id"]} for player in ranking ]

def get_tournament_ranking(tournament_id):
    """
    Returns players ranking in tournament:
    [
        {
            "id": xxx,
            "name": "Player 1",
            "rounds": [
                {"round_number": 1, "points": 8, "is_winner": True},
                {"round_number": 2, "points": 6, "is_winner": False},
                ]
            "total_points": 14,
            "win_loss_record": { "win": 1, "draw": 0, "loss":1},
            "win_rate": 50.0
        },
        ...
    ]
    """
    snapshots = (
        RankingSnapshot.objects
        .filter(tournament_id=tournament_id)
        .select_related('player', 'tournament')
        .order_by('player__name', 'round_number')
    )

    ranking = defaultdict(lambda: {"rounds": [], "total_points": 0, "total_matches": 0, "win_loss_record": {"win": 0, "draw": 0, "loss": 0}, "name": "", "id": "", "win_rate": 0.0})

    for snap in snapshots:
        player_id = snap.player.id
        player_data = ranking[player_id]

        if not player_data['name']:
            player_data['id'] = player_id
            player_data['name'] = snap.player.name
        player_data['rounds'].append({
            "round_number": snap.round_number,
            "points": snap.points,
            "is_winner": snap.is_winner
        })
        player_data["total_matches"] += 1
        player_data['total_points'] += snap.points
        if snap.is_winner:
            player_data['win_loss_record']['win'] += 1
        elif snap.points == snap.tournament.points_per_match / 2:
            player_data['win_loss_record']['draw'] += 1
        else:
            player_data['win_loss_record']['loss'] += 1

    for player in ranking.values():
        total_played = sum(player['win_loss_record'].values())
        if total_played > 0:
            player['win_rate'] = round(
                (player['win_loss_record']['win'] / total_played) * 100, 1
            )
        else:
            player['win_rate'] = 0.0

    ranking_list = sorted(ranking.values(), key=lambda x: (x['total_points'], x['win_rate']), reverse = True)
    # Convert to list sorted by total_points desc
    return  ranking_list

def create_ranking_snapshots(tournament_id, round_number):
    """
    Creates snapshot rankings for tournament and round.
    """

    RankingSnapshot.objects.filter(
        tournament_id=tournament_id,
        round_number=round_number
    ).delete()

    matches = Match.objects.filter(
        tournament_id=tournament_id,
        round_number=round_number,
        played=True
    ).prefetch_related('players')

    if not matches.exists():
        return

    for match in matches:
        team1_score = match.team_1_score or 0
        team2_score = match.team_2_score or 0

        winning_team = None
        if team1_score > team2_score:
            winning_team = MatchPlayer.TeamChoices.TEAM1
        elif team2_score > team1_score:
            winning_team = MatchPlayer.TeamChoices.TEAM2

        for mp in MatchPlayer.objects.filter(match=match).select_related('player'):
            RankingSnapshot.objects.create(
                tournament=match.tournament,
                player=mp.player,
                round_number=round_number,
                points=team1_score if mp.team == MatchPlayer.TeamChoices.TEAM1 else team2_score,
                is_winner=(mp.team == winning_team)
            )