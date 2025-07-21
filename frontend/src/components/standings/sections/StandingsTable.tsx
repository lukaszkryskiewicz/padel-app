import type { Standings } from '@/types/tournament';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import DetailedStandings from './DetailedStandings';
import GeneralStandings from './GeneralStandings';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

const StandingsTable = ({ standings }: { standings: Standings[] }) => {
  const { t } = useTranslation();
  const [rankingView, setRankingView] = useState<'general' | 'detailed'>(
    'general'
  );

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="w-6 h-6 text-yellow-500" />
            {t('standings.finalStandings')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {rankingView === 'detailed'
                ? t('standings.generalView')
                : t('standings.detailedView')}
            </span>
            <Switch
              checked={rankingView === 'detailed'}
              onCheckedChange={() =>
                setRankingView(
                  rankingView === 'general' ? 'detailed' : 'general'
                )
              }
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {rankingView === 'detailed' ? (
          <DetailedStandings standings={standings} />
        ) : (
          <GeneralStandings standings={standings} />
        )}
      </CardContent>
    </Card>
  );
};

export default StandingsTable;
