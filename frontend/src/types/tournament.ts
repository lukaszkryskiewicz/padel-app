export interface Player {
  name: string;
}

export interface Court {
  name: string;
  number?: number;
}

export type TournamentFormat = 'AMERICANO' | 'MEXICANO';
export type PointsPerMatch = '11' | '21' | '24' | '-1';
export type ResultSorting = 'POINTS' | 'WINS';
export type TeamFormat = 'PLAYER' | 'PAIR';
export type FinalMatchType = '1' | '2' | '3';

export interface TournamentFormValues {
  title: string;
  format: TournamentFormat;
  pointsPerMatch: PointsPerMatch;
  resultSorting: ResultSorting;
  teamFormat: TeamFormat;
  finalMatch: FinalMatchType;
  players: Player[];
  courts: Court[];
}

export interface TournamentApiValues extends TournamentFormValues {
  id: number;
  status: string;
  createdAt: string;
}

export interface TournamentFormProps {
  onSubmit: (data: TournamentFormValues) => void;
  isSubmitting: boolean;
}

export interface FormSectionCardProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
}

export interface Option {
  i18nKey?: string;
  label?: string;
  value: string;
  id?: string;
}

export interface RadioGroupFieldProps {
  name: string;
  label?: string;
  options: Option[];
  icon?: React.ReactNode;
  className?: string;
}

export interface DynamicInputListProps {
  name: 'players' | 'courts';
  icon: React.ReactNode;
  addButtonIcon: React.ReactNode;
}

export interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  borderColor: string;
  titleColor: string;
  children: React.ReactNode;
  className?: string;
}

export interface InfoItemProps {
  label: string;
  value: string | number | React.ReactNode;
}
