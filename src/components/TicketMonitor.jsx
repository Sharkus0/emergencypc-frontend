import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets.js';
import { useAppStore } from '../store/useAppStore.js';

const statusLabels = [
  'Przyjeto do rejestru centralnego EmergencyPC',
  'Diagnostyka obciazeniowa i logi bledow',
  'Czyszczenie fizyczne / tuning systemu',
  'Stabilnosc pooperacyjna i testy OCCT',
  'Zlecenie sfinalizowane, gotowe do odbioru',
];

export default function TicketMonitor() {
  const userSession = useAppStore((state) => state.userSession);
  const emailOutbox = useAppStore((state) => state.emailOutbox);
  const showToast = useAppStore((state) => state.showToast);
  const { tickets, clientTickets, fetchAdminTickets, fetchClientTickets, updateStatus, deleteTicket } = useTickets();

  useEffect(() => {
    if (!userSession) return;

    const loadTickets = userSession.role === 'admin' ? fetchAdminTickets : fetchClientTickets;
    loadTickets().catch((error) => showToast(error.message, 'error'));
  }, [fetchAdminTickets, fetchClientTickets, showToast, userSession]);

  if (!userSession) return <Navigate to="/login" replace />;

  if (userSession.role === 'admin') {
    return (
      <section className="section dashboard">
        <h1>[CORE_ADMIN_NODE]</h1>
        <p className="section__lead">Zarzadzanie baza zgloszen MongoDB w czasie rzeczywistym</p>

        <div className="dashboard-grid">
          <div className="panel">
            <h3>Globalna baza zgloszen</h3>
            {tickets.length === 0 ? (
              <p className="muted">Brak pobranych zlecen w bazie.</p>
            ) : (
              tickets.map((ticket) => (
                <article className="ticket-card" key={ticket.id}>
                  <header>
                    <strong>{ticket.id}</strong>
                    <b>{ticket.price} zl</b>
                  </header>
                  <p>
                    Urzadzenie: {ticket.deviceName} | Klient: <span>{ticket.clientEmail}</span>
                  </p>
                  <small>Uwagi: {ticket.desc || 'Brak uwag.'}</small>
                  <div className="ticket-actions">
                    <select value={ticket.status} onChange={(event) => updateStatus(ticket.id, event.target.value)}>
                      {statusLabels.map((label, index) => (
                        <option value={index} key={label}>{index} - {label}</option>
                      ))}
                    </select>
                    <button className="button button--danger" onClick={() => deleteTicket(ticket.id)}>
                      Usun
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="panel">
            <h3>Sesja deweloperska OTP</h3>
            <div className="outbox">
              {emailOutbox.length === 0 ? (
                <p className="muted">Brak wygenerowanych kodow w tej sesji okna.</p>
              ) : (
                emailOutbox.map((message, index) => (
                  <div key={`${message.to}-${index}`}>
                    <b>TO: {message.to}</b>
                    <span>{message.subject}</span>
                    <small>{message.body}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section dashboard">
      <h1>Panel monitorowania zgloszen</h1>
      <p className="section__lead">Zalogowany profil: {userSession.email}</p>

      <div className="panel">
        <h3>Twoje aktywne zlecenia w bazie</h3>
        {clientTickets.length === 0 ? (
          <p className="muted">Twoj profil nie posiada obecnie zarejestrowanych zgloszen naprawy.</p>
        ) : (
          clientTickets.map((ticket) => (
            <article className="ticket-card" key={ticket.id}>
              <header>
                <strong>{ticket.id}</strong>
                <b>{ticket.price} zl</b>
              </header>
              <p>Urzadzenie: {ticket.deviceName} | Opis: {ticket.desc}</p>
              <div className="status-log">
                {statusLabels.map((label, index) => {
                  const active = Number(ticket.status) >= index;
                  return (
                    <div className={active ? 'status-log__line status-log__line--active' : 'status-log__line'} key={label}>
                      {active ? '[x]' : '[ ]'} Krok {index}: {label}
                    </div>
                  );
                })}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
