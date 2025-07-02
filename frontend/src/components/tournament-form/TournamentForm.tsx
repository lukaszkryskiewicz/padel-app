import { useForm, FormProvider } from 'react-hook-form';
import TournamentSettings from './TournamentSettings';
import { Button } from '../ui/button';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TournamentFormData {
  title: string;
  format: 'Americano' | 'Mexicano';
  scoring: 'Do 11 punktów' | 'Do 21 punktów' | 'Do 24 punktów' | 'Dowolne';
  resultSorting: 'Po punktach' | 'Po wygranych';
  teamFormat: 'Gracz' | 'Para';
  finalMatch: '1 & 2 vs 3 & 4' | '1 & 3 vs 2 & 4' | '1 & 4 vs 2 & 3';
  players: { name: string }[];
  courts: { name: string }[];
}

interface TournamentFormProps {
  onSubmit: (data: TournamentFormData) => void;
  isSubmitting: boolean;
}

const TournamentForm = ({
  onSubmit,
  isSubmitting = false,
}: TournamentFormProps) => {
  const { t } = useTranslation();
  const methods = useForm<TournamentFormData>({
    defaultValues: {
      title: '',
      format: 'Americano',
      scoring: 'Do 21 punktów',
      resultSorting: 'Po punktach',
      teamFormat: 'Gracz',
      finalMatch: '1 & 3 vs 2 & 4',
      players: [],
      courts: [],
    },
  });

  const handleSubmit = methods.handleSubmit((data) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      console.log(data);
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <TournamentSettings />
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg rounded-md flex items-center gap-2"
            >
              <Trophy className="w-5 h-5 mr-2" />
              {isSubmitting
                ? t('tournament.creating')
                : t('tournament.createButton')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default TournamentForm;
