import { API_BASE_URL } from '../config';

export interface HealthCheckResponse {
  status: string;
  service: string;
}

export const checkHealth = async (): Promise<HealthCheckResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Backend health check error:', error);
    return null;
  }
};
