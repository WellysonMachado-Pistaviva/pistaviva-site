import { useState, useEffect } from 'react';
import { CheckCircle, Lock, Navigation } from 'lucide-react';
import { getStampsConfig, getUnlockedStamps, unlockStamp } from '../services/storage';

const Passport = ({ user }) => {
  const [stamps, setStamps] = useState([]);
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getStampsConfig().then(setStamps);
    if (user?.id) getUnlockedStamps(user.id).then(setUnlockedIds);
  }, [user]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleCheckIn = () => {
    if (!user) return setMessage('Identifique-se para registrar selos.');
    if (!navigator.geolocation) return setMessage('GPS não suportado no seu navegador.');

    setLoading(true);
    setMessage('Obtendo sua localização...');

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const toUnlock = stamps.filter(s =>
        !unlockedIds.includes(s.id) &&
        getDistance(latitude, longitude, parseFloat(s.lat), parseFloat(s.lng)) <= parseFloat(s.radius)
      );

      if (toUnlock.length > 0) {
        await Promise.all(toUnlock.map(s => unlockStamp(user.id, s.id)));
        const newIds = toUnlock.map(s => s.id);
        setUnlockedIds(prev => [...prev, ...newIds]);
        setMessage(`🎉 Sucesso! Você desbloqueou ${toUnlock.length} novo(s) selo(s)!`);
      } else {
        setMessage('📍 Você não está perto de nenhum ponto de selo ainda.');
      }
      setLoading(false);
    }, () => {
      setMessage('Erro ao obter GPS. Certifique-se que o local está ativado.');
      setLoading(false);
    });
  };

  const progress = Math.round((unlockedIds.length / (stamps.length || 1)) * 100);

  return (
    <div className="passport-page">
      <div className="page-header">
        <h2 className="page-title">MEU PASSAPORTE</h2>
        <p className="page-subtitle">Sua jornada marcada em selos de asfalto</p>
      </div>

      <div className="calc-card glass" style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div className="passport-progress">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span>Progresso da Jornada</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <button className="btn-primary" onClick={handleCheckIn} disabled={loading}>
          {loading ? 'PROCESSANDO...' : <><Navigation size={18} /> FAZER CHECK-IN GPS</>}
        </button>
        {message && <p className="text-muted" style={{ marginTop: '12px', fontSize: '13px', color: 'var(--accent)' }}>{message}</p>}
      </div>

      <div className="passport-grid">
        {stamps.map(stamp => {
          const isUnlocked = unlockedIds.includes(stamp.id);
          return (
            <div key={stamp.id} className={`seal-card glass ${isUnlocked ? 'unlocked' : ''}`}>
              <div className="seal-icon">
                {isUnlocked ? (
                  <img src={stamp.image} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt={stamp.name} />
                ) : (
                  <Lock size={40} style={{ opacity: 0.3 }} />
                )}
              </div>
              <h4>{stamp.name}</h4>
              <p className="seal-status">
                {isUnlocked ? <><CheckCircle size={12} /> DESBLOQUEADO</> : 'BLOQUEADO'}
              </p>
            </div>
          );
        })}
      </div>

      <style>{`
        .seal-card {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 15px;
          border-radius: 24px;
        }
        .seal-icon {
          width: 70px;
          height: 70px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
          border-radius: 50%;
        }
        .unlocked .seal-icon { border: 2px solid var(--accent); background: none; }
        .seal-status { font-size: 10px; font-weight: 800; display: flex; align-items: center; gap: 4px; margin-top: 5px; }
      `}</style>
    </div>
  );
};

export default Passport;
