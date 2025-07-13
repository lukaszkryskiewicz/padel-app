import type { TournamentApiValues } from '@/types/tournament';
import { CardContent } from '@/components/ui/card';
import { chunkArray } from '@/lib/tournament-utils';

const PlayersCard = ({ players }: Pick<TournamentApiValues, 'players'>) => {
  const playerColumns = chunkArray(players, players.length <= 16 ? 4 : 8);

  return (
    <CardContent>
      <ul className="ml-4 flex gap-20 flex-row list-decimal list-outside space-y-2 text-xl">
        {playerColumns.map((column, colIdx) => (
          <div key={colIdx}>
            {column.map((player) => (
              <li key={player.name} className="p-2">
                {player.name}
              </li>
            ))}
          </div>
        ))}
      </ul>
    </CardContent>
  );
};

export default PlayersCard;
