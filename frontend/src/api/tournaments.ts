import type {
  TournamentFormValues,
  MatchUpdatePayload,
} from '@/types/tournament';
import axios from './axios';

export const createTournamentApi = (data: TournamentFormValues) => {
  return axios.post('http://127.0.0.1:8000/api/tournaments/', data);
};

export const getAllTournamentsApi = () => {
  return axios.get('http://127.0.0.1:8000/api/tournaments/');
};

export const getSingleTournamentApi = (tournament_id: string) => {
  return axios.get(`http://127.0.0.1:8000/api/tournaments/${tournament_id}/`);
};

export const generateNewRound = (
  tournament_id: string,
  finalRound: boolean
) => {
  return axios.post(
    `http://127.0.0.1:8000/api/tournaments/${tournament_id}/generate-round/`,
    { is_final: finalRound }
  );
};

export const getCurrentRoundMatchesApi = (tournament_id: string) => {
  return axios.get(
    `http://127.0.0.1:8000/api/tournaments/${tournament_id}/current-round/`
  );
};

export const getSingleRoundMatchesApi = (
  round_id: number,
  tournament_id: string
) => {
  return axios.get(
    `http://127.0.0.1:8000/api/tournaments/${tournament_id}/${round_id}/`
  );
};

export const updateRound = (
  tournament_id: string,
  round_id: number,
  data: MatchUpdatePayload[]
) => {
  return axios.patch(
    `http://127.0.0.1:8000/api/tournaments/${tournament_id}/update-round/${round_id}/`,
    { results: data }
  );
};

export const getPlayersRanking = (tournament_id: string) => {
  return axios.get(
    `http://127.0.0.1:8000/api/tournaments/${tournament_id}/ranking/`
  );
};
