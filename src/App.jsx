import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import AuthModal from './components/AuthModal.jsx';
import Navigation from './components/Navigation.jsx';
import RegulationsModal from './components/RegulationsModal.jsx';
import ServiceCalculator from './components/ServiceCalculator.jsx';
import TicketMonitor from './components/TicketMonitor.jsx';
import Toast from './components/Toast.jsx';
import { useAppStore } from './store/useAppStore.js';

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="badge">Profesjonalny Serwis Modulowy / Swidnica</div>
        <h1>
          Przywracamy Twoj sprzet
          <br />
          do maksymalnej <span className="text-cyan">wydajnosci</span>
        </h1>
        <p>
          Koniec ze spadkami FPS i przegrzewaniem systemu. Realizujemy zaawansowana
          optymalizacje oprogramowania pod e-sport, czyszczenie oraz modernizacje
          podzespolow komputerowych.
        </p>
        <a className="hero__button" href="#configurator">
          Uruchom kalkulator uslug
        </a>

        <div className="stats">
          <div>
            <strong>100%</strong>
            <span>Bezpieczny montaz</span>
          </div>
          <div>
            <strong>&lt;24h</strong>
            <span>Czas reakcji serwisu</span>
          </div>
          <div>
            <strong>LIVE</strong>
            <span>
              <i className="live-dot" /> Status online
            </span>
          </div>
        </div>
      </section>

      <section id="services" className="section section--dark">
        <h2>Profesjonalny zakres dzialan</h2>
        <p className="section__lead">
          Pelne wsparcie techniczne: od diagnostyki, przez tuning, az po customowe buildy
        </p>

        <div className="service-grid">
          {[
            ['Low-Latency & Gaming Tuning', 'Redukcja input laga', 'Debloating Windows 10 / 11', 'Optymalizacja 1% Low FPS'],
            ['Ekspercki Hardware', 'Profesjonalny montaz jednostek', 'Wymiana past i termopadow', 'Diagnostyka termiczna i undervolting'],
            ['Diagnostyka i Ratunek', 'Analiza BSOD i niestabilnosci', 'Usuwanie malware', 'Testy podzespolow pod obciazeniem'],
            ['Consulting & Upgrade Path', 'Dobor podzespolow pod budzet', 'Plan modernizacji', 'Weryfikacja sprzetu uzywanego'],
          ].map(([title, ...items]) => (
            <article className="service-card" key={title}>
              <h3>{title}</h3>
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <ServiceCalculator />

      <section id="faq" className="section faq">
        <h2>Czesto zadawane pytania</h2>
        <p className="section__lead">Szybka pomoc techniczna</p>
        {[
          ['Dlaczego konto jest wymagane?', 'Konto pozwala bezpiecznie zapisac zgloszenie, przypisac je do klienta i pokazac status naprawy w panelu.'],
          ['Czy wycena z kalkulatora jest ostateczna?', 'Nie. Kalkulator daje szybka wycene orientacyjna, a ostateczna cena zalezy od fizycznej diagnostyki sprzetu.'],
          ['Czy dostane gwarancje na usluge?', 'Tak. Prace serwisowe i montazowe obejmujemy gwarancja rozruchowa serwisu.'],
        ].map(([q, a]) => (
          <details className="faq__item" key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
    </>
  );
}

function RequireAuth() {
  const userSession = useAppStore((state) => state.userSession);
  const location = useLocation();

  if (!userSession) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <TicketMonitor />;
}

export default function App() {
  const isRegulationsOpen = useAppStore((state) => state.isRegulationsOpen);

  return (
    <div className="app-shell">
      <Toast />
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthModal />} />
          <Route path="/dashboard" element={<RequireAuth />} />
          <Route path="/admin" element={<RequireAuth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {isRegulationsOpen && <RegulationsModal />}
      <footer className="footer">
        <strong>EmergencyPC.PL</strong>
        <span>Swidnica Local Service Platform connected via REST API.</span>
      </footer>
    </div>
  );
}
