import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Standings } from '@/types/tournament';
import { Trophy, TrendingUp, Users, Dices } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StandingsHeader = ({ standings }: { standings: Standings[] }) => {
  const { t } = useTranslation();

  const totalPlayers = standings.length;
  const averagePoints = Math.round(
    standings?.reduce((sum, player) => sum + player.totalPoints, 0) /
      totalPlayers
  );

  const headerItems = [
    {
      id: 'participants',
      color: 'blue',
      icon: <Users className="w-5 h-5" />,
      titleText: t('standings.participants'),
      value: totalPlayers,
      text: t('standings.participantsInTournament'),
    },
    {
      id: 'rounds',
      color: 'purple',
      icon: <Dices className="w-5 h-5" />,
      titleText: t('standings.roundsNumber'),
      value: standings[0]?.totalMatches,
      text: t('standings.rounds'),
    },
    {
      id: 'points',
      color: 'green',
      icon: <TrendingUp className="w-5 h-5" />,
      titleText: t('standings.averagePoints'),
      value: averagePoints,
      text: t('standings.pointsPerPlayer'),
    },
    {
      id: 'winner',
      color: 'yellow',
      icon: <Trophy className="w-5 h-5" />,
      titleText: t('standings.winner'),
      value: standings[0]?.name,
      text: `${standings[0]?.totalPoints} ${t('standings.points')}`,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {headerItems.map((header) => (
        <Card key={header.id} className={`border-2 border-${header.color}-100`}>
          <CardHeader className="pb-3">
            <CardTitle
              className={`flex items-center text-${header.color}-700 gap-2 text-lg`}
            >
              {header.icon}
              {header.titleText}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`${
                header.id === 'winner' ? 'text-xl' : 'text-3xl'
              } font-bold text-gray-900`}
            >
              {header.value}
            </p>
            <p className="text-sm text-gray-600">{header.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StandingsHeader;
