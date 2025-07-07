import applyCaseMiddleware from 'axios-case-converter';
import axios from 'axios';

const axiosInstance = applyCaseMiddleware(
  axios.create({
    baseURL: 'http://localhost:8000/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
