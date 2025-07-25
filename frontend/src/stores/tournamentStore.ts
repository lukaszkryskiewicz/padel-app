import type { TournamentState } from '@/types/tournament';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useTournamentStore = create<TournamentState>()(
  devtools(
    persist(
      (set) => ({
        tournaments: {},
        matches: {},
        standings: {},
        tournamentForm: {
          title: '',
          format: 'AMERICANO',
          pointsPerMatch: '11',
          resultSorting: 'POINTS',
          teamFormat: 'PLAYER',
          finalMatch: '1',
          courts: [],
          players: [],
        },
        matchesInProgress: {},
        addTournament: (newTournament) =>
          set((state) => ({
            tournaments: {
              ...state.tournaments,
              [newTournament.id]: newTournament,
            },
          })),
        updateTournament: (patch) =>
          set((state) => ({
            tournaments: {
              ...state.tournaments,
              [patch.id]: {
                ...state.tournaments[patch.id],
                ...patch,
              },
            },
          })),
        addMatches: (tournamentId, newMatches) =>
          set((state) => ({
            matches: {
              ...state.matches,
              [tournamentId]: [
                ...(state.matches[tournamentId] || []),
                ...newMatches,
              ],
            },
          })),
        updateMatches: (tournamentId, matchesToUpdate) =>
          set((state) => ({
            matches: {
              ...state.matches,
              [tournamentId]: (state.matches[tournamentId] || []).map(
                (match) => {
                  const findMatch = matchesToUpdate.find(
                    (matchToUpdate) => matchToUpdate.id === match.id
                  );
                  return findMatch ? { ...match, ...findMatch } : match;
                }
              ),
            },
          })),
        updateSingleMatch: (tournamentId, updatedMatch) =>
          set((state) => ({
            matches: {
              ...state.matches,
              [tournamentId]: (state.matches[tournamentId] || []).map((m) =>
                m.id === updatedMatch.id ? { ...m, ...updatedMatch } : m
              ),
            },
          })),
        setStandings: (tournamentId, standings) =>
          set((state) => ({
            standings: { ...state.standings, [tournamentId]: standings },
          })),
        setTournamentFormValues: (formValues) =>
          set((state) => ({
            tournamentForm: { ...state.tournamentForm, ...formValues },
          })),
        resetTournamentFormValues: () =>
          set(() => ({
            tournamentForm: {
              title: '',
              format: 'AMERICANO',
              pointsPerMatch: '11',
              resultSorting: 'POINTS',
              teamFormat: 'PLAYER',
              finalMatch: '1',
              courts: [],
              players: [],
            },
          })),
        setMatchesInProgress: (tournamentId, matches) =>
          set((state) => ({
            matchesInProgress: {
              ...state.matchesInProgress,
              [tournamentId]: matches,
            },
          })),
        setSingleMatchInProgress: (tournamentId, match) =>
          set((state) => ({
            matchesInProgress: {
              ...state.matchesInProgress,
              [tournamentId]: (state.matchesInProgress[tournamentId] || []).map(
                (singleMatch) =>
                  singleMatch.id === match.id ? match : singleMatch
              ),
            },
          })),
        resetMatchesInProgress: (tournamentId) =>
          set((state) => ({
            matchesInProgress: {
              ...state.matchesInProgress,
              [tournamentId]: [],
            },
          })),
      }),

      {
        name: 'padel-tournaments',
        partialize: (state) => ({
          tournaments: state.tournaments,
          matches: state.matches,
          standings: state.standings,
          tournamentForm: state.tournamentForm,
          matchesInProgress: state.matchesInProgress,
        }),
      }
    )
  )
);
