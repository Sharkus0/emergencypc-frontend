import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useAppStore } from '../store/useAppStore.js';

export default function Navigation() {
  const userSession = useAppStore((state) => state.userSession);
  const { logout } = useAuth();

  return (
    <nav className="nav">
      <Link className="nav__logo" to="/">
        Emergency<span>PC</span>
      </Link>

      <div className="nav__links">
        <a href="/#services">Uslugi</a>
        <a href="/#configurator">Kalkulator</a>
        <a href="/#faq">FAQ</a>
        {userSession && (
          <NavLink to={userSession.role === 'admin' ? '/admin' : '/dashboard'}>
            {userSession.role === 'admin' ? 'Admin' : 'Panel'}
          </NavLink>
        )}
        {userSession ? (
          <button className="button button--ghost button--danger" onClick={logout}>
            Wyloguj ({userSession.email.split('@')[0]})
          </button>
        ) : (
          <NavLink className="button button--ghost" to="/login">
            Zaloguj
          </NavLink>
        )}
      </div>
    </nav>
  );
}
