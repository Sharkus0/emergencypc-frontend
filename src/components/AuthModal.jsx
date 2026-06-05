import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useAppStore } from '../store/useAppStore.js';

export default function AuthModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { login, register } = useAuth();
  const showToast = useAppStore((state) => state.showToast);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      if (isRegisterMode) {
        await register(email, password);
        setIsRegisterMode(false);
      } else {
        await login(email, password);
      }
      setPassword('');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  return (
    <section className="auth-page">
      <div className="panel auth-panel">
        <h1>{isRegisterMode ? '[ Kreator nowego profilu ]' : '[ Autoryzacja uzytkownika ]'}</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="auth-email">Adres e-mail</label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="np. klient@emergencypc.pl"
            required
          />

          <label htmlFor="auth-password">Haslo dostepowe</label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            required
          />

          <button className="button button--primary" type="submit">
            {isRegisterMode ? 'Zarejestruj profil' : 'Uruchom sesje'}
          </button>
        </form>

        <button className="link-button" onClick={() => setIsRegisterMode((value) => !value)}>
          {isRegisterMode ? 'Masz konto? Zaloguj sie' : 'Nie masz konta? Utworz profil'}
        </button>
      </div>
    </section>
  );
}
