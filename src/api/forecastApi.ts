import axios from 'axios';
import type {
  ComparePredictionRequest,
  ComparePredictionResponse,
  ProductSummary,
} from '../types/forecast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
});

export const forecastApi = {
  getProducts: async (): Promise<string[]> => {
    const response = await api.get<{ products: string[] }>('/products');
    return response.data.products;
  },

  getProductSummary: async (productId: string): Promise<ProductSummary> => {
    const response = await api.get<ProductSummary>(`/products/${productId}/summary`);
    return response.data;
  },

  comparePredictions: async (
    payload: ComparePredictionRequest,
  ): Promise<ComparePredictionResponse> => {
    const response = await api.post<ComparePredictionResponse>('/predict/compare', payload);
    return response.data;
  },
};