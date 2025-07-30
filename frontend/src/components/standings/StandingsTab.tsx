import { useState, useEffect } from 'react';
import type { StandingsTabProps, Standings } from '@/types/tournament';
import { getPlayersRanking } from '@/api/tournaments';
import { useTranslation } from 'react-i18next';
import StandingsHeader from './sections/StandingsHeader';
import StandingsTable from './sections/StandingsTable';
import { useTournamentStore } from '@/stores/tournamentStore';

const StandingsTab = ({
  tournamentId,
  tournamentStatus,
  roundNumber,
}: StandingsTabProps) => {
  const { t } = useTranslation();
  const [standings, setStandings] = useState<Standings[]>([]);
  const [error, setError] = useState<string | null>(null);
  const cachedStandings = useTournamentStore(
    (state) => (tournamentId && state.standings[tournamentId]) || []
  );
  const setCachedStandings = useTournamentStore((state) => state.setStandings);

  useEffect(() => {
    const fetchRanking = async () => {
      if (!tournamentId) {
        console.error('No tournament ID!');
        return;
      }

      //if cached shows last ranking
      if (cachedStandings.length) {
        setStandings(cachedStandings);
      }

      // then try to update ranking
      try {
        const response = await getPlayersRanking(tournamentId);
        setStandings(response.data);
        setCachedStandings(tournamentId, response.data);
      } catch (error) {
        setError(t('standings.updateError'));
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
          <StandingsTable
            standings={standings}
            tournamentStatus={tournamentStatus}
          />
          {error && (
            <div className="text-center text-red-500 mt-4">{error}</div>
          )}
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
