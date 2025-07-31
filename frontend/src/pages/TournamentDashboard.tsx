import { useState, useEffect } from 'react';
import {
  getSingleTournamentApi,
  generateNewRound,
  updateRound,
  finishTournament,
} from '@/api/tournaments';
import { useParams } from 'react-router';
import { Loader } from 'lucide-react';
import type { Match } from '@/types/tournament';
import { TournamentDetails } from '@/components/tournament/TournamentDetails';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import DashboardHeader from '@/components/tournament/sections/DashboardHeader';
import { useTranslation } from 'react-i18next';
import RoundTab from '@/components/rounds/RoundTab';
import { mapMatchesToPayload } from '@/lib/tournament-utils';
import StandingsTab from '@/components/standings/StandingsTab';
import { useTournamentStore } from '@/stores/tournamentStore';
import axios from 'axios';
import { createPortal } from 'react-dom';
import SaveErrorModal from '@/components/tournament/shared/SaveErrorModal';

const TournamentDashboard = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  const tournament = useTournamentStore((state) => id && state.tournaments[id]);
  const updateTournament = useTournamentStore(
    (state) => state.updateTournament
  );
  const setCachedRounds = useTournamentStore((state) => state.setCachedRound);
  const resetMatchesInProgress = useTournamentStore(
    (state) => state.resetMatchesInProgress
  );
  const [activeTab, setActiveTab] = useState<string>('tournamentInfo');

  useEffect(() => {
    const fetchTournament = async () => {
      if (!id) {
        console.error('No tournament ID in URL');
        setLoading(false);
        return;
      }

      try {
        const response = await getSingleTournamentApi(id);
        updateTournament(response.data);
      } catch (error) {
        console.error('Error fetching tournament:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin w-8 h-8 text-orange-500" />
      </div>
    );
  }

  if (!tournament || !id) {
    return (
      <p className="text-center text-gray-500">{t('dashboard.notFound')}</p>
    );
  }

  const saveRoundScores = async (roundId: number, roundData: Match[]) => {
    if (!id) {
      console.warn('No tournament ID provided');
      return;
    }
    try {
      if (roundData.some((round) => round.roundNumber != roundId)) {
        throw new Error(`Some matches do not match round ${roundId}`);
      }

      const payload = mapMatchesToPayload(roundData);
      await updateRound(id, roundId, payload);

      setCachedRounds(id, String(roundId), roundData);
      resetMatchesInProgress(id, String(roundId));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setModal(true);
        console.error(
          'Round was already updated by other user, please refresh the page'
        );
      } else {
        console.error('Failed to save round scores:', error);
      }
      throw error;
    }
  };

  const saveScoresAndGenerateRound = async (
    roundId: number,
    roundData: Match[],
    finalRound: boolean
  ) => {
    try {
      setLoading(true);
      await saveRoundScores(roundId, roundData);
      if (tournament.finalRound === tournament.numberOfRounds) {
        await endTournament();
        return;
      } else {
        await generateRound(finalRound);
      }
    } catch (error) {
      console.error(
        'Failed to save scores, generate next round or finish tournament:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const generateRound = async (finalRound = false) => {
    if (!id) {
      console.warn('No tournament ID provided');
      return;
    }
    try {
      await generateNewRound(id, finalRound);
      const response = await getSingleTournamentApi(id);
      updateTournament(response.data);
      setActiveTab(`round${response.data.numberOfRounds}`);
      console.log(response.data);
    } catch (error) {
      console.error('Failed to generete round:', error);
    }
  };

  const endTournament = async () => {
    if (!id) {
      console.warn('No tournament ID provided');
      return;
    }
    try {
      await finishTournament(id);
      setActiveTab('playersRanking');
    } catch (error) {
      console.error('Failed to end Tournament', error);
    }
  };

  return (
    <>
      {modal &&
        createPortal(
          <SaveErrorModal generateRound={generateRound} setModal={setModal} />,
          document.body
        )}
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader tournament={tournament} />
          <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full h-auto p-2 bg-gray-100 rounded-lg flex flex-wrap justify-start gap-2 mb-6">
                  <TabsTrigger value="tournamentInfo" className="px-6 py-3">
                    {t('dashboard.tournamentInfo')}
                  </TabsTrigger>
                  {[...Array(tournament.numberOfRounds)].map((_, i) => (
                    <TabsTrigger
                      key={`round${i + 1}`}
                      value={`round${i + 1}`}
                      className="px-6 py-3"
                    >
                      {t('round.round', { round: i + 1 })}
                    </TabsTrigger>
                  ))}
                  {tournament.numberOfRounds > 0 && (
                    <TabsTrigger value="playersRanking" className="px-6 py-3">
                      {t('standings.title')}
                    </TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="tournamentInfo">
                  <TournamentDetails tournament={tournament} />
                </TabsContent>
                {[...Array(tournament.numberOfRounds)].map((_, i) => (
                  <TabsContent key={`round${i + 1}`} value={`round${i + 1}`}>
                    <RoundTab
                      roundNumber={i + 1}
                      tournamentId={id}
                      latestRound={tournament.numberOfRounds}
                      pointsPerMatch={tournament.pointsPerMatch}
                      courts={tournament.courts.length}
                      saveScoresAndGenerateRound={saveScoresAndGenerateRound}
                      finalRound={tournament.finalRound}
                      tournamentStatus={tournament.status}
                    />
                  </TabsContent>
                ))}
                {tournament.numberOfRounds > 0 && (
                  <TabsContent value="playersRanking">
                    <StandingsTab
                      tournamentId={id}
                      tournamentStatus={tournament.status}
                      roundNumber={tournament.numberOfRounds}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
          {tournament.status === 'NEW' && (
            <Button
              className="mx-auto my-10 px-8 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg rounded-md flex items-center gap-2"
              onClick={() => generateRound(false)}
            >
              {t('dashboard.firstRound')}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default TournamentDashboard;
