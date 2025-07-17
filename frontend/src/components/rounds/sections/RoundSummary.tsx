import { Card, CardContent } from '@/components/ui/card';
import type { RoundSummaryProps } from '@/types/tournament';
import { useTranslation } from 'react-i18next';

const RoundSummary = ({
  completedMatches,
  totalMatches,
}: RoundSummaryProps) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="text-sm text-center">
          <span className="font-semibold text-gray-900">
            {t('round.summary', {
              completedMatches: completedMatches,
              totalMatches: totalMatches,
              percentCompleted: Math.round(
                (completedMatches / totalMatches) * 100
              ),
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoundSummary;
