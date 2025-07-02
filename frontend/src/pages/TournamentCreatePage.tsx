import { useState } from 'react';
import TournamentForm from '@/components/tournament-form/TournamentForm';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TournamentFormValues {
  title: string;
  format: 'Americano' | 'Mexicano';
  scoring: 'Do 11 punktów' | 'Do 21 punktów' | 'Do 24 punktów' | 'Dowolne';
  resultSorting: 'Po punktach' | 'Po wygranych';
  teamFormat: 'Gracz' | 'Para';
  finalMatch: '1 & 2 vs 3 & 4' | '1 & 3 vs 2 & 4' | '1 & 4 vs 2 & 3';
  players: { name: string }[];
  courts: { name: string }[];
}

const TournamentCreatePage = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTournament = async (data: TournamentFormValues) => {
    setIsSubmitting(true);

    try {
      console.log('Creating tournament:', data);
    } catch (error) {
      console.error('Błąd:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Trophy className="text-orange-500" />
            {t('tournament.pageTitle')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('tournament.pageDescription')}
          </p>
        </div>
        <TournamentForm
          onSubmit={handleCreateTournament}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default TournamentCreatePage;
