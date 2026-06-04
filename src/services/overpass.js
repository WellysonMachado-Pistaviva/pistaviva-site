export async function fetchPoisInBounds(bounds) {
  // bounds: { _southWest: { lat, lng }, _northEast: { lat, lng } }
  // Overpass bbox format: south,west,north,east
  const bbox = `${bounds._southWest.lat},${bounds._southWest.lng},${bounds._northEast.lat},${bounds._northEast.lng}`;
  
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="fuel"](${bbox});
      node["amenity"="restaurant"](${bbox});
    );
    out body;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      console.error('Overpass API error:', response.statusText);
      return [];
    }

    const data = await response.json();
    
    // Map the Overpass response to our app's format
    const pois = (data.elements || []).map(el => {
      let type = 'unknown';
      let name = el.tags?.name || 'Desconhecido';
      
      if (el.tags?.amenity === 'fuel') {
        type = 'fuel';
        name = el.tags.brand || el.tags.name || 'Posto de Combustível';
      } else if (el.tags?.amenity === 'restaurant') {
        type = 'restaurant';
        name = el.tags.name || 'Restaurante';
        
        // Se quisermos filtrar algo com base nas tags no futuro, faremos aqui.
        // ex: el.tags.cuisine
      }

      return {
        id: `osm-${el.id}`,
        lat: el.lat,
        lng: el.lon,
        type: type,
        name: name,
        operator: el.tags?.operator || null,
        opening_hours: el.tags?.opening_hours || null
      };
    });

    return pois;

  } catch (err) {
    console.error('Failed to fetch POIs from Overpass:', err);
    return [];
  }
}
