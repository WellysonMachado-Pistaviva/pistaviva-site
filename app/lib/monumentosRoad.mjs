import { simplify, lineString } from '@turf/turf';
import { parseRoadRoute } from './monumentosRoute.mjs';

// Reduz a geometria completa com tolerância ~11 m, em vez do overview continental.
export function roadGeometry(data, expectedLegs) {
  const route = parseRoadRoute(data, expectedLegs);
  const reduced = simplify(lineString(route.line.map(([lat, lng]) => [lng, lat])), { tolerance: 0.0001, highQuality: true });
  return { ...route, line: reduced.geometry.coordinates.map(([lng, lat]) => [lat, lng]) };
}
