import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../config/api.js';
import { useAppStore } from '../store/useAppStore.js';

export function useAuth() {
  const navigate = useNavigate();
  const setUserSession = useAppStore((state) => state.setUserSession);
  const logoutStore = useAppStore((state) => state.logout);
  const showToast = useAppStore((state) => state.showToast);

  async function login(email, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const nextSession = {
      token: data.token,
      email: data.user.email,
      role: data.user.role,
    };

    setUserSession(nextSession);
    showToast(`Zalogowano pomyslnie: ${data.user.email}`);
    navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
  }

  async function register(email, password) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    showToast(data.message || 'Konto zostalo utworzone.');
  }

  function logout() {
    logoutStore();
    showToast('Wylogowano z konta uzytkownika.');
    navigate('/');
  }

  return { login, register, logout };
}
