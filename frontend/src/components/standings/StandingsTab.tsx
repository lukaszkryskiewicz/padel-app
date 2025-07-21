import { useState, useEffect } from 'react';
import type { StandingsTabProps, Standings } from '@/types/tournament';
import { getPlayersRanking } from '@/api/tournaments';
import { useTranslation } from 'react-i18next';
import StandingsHeader from './sections/StandingsHeader';
import StandingsTable from './sections/StandingsTable';

const StandingsTab = ({ tournamentId, roundNumber }: StandingsTabProps) => {
  const { t } = useTranslation();
  const [standings, setStandings] = useState<Standings[]>([]);

  useEffect(() => {
    const fetchRanking = async () => {
      if (!tournamentId) {
        console.error('No tournament ID!');
        return;
      }
      try {
        const response = await getPlayersRanking(tournamentId);
        setStandings(response.data);
      } catch (error) {
        console.error('Error fetching tournament:', error);
      }
    };

    fetchRanking();
  }, [roundNumber, tournamentId]);

  if (!tournamentId || !roundNumber) {
    return (
      <p className="text-center text-gray-500">
        {!tournamentId
          ? t('dashboard.notFound')
          : !roundNumber
          ? t('standings.roundError')
          : t('stadings.generalError')}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {standings.length > 0 ? (
        <>
          <StandingsHeader standings={standings} />
          <StandingsTable standings={standings} />
        </>
      ) : (
        <span className="flex justify-center text-2xl">
          {t('standings.empty')}
        </span>
      )}
    </div>
  );
};

export default StandingsTab;
