import type { SaveErrorModalProps } from '@/types/tournament';
import { useTranslation } from 'react-i18next';

const SaveErrorModal = ({ generateRound, setModal }: SaveErrorModalProps) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-center mb-4">
          {t('errors.saveScore')}
        </h3>
        <div className="text-center mt-6">
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full py-2 rounded-lg font-medium transition-colors bg-green-500 hover:bg-green-600 text-white shadow-lg"
          >
            {t('round.refresh')}
          </button>
          <button
            onClick={() => {
              generateRound(false);
              setModal(false);
            }}
            className="mt-4 w-full py-2 rounded-lg font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
          >
            {t('round.nextRound')}
          </button>
          <button
            onClick={() => {
              generateRound(true);
              setModal(false);
            }}
            className="mt-4 w-full py-2 rounded-lg font-medium transition-colors bg-red-500 hover:bg-red-600 text-white shadow-lg"
          >
            {t('round.finalRound')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveErrorModal;
