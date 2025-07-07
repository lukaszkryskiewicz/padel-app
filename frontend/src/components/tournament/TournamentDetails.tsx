import type { TournamentFormValues } from '@/types/tournament';
import { Card, CardTitle, CardHeader, CardContent } from '../ui/card';
import { getLabelForValue } from '@/lib/getLabelForValue';
import {
  TOURNAMENT_FORMAT_OPTIONS,
  TEAM_FORMAT_OPTIONS,
  RESULT_SORTING_OPTIONS,
  POINTS_PER_MATCH_OPTIONS,
  FINAL_MATCH_OPTIONS,
} from '@/constants/tournaments';
import { useTranslation } from 'react-i18next';

export const TournamentDetails = ({
  tournament,
}: {
  tournament: TournamentFormValues;
}) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <Card className="shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">
            {tournament.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            <span className="font-semibold">
              {t('tournament.tournamentType')}:
            </span>{' '}
            {t(
              TOURNAMENT_FORMAT_OPTIONS.find(
                (opt) => opt.value === tournament.format
              )?.i18nKey || ''
            )}
          </p>
          <p>
            <span className="font-semibold">
              {' '}
              {t('tournament.teamFormatLabel')}:
            </span>{' '}
            {t(
              TEAM_FORMAT_OPTIONS.find(
                (opt) => opt.value === tournament.teamFormat
              )?.i18nKey || ''
            )}
          </p>
          <p>
            <span className="font-semibold">
              {' '}
              {t('tournament.resultSortingLabel')}:
            </span>{' '}
            {t(
              RESULT_SORTING_OPTIONS.find(
                (opt) => opt.value === tournament.resultSorting
              )?.i18nKey || ''
            )}
          </p>
          <p>
            <span className="font-semibold">
              {' '}
              {t('tournament.finalMatchLabel')}:
            </span>{' '}
            {getLabelForValue(
              FINAL_MATCH_OPTIONS,
              tournament.finalMatch.toString()
            )}
          </p>
          <p>
            <span className="font-semibold">
              {' '}
              {t('tournament.pointsPerMatchLabel')}:
            </span>{' '}
            {t(
              POINTS_PER_MATCH_OPTIONS.find(
                (opt) => opt.value == tournament.pointsPerMatch
              )?.i18nKey || ''
            )}
          </p>

          <p>
            <span className="font-semibold">
              {' '}
              {t('tournament.playersTitle')}:
            </span>{' '}
            {tournament.players.map((p) => p.name).join(', ')}
          </p>

          <p>
            <span className="font-semibold">
              {' '}
              {t('tournament.courtsTitle')}:
            </span>{' '}
            {tournament.courts.map((c) => `${c.name} (${c.number})`).join(', ')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
