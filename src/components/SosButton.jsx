import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, X } from 'lucide-react';
import { broadcastSOS } from '../services/realtime';

const SosButton = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Auto-close success message
  useEffect(() => {
    if (sent) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        setSent(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sent]);

  const handleSosClick = () => {
    if (!user) {
      (() => { const el = document.getElementById("app-toast"); if (el) { el.textContent = "Faça login para enviar um SOS."; el.className = "toast error"; el.style.display = "block"; setTimeout(() => { el.style.display = "none"; }, 3000); } })();
      return;
    }
    setIsOpen(true);
    setError('');
  };

  const confirmSos = () => {
    setIsSending(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocalização não suportada pelo navegador.');
      setIsSending(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        try {
          await broadcastSOS(user, location);
          setSent(true);
        } catch (err) {
          setError('Falha ao enviar SOS. Verifique sua conexão.');
        } finally {
          setIsSending(false);
        }
      },
      (err) => {
        console.error(err);
        setError('Não foi possível obter sua localização. Verifique as permissões de GPS.');
        setIsSending(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <>
      <button 
        className="sos-floating-btn"
        onClick={handleSosClick}
        aria-label="Botão de Emergência SOS"
      >
        <AlertTriangle size={24} />
      </button>

      {isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '340px', padding: '24px', textAlign: 'center', border: '2px solid var(--danger)' }}>
            <button className="modal-close" onClick={() => setIsOpen(false)}><X size={20} /></button>
            
            <div style={{ background: 'var(--danger)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}>
              <AlertTriangle size={32} color="#fff" />
            </div>

            <h3 style={{ fontFamily: 'var(--display)', color: 'var(--danger)', marginBottom: '8px' }}>EMERGÊNCIA SOS</h3>
            
            {sent ? (
              <div style={{ padding: '16px 0' }}>
                <p style={{ color: 'var(--success)', fontWeight: 'bold', marginBottom: '8px' }}>Alerta Enviado!</p>
                <p className="text-muted" style={{ fontSize: '13px' }}>
                  Sua localização foi transmitida para os motociclistas próximos. Aguarde em um local seguro.
                </p>
              </div>
            ) : (
              <>
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '20px' }}>
                  Use este botão apenas em caso real de emergência (quebra, acidente). Sua localização exata será enviada para motociclistas próximos.
                </p>
                
                {error && <p style={{ color: 'var(--warning)', fontSize: '12px', marginBottom: '16px' }}>{error}</p>}

                <button 
                  className="btn-primary" 
                  style={{ width: '100%', background: 'var(--danger)', borderColor: 'var(--danger)' }}
                  onClick={confirmSos}
                  disabled={isSending}
                >
                  {isSending ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      <span className="loading-spinner" style={{ width: '16px', height: '16px' }}/> OBTENDO GPS...
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      <MapPin size={18} /> CONFIRMAR SOS
                    </span>
                  )}
                </button>
                <button 
                  className="btn-ghost" 
                  style={{ width: '100%', marginTop: '8px' }}
                  onClick={() => setIsOpen(false)}
                >
                  CANCELAR
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .sos-floating-btn {
          position: fixed;
          bottom: 80px; /* Above bottom nav */
          right: 20px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--danger), #ff1e1e);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4), 0 0 0 4px rgba(239, 68, 68, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 990;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          animation: pulse-sos 2s infinite;
        }
        .sos-floating-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.6), 0 0 0 6px rgba(239, 68, 68, 0.2);
        }
        @keyframes pulse-sos {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @media (min-width: 768px) {
          .sos-floating-btn {
            bottom: 30px;
            right: 30px;
            width: 64px;
            height: 64px;
          }
        }
      `}</style>
    </>
  );
};

export default SosButton;
