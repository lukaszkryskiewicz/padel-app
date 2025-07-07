import { useState } from 'react';
import TournamentForm from '@/components/tournament-form/TournamentForm';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TournamentFormValues } from '@/types/tournament';
import { createTournamentApi } from '@/api/tournaments';

const TournamentCreatePage = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTournament = async (data: TournamentFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await createTournamentApi(data);
      console.log(response);
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
