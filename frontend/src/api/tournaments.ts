import type { TournamentFormValues } from '@/types/tournament';
import axios from './axios';

export const createTournamentApi = (data: TournamentFormValues) => {
  return axios.post('http://127.0.0.1:8000/api/tournaments/', data);
};

export const getTournamentApi = () => {
  return axios.get('http://127.0.0.1:8000/api/tournaments');
};
