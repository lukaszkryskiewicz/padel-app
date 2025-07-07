export const TOURNAMENT_FORMAT_OPTIONS = [
  {
    value: 'AMERICANO',
    i18nKey: 'options.format.americano',
    id: 'americano',
  },
  { value: 'MEXICANO', i18nKey: 'options.format.mexicano', id: 'mexicano' },
];

export const RESULT_SORTING_OPTIONS = [
  { value: 'WINS', i18nKey: 'options.resultSorting.wins', id: 'wins' },
  { value: 'POINTS', i18nKey: 'options.resultSorting.points', id: 'points' },
];

export const TEAM_FORMAT_OPTIONS = [
  { value: 'PLAYER', i18nKey: 'options.teamFormat.player', id: 'player' },
  { value: 'PAIR', i18nKey: 'options.teamFormat.pair', id: 'pair' },
];

export const FINAL_MATCH_OPTIONS = [
  { value: '1', label: '1 & 2 vs 3 & 4', id: '1-2-vs-3-4' },
  { value: '2', label: '1 & 3 vs 2 & 4', id: '1-3-vs-2-4' },
  { value: '3', label: '1 & 4 vs 2 & 3', id: '1-4-vs-2-3' },
];
export const POINTS_PER_MATCH_OPTIONS = [
  { value: '11', i18nKey: 'options.pointsPerMatch.11', id: '11pts' },
  { value: '21', i18nKey: 'options.pointsPerMatch.21', id: '21pts' },
  { value: '24', i18nKey: 'options.pointsPerMatch.24', id: '24pts' },
  { value: 'ANY', i18nKey: 'options.pointsPerMatch.any', id: 'any' },
];
