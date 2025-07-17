import type { ProgressBarProps } from '@/types/tournament';

const ProgressBar = ({ completedMatches, totalMatches }: ProgressBarProps) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
        style={{ width: `${(completedMatches / totalMatches) * 100}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
