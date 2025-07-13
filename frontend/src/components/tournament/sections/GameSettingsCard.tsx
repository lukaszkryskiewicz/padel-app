import { useTranslation } from 'react-i18next';
import type { TournamentApiValues } from '@/types/tournament';
import { CardContent } from '@/components/ui/card';
import {
  FINAL_MATCH_OPTIONS,
  RESULT_SORTING_OPTIONS,
  TEAM_FORMAT_OPTIONS,
} from '@/constants/tournaments';
import InfoItem from '../shared/InfoItem';
import { findOptionLabel } from '@/lib/tournament-utils';

const GameSettingsCard = ({
  courts,
  pointsPerMatch,
  teamFormat,
  finalMatch,
  resultSorting,
}: Pick<
  TournamentApiValues,
  'courts' | 'pointsPerMatch' | 'teamFormat' | 'finalMatch' | 'resultSorting'
>) => {
  const { t } = useTranslation();

  return (
    <CardContent className="space-y-3">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          <InfoItem
            label={t('tournament.courtsSum')}
            value={courts ? courts.length : 0}
          />
          <InfoItem label={t('dashboard.points')} value={pointsPerMatch} />
          <InfoItem
            label={t('tournament.teamFormatLabel')}
            value={t(findOptionLabel(TEAM_FORMAT_OPTIONS, teamFormat))}
          />
        </div>
        <div className="space-y-4">
          <InfoItem
            label={t('tournament.finalMatchLabel')}
            value={t(findOptionLabel(FINAL_MATCH_OPTIONS, finalMatch))}
          />
          <InfoItem
            label={t('tournament.resultSortingLabel')}
            value={t(findOptionLabel(RESULT_SORTING_OPTIONS, resultSorting))}
          />
        </div>
      </div>
    </CardContent>
  );
};

export default GameSettingsCard;
