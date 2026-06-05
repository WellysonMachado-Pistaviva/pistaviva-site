import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Polyline, LayersControl } from 'react-leaflet';
import { TILES } from '../lib/mapTiles';
import { Camera, Plus, X, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getPings, addPing, getCurrentRoute } from '../services/storage';
import { joinSOSChannel, leaveSOSChannel, joinComboioChannel, updateComboioLocation, leaveComboioChannel } from '../services/realtime';
import { supabase } from '../lib/supabaseClient';
import { fetchPoisInBounds } from '../services/overpass';

const photIg = (ig) => !ig ? null : (ig.startsWith('http') ? ig : `https://instagram.com/${ig.replace(/^@/, '')}`);
const photographerIcon = L.divIcon({
  html: `<div style="width:30px;height:30px;border-radius:50%;background:#0e1311;border:2px solid #f97316;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,.5);">📸</div>`,
  className: '', iconSize: [30, 30], iconAnchor: [15, 15],
});
const CAT_EMOJI = { pousada: '🛏️', restaurante: '🍽️', mirante: '🏔️', oficina: '🔧', posto: '⛽', atrativo: '🌄', outro: '📍' };
const spotIcon = (cat) => L.divIcon({
  html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#6f9a5e;border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.5);"><span style="transform:rotate(45deg);font-size:14px;">${CAT_EMOJI[cat] || '📍'}</span></div>`,
  className: '', iconSize: [30, 30], iconAnchor: [15, 28],
});

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Marcador CSS (sem imagem externa — github raw bloqueia hotlink e some o pin).
const PIN_COLORS = { orange: '#f97316', violet: '#8b5cf6', green: '#22c55e', red: '#ef4444', blue: '#3b82f6' };
const createIcon = (color) => L.divIcon({
  html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${PIN_COLORS[color] || color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5);"><span style="display:block;width:8px;height:8px;border-radius:50%;background:#fff;position:absolute;top:7px;left:7px;"></span></div>`,
  className: '', iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -24],
});

const createBikerIcon = () => L.divIcon({
  html: `<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ea580c);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(249,115,22,.6);border:2px solid #fff;">🏍️</div>`,
  className: '', iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -18],
});

const createSosIcon = () => L.divIcon({
  html: `<div style="width:40px;height:40px;border-radius:50%;background:rgba(239,68,68,0.2);display:flex;align-items:center;justify-content:center;animation:pulse-sos 2s infinite;"><div style="width:24px;height:24px;border-radius:50%;background:#ef4444;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:12px;border:2px solid #fff;box-shadow:0 0 10px #ef4444;">!</div></div>`,
  className: '', iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -20],
});

const fuelIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#eab308;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.5);border:2px solid #fff;">⛽</div>`,
  className: '', iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -14],
});

const restaurantIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#e11d48;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.5);border:2px solid #fff;">🍽️</div>`,
  className: '', iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -14],
});

const createComboioMemberIcon = () => L.divIcon({
  html: `<div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#2563eb);display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(59,130,246,.6);border:2px solid #fff;">👤</div>`,
  className: '', iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -15],
});

const icons = {
  user: createIcon('orange'),
  photographer: createIcon('violet'),
  business: createIcon('green'),
  monument: createIcon('red'),
};

