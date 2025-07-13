import { useState, useEffect } from 'react';
import { getSingleTournamentApi, generateNewRound } from '@/api/tournaments';
import { useParams } from 'react-router';
import { Loader } from 'lucide-react';
import type { TournamentApiValues } from '@/types/tournament';
import { TournamentDetails } from '@/components/tournament/TournamentDetails';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import DashboardHeader from '@/components/tournament/sections/DashboardHeader';
import { useTranslation } from 'react-i18next';

const TournamentDashboard = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState<TournamentApiValues | null>(
    null
  );

  useEffect(() => {
    const fetchTournament = async () => {
      if (!id) {
        console.error('No tournament ID in URL');
        setLoading(false);
        return;
      }

      try {
        const response = await getSingleTournamentApi(id);
        setTournament(response.data);
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

  if (!tournament) {
    return (
      <p className="text-center text-gray-500">{t('dashboard.notFound')}</p>
    );
  }

  const generate_round = async () => {
    try {
      if (!id) return;
      const response = await generateNewRound(id);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching tournament:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader tournament={tournament} />
        <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <Tabs defaultValue="tournament_info" className="w-full">
              <TabsList className="w-full h-auto p-2 bg-gray-100 rounded-lg flex flex-wrap justify-start gap-2 mb-6">
                <TabsTrigger value="tournament_info" className="px-6 py-3">
                  {t('dashboard.tournamentInfo')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="tournament_info">
                <TournamentDetails tournament={tournament} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        {tournament.status === 'NEW' && (
          <Button
            className="mx-auto my-10 px-8 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg rounded-md flex items-center gap-2"
            onClick={generate_round}
          >
            {t('dashboard.firstRound')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TournamentDashboard;
