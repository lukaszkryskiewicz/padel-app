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
  numberOfRounds: number;
  finalRound: number;
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

interface MatchCourts {
  id: number;
  name: string;
  number?: number;
  tournament: number;
}

interface MatchPlayers {
  id: number;
  name: string;
  team: 'team1' | 'team2';
}

export interface Match {
  id: number;
  roundNumber: number;
  court: MatchCourts;
  team_1Score: number | null;
  team_2Score: number | null;
  played: boolean;
  players: MatchPlayers[];
  updatedAt: string;
}

export interface RoundTabProps {
  roundNumber: number;
  tournamentId: string | undefined;
  latestRound: number;
  pointsPerMatch: string;
  courts: number;
  saveScoresAndGenerateRound: (
    roundId: number,
    roundData: Match[],
    finalRound: boolean
  ) => void;
  finalRound: number;
  tournamentStatus: string;
}

export interface RoundHeaderProps {
  roundNumber: number;
  courts: number;
  latestRound: number;
  completedMatches: number;
  totalMatches: number;
  saveRound: (finalRound: boolean) => void;
  finalRound: number;
  tournamentStatus: string;
}

export interface ProgressBarProps {
  completedMatches: number;
  totalMatches: number;
}

export interface RoundSummaryProps {
  completedMatches: number;
  totalMatches: number;
}
export interface CourtViewProps {
  match: Match;
  updateMatchInRound: (match: Match) => void;
  pointsPerMatch: string;
  isReadOnly: boolean;
}

export interface ScoreModalProps {
  pointsPerMatch: string;
  handleSelect: (score: number) => void;
  onClose: () => void;
  activeTeam: string;
}

export interface MatchUpdatePayload {
  match_id: number;
  team_1Score: number | null;
  team_2Score: number | null;
  played: boolean;
  updatedAt: string;
}

interface RoundsStanding {
  roundNumber: number;
  points: number;
  isWinner: boolean;
}

interface WinLossRecord {
  win: number;
  draw: number;
  loss: number;
}
export interface Standings {
  id: number;
  name: string;
  rounds: RoundsStanding[];
  totalPoints: number;
  totalMatches: number;
  winLossRecord: WinLossRecord;
  winRate: number;
}

export interface StandingsTabProps {
  tournamentId: string | undefined;
  tournamentStatus: string;
  roundNumber: number;
}

export interface StandingsTableCellProps {
  className: string;
  value: string | number;
}

export interface MatchResultsBadgeProps {
  isDraw: boolean;
  winningTeam?: number;
}

// store types

export interface TournamentState {
  tournaments: Record<string, TournamentApiValues>;
  standings: Record<string, Standings[]>;
  tournamentForm: TournamentFormValues;
  matchesInProgress: Record<string, Record<string, Match[]>>;
  cachedRounds: Record<string, Record<string, Match[]>>;

  // actions
  addTournament: (t: TournamentApiValues) => void;
  updateTournament: (
    patch: Partial<TournamentApiValues> & { id: string }
  ) => void;
  setStandings: (tournamentId: string, standings: Standings[]) => void;
  setTournamentFormValues: (formValues: TournamentFormValues) => void;
  resetTournamentFormValues: () => void;
  setMatchesInProgress: (
    tournamentId: string,
    roundId: string,
    matches: Match[]
  ) => void;
  setSingleMatchInProgress: (
    tournamentId: string,
    roundId: string,
    match: Match
  ) => void;
  resetMatchesInProgress: (tournamentId: string, roundId: string) => void;
  setCachedRound: (
    tournamentId: string,
    roundNumber: string,
    matches: Match[]
  ) => void;
  updateCachedRound: (
    tournamentId: string,
    roundNumber: string,
    matchesToUpdate: Match[]
  ) => void;
}