// ── 34 Monumentos Oficiais da Rota Biker ─────────────────────
const BIKER_MONUMENTS = [
  { id:'m01', num:1,  name:'Serpenteando Café',              city:'Bocaiúva do Sul',     uf:'PR', lat:-25.205, lng:-49.119, ig:'serpenteando.cafe' },
  { id:'m02', num:2,  name:'Fábrica Cafeteria',              city:'Curitiba',             uf:'PR', lat:-25.428, lng:-49.273, ig:'fabricacafeteria' },
  { id:'m03', num:3,  name:'Mirante do 12',                  city:'Lauro Müller',         uf:'SC', lat:-28.382, lng:-49.397, ig:'mirantedo12' },
  { id:'m04', num:4,  name:'Rota 370',                       city:'Urubici',              uf:'SC', lat:-28.016, lng:-49.591, ig:'rota370urubici' },
  { id:'m05', num:5,  name:'Parada Rota PR 218',             city:'Carlópolis',           uf:'PR', lat:-23.420, lng:-49.733, ig:'rotapr218' },
  { id:'m06', num:6,  name:'Parada Rota Bike Café',          city:'Rio dos Cedros',       uf:'SC', lat:-26.738, lng:-49.268, ig:'rotabikecafe' },
  { id:'m07', num:7,  name:'Container da Serra',             city:'Doutor Pedrinho',      uf:'SC', lat:-26.746, lng:-49.483, ig:'containerdaserra' },
  { id:'m08', num:8,  name:'Parada 261',                     city:'Guapiara',             uf:'SP', lat:-24.187, lng:-48.529, ig:'parada_261' },
  { id:'m09', num:9,  name:'Posto Rota 090',                 city:'Piraí do Sul',         uf:'PR', lat:-24.524, lng:-49.943, ig:'rota090' },
  { id:'m10', num:10, name:'Terrasul Motos',                 city:'Jaguarão',             uf:'RS', lat:-32.566, lng:-53.376, ig:null },
  { id:'m11', num:11, name:'Pad Bier Cervejaria',            city:'Brasília',             uf:'DF', lat:-15.780, lng:-47.929, ig:'padbiercervejaria' },
  { id:'m12', num:12, name:'Centro Cultural Movimento',      city:'Socorro',              uf:'SP', lat:-22.591, lng:-46.528, ig:'centroculturalmovimento' },
  { id:'m13', num:13, name:'Rota 513',                       city:'Ponta Grossa',         uf:'PR', lat:-25.094, lng:-50.166, ig:'portal.dos.campos' },
  { id:'m14', num:14, name:'Parador 158',                    city:'Itaara',               uf:'RS', lat:-29.600, lng:-53.783, ig:'parador158' },
  { id:'m15', num:15, name:'Garimpo em Atividade',           city:'Ametista do Sul',      uf:'RS', lat:-27.366, lng:-53.058, ig:'garimpoematividade' },
  { id:'m16', num:16, name:'Bar Original – Pier SP-270',     city:'Piraju',               uf:'SP', lat:-23.192, lng:-49.378, ig:'baroriginalpiraju' },
  { id:'m17', num:17, name:'Armazém Canastra',               city:'Piumhi',               uf:'MG', lat:-20.468, lng:-45.958, ig:'armazem_canastra' },
  { id:'m18', num:18, name:'Box 1200',                       city:'Jundiaí',              uf:'SP', lat:-23.186, lng:-46.896, ig:'box1200oficial' },
  { id:'m19', num:19, name:'Rancho Terra Crua',              city:'Salesópolis',          uf:'SP', lat:-23.532, lng:-45.845, ig:'rancho.terracrua' },
  { id:'m20', num:20, name:'Casa Rural',                     city:'Barra do Ribeiro',     uf:'RS', lat:-30.298, lng:-51.300, ig:'casa_rural_barra_do_ribeiro' },
  { id:'m21', num:21, name:'Parada Penhasco',                city:'Penha',                uf:'SC', lat:-26.769, lng:-48.648, ig:'penhascocervejaria' },
  { id:'m22', num:22, name:'Restaurante Mata Virgem',        city:'Três Corações',        uf:'MG', lat:-21.691, lng:-45.258, ig:'matavirgemrestaurante' },
  { id:'m23', num:23, name:'Bar do Hélio',                   city:'Santo Antônio da Alegria', uf:'SP', lat:-21.082, lng:-47.148, ig:'bardoheliosaa' },
  { id:'m24', num:24, name:'Camping Poço do Caixão',         city:'Timbé do Sul',         uf:'SC', lat:-28.833, lng:-49.683, ig:'campingpocodocaixao' },
  { id:'m25', num:25, name:'Os Independentes',               city:'Barretos',             uf:'SP', lat:-20.557, lng:-48.568, ig:'barretosmotorcycles_oficial' },
  { id:'m26', num:26, name:'Restaurante Portal Grill',       city:'Porto União',          uf:'SC', lat:-26.234, lng:-51.083, ig:'restaurante.portalgrilloficial' },
  { id:'m27', num:27, name:'Restaurante Pedra do Baú',       city:'São Bento do Sapucaí',uf:'SP', lat:-22.691, lng:-45.728, ig:'restaurantepedradobau' },
  { id:'m28', num:28, name:'Hotel Barra Bonita',             city:'Barra Bonita',         uf:'SP', lat:-22.492, lng:-48.558, ig:'hotelbarrabonita_' },
  { id:'m29', num:29, name:'Rancho Gastronomia e Cultura',   city:'São José do Barreiro', uf:'SP', lat:-22.641, lng:-44.578, ig:'canalrancho' },
  { id:'m30', num:30, name:'Drei Schritte Restô Bar',        city:'Katueté',              uf:'PY', lat:-24.138, lng:-55.583, ig:'dreischrittekatuete' },
  { id:'m31', num:31, name:'Pro Tork',                       city:'Siqueira Campos',      uf:'PR', lat:-23.689, lng:-49.836, ig:'protork_oficial' },
  { id:'m32', num:32, name:"Hell's Dogs Motorcycle Bar",     city:'Foz do Iguaçu',        uf:'PR', lat:-25.548, lng:-54.588, ig:'hellsdogsfoz' },
  { id:'m33', num:33, name:'Zapata Garage',                  city:'Garça',                uf:'SP', lat:-22.213, lng:-49.656, ig:'zapatagarage' },
  { id:'m34', num:34, name:'Parada da Búfala',               city:'Sete Barras',          uf:'SP', lat:-24.388, lng:-47.928, ig:'parada.dabufala' },
];

