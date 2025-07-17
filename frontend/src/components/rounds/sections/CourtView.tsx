import type { CourtViewProps } from '@/types/tournament';
import { Users } from 'lucide-react';
import { useState } from 'react';
import ScoreModal from '../shared/ScoreModal';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

const CourtView = ({
  match,
  updateMatchInRound,
  pointsPerMatch,
}: CourtViewProps) => {
  const { t } = useTranslation();
  const [modal, setModal] = useState(false);
  const [activeTeam, setActiveTeam] = useState<'1' | '2' | null>(null);

  const team_1_players = match.players.filter(
    (player) => player.team === 'team1'
  );
  const team_2_players = match.players.filter(
    (player) => player.team === 'team2'
  );

  const handleClick = (team: '1' | '2' | null) => {
    setActiveTeam(team);
    setModal(true);
  };

  const handleSelect = (score: number) => {
    if (activeTeam && ['1', '2'].indexOf(activeTeam) != -1) {
      if (activeTeam === '1') {
        match.team_1Score = score;
        match.team_2Score = parseInt(pointsPerMatch) - score;
      } else if (activeTeam === '2') {
        match.team_2Score = score;
        match.team_1Score = parseInt(pointsPerMatch) - score;
      }
      match.played = true;
      updateMatchInRound(match);
    }
    setModal(false);
  };

  return (
    <>
      {modal &&
        activeTeam != null &&
        createPortal(
          <ScoreModal
            pointsPerMatch={pointsPerMatch}
            handleSelect={handleSelect}
            onClose={() => setModal(false)}
            activeTeam={activeTeam}
          />,
          document.body
        )}
      <div className="space-y-6">
        {/* Court Visual Representation */}
        <div className="relative bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-6 border-4 border-orange-300">
          {/* Court Layout */}
          <div className="grid grid-cols-2 gap-4 h-48">
            {/* Team 1 Side */}
            <div className="space-y-2">
              <div className="bg-blue-500 text-white rounded-lg p-3 text-center font-semibold">
                {team_1_players[0].name}
              </div>
              <div className="bg-blue-400 text-white rounded-lg p-3 text-center font-semibold">
                {team_1_players[1].name}
              </div>
              <div className="flex items-center justify-center mt-4">
                <div
                  onClick={() => handleClick('1')}
                  className="w-12 h-12 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center"
                >
                  {!match.played && <Users className="w-6 h-6 text-gray-500" />}
                  <span className="font-bold">{match.team_1Score}</span>
                </div>
              </div>
            </div>

            {/* Team 2 Side */}
            <div className="space-y-2">
              <div className="bg-red-500 text-white rounded-lg p-3 text-center font-semibold">
                {team_2_players[0].name}
              </div>
              <div className="bg-red-400 text-white rounded-lg p-3 text-center font-semibold">
                {team_2_players[1].name}
              </div>
              <div className="flex items-center justify-center mt-4">
                <div
                  onClick={() => handleClick('2')}
                  className="w-12 h-12 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center"
                >
                  {!match.played && <Users className="w-6 h-6 text-gray-500" />}
                  <span className="font-bold">{match.team_2Score}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Net Line */}
          <div className="absolute left-1/2 top-6 bottom-6 w-1 bg-gray-400 transform -translate-x-1/2"></div>
        </div>

        {/* Winner Display */}
        {match.played &&
          match.team_1Score &&
          match.team_2Score &&
          match.team_1Score !== match.team_2Score && (
            <div className="text-center p-3 bg-green-100 rounded-lg">
              <span className="text-green-800 font-semibold">
                {t('round.winner', {
                  team: match.team_1Score > match.team_2Score ? '1' : '2',
                })}
              </span>
            </div>
          )}
      </div>
    </>
  );
};

export default CourtView;
