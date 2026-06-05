import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hardwarePackages, softwarePackages } from '../data/servicePackages.js';
import { useTickets } from '../hooks/useTickets.js';
import TicketForm from './TicketForm.jsx';

export default function ServiceCalculator() {
  const navigate = useNavigate();
  const { createTicket } = useTickets();
  const [device, setDevice] = useState({ type: '0', price: 0, name: '' });
  const [services, setServices] = useState({});
  const [urgency, setUrgency] = useState('normal');
  const [desc, setDesc] = useState('');

  const selectedServices = useMemo(
    () => [...softwarePackages, ...hardwarePackages].filter((service) => services[service.id]),
    [services],
  );

  const total = useMemo(() => {
    const serviceTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
    return device.price + serviceTotal + (urgency === 'express' ? 60 : 0);
  }, [device.price, selectedServices, urgency]);

  function handleDeviceChange(event) {
    const option = event.target.options[event.target.selectedIndex];
    setDevice({
      type: event.target.value,
      price: Number(option.dataset.price || 0),
      name: option.text,
    });
  }

  function toggleService(id) {
    setServices((current) => ({ ...current, [id]: !current[id] }));
  }

  async function handleSubmitted(payload) {
    await createTicket(payload);
    setDevice({ type: '0', price: 0, name: '' });
    setServices({});
    setUrgency('normal');
    setDesc('');
    navigate('/dashboard');
  }

  return (
    <section id="configurator" className="section configurator">
      <h2>Kreator zgloszen serwisowych</h2>
      <p className="section__lead">Dobierz warianty i uzyskaj natychmiastowe podsumowanie kosztow</p>

      <div className="calculator-grid">
        <div className="panel">
          <h3>1. Skonfiguruj usluge</h3>
          <label htmlFor="device">Typ urzadzenia</label>
          <select id="device" value={device.type} onChange={handleDeviceChange}>
            <option value="0" data-price="0">Wybierz kategorie sprzetu...</option>
            <option value="pc" data-price="60">Komputer stacjonarny (+60 zl diagnostyka)</option>
            <option value="laptop" data-price="80">Laptop / notebook (+80 zl diagnostyka)</option>
          </select>

          <PackageList title="Pakiety oprogramowania" items={softwarePackages} selected={services} onToggle={toggleService} />
          <PackageList title="Pakiety sprzetowe" items={hardwarePackages} selected={services} onToggle={toggleService} />
        </div>

        <div className="panel">
          <h3>2. Wstepny kosztorys</h3>
          <div className="receipt">
            <div>
              <strong>Pozycja</strong>
              <strong>Cena</strong>
            </div>
            {device.type !== '0' && (
              <div>
                <span>Diagnostyka wstepna</span>
                <span>{device.price} zl</span>
              </div>
            )}
            {selectedServices.map((service) => (
              <div key={service.id}>
                <span>{service.label}</span>
                <span>{service.price} zl</span>
              </div>
            ))}
            {urgency === 'express' && (
              <div className="text-cyan">
                <span>Doplata za tryb ekspresowy</span>
                <span>+60 zl</span>
              </div>
            )}
          </div>

          <div className="price-box">
            <span>Wartosc szacunkowa</span>
            <strong>{total} zl</strong>
          </div>

          <div className="choice-grid">
            <label className={urgency === 'normal' ? 'choice choice--active' : 'choice'}>
              <input type="radio" name="urgency" checked={urgency === 'normal'} onChange={() => setUrgency('normal')} />
              <span>Standard</span>
              <small>Kolejka FIFO (1-3 dni)</small>
            </label>
            <label className={urgency === 'express' ? 'choice choice--active' : 'choice'}>
              <input type="radio" name="urgency" checked={urgency === 'express'} onChange={() => setUrgency('express')} />
              <span>Ekspres (+60 zl)</span>
              <small>Poza kolejnoscia</small>
            </label>
          </div>

          <TicketForm
            device={device}
            total={total}
            desc={desc}
            onDescChange={setDesc}
            onSubmitted={handleSubmitted}
          />
        </div>
      </div>
    </section>
  );
}

function PackageList({ title, items, selected, onToggle }) {
  return (
    <div className="package-list">
      <h4>{title}</h4>
      {items.map((item) => {
        const isSelected = Boolean(selected[item.id]);
        return (
          <button
            className={isSelected ? 'package-card package-card--active' : 'package-card'}
            key={item.id}
            onClick={() => onToggle(item.id)}
            type="button"
          >
            <span>
              <strong>{item.label}</strong>
              <small>{item.desc}</small>
            </span>
            <b>{item.price} zl</b>
          </button>
        );
      })}
    </div>
  );
}
