import type { Standings } from '@/types/tournament';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslation } from 'react-i18next';
import PositionCell from '../shared/PositionCell';
import { getRankBackgroundClass } from '@/lib/standings-utils';
import StandingsTableCell from '../shared/StandingsTableCell';

const GeneralStandings = ({ standings }: { standings: Standings[] }) => {
  const { t } = useTranslation();
  const tableHeaders = [
    'position',
    'participant',
    'points',
    'matches',
    'wins',
    'draws',
    'loss',
    'winsRatio',
  ];
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b-2">
          {tableHeaders.map((header) => (
            <TableHead key={header} className="text-center">
              {t(`standings.${header}`)}
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
              <StandingsTableCell
                className="font-bold text-lg text-blue-600"
                value={player.totalPoints}
              />
              <StandingsTableCell
                className="font-semibold text-gray-900"
                value={player.totalMatches}
              />
              <StandingsTableCell
                className="font-semibold text-green-600"
                value={player.winLossRecord.win}
              />
              <StandingsTableCell
                className="font-semibold text-yellow-600"
                value={player.winLossRecord.draw}
              />
              <StandingsTableCell
                className="font-semibold text-red-600"
                value={player.winLossRecord.loss}
              />
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className={`${
                    player.winRate >= 70
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : player.winRate >= 50
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      : 'bg-red-100 text-red-800 border-red-300'
                  }`}
                >
                  {player.winRate}%
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default GeneralStandings;
