import { useState } from 'react';

export default function Configurator() {
  const [device, setDevice] = useState({ type: '0', price: 0 });
  const [services, setServices] = useState({});

  const softwareServices = [
    { id: 'opt_win', label: 'Optymalizacja & czyszczenie Windows', price: 80 },
    { id: 'virus', label: 'Usuwanie wirusów i złośliwego softu', price: 60 },
    { id: 'format', label: 'Format i instalacja systemu od nowa', price: 120 }
  ];

  const hardwareServices = [
    { id: 'clean', label: 'Czyszczenie wnętrza + nowe pasty', price: 100 },
    { id: 'consult', label: 'Konsultacja i dobór podzespołów', price: 50 },
    { id: 'build', label: 'Montaż całej jednostki PC od zera', price: 250 }
  ];

  const handleDeviceChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const price = parseInt(selectedOption.getAttribute('data-price')) || 0;
    setDevice({ type: e.target.value, price });
  };

  const handleServiceChange = (id, price) => {
    setServices(prev => ({
      ...prev,
      [id]: prev[id] ? null : price
    }));
  };

  const calculateTotal = () => {
    const servicesTotal = Object.values(services).reduce((sum, price) => sum + (price || 0), 0);
    return device.price + servicesTotal;
  };

  const styles = {
    section: { padding: '80px 20px', backgroundColor: '#0a0c10' },
    container: { width: '100%', maxWidth: '1000px', margin: '0 auto' },
    title: { textAlign: 'center', fontSize: '32px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px', color: '#fff' },
    subtitle: { textAlign: 'center', color: '#38bdf8', marginBottom: '50px', fontWeight: 500 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '40px' },
    panel: { backgroundColor: '#14171c', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px' },
    panelTitle: { fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', color: '#fff' },
    group: { marginBottom: '25px' },
    label: { display: 'block', marginBottom: '10px', color: '#8a99ad', fontWeight: 500 },
    select: { width: '100%', padding: '12px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', fontSize: '16px', outline: 'none' },
    item: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '12px 15px', border: '1px solid transparent', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', transition: '0.2s' },
    checkbox: { marginRight: '10px', width: '18px', height: '18px', accentColor: '#38bdf8' },
    priceBox: { textAlign: 'center', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '20px', margin: '20px 0' },
    amount: { fontSize: '42px', fontWeight: 800, color: '#38bdf8', marginTop: '5px' },
    input: { width: '100%', padding: '12px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', fontSize: '16px', marginBottom: '15px', outline: 'none' },
    textarea: { width: '100%', padding: '12px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', fontSize: '16px', marginBottom: '15px', outline: 'none', resize: 'vertical' },
    btn: { display: 'block', width: '100%', padding: '14px', backgroundColor: '#38bdf8', color: '#0a0c10', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', transition: '0.2s' },
    note: { fontSize: '13px', color: '#64748b', textAlign: 'center', marginTop: '15px', lineHeight: '1.4' }
  };

  return (
    <section id="configurator" style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.title}>Kalkulator Wyceny</h2>
        <p style={styles.subtitle}>Wybierz usługi i poznaj szacowany koszt</p>

        <div style={styles.grid}>
          <div style={styles.panel}>
            <div style={styles.panelTitle}>1. Konfiguracja zgłoszenia</div>
            
            <div style={styles.group}>
              <label style={styles.label}>Typ urządzenia:</label>
              <select style={styles.select} onChange={handleDeviceChange}>
                <option value="0" data-price="0">Wybierz urządzenie...</option>
                <option value="pc" data-price="50">Komputer Stacjonarny (+50 zł diagnoza)</option>
                <option value="laptop" data-price="70">Laptop (+70 zł diagnoza)</option>
              </select>
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Usługi systemowe:</label>
              {softwareServices.map(srv => (
                <div key={srv.id} style={styles.item}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#e2e8f0' }}>
                    <input type="checkbox" style={styles.checkbox} onChange={() => handleServiceChange(srv.id, srv.price)} />
                    {srv.label}
                  </label>
                  <span style={{ color: '#38bdf8', fontWeight: 500 }}>{srv.price} zł</span>
                </div>
              ))}
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Usługi sprzętowe:</label>
              {hardwareServices.map(srv => (
                <div key={srv.id} style={styles.item}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#e2e8f0' }}>
                    <input type="checkbox" style={styles.checkbox} onChange={() => handleServiceChange(srv.id, srv.price)} />
                    {srv.label}
                  </label>
                  <span style={{ color: '#38bdf8', fontWeight: 500 }}>{srv.price} zł</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...styles.panel, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={styles.panelTitle}>2. Szacowany koszt</div>
              <div style={styles.priceBox}>
                <div style={{ color: '#8a99ad' }}>Suma częściowa:</div>
                <div style={styles.amount}>{calculateTotal()} zł</div>
              </div>
              <p style={styles.note}>Ostateczna cena zależy od stopnia skomplikowania usterki.</p>
            </div>

            <div style={{ marginTop: '30px' }}>
              <div style={styles.panelTitle}>3. Wyślij zapytanie do serwisu</div>
              <input type="text" placeholder="Twoje imię / Nick" style={styles.input} />
              <input type="email" placeholder="Twój adres E-mail" style={styles.input} />
              <textarea rows="4" placeholder="Opisz dokładnie swój problem lub podaj komponenty do wyceny..." style={styles.textarea}></textarea>
              <button style={styles.btn} onClick={() => alert('Wysłano zgłoszenie!')}>
                Zgłoś sprzęt do naprawy
              </button>
              <p style={styles.note}>Odpowiedź oraz dostęp do panelu klienta otrzymasz w ciągu 1-2 dni roboczych.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
