export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.emergencypc.pl/api';

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Blad komunikacji z API.');
  }

  return data;
}
