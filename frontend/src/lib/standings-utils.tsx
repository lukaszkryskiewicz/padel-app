import { Trophy, Medal, Award } from 'lucide-react';

export const getRankBackgroundClass = (position: number) => {
  return position <= 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100' : '';
};

export const getRankIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />;
    default:
      return (
        <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">
          {position}
        </span>
      );
  }
};

export const getRankBadge = (position: number) => {
  if (position <= 3) {
    const colors = {
      1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      2: 'bg-gray-100 text-gray-800 border-gray-300',
      3: 'bg-amber-100 text-amber-800 border-amber-300',
    };
    return colors[position as keyof typeof colors];
  }
  return 'bg-gray-50 text-gray-600 border-gray-200';
};
