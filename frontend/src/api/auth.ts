import type { LoginFormData, RegisterFormData } from '@/types/auth';
import axios from './axios';

export const registerUser = (data: RegisterFormData) => {
  return axios.post('http://127.0.0.1:8000/api/accounts/register/', data);
};

export const loginUser = (data: LoginFormData) => {
  return axios.post('http://127.0.0.1:8000/api/accounts/login/', data);
};
