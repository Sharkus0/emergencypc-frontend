import PropTypes from 'prop-types';
import { useState } from 'react';
import { apiRequest } from '../config/api.js';
import { useAppStore } from '../store/useAppStore.js';

export default function TicketForm({
  device,
  total,
  desc,
  onDescChange,
  onSubmitted,
}) {
  const [acceptedRegulations, setAcceptedRegulations] = useState(false);
  const [emailStep, setEmailStep] = useState('idle');
  const [verificationCode, setVerificationCode] = useState('');
  const userSession = useAppStore((state) => state.userSession);
  const showToast = useAppStore((state) => state.showToast);
  const addEmailOutbox = useAppStore((state) => state.addEmailOutbox);
  const setIsRegulationsOpen = useAppStore((state) => state.setIsRegulationsOpen);

  const isDisabled = !userSession || device.type === '0' || !acceptedRegulations || emailStep !== 'verified';

  async function sendOtp() {
    if (!userSession) {
      showToast('Zaloguj sie, aby wygenerowac token OTP.', 'error');
      return;
    }

    if (!acceptedRegulations) {
      showToast('Najpierw zaakceptuj regulamin serwisu.', 'error');
      return;
    }

    try {
      const data = await apiRequest('/otp/generate', {
        method: 'POST',
        body: JSON.stringify({ email: userSession.email }),
      });

      setEmailStep('sent');
      showToast(data.message || 'Kod OTP zostal wygenerowany.');

      if (data.devCode) {
        addEmailOutbox({
          to: userSession.email,
          subject: 'Token autoryzacyjny (fallback)',
          body: `Kod: ${data.devCode}`,
        });
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async function verifyOtp() {
    try {
      await apiRequest('/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ email: userSession.email, code: verificationCode }),
      });
      setEmailStep('verified');
      showToast('Adres e-mail zostal zweryfikowany.');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async function submitTicket() {
    if (isDisabled) {
      showToast('Uzupelnij konfiguracje, OTP i regulamin.', 'error');
      return;
    }

    await onSubmitted({
      deviceName: device.name.split(' (')[0],
      price: total,
      desc: desc || 'Brak dodatkowych uwag diagnostycznych.',
    });

    setAcceptedRegulations(false);
    setEmailStep('idle');
    setVerificationCode('');
  }

  return (
    <div className="ticket-form">
      <h3>3. Autoryzacja i bezpieczny zapis</h3>

      <div className="auth-box">
        {userSession ? (
          <>
            <span className="eyebrow">Profil ze zgloszeniem</span>
            <strong>{userSession.email}</strong>
            {emailStep === 'verified' ? (
              <p className="verified"><i className="live-dot" /> Autoryzacja zweryfikowana</p>
            ) : (
              <>
                <button className="button button--ghost" onClick={sendOtp}>
                  {emailStep === 'sent' ? 'Wyslij nowy kod OTP' : 'Generuj token bezpieczenstwa'}
                </button>
                {emailStep === 'sent' && (
                  <div className="otp-row">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={verificationCode}
                      onChange={(event) => setVerificationCode(event.target.value)}
                      placeholder="Wpisz 4-cyfrowy token"
                    />
                    <button className="button button--primary" onClick={verifyOtp}>
                      Zatwierdz
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <p>Zaloguj sie, aby przeslac formularz i sledzic status zlecenia.</p>
        )}
      </div>

      <label htmlFor="ticket-desc">Specyfikacja platformy / objawy</label>
      <input
        id="ticket-desc"
        type="text"
        value={desc}
        onChange={(event) => onDescChange(event.target.value)}
        placeholder="np. i7-14700K, spadki klatek w Valorancie..."
      />

      <label className="check-row">
        <input
          type="checkbox"
          checked={acceptedRegulations}
          onChange={(event) => setAcceptedRegulations(event.target.checked)}
        />
        <span>
          Akceptuje{' '}
          <button type="button" className="inline-link" onClick={() => setIsRegulationsOpen(true)}>
            Regulamin Swiadczenia Uslug Serwisowych EmergencyPC
          </button>
        </span>
      </label>

      <button className="button button--primary" disabled={isDisabled} onClick={submitTicket}>
        Wyslij zgloszenie serwisowe
      </button>
    </div>
  );
}

TicketForm.propTypes = {
  device: PropTypes.shape({
    type: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  total: PropTypes.number.isRequired,
  desc: PropTypes.string.isRequired,
  onDescChange: PropTypes.func.isRequired,
  onSubmitted: PropTypes.func.isRequired,
};
