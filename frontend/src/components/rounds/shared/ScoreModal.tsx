import type { ScoreModalProps } from '@/types/tournament';
import { useTranslation } from 'react-i18next';

const ScoreModal = ({
  pointsPerMatch,
  handleSelect,
  onClose,
  activeTeam,
}: ScoreModalProps) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-center mb-4">
          {t('round.setScore')} {activeTeam}
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: parseInt(pointsPerMatch) + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className="bg-gray-200 hover:bg-blue-500 hover:border-blue-50 transition-all hover:text-white font-bold py-4 text-xl rounded-lg"
            >
              {i}
            </button>
          ))}
        </div>
        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
          >
            {t('round.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreModal;
