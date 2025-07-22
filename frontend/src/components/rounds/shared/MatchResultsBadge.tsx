import type { MatchResultsBadgeProps } from '@/types/tournament';
import { useTranslation } from 'react-i18next';

const MatchResultBadge = ({ isDraw, winningTeam }: MatchResultsBadgeProps) => {
  const { t } = useTranslation();
  if (isDraw) {
    return (
      <div className="text-center p-3 bg-yellow-100 rounded-lg">
        <span className="text-yellow-800 font-semibold">{t('round.draw')}</span>
      </div>
    );
  }

  return (
    <div className="text-center p-3 bg-green-100 rounded-lg">
      <span className="text-green-800 font-semibold">
        {t('round.winner', { team: winningTeam })}
      </span>
    </div>
  );
};

export default MatchResultBadge;
