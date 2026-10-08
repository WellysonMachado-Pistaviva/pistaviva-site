import { writeFile } from 'node:fs/promises';
import { MONUMENTOS, BIKERS_CHECKED_AT } from '../app/lib/monumentosBikers.mjs';
import { orderStops, routePoints, ROUTING_VERSION } from '../app/lib/monumentosRoute.mjs';
import { roadGeometry } from '../app/lib/monumentosRoad.mjs';

for (const mode of ['todos', 'prontos']) {
  const stops = orderStops(MONUMENTOS.filter(m => m.coordinates && (mode === 'todos' || m.status === 'pronto')), 10);
  const points = routePoints(stops);
  const coordinates = points.map(m => [...m.coordinates].reverse().join(',')).join(';');
  const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`OSRM ${response.status}`);
  const route = roadGeometry(await response.json(), points.length - 1);
  await writeFile(`public/monumentos/rota-${mode}.json`, JSON.stringify({ ...route, ids: stops.map(m => m.id), routingVersion: ROUTING_VERSION, checkedAt: BIKERS_CHECKED_AT }));
  console.log(`${mode}: ${stops.length} pontos, ${Math.round(route.distanceKm)} km, ${route.line.length} coordenadas`);
}