// ── Cafés e Pontos de Encontro Clássicos ──────────────────────
const BIKER_CAFES = [
  { id: 'bc01', name: 'Venda do Chico', city: 'Carmópolis de Minas', uf: 'MG', lat: -20.4722, lng: -44.7570, ig: 'vendadochico', desc: 'A parada mais famosa e obrigatória da Fernão Dias.' },
  { id: 'bc02', name: 'Cuesta Café', city: 'Pardinho', uf: 'SP', lat: -23.0565, lng: -48.3308, ig: 'cuestacafe', desc: 'Vista panorâmica inacreditável da Cuesta de Botucatu.' },
  { id: 'bc03', name: 'Fazenda do Chocolate', city: 'Itu', uf: 'SP', lat: -23.2842, lng: -47.2346, ig: 'fazendadochocolate', desc: 'Ponto tradicional de encontro na Estrada dos Romeiros.' },
  { id: 'bc04', name: 'Chalé das Flores Café', city: 'Mairiporã', uf: 'SP', lat: -23.3275, lng: -46.5861, ig: 'chaledasflorescafe', desc: 'Destino matinal clássico próximo à Grande São Paulo.' },
  { id: 'bc05', name: 'Fazenda Atalaia', city: 'Amparo', uf: 'SP', lat: -22.7093, lng: -46.7725, ig: 'fazendaatalaia', desc: 'Queijos premiados, café colonial e rota cênica no interior.' },
  { id: 'bc06', name: 'Lucky Friends Kustom House', city: 'Sorocaba', uf: 'SP', lat: -23.4939, lng: -47.4578, ig: 'luckyfriendskustomhouse', desc: 'Meca da cultura Kustom, Harley e Cafe Racer em SP.' },
  { id: 'bc07', name: 'Recanto do Morango', city: 'Estiva', uf: 'MG', lat: -22.4630, lng: -46.0120, ig: 'recantodomorangoestiva', desc: 'Parada doce e tradicional na BR-381 para quem sobe pra BH.' },
  { id: 'bc08', name: 'Frutas Rondon', city: 'Jundiaí', uf: 'SP', lat: -23.186, lng: -46.896, ig: 'frutasrondon', desc: 'Parada constante para grupos de motos.' },
  { id: 'bc09', name: 'Rancho Terra Crua', city: 'Salesópolis', uf: 'SP', lat: -23.532, lng: -45.845, ig: 'rancho.terracrua', desc: 'Café colonial farto no alto da serra com muito motociclismo.' },
  { id: 'bc10', name: 'Marie\'s Café', city: 'Vinhedo', uf: 'SP', lat: -23.0298, lng: -46.9744, ig: 'mariescafe.vinhedo', desc: 'Ótimo espaço aberto e encontro de motociclistas aos domingos.' },
  { id: 'bc11', name: 'Rota 68 Moto Point', city: 'Bueno Brandão', uf: 'MG', lat: -22.4411, lng: -46.3508, ig: 'rota68.oficial', desc: 'Ponto de encontro temático e obrigatório na região.' },
  { id: 'bc12', name: 'Café Boteco', city: 'Serra Negra', uf: 'SP', lat: -22.6111, lng: -46.7005, ig: 'cafeboteco_serranegra', desc: 'Serra Negra é o paraíso dos motociclistas e este bar é referência no centro.' },
  { id: 'bc13', name: 'Rota 370 Café & Store', city: 'Urubici', uf: 'SC', lat: -28.016, lng: -49.591, ig: 'rota370urubici', desc: 'No coração das serras catarinenses, parada essencial antes de encarar o Corvo Branco ou Rio do Rastro.' },
];

const MapClickHandler = ({ isAdding, onMapClick }) => {
  useMapEvents({ click: (e) => { if (isAdding) onMapClick(e.latlng); } });
  return null;
};

const MapResizer = () => {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 300); }, [map]);
  return null;
};

const FitMonuments = ({ active }) => {
  const map = useMap();
  useEffect(() => {
    if (!active) return;
    const bounds = L.latLngBounds(BIKER_MONUMENTS.map(m => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [active, map]);
  return null;
};

const PoiRadarComponent = ({ active, onPoisFetched, onFetchingChange }) => {
  const map = useMap();
  const [lastBounds, setLastBounds] = useState(null);

  useEffect(() => {
    if (!active) return;
    
    let timeoutId;
    
    const fetchPois = async () => {
      const zoom = map.getZoom();
      if (zoom < 10) {
        // Too zoomed out, don't fetch to avoid huge payloads
        onPoisFetched([]);
        onFetchingChange(false);
        return;
      }
      
      const bounds = map.getBounds();
      // Basic check to avoid re-fetching if bounds haven't changed much
      if (lastBounds && lastBounds.equals(bounds)) return;
      
      onFetchingChange(true);
      setLastBounds(bounds);
      const pois = await fetchPoisInBounds(bounds);
      onPoisFetched(pois);
      onFetchingChange(false);
    };

    const handleMoveEnd = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(fetchPois, 800); // 800ms debounce
    };

    // Initial fetch
    fetchPois();

    map.on('moveend', handleMoveEnd);
    return () => {
      clearTimeout(timeoutId);
      map.off('moveend', handleMoveEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, map, onPoisFetched]); // purposefully excluding lastBounds to avoid loop

  return null;
};


const createSelfIcon = () => L.divIcon({
  html: `<div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(249,115,22,0.3);animation:pulse-sos 2s infinite;"></div><div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ea580c);display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 2px 10px rgba(249,115,22,.8);border:2px solid #fff;z-index:1;">🏍️</div></div>`,
  className: '', iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -22],
});

const bikerIcon = createBikerIcon();
const sosIcon = createSosIcon();
const comboioIcon = createComboioMemberIcon();
const selfIcon = createSelfIcon();

const CenterOnUser = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) map.flyTo([location.lat, location.lng], 13, { animate: true, duration: 1.5 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

const FlyTo = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 14, { animate: true, duration: 1.2 });
  }, [target, map]);
  return null;
};

