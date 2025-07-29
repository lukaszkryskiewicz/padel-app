import { getSingleRoundMatchesApi } from '@/api/tournaments';
import { Trophy, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import CourtView from './sections/CourtView';
import type { Match, RoundTabProps } from '@/types/tournament';
import { useTranslation } from 'react-i18next';
import RoundHeader from './sections/RoundHeader';
import ProgressBar from './shared/ProgressBar';
import RoundSummary from './sections/RoundSummary';
import { useTournamentStore } from '@/stores/tournamentStore';
import { STATUS_TOURNAMENT_OPTIONS } from '@/constants/tournaments';

const RoundTab = ({
  roundNumber,
  tournamentId,
  latestRound,
  pointsPerMatch,
  courts,
  saveScoresAndGenerateRound,
  finalRound,
  tournamentStatus,
}: RoundTabProps) => {
  const cachedRounds = useTournamentStore((state) => state.cachedRounds);
  const setCachedRound = useTournamentStore((state) => state.setCachedRound);

  const matchesInProgress = useTournamentStore(
    (state) => state.matchesInProgress
  );
  const setMatchesInProgress = useTournamentStore(
    (state) => state.setMatchesInProgress
  );
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [roundLocal, setRoundLocal] = useState<Match[]>([]);
  const [completedMatches, setCompletedMatches] = useState<number>(0);
  const totalMatches = roundLocal.length;

  useEffect(() => {
    if (!roundNumber || !tournamentId) {
      console.error('No tournament ID or round number in URL');
      setLoading(false);
      return;
    }
    // checks if the round was saved as in progress ins store
    if (matchesInProgress[tournamentId]?.[roundNumber]) {
      setRoundLocal(matchesInProgress[tournamentId][roundNumber]);
      setLoading(false);
      return;
    }
    // checks if the round is saved in store
    if (cachedRounds[tournamentId]?.[roundNumber]) {
      setRoundLocal(cachedRounds[tournamentId][roundNumber]);
      setLoading(false);
      return;
    }

    const fetchRound = async () => {
      try {
        const response = await getSingleRoundMatchesApi(
          roundNumber,
          tournamentId
        );
        setRoundLocal(response.data);

        if (
          latestRound === roundNumber &&
          tournamentStatus === STATUS_TOURNAMENT_OPTIONS[1].value
        ) {
          setMatchesInProgress(
            tournamentId,
            String(roundNumber),
            response.data
          );
        } else {
          setCachedRound(tournamentId, String(roundNumber), response.data);
        }
      } catch (error) {
        console.error('Error fetching round:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRound();
  }, [roundNumber, tournamentId]);

  const updateMatchInRound = (updatedMatch: Match) => {
    setRoundLocal((prev) =>
      prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
    );
    if (tournamentId)
      setMatchesInProgress(tournamentId, String(roundNumber), roundLocal);
  };

  useEffect(() => {
    const completed = roundLocal.filter(
      (match) => match.played === true
    ).length;
    setCompletedMatches(completed);
  }, [roundLocal]);

  const saveRound = (finalRound = false) => {
    saveScoresAndGenerateRound(roundNumber, roundLocal, finalRound);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin w-8 h-8 text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RoundHeader
        roundNumber={roundNumber}
        courts={courts}
        latestRound={latestRound}
        completedMatches={completedMatches}
        totalMatches={totalMatches}
        saveRound={saveRound}
        finalRound={finalRound}
        tournamentStatus={tournamentStatus}
      />

      <ProgressBar
        completedMatches={completedMatches}
        totalMatches={totalMatches}
      />

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          <Trophy className="text-blue-500" />
          {t('round.round', { round: roundNumber })}
        </h1>
        <div className="flex items-center justify-center gap-4 text-lg text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>
              {t('round.progress', { completedMatches: completedMatches })}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {roundLocal.map((match: Match) => (
          <Card
            key={match.id}
            className="shadow-lg border-0 bg-white/80 backdrop-blur-sm"
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-gray-800 text-lg">
                {match.court.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CourtView
                match={match}
                updateMatchInRound={updateMatchInRound}
                pointsPerMatch={pointsPerMatch}
                isReadOnly={latestRound !== roundNumber}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <RoundSummary
        totalMatches={totalMatches}
        completedMatches={completedMatches}
      />
    </div>
  );
};

export default RoundTab;
