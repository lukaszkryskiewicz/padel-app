import { Trophy, Users, Calendar, Target } from 'lucide-react';
import type { TournamentApiValues } from '@/types/tournament';
import { useTranslation } from 'react-i18next';
import { STATUS_TOURNAMENT_OPTIONS } from '@/constants/tournaments';
import { findOptionLabel } from '@/lib/tournament-utils';

const DashboardHeader = ({
  tournament,
}: {
  tournament: TournamentApiValues;
}) => {
  const { t } = useTranslation();

  const headerItems = [
    {
      icon: <Users className="w-5 h-5" />,
      text: tournament.format,
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      text: `${t('dashboard.status')} ${t(
        findOptionLabel(STATUS_TOURNAMENT_OPTIONS, tournament.status)
      )}`,
    },
    {
      icon: <Target className="w-5 h-5" />,
      text: `${t('tournament.courtsSum')}: ${tournament.courts.length}`,
    },
  ];
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
        <Trophy className="text-blue-500" />
        {tournament.title}
      </h1>
      <div className="flex items-center justify-center gap-6 text-lg text-gray-600">
        {headerItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardHeader;
