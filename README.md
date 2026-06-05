# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://api.emergencypc.pl';

export default function App() {
  // --- SYSTEM AUTORYZACJI I RÓL (JWT SESSION) ---
  const [userSession, setUserSession] = useState(() => {
    const saved = localStorage.getItem('epc_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // --- SYSTEM WIDOKÓW (ROUTING) I MODALU ---
  const [currentView, setCurrentView] = useState('main'); // 'main', 'panel', 'login'
  const [isRegulationsOpen, setIsRegulationsOpen] = useState(false);

  // --- MODEL DATA ---
  const [tickets, setTickets] = useState([]); 
  const [clientTickets, setClientTickets] = useState([]); 
  const [emailOutbox, setEmailOutbox] = useState([]); 

  // --- STANY INTERAKCJI I FORMULARZY ---
  const [device, setDevice] = useState({ type: '0', price: 0, name: '' });
  const [services, setServices] = useState({});
  const [activeFaq, setActiveFaq] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [formData, setFormData] = useState({ desc: '', urgency: 'normal' });

  // --- ZABEZPIECZENIA I OTP ---
  const [acceptedRegulations, setAcceptedRegulations] = useState(false);
  const [emailStep, setEmailStep] = useState('idle'); // 'idle', 'sent', 'verified'
  const [verificationCode, setVerificationCode] = useState('');

  // --- RESPONSYWNOŚĆ (DYNAMICZNA SZEROKOŚĆ OKNA) ---
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const isMobile = windowWidth <= 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- SYSTEM TOAST (POWIADOMIENIA CYBERPUNK) ---
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // --- ZAPIS SESJI W LOCALSTORAGE ---
  useEffect(() => {
    if (userSession) {
      localStorage.setItem('epc_session', JSON.stringify(userSession));
    } else {
      localStorage.removeItem('epc_session');
    }
  }, [userSession]);

  // --- EFFECT: POBIERANIE DANYCH PO ZALOGOWANIU W PANELU ---
  useEffect(() => {
    if (!userSession || currentView !== 'panel') return;

    if (userSession.role === 'admin') {
      fetch(`${API_BASE_URL}/admin/tickets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession.token}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(data => { if (data.success) setTickets(data.tickets); })
        .catch(() => {
          triggerToast('Błąd autoryzacji sesji administratora.', 'error');
          handleLogout();
        });
    } else {
      fetch(`${API_BASE_URL}/client/tickets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession.token}`
        }
      })
        .then(res => res.json())
        .then(data => { if (data.success) setClientTickets(data.tickets); })
        .catch(() => triggerToast('Błąd ładowania zlecen użytkownika.', 'error'));
    }
  }, [currentView, userSession]);

  // --- ANIMACJE INTERSECTION OBSERVER ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.05 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [currentView]);

  // --- SŁOWNIKI USŁUG ---
  const softwarePackages = [
    { id: 'opt_win', label: 'Optymalizacja Systemu (Debloating)', desc: 'Wyłączenie telemetrii, czyszczenie rejestru, optymalizacja autostartu i redukcja procesów w tle.', price: 90 },
    { id: 'virus', label: 'Czyszczenie z wirusów i adware', desc: 'Usuwanie uciążliwego oprogramowania reklamowego, złośliwych skryptów oraz optymalizacja zapór sieciowych.', price: 80 },
    { id: 'format', label: 'Czysta instalacja OS Premium', desc: 'Pełny format, wgranie najnowszego stabilnego Windows 10/11, konfiguracja prywatności i instalacja najświeższych sterowników.', price: 140 },
    { id: 'tweak_game', label: 'Advanced Gaming Tuning (FPS/Latency)', desc: 'Maksymalizacja stabilności FPS, obniżenie systemowego input laga oraz zaawansowana konfiguracja planów zasilania pod e-sport.', price: 150 }
  ];

  const hardwarePackages = [
    { id: 'clean', label: 'SPA dla komputera / Laptopa', desc: 'Dokładne czyszczenie wnętrza z kurzu sprężonym powietrzem i aplikacja wydajnej pasty termoprzewodzącej na procesor.', price: 120 },
    { id: 'build', label: 'Montaż jednostki + Cable Management', desc: 'Profesjonalne złożenie PC od zera z części powierzonych lub dobranych, ułożenie okablowania i testy stabilności (OCCT).', price: 290 },
    { id: 'upgrade', label: 'Montaż i klonowanie dysku SSD / RAM', desc: 'Instalacja nowych podzespołów z bezpiecznym, programowym przeniesieniem struktury plików 1:1 na nowy nośnik.', price: 80 },
    { id: 'water_aio', label: 'Montaż chłodzenia wodnego AIO', desc: 'Montaż gotowego zestawu chłodzenia cieczą, optymalne pozycjonowanie chłodnicy oraz kalibracja krzywych wentylatorów w BIOS.', price: 130 }
  ];

  const faqData = [
    { 
      q: "Dlaczego nie muszę zakładać tradycyjnego konta i hasła?", 
      a: "Dla Twojej wygody i maksymalnego bezpieczeństwa zrezygnowaliśmy z klasycznych baz loginów i haseł, które często padają ofiarą wycieków. W EmergencyPC autoryzacja odbywa się za pomocą jednorazowych kodów bezpieczeństwa (OTP) wysyłanych bezpośrednio na Twoją skrzynkę e-mail. Podajesz maila, wpisujesz kod i natychmiast uzyskujesz wgląd w swoje zamówienia oraz bezpieczny czat techniczny." 
    },
    { 
      q: "Czym różni się Czysta Instalacja OS Premium od zwykłego formatu?", 
      a: "Standardowy format instaluje system z domyślnymi śmieciami od producenta i zbędnymi usługami spowalniającymi procesor. Nasza usługa OS Premium obejmuje pełne formatowanie, wdrożenie autorskich skryptów blokujących telemetrię (szpiegowanie Windowsa), manualne wgranie najstabilniejszych (a nie najnowszych, często zabugowanych) sterowników pod Twoją platformę oraz precyzyjne ustawienie pamięci RAM i profilu zasilania w BIOS." 
    },
    { 
      q: "Co zyskuję dzięki pakietowi Advanced Gaming Tuning (FPS/Latency)?", 
      a: "Ten pakiet dedykowany jest dla graczy rywalizujących w tytułach e-sportowych (np. Valorant, Counter-Strike, Fortnite). Przeprowadzamy głęboki tuning jądra systemu, optymalizujemy dystrybucję przerwań MSI (Message Signaled Interrupts) dla karty graficznej, konfigurujemy plany zasilania z pominięciem oszczędzania energii oraz wyłączamy systemowe opóźnienia wejścia. Efektem jest wyższy, bardziej stabilny FPS (mniejsze spadki o 1%) oraz drastyczne obniżenie systemowego opóźnienia myszki i klawiatury (input lag)." 
    },
    { 
      q: "Czy na wykonane usługi komputerowe otrzymam gwarancję?", 
      a: "Tak. Na wszelkie prace montażowe, SPA podzespołów (wymiana past i termopadów) oraz konfiguracje sprzętowe udzielamy 3-miesięcznej gwarancji rozruchowej serwisu. W przypadku montażu nowych części, każdy podzespół objęty jest pełną, niezależną gwarancją producenta (zazwyczaj od 2 do 5 lat)." 
    }
  ];

  // --- LOGIKA OBSŁUGI LOGOWANIA / REJESTRACJI ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      triggerToast('Proszę wypełnić wszystkie pola formularza.', 'error');
      return;
    }

    const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await response.json();

      if (response.ok) {
        if (isRegisterMode) {
          triggerToast(data.message, 'success');
          setIsRegisterMode(false);
        } else {
          triggerToast(`Zalogowano pomyślnie! Witaj ${data.user.email}`);
          setUserSession({ token: data.token, email: data.user.email, role: data.user.role });
          setAuthEmail('');
          setAuthPassword('');
          setCurrentView(data.user.role === 'admin' ? 'panel' : 'main');
        }
      } else {
        triggerToast(data.message || 'Wystąpił błąd autoryzacji.', 'error');
      }
    } catch (error) {
      triggerToast('Błąd krytyczny połączenia z systemem uwierzytelniania.', 'error');
    }
  };

  const handleLogout = () => {
    setUserSession(null);
    setTickets([]);
    setClientTickets([]);
    triggerToast('Wylogowano z konta użytkownika.');
    setCurrentView('main');
  };

  // --- LOGIKA GENEROWANIA KODU OTP ---
  const handleSendOTP = async () => {
    if (!userSession || !userSession.email) {
      triggerToast('Błąd sesji użytkownika. Zaloguj się ponownie.', 'error');
      return;
    }
    
    if (!acceptedRegulations) {
      triggerToast('Musisz zapoznać się i zaakceptować Regulamin Serwisu przed wygenerowaniem tokenu!', 'error');
      
      const regCheckbox = document.getElementById('reg-checkbox-container');
      if (regCheckbox) {
        regCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        regCheckbox.style.border = `1px solid ${theme.magenta}`;
        regCheckbox.style.boxShadow = `0 0 15px ${theme.magenta}44`;
        setTimeout(() => {
          regCheckbox.style.border = `1px solid ${theme.border}`;
          regCheckbox.style.boxShadow = 'none';
        }, 3000);
      }
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/otp/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userSession.email })
      });
      const data = await response.json();

      if (response.ok || data.devCode) {
        setEmailStep('sent');
        
        if (response.ok) {
          triggerToast('Kod autoryzacyjny został wysłany na Twój adres e-mail!', 'success');
        } else {
          triggerToast('⚠️ Serwer SMTP offline! Kod deweloperski został przechwycony do konsoli Node.js.', 'error');
        }
        
        if (data.devCode) {
          console.log(`[SYSTEM NODEMAILER DEVBOT] Token wygenerowany przez serwer: ${data.devCode}`);
          setEmailOutbox(prev => [{ to: userSession.email, subject: 'Token autoryzacyjny (Fallback)', body: `Twój kod to: ${data.devCode}`, date: 'TERAZ' }, ...prev]);
        }
      } else {
        triggerToast(data.message || 'Błąd generowania kodu.', 'error');
      }
    } catch (error) {
      triggerToast('Brak komunikacji z backendem. Upewnij się, że odpaliłeś serwer!', 'error');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userSession.email, code: verificationCode })
      });
      const data = await response.json();

      if (response.ok) {
        setEmailStep('verified');
        triggerToast('Adres e-mail został zweryfikowany pomyślnie!', 'success');
      } else {
        triggerToast(data.message || 'Niepoprawny kod tokena.', 'error');
      }
    } catch (error) {
      triggerToast('Błąd krytyczny połączenia z serwerem weryfikacji.', 'error');
    }
  };

  const handleDeviceChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const price = parseInt(selectedOption.getAttribute('data-price')) || 0;
    const name = selectedOption.text;
    setDevice({ type: e.target.value, price, name });
  };

  const handleServiceChange = (id, price) => {
    setServices(prev => ({ ...prev, [id]: prev[id] ? null : price }));
  };

  const calculateTotal = () => {
    const servicesTotal = Object.values(services).reduce((sum, price) => sum + (price || 0), 0);
    const basePrice = device.price + servicesTotal;
    return formData.urgency === 'express' ? basePrice + 60 : basePrice;
  };

  const getSelectedServicesList = () => {
    const list = [];
    [...softwarePackages, ...hardwarePackages].forEach(p => {
      if (services[p.id]) list.push({ label: p.label, price: p.price });
    });
    return list;
  };

  const handleNavigation = (targetId) => {
    setCurrentView('main');
    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmitTicket = async () => {
    if (!userSession) {
      triggerToast('Musisz być zalogowany, aby złożyć zamówienie.', 'error');
      setCurrentView('login');
      return;
    }

    if (device.type === '0' || !acceptedRegulations || emailStep !== 'verified') {
      triggerToast('Uzupełnij konfigurację sprzętu, przejdź autoryzację OTP i zaakceptuj regulamin.', 'error');
      return;
    }

    const payload = {
      deviceName: device.name.split(' (')[0],
      price: calculateTotal(),
      desc: formData.desc || 'Brak dodatkowych uwag diagnostycznych.'
    };

    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession.token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok) {
        triggerToast(`Zgłoszenie ${data.ticket.id} zostało pomyślnie zapisane w MongoDB!`);
        setAcceptedRegulations(false);
        setEmailStep('idle');
        setVerificationCode('');
        setFormData({ desc: '', urgency: 'normal' });
        setCurrentView('panel');
      } else {
        triggerToast(data.message || 'Błąd rejestracji zgłoszenia.', 'error');
      }
    } catch (error) {
      triggerToast('Błąd wysyłania pakietu danych do serwera.', 'error');
    }
  };

  const updateTicketStatus = async (ticketId, nextStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession.token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await response.json();

      if (response.ok) {
        triggerToast(`Zaktualizowano status ticketu ${ticketId} w bazie.`);
        setTickets(prev => prev.map(t => t.id === ticketId ? data.ticket : t));
      } else {
        triggerToast(data.message || 'Nie udało się zmienić statusu.', 'error');
      }
    } catch (error) {
      triggerToast('Błąd komunikacji API administratora.', 'error');
    }
  };

  // --- SYSTEM DESIGNU (NEON CYBERPUNK) ---
  const theme = {
    bg: '#04060a', card: '#0a0d14', cyan: '#00f0ff', purple: '#bd00ff', magenta: '#ff0055', green: '#00ff66', text: '#ffffff', muted: '#6f7e97',
    border: 'rgba(0, 240, 255, 0.08)', glow: '0 0 25px rgba(0, 240, 255, 0.25)', errorGlow: '0 0 25px rgba(255, 74, 74, 0.3)'
  };

// --- SYSTEM DESIGNU (NEON CYBERPUNK) ---
  const theme = {
    bg: '#04060a', card: '#0a0d14', cyan: '#00f0ff', purple: '#bd00ff', magenta: '#ff0055', green: '#00ff66', text: '#ffffff', muted: '#6f7e97',
    border: 'rgba(0, 240, 255, 0.08)', glow: '0 0 25px rgba(0, 240, 255, 0.25)', errorGlow: '0 0 25px rgba(255, 74, 74, 0.3)'
  };

  const styles = {
    body: { backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden', width: '100%' },
    nav: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', gap: isMobile ? '15px' : '0', padding: isMobile ? '15px' : '20px 60px', backgroundColor: 'rgba(10, 13, 20, 0.85)', backdropFilter: 'blur(15px)', borderBottom: `1px solid ${theme.cyan}33`, position: 'sticky', top: 0, zIndex: 1000, width: '100%', boxSizing: 'border-box' },
    logo: { fontSize: isMobile ? '20px' : '24px', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' },
    cyanText: { color: theme.cyan, textShadow: '0 0 15px rgba(0,240,255,0.6)' },
    menu: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? '12px' : '40px', listStyle: 'none', alignItems: 'center', margin: 0, padding: 0, width: isMobile ? '100%' : 'auto' },
    link: { color: theme.muted, textDecoration: 'none', fontWeight: 500, fontSize: isMobile ? '12px' : '13px', textTransform: 'uppercase', letterSpacing: '1.5px', cursor: 'pointer', background: 'none', border: 'none', padding: isMobile ? '8px 0' : '0' },
    navBtn: (color = theme.cyan) => ({ background: 'transparent', border: `1px solid ${color}`, color: color, padding: isMobile ? '10px 20px' : '10px 22px', borderRadius: '4px', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', fontSize: isMobile ? '11px' : '12px', letterSpacing: '1.5px', boxShadow: `0 0 10px ${color}33`, width: isMobile ? '100%' : 'auto' }),
    hero: { position: 'relative', padding: isMobile ? '60px 15px' : '130px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(0,240,255,0.04) 0%, rgba(4,6,10,1) 70%)', boxSizing: 'border-box' },
    badge: { color: theme.cyan, border: `1px solid ${theme.cyan}`, padding: '8px 22px', borderRadius: '4px', fontSize: isMobile ? '10px' : '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '24px', background: 'rgba(0, 240, 255, 0.03)' },
    h1: { fontSize: isMobile ? '28px' : '64px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px', marginBottom: '25px', lineHeight: 1.2 },
    heroP: { fontSize: isMobile ? '14px' : '18px', color: theme.muted, maxWidth: '750px', marginBottom: '45px', fontWeight: 300, lineHeight: 1.65 },
    heroBtn: { padding: isMobile ? '16px 24px' : '18px 45px', backgroundColor: 'transparent', color: theme.cyan, border: `1px solid ${theme.cyan}`, borderRadius: '4px', fontSize: isMobile ? '12px' : '15px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1.5px', boxShadow: hoveredBtn ? theme.glow : 'none', transform: hoveredBtn ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.3s ease', width: isMobile ? '100%' : 'auto', maxWidth: '340px' },
    statsSec: { display: 'flex', gap: isMobile ? '25px' : '50px', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', alignItems: 'center', margin: '40px auto 0 auto', maxWidth: '900px', width: '100%' },
    statBox: { textAlign: 'center', padding: isMobile ? '10px 0' : '10px 35px', width: isMobile ? '100%' : 'auto' },
    statNum: { fontSize: isMobile ? '32px' : '36px', fontWeight: 800, color: '#fff' },
    statLabel: { color: theme.muted, fontSize: isMobile ? '11px' : '13px', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' },
    liveDot: { width: '8px', height: '8px', backgroundColor: theme.green, borderRadius: '50%', boxShadow: `0 0 10px ${theme.green}` },
    servicesSec: { padding: isMobile ? '50px 15px' : '100px 60px', backgroundColor: theme.card, borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, boxSizing: 'border-box' },
    secTitle: { textAlign: 'center', fontSize: isMobile ? '24px' : '42px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '15px', px: '10px' },
    secSub: { textAlign: 'center', color: theme.cyan, fontSize: isMobile ? '11px' : '14px', textTransform: 'uppercase', letterSpacing: isMobile ? '1.5px' : '3px', marginBottom: isMobile ? '35px' : '70px', padding: '0 10px' },
    srvGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1300px', margin: '0 auto', width: '100%' },
    srvCard: (id) => ({ backgroundColor: theme.bg, border: `1px solid ${hoveredCard === id ? theme.cyan : theme.border}`, padding: isMobile ? '20px' : '40px', borderRadius: '6px', transition: 'all 0.3s ease', boxShadow: hoveredCard === id ? theme.glow : 'none', boxSizing: 'border-box' }),
    srvCardTitle: { fontSize: '18px', fontWeight: 700, marginBottom: '20px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px' },
    srvList: { listStyle: 'none', color: theme.muted, fontSize: '14px', lineHeight: '2.3', padding: 0, margin: 0 },
    configSec: { padding: isMobile ? '50px 15px' : '100px 40px', maxWidth: '1300px', margin: '0 auto', boxSizing: 'border-box', width: '100%' },
    calcGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: isMobile ? '25px' : '50px', width: '100%' },
    panel: { backgroundColor: theme.card, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: isMobile ? '20px 15px' : '45px', boxSizing: 'border-box', width: '100%' },
    panelTitle: { fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '25px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px', color: theme.cyan },
    group: { marginBottom: '35px' },
    label: { display: 'block', marginBottom: '12px', color: theme.muted, fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1.5px' },
    select: { width: '100%', padding: '16px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '4px', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
    itemCard: (isChecked) => ({ display: 'flex', flexDirection: 'column', background: isChecked ? 'rgba(0, 240, 255, 0.02)' : 'transparent', padding: '15px', borderRadius: '4px', marginBottom: '15px', border: `1px solid ${isChecked ? theme.cyan : theme.border}`, cursor: 'pointer', boxSizing: 'border-box' }),
    itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '6px' },
    itemDesc: { fontSize: '13px', color: theme.muted, lineHeight: 1.45 },
    checkbox: { marginRight: '12px', minWidth: '18px', minHeight: '18px', width: '18px', height: '18px', accentColor: theme.cyan, cursor: 'pointer' },
    priceBox: { textAlign: 'center', background: 'rgba(0,240,255,0.01)', border: `1px solid rgba(0, 240, 255, 0.15)`, borderRadius: '4px', padding: isMobile ? '20px' : '30px', margin: '20px 0' },
    amount: { fontSize: isMobile ? '36px' : '54px', fontWeight: 900, color: theme.cyan, marginTop: '5px', textShadow: '0 0 20px rgba(0,240,255,0.25)' },
    input: { width: '100%', padding: '16px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '4px', color: '#fff', fontSize: '15px', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' },
    btn: (isDisabled, color = theme.cyan) => ({ display: 'block', width: '100%', padding: '18px', background: isDisabled ? '#161b26' : `linear-gradient(135deg, ${color}, #00bcff)`, color: isDisabled ? '#47536b' : '#000', border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: 800, cursor: isDisabled ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '1.5px', boxShadow: isDisabled ? 'none' : theme.glow, opacity: isDisabled ? 0.6 : 1, boxSizing: 'border-box' }),
    faqSec: { padding: isMobile ? '50px 15px' : '100px 40px', maxWidth: '900px', margin: '0 auto', boxSizing: 'border-box', width: '100%' },
    faqItem: (isOpen) => ({ backgroundColor: theme.card, border: `1px solid ${isOpen ? theme.cyan : theme.border}`, borderRadius: '4px', marginBottom: '15px', padding: isMobile ? '16px' : '24px', cursor: 'pointer' }),
    faqQuestion: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', fontSize: '15px', fontWeight: 600 },
    faqAnswer: { color: theme.muted, marginTop: '15px', fontSize: '14px', lineHeight: 1.65, borderTop: `1px solid ${theme.border}`, paddingTop: '15px' },
    toastBox: (type) => ({ position: 'fixed', bottom: '20px', right: '20px', left: isMobile ? '20px' : 'auto', backgroundColor: theme.card, border: `1px solid ${type === 'success' ? theme.cyan : '#ff4a4a'}`, padding: '20px 30px', borderRadius: '4px', boxShadow: type === 'success' ? theme.glow : theme.errorGlow, zIndex: 2000, display: 'flex', alignItems: 'center', gap: '15px' }),
    receiptRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: theme.muted, marginBottom: '6px', gap: '10px' },
    statusLogContainer: { fontFamily: 'monospace', fontSize: '12px', background: '#05080f', padding: '15px', border: `1px solid ${theme.border}`, marginTop: '15px', borderRadius: '4px', overflowX: 'auto' },
    statusLine: (isActive) => ({ color: isActive ? theme.green : theme.muted, display: 'flex', gap: '10px', marginBottom: '5px', textShadow: isActive ? `0 0 5px ${theme.green}44` : 'none', whiteSpace: isMobile ? 'normal' : 'nowrap' }),
    footer: { padding: '40px 20px', borderTop: `1px solid ${theme.border}`, textAlign: 'center', fontSize: '13px', color: theme.muted, letterSpacing: '1px', boxSizing: 'border-box' }
  };

  return (
    <div style={styles.body}>
      <style>{`
        .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.active { opacity: 1; transform: translateY(0); }
        button.link-btn { transition: all 0.2s ease; }
        button.link-btn:hover { color: ${theme.cyan} !important; text-shadow: 0 0 8px rgba(0,240,255,0.4); }
        input, select { transition: all 0.2s ease; }
        input:focus, select:focus { border-color: ${theme.cyan} !important; box-shadow: 0 0 12px rgba(0, 240, 255, 0.25) !important; }
        .menu-btn-nav { transition: all 0.2s ease; }
        .menu-btn-nav:hover { background: ${theme.magenta}22 !important; box-shadow: 0 0 15px ${theme.magenta}66 !important; }
      `}</style>

      {/* TOAST SYSTEM */}
      {toast.show && (
        <div style={styles.toastBox(toast.type)}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: toast.type === 'success' ? theme.cyan : '#ff4a4a' }} />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}

      {/* NAVIGATION BAR */}
      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => setCurrentView('main')}>Emergency<span style={styles.cyanText}>PC</span></div>
        <ul style={styles.menu}>
          <li><button className="link-btn" style={styles.link} onClick={() => setCurrentView('main')}>Główna</button></li>
          <li><button className="link-btn" style={styles.link} onClick={() => handleNavigation('services')}>Usługi</button></li>
          <li><button className="link-btn" style={styles.link} onClick={() => handleNavigation('configurator')}>Kalkulator</button></li>
          <li><button className="link-btn" style={styles.link} onClick={() => handleNavigation('faq')}>FAQ</button></li>
          {userSession && (
            <li><button className="link-btn" style={{...styles.link, color: theme.cyan}} onClick={() => setCurrentView('panel')}>[ {userSession.role === 'admin' ? 'ADMIN' : 'PANEL'} ]</button></li>
          )}
          <li>
            {userSession ? (
              <button className="menu-btn-nav" style={styles.navBtn(theme.magenta)} onClick={handleLogout}>WYLOGUJ ({userSession.email.split('@')[0]})</button>
            ) : (
              <button className="menu-btn-nav" style={styles.navBtn(theme.cyan)} onClick={() => setCurrentView('login')}>ZALOGUJ</button>
            )}
          </li>
        </ul>
      </nav>

      {/* VIEW GŁÓWNY */}
      {currentView === 'main' && (
        <>
          <section style={styles.hero}>
            <div style={styles.badge}>Profesjonalny Serwis Modułowy • Świdnica</div>
            <h1 style={styles.h1}>PRZYWRACAMY TWÓJ SPRZĘT<br />DO MAKSYMALNEJ <span style={styles.cyanText}>WYDAJNOŚCI</span></h1>
            <p style={styles.heroP}>Koniec ze spadkami FPS i przegrzewaniem systemu. Realizujemy zaawansowaną optymalizację oprogramowania pod e-sport, czyszczenie oraz modernizację podzespołów komputerowych.</p>
            <button style={styles.heroBtn} onMouseEnter={() => setHoveredBtn(true)} onMouseLeave={() => setHoveredBtn(false)} onClick={() => handleNavigation('configurator')}>Uruchom kalkulator usług</button>

            <div style={styles.statsSec}>
              <div style={styles.statBox}>
                <div style={styles.statNum}>100%</div>
                <div style={styles.statLabel}>Bezpieczny montaż</div>
              </div>
              <div style={{...styles.statBox, borderLeft: isMobile ? 'none' : `1px solid ${theme.border}`, borderRight: isMobile ? 'none' : `1px solid ${theme.border}`}}>
                <div style={styles.statNum}>&lt;24h</div>
                <div style={styles.statLabel}>Czas reakcji serwisu</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statNum}>LIVE</div>
                <div style={styles.statLabel}><span style={styles.liveDot}></span> Status online</div>
              </div>
            </div>
          </section>

          {/* ZAKRES DZIAŁAŃ */}
          <section id="services" className="reveal" style={styles.servicesSec}>
            <h2 style={styles.secTitle}>Profesjonalny Zakres Działań</h2>
            <div style={styles.secSub}>Pełne wsparcie techniczne: od diagnostyki, przez tuning, aż po customowe buildy</div>
            
            <div style={styles.srvGrid}>
              {/* 1. Gaming Tuning */}
              <div style={styles.srvCard(1)} onMouseEnter={() => setHoveredCard(1)} onMouseLeave={() => setHoveredCard(null)}>
                <div style={styles.srvCardTitle}>⚡ Low-Latency & Gaming Tuning</div>
                <ul style={styles.srvList}>
                  <li>— Redukcja systemowych opóźnień wejściowych (Input Lag)</li>
                  <li>— Kompleksowy debloating systemów Windows 10 / 11</li>
                  <li>— Optymalizacja 1% Low FPS w tytułach e-sportowych</li>
                </ul>
              </div>

              {/* 2. Ekspercki Hardware */}
              <div style={styles.srvCard(2)} onMouseEnter={() => setHoveredCard(2)} onMouseLeave={() => setHoveredCard(null)}>
                <div style={styles.srvCardTitle}>🔧 Ekspercki Hardware</div>
                <ul style={styles.srvList}>
                  <li>— Profesjonalny montaż jednostek (Custom Loop / AIO)</li>
                  <li>— Wymiana past termoprzewodzących (ciekły metal / high-end)</li>
                  <li>— Diagnostyka termiczna i undervolting</li>
                </ul>
              </div>

              {/* 3. Diagnostyka */}
              <div style={styles.srvCard(3)} onMouseEnter={() => setHoveredCard(3)} onMouseLeave={() => setHoveredCard(null)}>
                <div style={styles.srvCardTitle}>🆘 Diagnostyka i Ratunek</div>
                <ul style={styles.srvList}>
                  <li>— Analiza niestabilności i błędów krytycznych (BSOD)</li>
                  <li>— Odzyskiwanie systemu i usuwanie malware</li>
                  <li>— Weryfikacja sprawności podzespołów pod obciążeniem</li>
                </ul>
              </div>

              {/* 4. Consulting */}
              <div style={styles.srvCard(4)} onMouseEnter={() => setHoveredCard(4)} onMouseLeave={() => setHoveredCard(null)}>
                <div style={styles.srvCardTitle}>💻 Consulting & Upgrade Path</div>
                <ul style={styles.srvList}>
                  <li>— Dobór podzespołów pod specyficzne budżety i AI/Render</li>
                  <li>— Planowanie ścieżki modernizacji (Future-Proofing)</li>
                  <li>— Pomoc w zakupie i weryfikacji sprzętu używanego</li>
                </ul>
              </div>
            </div>
          </section>

          {/* KREATOR */}
          <section id="configurator" className="reveal" style={styles.configSec}>
            <h2 style={styles.secTitle}>Kreator Zgłoszeń Serwisowych</h2>
            <div style={styles.secSub}>Dobierz warianty i uzyskaj natychmiastowe podsumowanie kosztów</div>

            <div style={styles.calcGrid}>
              <div style={styles.panel}>
                <div style={styles.panelTitle}>1. Skonfiguruj usługę</div>
                <div style={styles.group}>
                  <label style={styles.label}>Typ urządzenia <span style={{color: theme.cyan}}>*</span>:</label>
                  <select style={styles.select} onChange={handleDeviceChange} value={device.type}>
                    <option value="0" data-price="0">Wybierz kategorię sprzętu...</option>
                    <option value="pc" data-price="60">Komputer Stacjonarny (+60 zł diagnostyka wstępna)</option>
                    <option value="laptop" data-price="80">Laptop / Notebook (+80 zł diagnostyka wstępna)</option>
                  </select>
                </div>

                <div style={styles.group}>
                  <label style={styles.label}>Pakiety Oprogramowania (Software):</label>
                  {softwarePackages.map(srv => {
                    const isChecked = !!services[srv.id];
                    return (
                      <div key={srv.id} style={styles.itemCard(isChecked)} onClick={() => handleServiceChange(srv.id, srv.price)}>
                        <div style={styles.itemHeader}>
                          <span style={{fontWeight: 600, color: isChecked ? theme.cyan : '#fff', display: 'flex', alignItems: 'center'}}>
                            <input type="checkbox" checked={isChecked} readOnly style={styles.checkbox} />
                            {srv.label}
                          </span>
                          <span style={{color: theme.cyan, fontWeight: 700, whiteSpace: 'nowrap'}}>{srv.price} zł</span>
                        </div>
                        <div style={styles.itemDesc}>{srv.desc}</div>
                      </div>
                    );
                  })}
                </div>

                <div style={styles.group}>
                  <label style={styles.label}>Pakiety Sprzętowe (Hardware):</label>
                  {hardwarePackages.map(srv => {
                    const isChecked = !!services[srv.id];
                    return (
                      <div key={srv.id} style={styles.itemCard(isChecked)} onClick={() => handleServiceChange(srv.id, srv.price)}>
                        <div style={styles.itemHeader}>
                          <span style={{fontWeight: 600, color: isChecked ? theme.cyan : '#fff', display: 'flex', alignItems: 'center'}}>
                            <input type="checkbox" checked={isChecked} readOnly style={styles.checkbox} />
                            {srv.label}
                          </span>
                          <span style={{color: theme.cyan, fontWeight: 700, whiteSpace: 'nowrap'}}>{srv.price} zł</span>
                        </div>
                        <div style={styles.itemDesc}>{srv.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* KOSZTORYS I ELEKTRONICZNE OTP */}
              <div style={{ ...styles.panel, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={styles.panelTitle}>2. Wstępny kosztorys</div>
                  <div style={{ marginBottom: '15px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '4px', border: `1px solid ${theme.border}` }}>
                    <div style={{ ...styles.receiptRow, color: '#fff', fontWeight: 600, borderBottom: `1px solid ${theme.border}`, paddingBottom: '6px', marginBottom: '8px' }}>
                      <span>Pozycja</span>
                      <span>Cena</span>
                    </div>
                    {device.type !== '0' && (
                      <div style={styles.receiptRow}>
                        <span>Diagnostyka wstępna ({device.type === 'pc' ? 'PC' : 'Laptop'})</span>
                        <span style={{whiteSpace: 'nowrap'}}>{device.price} zł</span>
                      </div>
                    )}
                    {getSelectedServicesList().map((item, idx) => (
                      <div key={idx} style={styles.receiptRow}>
                        <span>{item.label}</span>
                        <span style={{whiteSpace: 'nowrap'}}>{item.price} zł</span>
                      </div>
                    ))}
                    {formData.urgency === 'express' && (
                      <div style={{ ...styles.receiptRow, color: theme.cyan }}>
                        <span>Dopłata za tryb ekspresowy</span>
                        <span style={{whiteSpace: 'nowrap'}}>+60 zł</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.priceBox}>
                    <div style={{ color: theme.muted, fontSize: '13px', textTransform: 'uppercase' }}>Wartość szacunkowa:</div>
                    <div style={styles.amount}>{calculateTotal()} zł</div>
                  </div>

                  <div style={styles.group}>
                    <label style={styles.label}>Tryb realizacji:</label>
                    <div style={{display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px', marginTop: '10px'}}>
                      <label style={{flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '15px', border: `1px solid ${formData.urgency === 'normal' ? theme.cyan : theme.border}`, borderRadius: '4px', cursor: 'pointer'}}>
                        <input type="radio" name="urgency" checked={formData.urgency === 'normal'} onChange={() => setFormData({...formData, urgency: 'normal'})} style={{marginRight: '12px', accentColor: theme.cyan}} />
                        <div>
                          <div style={{fontSize: '14px', fontWeight: 600}}>Standard</div>
                          <div style={{fontSize: '12px', color: theme.muted}}>Kolejka FIFO (1-3 dni)</div>
                        </div>
                      </label>
                      <label style={{flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(0,240,255,0.01)', padding: '15px', border: `1px solid ${formData.urgency === 'express' ? theme.cyan : theme.border}`, borderRadius: '4px', cursor: 'pointer'}}>
                        <input type="radio" name="urgency" checked={formData.urgency === 'express'} onChange={() => setFormData({...formData, urgency: 'express'})} style={{marginRight: '12px', accentColor: theme.cyan}} />
                        <div>
                          <div style={{fontSize: '14px', fontWeight: 600, color: theme.cyan}}>Ekspres (+60 zł)</div>
                          <div style={{fontSize: '12px', color: theme.muted}}>Poza kolejnością</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={styles.panelTitle}>3. Autoryzacja i bezpieczny zapis</div>
                  
                  <div style={{ background: 'rgba(0,240,255,0.01)', padding: '20px', border: `1px solid ${theme.border}`, marginBottom: '20px', borderRadius: '4px' }}>
                    {userSession ? (
                      <>
                        <label style={styles.label}>Profil ze zgłoszeniem:</label>
                        <div style={{color: theme.cyan, fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', wordBreak: 'break-word'}}>{userSession.email}</div>
                        
                        {emailStep !== 'verified' ? (
                          <div>
                            <button style={styles.navBtn(theme.cyan)} onClick={handleSendOTP}>
                              {emailStep === 'sent' ? 'Wyślij nowy kod OTP' : 'Generuj Token Bezpieczeństwa'}
                            </button>
                            {emailStep === 'sent' && (
                              <div style={{ marginTop: '15px' }}>
                                <input type="text" placeholder="Wpisz 4-cyfrowy token" style={styles.input} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
                                <button style={{...styles.btn(false), padding: '12px'}} onClick={handleVerifyOTP}>Zatwierdź Kod</button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ color: theme.green, fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={styles.liveDot}></span> AUTORYZACJA ZWERYFIKOWANA
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{textAlign: 'center', padding: '10px 0'}}>
                        <p style={{fontSize: '13px', color: theme.muted, marginBottom: '15px'}}>Musisz posiadać aktywne konto, aby przesyłać formularze.</p>
                        <button style={styles.btn(false, theme.magenta)} onClick={() => setCurrentView('login')}>Zaloguj się / Rejestracja</button>
                      </div>
                    )}
                  </div>

                  <label style={styles.label}>Specyfikacja platformy / Objawy:</label>
                  <input type="text" placeholder="np. i7-14700K, spadki klatek w Valorancie..." style={styles.input} value={formData.desc} onChange={(e) => setFormData({ ...formData, desc: e.target.value })} />

                  {/* CHECKBOX I LINK DO REGULAMINU */}
                  <div 
                    id="reg-checkbox-container"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '10px', 
                      marginTop: '20px', 
                      padding: '15px', 
                      background: 'rgba(10, 13, 20, 0.5)', 
                      borderRadius: '6px', 
                      border: `1px solid ${theme.border}`,
                      transition: 'all 0.3s ease',
                      marginBottom: '20px'
                    }}
                  >
                    <input 
                      type="checkbox" 
                      id="reg-accept"
                      checked={acceptedRegulations}
                      onChange={(e) => setAcceptedRegulations(e.target.checked)}
                      style={{ cursor: 'pointer', minWidth: '18px', minHeight: '18px', width: '18px', height: '18px', accentColor: theme.cyan, marginTop: '2px' }}
                    />
                    <label htmlFor="reg-accept" style={{ fontSize: '13px', color: '#fff', cursor: 'pointer', userSelect: 'none', lineHeight: '1.4' }}>
                      Oświadczam, że zapoznałem się i akceptuję{' '}
                      <a 
                        href="#regulamin" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          setIsRegulationsOpen(true); 
                        }} 
                        style={{ color: theme.cyan, textDecoration: 'underline', fontWeight: 'bold' }}
                      >
                        Regulamin Świadczenia Usług Serwisowych EmergencyPC
                      </a>
                    </label>
                  </div>

                  <button 
                    style={styles.btn(!userSession || device.type === '0' || !acceptedRegulations || emailStep !== 'verified')} 
                    disabled={!userSession || device.type === '0' || !acceptedRegulations || emailStep !== 'verified'}
                    onClick={handleSubmitTicket}
                  >
                    Wyślij Zgłoszenie Serwisowe
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="reveal" style={styles.faqSec}>
            <h2 style={styles.secTitle}>Często zadawane pytania</h2>
            <div style={styles.secSub}>Szybka pomoc techniczna</div>
            {faqData.map((f, idx) => (
              <div key={idx} style={styles.faqItem(activeFaq === idx)} onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}>
                <div style={styles.faqQuestion}>
                  <span>{f.q}</span>
                  <span style={{fontSize: '12px'}}>{activeFaq === idx ? '▲' : '▼'}</span>
                </div>
                {activeFaq === idx && <div style={styles.faqAnswer}>{f.a}</div>}
              </div>
            ))}
          </section>
        </>
      )}

      {/* VIEW: LOGOWANIE / REJESTRACJA */}
      {currentView === 'login' && (
        <div style={{ maxWidth: '450px', margin: isMobile ? '40px auto' : '80px auto', padding: '20px' }}>
          <div style={styles.panel}>
            <div style={{ ...styles.panelTitle, color: isRegisterMode ? theme.purple : theme.cyan, textAlign: 'center' }}>
              {isRegisterMode ? '[ KREATOR NOWEGO PROFILU ]' : '[ AUTORYZACJA RDZENIA UŻYTKOWNIKA ]'}
            </div>
            
            <form onSubmit={handleAuthSubmit}>
              <label style={styles.label}>Twój adres e-mail:</label>
              <input type="email" placeholder="np. kamil@gaming.pl" style={styles.input} value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required />

              <label style={styles.label}>Hasło dostępowe:</label>
              <input type="password" placeholder="••••••••" style={styles.input} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />

              <button type="submit" style={styles.btn(false, isRegisterMode ? theme.purple : theme.cyan)}>
                {isRegisterMode ? 'Zarejestruj profil' : 'Uruchom sesję'}
              </button>
            </form>

            <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '13px' }}>
              <span style={{ color: theme.muted }}>{isRegisterMode ? 'Masz już konto?' : 'Nie posiadasz konta?'} </span>
              <button style={{ background: 'none', border: 'none', color: theme.cyan, cursor: 'pointer', textDecoration: 'underline', padding: 0 }} onClick={() => setIsRegisterMode(!isRegisterMode)}>
                {isRegisterMode ? 'Zaloguj się' : 'Utwórz profil klienta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: PANEL ZAMÓWIEŃ */}
      {currentView === 'panel' && userSession && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '20px 15px' : '40px' }}>
          
          {/* A. WIDOK ADMINISTRATORA */}
          {userSession.role === 'admin' && (
            <div>
              <h1 style={{ color: theme.magenta, fontSize: isMobile ? '24px' : '32px', textShadow: `0 0 10px ${theme.magenta}44`, fontWeight: 900, marginBottom: '5px' }}>[CORE_ADMIN_NODE]</h1>
              <div style={styles.secSub}>Zarządzanie bazą danych MongoDB w czasie rzeczywistym</div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.8fr 1.2fr', gap: isMobile ? '20px' : '40px' }}>
                <div style={styles.panel}>
                  <div style={styles.panelTitle}>Globalna Baza Zgłoszeń (`MongoDB / tickets`)</div>
                  {tickets.length === 0 ? (
                    <p style={{ color: theme.muted, fontSize: '13px' }}>Brak pobranych zleceń w bazie MongoDB.</p>
                  ) : (
                    tickets.map(t => (
                      <div key={t.id} style={{ background: '#060910', padding: isMobile ? '15px' : '20px', border: `1px solid ${theme.border}`, marginBottom: '15px', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: theme.cyan, fontWeight: 'bold', wordBreak: 'break-all', fontSize: '13px' }}>{t.id}</span>
                          <span style={{ color: theme.green, fontWeight: 'bold', whiteSpace: 'nowrap' }}>{t.price} zł</span>
                        </div>
                        <div style={{ fontSize: '13px', margin: '8px 0', wordBreak: 'break-word' }}>Urządzenie: {t.deviceName} | Klient: <span style={{ color: theme.cyan }}>{t.clientEmail}</span></div>
                        <div style={{ fontSize: '12px', color: theme.muted, marginBottom: '15px' }}>Uwagi: {t.desc}</div>
                        
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}` }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: theme.magenta }}>Status live:</span>
                          <select 
                            style={{ ...styles.select, width: '100%', padding: '6px 12px', fontSize: '13px', color: theme.cyan }} 
                            value={t.status} 
                            onChange={(e) => updateTicketStatus(t.id, e.target.value)}
                          >
                            <option value="0">0 - Przyjęty do rejestru</option>
                            <option value="1">1 - Diagnostyka obciążeniowa</option>
                            <option value="2">2 - Prace Naprawcze / Tuning</option>
                            <option value="3">3 - Testy Syntetyczne OCCT</option>
                            <option value="4">4 - Gotowy do odbioru</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={styles.panel}>
                  <div style={styles.panelTitle}>Sesja Deweloperska OTP</div>
                  <div style={{ maxHeight: '400px', overflowY: 'auto', background: '#020407', padding: '15px', border: `1px solid ${theme.magenta}33`, fontFamily: 'monospace', borderRadius: '4px' }}>
                    {emailOutbox.length === 0 ? (
                      <div style={{color: theme.muted, fontSize: '11px'}}>Brak wygenerowanych kodów w tej sesji okna. Kody wysyłane są bezpośrednio na skrzynki pocztowe klientów za pomocą SMTP.</div>
                    ) : (
                      emailOutbox.map((m, idx) => (
                        <div key={idx} style={{ fontSize: '11px', marginBottom: '15px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '10px', wordBreak: 'break-word' }}>
                          <div style={{ color: theme.magenta }}>TO: {m.to}</div>
                          <div style={{ fontWeight: 'bold', color: '#fff' }}>SUBJECT: {m.subject}</div>
                          <div style={{ color: theme.muted }}>BODY: {m.body}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. WIDOK KLIENTA */}
          {userSession.role === 'client' && (
            <div>
              <h2 style={styles.secTitle}>Panel Monitorowania Zgłoszeń</h2>
              <div style={styles.secSub} style={{textAlign:'center', color: theme.muted, marginBottom:'30px', fontSize:'14px'}}>Zalogowany profil: <span style={{color: theme.cyan}}>{userSession.email}</span></div>

              <div style={styles.panel}>
                <div style={styles.panelTitle}>Twoje Aktywne Zlecenia w Bazie</div>
                {clientTickets.length === 0 ? (
                  <p style={{ color: theme.muted, fontSize: '14px', textAlign: 'center' }}>Twój profil nie posiada obecnie zarejestrowanych zgłoszeń naprawy.</p>
                ) : (
                  clientTickets.map(t => (
                    <div key={t.id} style={{ borderBottom: `1px solid ${theme.border}`, paddingBottom: '25px', marginBottom: '25px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', gap: '10px' }}>
                        <span style={{ color: theme.cyan, wordBreak: 'break-all' }}>{t.id}</span>
                        <span style={{ color: '#fff', whiteSpace: 'nowrap' }}>{t.price} zł</span>
                      </div>
                      <div style={{ fontSize: '14px', margin: '8px 0', color: theme.muted }}>Urządzenie: <span style={{color: '#fff'}}>{t.deviceName}</span> | Opis: {t.desc}</div>
                      
                      <div style={styles.statusLogContainer}>
                        <div style={styles.statusLine(t.status >= 0)}>{t.status >= 0 ? '[✓]' : '[ ]'} Krok 0: Przyjęto do rejestru centralnego EmergencyPC</div>
                        <div style={styles.statusLine(t.status >= 1)}>{t.status >= 1 ? '[✓]' : '[ ]'} Krok 1: Diagnostyka obciążeniowa i logi błędów</div>
                        <div style={styles.statusLine(t.status >= 2)}>{t.status >= 2 ? '[✓]' : '[ ]'} Krok 2: Czyszczenie fizyczne / Tuning systemu</div>
                        <div style={styles.statusLine(t.status >= 3)}>{t.status >= 3 ? '[✓]' : '[ ]'} Krok 3: Stabilność pooperacyjna (Testy syntetyczne OCCT)</div>
                        <div style={styles.statusLine(t.status >= 4)}>{t.status >= 4 ? '[✓]' : '[ ]'} Krok 4: Zlecenie sfinalizowane. Platforma gotowa do odbioru w Świdnicy</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* MODAL REGULAMINU */}
      {isRegulationsOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(2, 4, 7, 0.95)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            width: '95%',
            maxWidth: '850px',
            height: '90vh',
            background: '#060913',
            border: `1px solid ${theme.cyan}`,
            boxShadow: `0 0 40px ${theme.cyan}33`,
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
          }}>
            
            {/* NAGŁÓWEK MODALU */}
            <div style={{
              padding: '20px 25px',
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              background: '#0a0f20'
            }}>
              <button 
                onClick={() => setIsRegulationsOpen(false)}
                style={{
                  background: 'none',
                  border: `1px solid ${theme.cyan}`,
                  color: theme.cyan,
                  padding: '8px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                ← COFNIJ
              </button>
              <div style={{ fontSize: isMobile ? '13px' : '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                REGULAMIN // EMERGENCY_PC_LAW
              </div>
            </div>

            <div style={{ padding: isMobile ? '20px 15px' : '30px', overflowY: 'auto', fontSize: '13px', lineHeight: '1.8', color: '#8fa0bc' }}>
              <p style={{ textAlign: 'center', fontWeight: 'bold', color: theme.cyan, marginBottom: '25px', letterSpacing: '2px' }}>
                REGULAMIN ŚWIADCZENIA USŁUG SERWISOWYCH EMERGENCYPC.PL
              </p>
              
              <h4 style={{ color: '#fff', marginBottom: '8px' }}>§1. POSTANOWIENIA OGÓLNE I ZAWARCIE UMOWY</h4>
              <p>1. Niniejszy dokument określa zasady współpracy pomiędzy EmergencyPC (Serwis) a Zleceniodawcą (Klient).<br />
              2. Akceptacja regulaminu oraz wysyłka formularza poprzez system autoryzacji OTP jest równoznaczna z zawarciem prawnie wiążącej umowy o świadczenie usług serwisowych.<br />
              3. Prezentowany w serwisie konfigurator cenowy ma charakter poglądowy. Ostateczna wycena usług następuje po fizycznej diagnostyce sprzętu.</p>

              <h4 style={{ color: '#fff', marginTop: '20px', marginBottom: '8px' }}>§2. GWARANCJA, ODPOWIEDZIALNOŚĆ I BEZPIECZEŃSTWO DANYCH</h4>
              <p style={{ borderLeft: `3px solid ${theme.cyan}`, paddingLeft: '15px', background: 'rgba(0, 240, 255, 0.03)', padding: '10px', borderRadius: '4px' }}>
                1. Serwis EmergencyPC dokłada należytej staranności w procesach serwisowych. Klient przyjmuje do wiadomości, że zaawansowane procedury (flashowanie BIOS/UEFI, tuning systemowy, testy obciążeniowe) niosą ze sobą ryzyko systemowe.<br />
                2. <strong>Zobowiązanie Klienta:</strong> Klient oświadcza, iż przed dostarczeniem sprzętu dokonał pełnej kopii zapasowej (Backup) swoich danych. Serwis nie ponosi odpowiedzialności za utratę danych wynikającą z awarii sprzętowych, procedur optymalizacji czy błędów nośników, o ile nie wynika ona z rażącego niedbalstwa technika.<br />
                3. Serwis nie ponosi odpowiedzialności za niekompatybilność oprogramowania Klienta z wprowadzonymi ustawieniami optymalizacyjnymi (np. Advanced Gaming Tuning).
              </p>

              <h4 style={{ color: '#fff', marginTop: '20px', marginBottom: '8px' }}>§3. PRAWA KONSUMENCKIE I ODSTĄPIENIE OD UMOWY</h4>
              <p>1. Klientowi przysługuje prawo do odstąpienia od umowy w terminie 14 dni. <br />
              2. <strong>Zgoda na rozpoczęcie usług:</strong> Zlecając wykonanie naprawy/optymalizacji, Klient wyraża wyraźną zgodę na rozpoczęcie świadczenia usług przed upływem terminu do odstąpienia od umowy. W związku z tym, po pełnym wykonaniu usługi przez Serwis, prawo do odstąpienia od umowy wygasa. Jest to standardowa procedura dla usług serwisowych o charakterze technicznym.</p>

              <h4 style={{ color: '#fff', marginTop: '20px', marginBottom: '8px' }}>§4. LICENCJE OPROGRAMOWANIA ORAZ RODO</h4>
              <p>1. Klient oświadcza, że posiada legalne licencje na użytkowane oprogramowanie oraz system operacyjny. Serwis nie pełni roli weryfikatora legalności licencji i nie ponosi odpowiedzialności za naruszenia praw autorskich przez Klienta.<br />
              2. <strong>Ochrona danych:</strong> Administratorem danych osobowych (e-mail, dane sprzętowe) jest EmergencyPC. Dane przetwarzane są wyłącznie w celu realizacji umowy. System autoryzacji OTP gwarantuje wyższy standard bezpieczeństwa poprzez rezygnację z przechowywania haseł stałych.</p>

              <h4 style={{ color: '#fff', marginTop: '20px', marginBottom: '8px' }}>§5. PROCEDURY MAGAZYNOWE I PORZUCENIE SPRZĘTU</h4>
              <p>1. Odbiór sprzętu warunkowany jest pełnym rozliczeniem finansowym.<br />
              2. W przypadku braku odbioru sprzętu w terminie 14 dni od monitu „Gotowy do odbioru”, naliczana jest opłata magazynowa w wysokości 15 PLN brutto za każdy dzień.<br />
              3. Zgodnie z art. 180 Kodeksu Cywilnego, po przekroczeniu 90 dni zwłoki w odbiorze, sprzęt uznaje się za porzucony z zamiarem wyzbycia się własności na rzecz Serwisu, celem pokrycia kosztów utylizacji lub diagnostyki.</p>
              
              <p style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '30px', fontSize: '11px', textAlign: 'center', color: theme.cyan, textTransform: 'uppercase', letterSpacing: '2px' }}>
                EmergencyPC // Profesjonalna Infrastruktura Serwisowa // Dokument Kontraktowy v.2026
              </p>
            </div>

            {/* DOLNY PRZYCISK ZAMKNIĘCIA */}
            <div style={{
              padding: '15px 25px',
              borderTop: `1px solid ${theme.border}`,
              background: '#0a0f20',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button 
                onClick={() => setIsRegulationsOpen(false)}
                style={{
                  background: theme.cyan,
                  color: '#000',
                  border: 'none',
                  padding: '10px 25px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  letterSpacing: '1px'
                }}
              >
                ZAKOŃCZ PODGLĄD
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div>EMERGENCY_PC // SYSTEM_NODE_READY // {new Date().getFullYear()}</div>
        <div style={{ color: theme.cyan, fontSize: '12px', marginTop: '5px' }}>Świdnica Local Service Platform connected via REST API.</div>
      </footer>
    </div>
  );
}