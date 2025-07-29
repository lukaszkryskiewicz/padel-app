import type { TournamentState } from '@/types/tournament';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useTournamentStore = create<TournamentState>()(
  devtools(
    persist(
      (set) => ({
        tournaments: {},
        standings: {},
        tournamentForm: {
          title: '',
          format: 'MEXICANO',
          pointsPerMatch: '21',
          resultSorting: 'POINTS',
          teamFormat: 'PAIR',
          finalMatch: '1',
          courts: [],
          players: [],
        },
        matchesInProgress: {},
        cachedRounds: {},
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
        setMatchesInProgress: (tournamentId, roundId, matches) =>
          set((state) => ({
            matchesInProgress: {
              ...state.matchesInProgress,
              [tournamentId]: {
                ...(state.matchesInProgress[tournamentId] || {}),
                [roundId]: matches,
              },
            },
          })),
        setSingleMatchInProgress: (tournamentId, roundId, match) =>
          set((state) => ({
            matchesInProgress: {
              ...state.matchesInProgress,
              [tournamentId]: {
                ...(state.matchesInProgress[tournamentId] || {}),
                [roundId]: (
                  state.matchesInProgress[tournamentId]?.[roundId] || []
                ).map((singleMatch) =>
                  singleMatch.id === match.id ? match : singleMatch
                ),
              },
            },
          })),
        resetMatchesInProgress: (tournamentId, roundId) =>
          set((state) => ({
            matchesInProgress: {
              ...state.matchesInProgress,
              [tournamentId]: {
                ...(state.matchesInProgress[tournamentId] || {}),
                [roundId]: [],
              },
            },
          })),
        setCachedRound: (tournamentId, roundNumber, matches) =>
          set((state) => ({
            cachedRounds: {
              ...state.cachedRounds,
              [tournamentId]: {
                ...(state.cachedRounds[tournamentId] || {}),
                [roundNumber]: matches,
              },
            },
          })),
        updateCachedRound: (tournamentId, roundNumber, matchesToUpdate) =>
          set((state) => ({
            cachedRounds: {
              ...state.cachedRounds,
              [tournamentId]: {
                ...(state.matchesInProgress[tournamentId] || {}),
                [roundNumber]: (
                  state.cachedRounds[tournamentId]?.[roundNumber] || []
                ).map((match) => {
                  const findMatch = matchesToUpdate.find(
                    (matchToUpdate) => matchToUpdate.id === match.id
                  );
                  return findMatch ? { ...match, ...findMatch } : match;
                }),
              },
            },
          })),
      }),
      {
        name: 'padel-tournaments',
        partialize: (state) => ({
          tournaments: state.tournaments,
          standings: state.standings,
          tournamentForm: state.tournamentForm,
          matchesInProgress: state.matchesInProgress,
          cachedRounds: state.cachedRounds,
        }),
      }
    )
  )
);
