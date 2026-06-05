import { useAppStore } from '../store/useAppStore.js';

export default function RegulationsModal() {
  const setIsRegulationsOpen = useAppStore((state) => state.setIsRegulationsOpen);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <header>
          <button className="button button--ghost" onClick={() => setIsRegulationsOpen(false)}>
            Cofnij
          </button>
          <strong>REGULAMIN // EMERGENCY_PC_LAW</strong>
        </header>
        <div className="modal__body">
          <h2>Regulamin Swiadczenia Uslug Serwisowych EmergencyPC.PL</h2>
          <h3>1. Postanowienia ogolne</h3>
          <p>
            Regulamin okresla zasady wspolpracy pomiedzy EmergencyPC a klientem.
            Wyslanie formularza po autoryzacji OTP oznacza akceptacje warunkow uslugi.
          </p>
          <h3>2. Gwarancja i bezpieczenstwo danych</h3>
          <p>
            Klient powinien wykonac kopie zapasowa danych przed przekazaniem sprzetu.
            Zaawansowane procedury serwisowe moga wymagac testow obciazeniowych i zmian
            konfiguracji systemu.
          </p>
          <h3>3. Wycena</h3>
          <p>
            Kalkulator prezentuje wartosc orientacyjna. Ostateczna wycena nastepuje po
            diagnostyce fizycznej sprzetu.
          </p>
        </div>
        <footer>
          <button className="button button--primary" onClick={() => setIsRegulationsOpen(false)}>
            Rozumiem
          </button>
        </footer>
      </div>
    </div>
  );
}