const MapPage = ({ user }) => {
  const [pings, setPings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showMonuments, setShowMonuments] = useState(true);
  const [fitMonuments, setFitMonuments] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isPhotographerMode, setIsPhotographerMode] = useState(false);
  const [newPing, setNewPing] = useState(null);
  const [pingType, setPingType] = useState('user');
  const [pingTitle, setPingTitle] = useState('');
  const [pingLocal, setPingLocal] = useState('');
  const [pingInsta, setPingInsta] = useState('');
  const [routeLine, setRouteLine] = useState(null);
  const [photographers, setPhotographers] = useState([]);
  const [spots, setSpots] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);

  // POI Radar State
  const [showPoiRadar, setShowPoiRadar] = useState(false);
  const [poiData, setPoiData] = useState([]);
  const [isFetchingPois, setIsFetchingPois] = useState(false);

  useEffect(() => {
    supabase.from('pv_photographers').select('id, slug, nome, local, instagram, site_url, lat, lng')
      .eq('published', true).not('lat', 'is', null)
      .then(({ data }) => setPhotographers(data || []));
    supabase.from('pv_spots').select('id, slug, nome, categoria, cidade, uf, lat, lng, selos')
      .eq('published', true).not('lat', 'is', null)
      .then(({ data }) => setSpots(data || []));
  }, []);
  const [comboioMembers, setComboioMembers] = useState([]);
  const [activeComboioId, setActiveComboioId] = useState(null);
  // Busca de localização para fotógrafo
  const [photoSearch, setPhotoSearch]         = useState('');
  const [photoSuggestions, setPhotoSuggestions] = useState([]);
  const [flyTarget, setFlyTarget]             = useState(null);

  // Check-in rápido ("Registrar Parada")
  const [showCheckin, setShowCheckin]         = useState(false);
  const [checkinLoading, setCheckinLoading]   = useState(false);
  const [checkinLocation, setCheckinLocation] = useState(null); // { lat, lng, name }
  const [checkinNote, setCheckinNote]         = useState('');


  useEffect(() => {
    getPings().then(setPings);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    const line = getCurrentRoute();
    if (line && Array.isArray(line) && line.length > 0) setRouteLine(line);

    // Join SOS Channel
    joinSOSChannel((alert) => {
      setSosAlerts(prev => {
        const filtered = prev.filter(a => a.userId !== alert.userId);
        return [...filtered, alert];
      });
    });

    // Handle Comboio
    let watchId;
    const comboioId = sessionStorage.getItem('activeComboio');
    if (comboioId && user) {
      setActiveComboioId(comboioId);
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          joinComboioChannel(comboioId, user, loc, (state) => {
            const members = Object.keys(state).map(k => state[k][0]);
            setComboioMembers(members);
          });
        },
        console.error,
        { enableHighAccuracy: true }
      );

      watchId = navigator.geolocation.watchPosition(
        (pos) => updateComboioLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        console.error,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    return () => {
      leaveSOSChannel();
      leaveComboioChannel();
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [user]);

  const handleMapClick  = (latlng) => setNewPing(latlng);

  // ── Check-in rápido: GPS → geocoding reverso → modal ──────
  const handleCheckin = () => {
    if (!user) {
      const el = document.getElementById('app-toast');
      if (el) { el.textContent = 'Identifique-se para registrar sua parada.'; el.className = 'toast error'; el.style.display = 'block'; setTimeout(() => { el.style.display = 'none'; }, 3000); }
      return;
    }
    if (!navigator.geolocation) return;
    setCheckinLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      let name = 'Minha localização';
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt&zoom=10`,
          { headers: { 'User-Agent': 'PistaViva/1.0' } }
        );
        const d = await r.json();
        const city  = d.address?.city || d.address?.town || d.address?.village || d.address?.municipality || d.address?.county || '';
        const state = d.address?.state || '';
        name = city ? (state ? `${city}, ${state}` : city) : (state || 'Minha localização');
      } catch { /* usa fallback */ }
      setCheckinLocation({ lat, lng, name });
      setCheckinLoading(false);
      setShowCheckin(true);
    }, () => {
      setCheckinLoading(false);
      const el = document.getElementById('app-toast');
      if (el) { el.textContent = 'GPS não encontrado. Ative a localização.'; el.className = 'toast error'; el.style.display = 'block'; setTimeout(() => { el.style.display = 'none'; }, 3000); }
    }, { enableHighAccuracy: true, timeout: 8000 });
  };

  const saveCheckin = async () => {
    if (!checkinLocation) return;
    const authorName = user?.nome || user?.name || 'Piloto';
    const note = checkinNote.trim();
    const ping = {
      type:  'user',
      lat:   checkinLocation.lat,
      lng:   checkinLocation.lng,
      title: checkinLocation.name,
      desc:  note
        ? `🏍️ ${authorName} — "${note}"`
        : `🏍️ ${authorName} esteve aqui`,
      instagram: null,
    };
    const saved = await addPing(ping, user?.id);
    if (saved) {
      setPings(prev => [...prev, saved]);
      setFlyTarget({ lat: checkinLocation.lat, lng: checkinLocation.lng });
    }
    setShowCheckin(false);
    setCheckinNote('');
    setCheckinLocation(null);
  };

  const fetchPhotoSuggestions = async (q) => {
    if (q.length < 3) { setPhotoSuggestions([]); return; }
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&language=pt&count=5`);
      const data = await res.json();
      setPhotoSuggestions(data.results || []);
    } catch { /* silent */ }
  };

  const selectPhotoLocation = (loc) => {
    const latlng = { lat: loc.latitude, lng: loc.longitude };
    setNewPing(latlng);
    setFlyTarget(latlng);
    const label = `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}`;
    setPingLocal(label);
    setPhotoSearch(label);
    setPhotoSuggestions([]);
  };

  const cancelAdd = () => {
    setIsAdding(false); setIsPhotographerMode(false);
    setNewPing(null); setPingTitle(''); setPingLocal(''); setPingInsta('');
    setPhotoSearch(''); setPhotoSuggestions([]);
  };

  const savePing = async () => {
    if (!newPing || !pingTitle) return;

    // Parada normal → grava em pv_spots (mesma fonte de /paradas → aparece nos dois).
    if (pingType === 'user') {
      const slug = pingTitle.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) + '-' + Math.random().toString(36).slice(2, 6);
      const row = {
        slug, nome: pingTitle, categoria: 'outro',
        cidade: pingLocal || '', uf: '',
        lat: newPing.lat, lng: newPing.lng, selos: [],
        author: user?.nome || user?.name || 'Piloto', author_id: String(user?.id || ''), published: true,
      };
      const { data, error } = await supabase.from('pv_spots').insert(row).select().single();
      if (!error && data) setSpots(prev => [...prev, data]);
      setIsAdding(false); setIsPhotographerMode(false); setNewPing(null);
      setPingTitle(''); setPingLocal(''); setPingInsta('');
      return;
    }

    // Fotógrafo / monumento → ping efêmero no mapa (pv_map_pings).
    const ping = {
      type: pingType, lat: newPing.lat, lng: newPing.lng,
      title: pingTitle,
      desc: pingType === 'photographer'
        ? `📍 ${pingLocal || 'Local variado'} · 📸 ${pingInsta || 'sem Instagram'}`
        : pingType === 'monument' ? 'Ponto turístico biker' : 'Local visitado',
      instagram: pingInsta || null,
    };
    const saved = await addPing(ping, user?.id);
    if (saved) setPings(prev => [...prev, saved]);
    setIsAdding(false); setIsPhotographerMode(false); setNewPing(null);
    setPingTitle(''); setPingLocal(''); setPingInsta('');
  };


  const handleShowMonuments = () => {
    setShowMonuments(true);
    setFitMonuments(f => !f); // toggle to re-trigger effect
  };

  return (
    <div className="map-page">
      <div className="page-header" style={{ marginBottom: '8px' }}>
        <h1 className="page-title">MAPA INTERATIVO</h1>
        <p className="page-subtitle">Pings da comunidade e 34 Monumentos Rota Biker</p>
      </div>

      {/* Legend */}
      <div className="map-legend" style={{ marginBottom: '8px', flexWrap: 'wrap' }}>
        {[
          { color: '#f97316', label: 'Visitado' },
          { color: '#8b5cf6', label: 'Fotógrafo' },
          { color: '#22c55e', label: 'Estabelecimento' },
          { color: '#ef4444', label: 'Monumento' },
        ].map(l => (
          <div key={l.label} className="map-legend-item">
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
            <span>{l.label}</span>
          </div>
        ))}
        <div className="map-legend-item">
          <span style={{ fontSize: '14px' }}>🏍️</span>
          <span>Rota Biker</span>
        </div>
      </div>

      {/* Rota Biker toggle strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px',
        padding: '10px 16px', borderRadius: 'var(--radius-sm)',
        background: showMonuments ? 'rgba(249,115,22,.08)' : 'var(--bg2)',
        border: `1px solid ${showMonuments ? 'rgba(249,115,22,.35)' : 'var(--border)'}`,
        transition: 'var(--transition)',
      }}>
        <span style={{ fontSize: '20px' }}>🏍️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '800', fontSize: '13px' }}>Monumentos Rota Biker</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>34 monumentos oficiais · Brasil e Paraguai</div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={handleShowMonuments}
            style={{
              padding: '6px 12px', borderRadius: 'var(--radius-xs)', fontSize: '11px', fontWeight: '800',
              background: showMonuments ? 'var(--accent)' : 'var(--bg3)',
              color: showMonuments ? '#fff' : 'var(--muted)',
              border: '1px solid var(--border)', cursor: 'pointer',
            }}
          >
            {showMonuments ? '✓ VISÍVEIS' : 'MOSTRAR'}
          </button>
        </div>
      </div>

      {/* Radar de Apoio (POIs Overpass) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px',
        padding: '10px 16px', borderRadius: 'var(--radius-sm)',
        background: showPoiRadar ? 'rgba(234,179,8,.08)' : 'var(--bg2)',
        border: `1px solid ${showPoiRadar ? 'rgba(234,179,8,.35)' : 'var(--border)'}`,
        transition: 'var(--transition)',
      }}>
        <span style={{ fontSize: '20px' }}>{isFetchingPois ? <span className="loading-spinner" style={{borderColor: '#eab308', borderTopColor: 'transparent', width: 20, height: 20, borderWidth: 2}} /> : '📡'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '800', fontSize: '13px' }}>Radar de Apoio</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Postos e Restaurantes (Zoom min: 10)</div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => {
              if (showPoiRadar) setPoiData([]); // clear when disabling
              setShowPoiRadar(!showPoiRadar);
            }}
            style={{
              padding: '6px 12px', borderRadius: 'var(--radius-xs)', fontSize: '11px', fontWeight: '800',
              background: showPoiRadar ? '#eab308' : 'var(--bg3)',
              color: showPoiRadar ? '#000' : 'var(--muted)',
              border: '1px solid var(--border)', cursor: 'pointer',
            }}
          >
            {showPoiRadar ? '✓ LIGADO' : 'LIGAR'}
          </button>
        </div>
      </div>

      {/* ── BOTÃO PRINCIPAL: CHECK-IN ── */}
      <button
        className="btn-primary"
        style={{ width: '100%', marginBottom: '10px', padding: '14px', fontSize: '15px', gap: '10px' }}
        onClick={handleCheckin}
        disabled={checkinLoading}
      >
        {checkinLoading
          ? <><span className="loading-spinner" /> LOCALIZANDO...</>
          : <>📍 REGISTRAR MINHA PARADA</>}
      </button>

      {/* ── BOTÕES SECUNDÁRIOS ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          style={{
            flex: 1, padding: '9px', fontSize: '12px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: isAdding && !isPhotographerMode ? 'var(--bg3)' : 'transparent',
            color: 'var(--muted)', cursor: 'pointer', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
          }}
          onClick={() => { setIsAdding(!isAdding); setIsPhotographerMode(false); setPingType('user'); }}
        >
          <Plus size={14} /> ADICIONAR PONTO
        </button>
      </div>

      {isAdding && !newPing && (
        <div className="glass reveal visible" style={{
          marginBottom: '10px', padding: '14px 16px', borderRadius: 'var(--radius)',
          border: `1px solid ${isPhotographerMode ? '#8b5cf6' : 'var(--accent)'}`,
          background: isPhotographerMode ? 'rgba(139,92,246,.06)' : 'rgba(249,115,22,.04)',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: isPhotographerMode ? '#8b5cf6' : 'var(--accent)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={14} />
            {isPhotographerMode ? 'Buscar onde você fica para fotografar' : 'Buscar o local que deseja marcar'}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder={isPhotographerMode ? 'Ex: Serra do Cipó, MG...' : 'Ex: Mirante do Sol, Chapada...'}
              value={photoSearch}
              onChange={e => { setPhotoSearch(e.target.value); fetchPhotoSuggestions(e.target.value); }}
              autoFocus
              style={{ width: '100%', paddingLeft: '36px' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
            {photoSuggestions.length > 0 && (
              <ul className="autocomplete-list" style={{ position: 'absolute', width: '100%', zIndex: 50 }}>
                {photoSuggestions.map((s, i) => (
                  <li key={i} onClick={() => selectPhotoLocation(s)}>
                    📍 {s.name} <small>{s.admin1 || s.country}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
            Ou toque diretamente no mapa para marcar a posição exata.
          </p>
        </div>
      )}

      {/* Map */}
      <div style={{ flex: 1, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', minHeight: '420px' }}>
        <MapContainer center={[-22.5, -48.5]} zoom={5} style={{ height: '100%', width: '100%', minHeight: '420px' }}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name={TILES.topo.label}>
              <TileLayer attribution={TILES.topo.attribution} url={TILES.topo.url} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name={TILES.satelite.label}>
              <TileLayer attribution={TILES.satelite.attribution} url={TILES.satelite.url} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name={TILES.escuro.label}>
              <TileLayer attribution={TILES.escuro.attribution} url={TILES.escuro.url} subdomains="abcd" />
            </LayersControl.BaseLayer>
          </LayersControl>
          <MapClickHandler isAdding={isAdding} onMapClick={handleMapClick} />
          <MapResizer />
          <FitMonuments active={fitMonuments} />
          {userLocation && <CenterOnUser location={userLocation} />}
          {flyTarget && <FlyTo target={flyTarget} />}

          {/* Sua localização */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={selfIcon}>
              <Popup>
                <div style={{ textAlign: 'center', minWidth: '120px' }}>
                  <strong style={{ display: 'block', fontSize: '14px' }}>Você está aqui</strong>
                  <span style={{ fontSize: '11px', color: '#666' }}>📍 Sua posição atual</span>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Community pings */}
          {pings.map(p => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={icons[p.type] || icons.user}>
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <strong style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#ea580c' }}>
                    {p.title}
                  </strong>
                  {p.desc && (
                    <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.5, marginBottom: '8px' }}>
                      {p.desc}
                    </p>
                  )}
                  {p.type === 'photographer' && p.instagram && (
                    <a href={`https://instagram.com/${p.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-block', background: '#f97316', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                      📸 Ver Instagram
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Fotógrafos cadastrados */}
          {photographers.map(f => (
            <Marker key={'ph-' + f.id} position={[f.lat, f.lng]} icon={photographerIcon}>
              <Popup>
                <div style={{ minWidth: '190px' }}>
                  <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#ea580c' }}>📸 {f.nome}</strong>
                  {f.local && <div style={{ fontSize: '12px', color: '#444', marginBottom: '8px' }}>{f.local}</div>}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {photIg(f.instagram) && <a href={photIg(f.instagram)} target="_blank" rel="noopener noreferrer" style={{ background: '#f97316', color: '#fff', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>Instagram</a>}
                    {f.site_url && <a href={f.site_url} target="_blank" rel="noopener noreferrer" style={{ border: '1px solid #f97316', color: '#ea580c', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>Fotos</a>}
                    <a href={`/fotografo/${f.slug}`} style={{ color: '#666', fontSize: '12px', alignSelf: 'center' }}>perfil →</a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Paradas da Comunidade (pv_spots) */}
          {spots.map(s => (
            <Marker key={'sp-' + s.id} position={[s.lat, s.lng]} icon={spotIcon(s.categoria)}>
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#3f5a36' }}>{s.nome}</strong>
                  <div style={{ fontSize: '12px', color: '#444', marginBottom: '8px' }}>{[s.cidade, s.uf].filter(Boolean).join(' · ')}</div>
                  <a href={`/parada/${s.slug}`} style={{ display: 'inline-block', background: '#6f9a5e', color: '#fff', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>Ver parada →</a>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Rota Biker monuments */}
          {showMonuments && BIKER_MONUMENTS.map(m => (
            <Marker key={m.id} position={[m.lat, m.lng]} icon={bikerIcon}>
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '20px' }}>🏍️</span>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '13px', color: '#ea580c' }}>#{m.num} — Rota Biker</div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{m.name}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📍 {m.city} — {m.uf}
                  </div>
                  {m.ig && (
                    <a href={`https://instagram.com/${m.ig}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                      📸 @{m.ig}
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Biker Cafes and Gathering Points */}
          {BIKER_CAFES.map(c => (
            <Marker key={c.id} position={[c.lat, c.lng]} icon={icons.business}>
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '20px' }}>☕</span>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '13px', color: '#22c55e' }}>Ponto de Encontro</div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{c.name}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📍 {c.city} — {c.uf}
                  </div>
                  <p style={{ fontSize: '12px', color: '#444', marginBottom: '10px', lineHeight: 1.4 }}>
                    {c.desc}
                  </p>
                  {c.ig && (
                    <a href={`https://instagram.com/${c.ig}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#22c55e', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                      📸 @{c.ig}
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* SOS Alerts */}
          {sosAlerts.map(sos => (
            <Marker key={sos.userId} position={[sos.lat, sos.lng]} icon={sosIcon}>
              <Popup>
                <div style={{ textAlign: 'center', minWidth: '180px' }}>
                  <div style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontWeight: '800', fontSize: '12px', marginBottom: '8px' }}>
                    🚨 ALERTA SOS
                  </div>
                  <strong style={{ display: 'block', fontSize: '15px' }}>{sos.name}</strong>
                  <p style={{ margin: '8px 0', fontSize: '13px', color: '#666' }}>{sos.message}</p>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    {new Date(sos.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Comboio Members */}
          {comboioMembers.map(m => {
            if (!m.location) return null;
            return (
              <Marker key={m.user.id} position={[m.location.lat, m.location.lng]} icon={comboioIcon}>
                <Popup>
                  <div style={{ textAlign: 'center', minWidth: '120px' }}>
                    <strong style={{ display: 'block', fontSize: '14px' }}>{m.user.name}</strong>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>No seu Comboio</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Overpass POIs (Radar) */}
          {showPoiRadar && <PoiRadarComponent active={showPoiRadar} onPoisFetched={setPoiData} onFetchingChange={setIsFetchingPois} />}
          {showPoiRadar && poiData.map(poi => (
            <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={poi.type === 'fuel' ? fuelIcon : restaurantIcon}>
              <Popup>
                <div style={{ minWidth: '160px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px' }}>{poi.type === 'fuel' ? '⛽' : '🍽️'}</span>
                    <strong style={{ fontSize: '13px', color: poi.type === 'fuel' ? '#eab308' : '#e11d48' }}>
                      {poi.type === 'fuel' ? 'Posto de Combustível' : 'Restaurante'}
                    </strong>
                  </div>
                  <strong style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>{poi.name}</strong>
                  {poi.operator && <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Rede: {poi.operator}</div>}
                  {poi.opening_hours && <div style={{ fontSize: '11px', color: '#666' }}>Horário: {poi.opening_hours}</div>}
                </div>
              </Popup>
            </Marker>
          ))}

          {routeLine && <Polyline positions={routeLine} color="#f97316" weight={5} opacity={0.85} />}
          {newPing && <Marker position={[newPing.lat, newPing.lng]} icon={icons[pingType]} />}
        </MapContainer>
        
        {/* Comboio Active Banner */}
        {activeComboioId && (
          <div style={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 999, background: 'rgba(59,130,246,0.9)', backdropFilter: 'blur(10px)', color: 'white', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80', animation: 'pulse-sos 2s infinite' }} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', opacity: 0.8, textTransform: 'uppercase' }}>Comboio Ativo</div>
                <div style={{ fontSize: '16px', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '2px' }}>{activeComboioId}</div>
              </div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
              {comboioMembers.length} {comboioMembers.length === 1 ? 'membro' : 'membros'}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL DE CHECK-IN ── */}
      {showCheckin && checkinLocation && (
        <div className="glass calc-card reveal visible" style={{ marginTop: '12px', padding: '20px' }}>
          <h4 style={{ marginBottom: '6px', fontSize: '16px', fontWeight: 900 }}>
            📍 Registrar Parada
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '18px', lineHeight: 1.5 }}>
            Você está em{' '}
            <strong style={{ color: 'var(--text)' }}>{checkinLocation.name}</strong>.
            Deseja registrar sua passagem aqui?
          </p>

          <div className="calc-field">
            <label>
              O que você achou?{' '}
              <span style={{ color: 'var(--muted)', fontWeight: 400 }}>opcional · {checkinNote.length}/120</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Estrada épica, vale muito a visita!"
              value={checkinNote}
              maxLength={120}
              onChange={e => setCheckinNote(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && saveCheckin()}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button className="btn-primary" style={{ flex: 2 }} onClick={saveCheckin}>
              ✓ REGISTRAR
            </button>
            <button className="btn-outline" style={{ flex: 1 }}
              onClick={() => { setShowCheckin(false); setCheckinNote(''); setCheckinLocation(null); }}>
              CANCELAR
            </button>
          </div>
        </div>
      )}

      {/* New ping form */}
      {newPing && (
        <div className="glass calc-card reveal visible" style={{ marginTop: '12px', padding: '20px' }}>
          <h4 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 800 }}>
            {isPhotographerMode ? '📷 Cadastrar Fotógrafo' : '📍 Novo Ponto'}
          </h4>
          <div className="calc-field">
            <label>{isPhotographerMode ? 'Nome do Fotógrafo' : 'Nome do Local'}</label>
            <input type="text" placeholder={isPhotographerMode ? 'Ex: João Fotos' : 'Ex: Mirante do Sol'} value={pingTitle} onChange={e => setPingTitle(e.target.value)} />
          </div>
          {isPhotographerMode ? (
            <>
              <div className="calc-field" style={{ position: 'relative' }}>
                <label>Localização <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(busque ou toque no mapa)</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Ex: Serra do Cipó, MG"
                    value={pingLocal}
                    onChange={e => { setPingLocal(e.target.value); fetchPhotoSuggestions(e.target.value); }}
                    style={{ paddingLeft: '34px' }}
                  />
                  <Search size={13} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
                  {photoSuggestions.length > 0 && (
                    <ul className="autocomplete-list" style={{ position: 'absolute', width: '100%', zIndex: 50 }}>
                      {photoSuggestions.map((s, i) => (
                        <li key={i} onClick={() => selectPhotoLocation(s)}>
                          📍 {s.name} <small>{s.admin1 || s.country}</small>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="calc-field">
                <label>Instagram</label>
                <input type="text" placeholder="@seuinstagram" value={pingInsta} onChange={e => setPingInsta(e.target.value)} />
              </div>
            </>
          ) : (
            <div className="calc-field">
              <label>Tipo</label>
              <select value={pingType} onChange={e => setPingType(e.target.value)}>
                <option value="user">📍 Local Visitado</option>
                <option value="monument">🗿 Monumento</option>
                <option value="business">🏪 Estabelecimento</option>
              </select>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button className="btn-primary" style={{ flex: 2 }} onClick={savePing} disabled={!pingTitle}>CONFIRMAR</button>
            <button className="btn-outline" style={{ flex: 1 }} onClick={cancelAdd}>CANCELAR</button>
          </div>
        </div>
      )}

      <style>{`
        .leaflet-container { filter: invert(95%) hue-rotate(180deg) brightness(90%) contrast(88%); }
        .leaflet-popup-content-wrapper { border-radius: 12px; }
        .leaflet-popup-content { margin: 14px; }
        .leaflet-div-icon { background: transparent !important; border: none !important; }
      `}</style>
    </div>
  );
};

export default MapPage;
