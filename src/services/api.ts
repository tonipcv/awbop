import axios from 'axios';

// Configuração de URL da API baseada no ambiente
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Cliente - usar localhost para desenvolvimento
    return process.env.NODE_ENV === 'production' 
      ? 'https://sua-api.com/api/v1' 
      : 'http://localhost:3000/api/v1';
  }
  
  // Servidor - usar localhost
  return process.env.NODE_ENV === 'production' 
    ? 'https://sua-api.com/api/v1' 
    : 'http://localhost:3000/api/v1';
};

const apiUrl = getApiUrl();

const api = axios.create({
  baseURL: apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para logs em desenvolvimento
api.interceptors.request.use(request => {
  console.log('Starting Request:', request.url);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Response:', response.status);
    return response;
  },
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const protocolsApi = {
  // Listar protocolos ativos
  list: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/patient/protocols', { params });
    return response.data;
  },

  // Obter detalhes de um protocolo
  getDetails: async (id: string) => {
    const response = await api.get(`/patient/protocols/${id}`);
    return response.data;
  },

  // Obter progresso de um protocolo
  getProgress: async (id: string, params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get(`/patient/protocols/${id}/progress`, { params });
    return response.data;
  },

  // Listar fases de um protocolo
  getPhases: async (id: string) => {
    const response = await api.get(`/patient/protocols/${id}/phases`);
    return response.data;
  },

  // Obter fase atual
  getCurrentPhase: async (id: string) => {
    const response = await api.get(`/patient/protocols/${id}/phases/current`);
    return response.data;
  }
};

export default api; 