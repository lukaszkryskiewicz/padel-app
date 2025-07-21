import type { Standings } from '@/types/tournament';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslation } from 'react-i18next';
import { getRankBackgroundClass } from '@/lib/standings-utils';
import PositionCell from '../shared/PositionCell';
import StandingsTableCell from '../shared/StandingsTableCell';

const DetailedStandings = ({ standings }: { standings: Standings[] }) => {
  const { t } = useTranslation();
  const rounds = standings[0].rounds.length;
  const roundHeaders = [...Array(rounds)].map((_, i) => `${i + 1}`);

  const tableHeaders = ['position', 'participant', ...roundHeaders, 'points'];

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b-2">
          {tableHeaders.map((header) => (
            <TableHead key={header} className="text-center">
              {!isNaN(Number(header)) ? header : t(`standings.${header}`)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings.map((player, index) => {
          const position = index + 1;
          return (
            <TableRow
              key={player.id}
              className={`${getRankBackgroundClass(position)} hover:bg-gray-50`}
            >
              <PositionCell position={position} />
              <StandingsTableCell
                className="font-semibold text-gray-900"
                value={player.name}
              />
              {player.rounds.map((round) => (
                <TableCell key={round.roundNumber} className="text-center">
                  {round.points}
                </TableCell>
              ))}
              <StandingsTableCell
                className="font-bold text-lg text-blue-600"
                value={player.totalPoints}
              />
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default DetailedStandings;
