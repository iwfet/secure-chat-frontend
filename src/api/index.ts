import axios from 'axios';
import { useAuthStore } from '../store/auth';

const api = axios.create({
    baseURL: 'http://localhost:5000', // URL do seu backend
});

// Interceptor para adicionar o token a cada requisição
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para lidar com erros 401 (Não Autorizado)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Se o token for inválido, limpa tudo e força o logout
            useAuthStore.getState().logout();
            // O redirecionamento será tratado pelo Router
        }
        return Promise.reject(error);
    }
);

export default api;