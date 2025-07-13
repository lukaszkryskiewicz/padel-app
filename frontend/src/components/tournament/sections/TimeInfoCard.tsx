import type { TournamentApiValues } from '@/types/tournament';
import { CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import InfoItem from '../shared/InfoItem';

const TimeInfoCard = ({
  createdAt,
}: Pick<TournamentApiValues, 'createdAt'>) => {
  const { t } = useTranslation();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <CardContent className="space-y-5">
      <InfoItem
        label={t('dashboard.createdAt')}
        value={createdAt && formatDate(createdAt)}
      />
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        <span>
          {t('dashboard.wasCreated', {
            count: Math.floor(
              (Date.now() - new Date(createdAt).getTime()) /
                (1000 * 60 * 60 * 24)
            ),
          })}
        </span>
      </div>
    </CardContent>
  );
};

export default TimeInfoCard;
