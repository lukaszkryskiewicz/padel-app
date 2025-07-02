export interface Player {
  name: string;
}

export interface Court {
  name: string;
}

export type TournamentFormat = 'Americano' | 'Mexicano';
export type ScoringSystem =
  | 'Do 11 punktów'
  | 'Do 21 punktów'
  | 'Do 24 punktów'
  | 'Dowolne';
export type ResultSorting = 'Po punktach' | 'Po wygranych';
export type TeamFormat = 'Gracz' | 'Para';
export type FinalMatchType =
  | '1 & 2 vs 3 & 4'
  | '1 & 3 vs 2 & 4'
  | '1 & 4 vs 2 & 3';

export interface TournamentFormValues {
  title: string;
  format: TournamentFormat;
  scoring: ScoringSystem;
  resultSorting: ResultSorting;
  teamFormat: TeamFormat;
  finalMatch: FinalMatchType;
  players: Player[];
  courts: Court[];
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

interface Option {
  label: string;
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
  name: 'tournament.players' | 'tournament.courts';
  icon: React.ReactNode;
  addButtonIcon: React.ReactNode;
}
