// Camadas de mapa. MapTiler (topográfico/satélite) quando a chave existe;
// fallback OSM/CARTO sem chave. A chave NEXT_PUBLIC_ é pública (restrinja o
// domínio no painel do MapTiler).
const KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || '';
const mt = (style) => `https://api.maptiler.com/maps/${style}/{z}/{x}/{y}.png?key=${KEY}`;

export const HAS_MAPTILER = !!KEY;

export const TILES = {
  topo: {
    label: 'Topográfico',
    url: HAS_MAPTILER ? mt('outdoor') : 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: HAS_MAPTILER ? '&copy; MapTiler &copy; OpenStreetMap' : '&copy; OpenTopoMap',
  },
  satelite: {
    label: 'Satélite',
    url: HAS_MAPTILER ? mt('hybrid') : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: HAS_MAPTILER ? '&copy; MapTiler &copy; OpenStreetMap' : '&copy; Esri',
  },
  escuro: {
    label: 'Escuro',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
};
