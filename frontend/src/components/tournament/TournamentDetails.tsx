import type { TournamentApiValues } from '@/types/tournament';
import { Calendar, Users, Target, Trophy, ReceiptText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BasicInfoCard from './sections/BasicInfoCard';
import GameSettingsCard from './sections/GameSettingsCard';
import TimeInfoCard from './sections/TimeInfoCard';
import PlayersCard from './sections/PlayersCard';
import TournamentRulesCard from './sections/TournamentRulesCard';
import InfoCard from './shared/InfoCard';

export const TournamentDetails = ({
  tournament,
}: {
  tournament: TournamentApiValues;
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Basic Info */}
        <InfoCard
          icon={<Trophy className="w-5 h-5" />}
          title={t('tournament.basicInfo')}
          borderColor="border-blue-100"
          titleColor="text-blue-700"
        >
          <BasicInfoCard
            title={tournament.title}
            format={tournament.format}
            status={tournament.status}
          />
        </InfoCard>

        {/* Game Settings */}
        <InfoCard
          icon={<Target className="w-5 h-5" />}
          title={t('dashboard.settings')}
          borderColor="border-green-100"
          titleColor="text-green-700"
          className="col-span-2 order-2 lg:order-0"
        >
          <GameSettingsCard
            courts={tournament.courts}
            pointsPerMatch={tournament.pointsPerMatch}
            teamFormat={tournament.teamFormat}
            finalMatch={tournament.finalMatch}
            resultSorting={tournament.resultSorting}
          />
        </InfoCard>

        {/* Timeline */}
        <InfoCard
          icon={<Calendar className="w-5 h-5" />}
          title={t('dashboard.timeInfo')}
          borderColor="border-purple-100"
          titleColor="text-purple-700"
        >
          <TimeInfoCard createdAt={tournament.createdAt} />
        </InfoCard>
      </div>

      {/* Players */}
      <InfoCard
        icon={<Users className="w-5 h-5" />}
        title={t('tournament.playersTitle')}
        borderColor="border-orange-100"
        titleColor="text-orange-700"
      >
        <PlayersCard players={tournament.players} />
      </InfoCard>

      {/* Tournament Rules */}
      <InfoCard
        icon={<ReceiptText className="w-5 h-5" />}
        title={t('dashboard.tournamentRules', { format: tournament.format })}
        borderColor="border-orange-100"
        titleColor="text-orange-700"
      >
        <TournamentRulesCard format={tournament.format} />
      </InfoCard>
    </div>
  );
};
