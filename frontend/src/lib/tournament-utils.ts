import type { Option, Match, MatchUpdatePayload } from '../types/tournament';

export function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export function findOptionLabel(
  options: Option[],
  value: string,
  defaultValue = ''
): string {
  const option = options.find((opt) => opt.value === value.toString());
  return option?.i18nKey || option?.label || defaultValue;
}

export function mapMatchesToPayload(matches: Match[]): MatchUpdatePayload[] {
  return matches.map((match) => ({
    match_id: match.id,
    team_1Score: match.team_1Score,
    team_2Score: match.team_2Score,
    played: match.played,
    updatedAt: match.updatedAt,
  }));
}
