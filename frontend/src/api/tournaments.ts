import type { TournamentFormValues } from '@/types/tournament';
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

export const generateNewRound = (tournament_id: string) => {
  return axios.post(
    `http://127.0.0.1:8000/api/tournaments/${tournament_id}/generate-round/`
  );
};

export const getCurrentRoundMatchesApi = (tournament_id: string) => {
  return axios.get(
    `http://127.0.0.1:8000/api/tournaments/${tournament_id}/current-round/`
  );
};

export const getSingleRoundMatchesApi = (
  round_id: string,
  tournament_id: string
) => {
  return axios.get(
    `http://127.0.0.1:8000/api/tournaments/${tournament_id}/${round_id}/`
  );
};
