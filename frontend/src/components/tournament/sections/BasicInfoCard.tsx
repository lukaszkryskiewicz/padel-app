import type { TournamentApiValues } from '@/types/tournament';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STATUS_TOURNAMENT_OPTIONS } from '@/constants/tournaments';
import { useTranslation } from 'react-i18next';
import InfoItem from '../shared/InfoItem';
import { findOptionLabel } from '@/lib/tournament-utils';

const BasicInfoCard = ({
  title,
  format,
  status,
}: Pick<TournamentApiValues, 'title' | 'format' | 'status'>) => {
  const { t } = useTranslation();

  return (
    <CardContent className="space-y-3">
      <InfoItem label={t('tournament.tournamentName')} value={title} />
      <InfoItem
        label={t('dashboard.format')}
        value={
          <Badge variant="secondary" className="text-sm">
            {format}
          </Badge>
        }
      />
      <InfoItem
        label={t('dashboard.status')}
        value={
          <Badge
            variant={
              status === 'NEW'
                ? 'default'
                : status === 'FINISHED'
                ? 'destructive'
                : 'outline'
            }
            className={status === 'IN PROGRESS' ? 'bg-green-500' : ''}
          >
            {t(findOptionLabel(STATUS_TOURNAMENT_OPTIONS, status))}
          </Badge>
        }
      />
    </CardContent>
  );
};

export default BasicInfoCard;
