import type { Option } from '../types/tournament';

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
