import { useState, useEffect } from 'react';
import { getSingleTournamentApi } from '@/api/tournaments';
import { useParams } from 'react-router';
import { Trophy, Clock, Loader } from 'lucide-react';
import type { TournamentFormValues } from '@/types/tournament';
import { TournamentDetails } from '@/components/tournament/tournamentDetails';

const TournamentDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState<TournamentFormValues | null>(
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
    return <p className="text-center text-gray-500">Tournament not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        <TournamentDetails tournament={tournament} />
      </div>
    </div>
  );
};

export default TournamentDashboard;
