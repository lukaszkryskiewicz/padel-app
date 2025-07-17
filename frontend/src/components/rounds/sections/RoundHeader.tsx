import type { RoundHeaderProps } from '@/types/tournament';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle } from 'lucide-react';

const RoundHeader = ({
  roundNumber,
  courts,
  completedMatches,
  totalMatches,
  createNextRound,
}: RoundHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {t('round.round', { round: roundNumber })}
        </h2>
        <p className="text-gray-600">{t('round.courts', { count: courts })}</p>
      </div>
      <div className="flex items-center gap-4">
        <Badge
          variant={completedMatches === totalMatches ? 'default' : 'secondary'}
          className="text-sm"
        >
          {completedMatches === totalMatches ? (
            <>
              <CheckCircle className="w-4 h-4 mr-1" />
              {t('round.finished')}
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 mr-1" />
              {t('round.inProgress')} ({completedMatches}/{totalMatches})
            </>
          )}
        </Badge>
        <button
          onClick={createNextRound}
          disabled={completedMatches !== totalMatches}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            completedMatches === totalMatches
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {t('round.nextRound')}
        </button>
      </div>
    </div>
  );
};

export default RoundHeader;
