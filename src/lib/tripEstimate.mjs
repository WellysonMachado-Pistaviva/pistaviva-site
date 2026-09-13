export const validLocation = p => p && Number.isFinite(p.lat) && Math.abs(p.lat) <= 90 && Number.isFinite(p.lng) && Math.abs(p.lng) <= 180;

export function estimateTrip({ distanceKm, durationSec, consumption, price, tank, reserve, breakEvery, breakMinutes, stopMinutes, stops, extraCost, contingency, destinationMinutes = 0 }) {
  const values = { distanceKm, durationSec, consumption, price, tank, reserve, breakEvery, breakMinutes, stopMinutes, stops, extraCost, contingency, destinationMinutes };
  for (const [key, value] of Object.entries(values)) {
    if (value === '' || !Number.isFinite(Number(value)) || Number(value) < 0) throw new Error(`Valor inválido: ${key}`);
    values[key] = Number(value);
  }
  const v = values;
  if (v.consumption <= 0 || v.tank <= 0 || v.breakEvery <= 0 || v.reserve >= 100 || v.contingency > 100) throw new Error('Revise consumo, tanque, reserva e intervalo de pausas.');
  const liters = v.distanceKm / v.consumption;
  const fuelCost = liters * v.price;
  const rangeKm = v.tank * v.consumption * (1 - v.reserve / 100);
  const fuelStops = Math.max(0, Math.ceil(v.distanceKm / rangeKm) - 1);
  const breaks = Math.max(0, Math.ceil(v.durationSec / (v.breakEvery * 60)) - 1);
  // Descanso e abastecimento podem ocorrer juntos; visitas são tempo adicional.
  const pauseMinutes = Math.max(breaks, fuelStops) * v.breakMinutes + v.stops * v.stopMinutes + v.destinationMinutes;
  const totalSec = v.durationSec + pauseMinutes * 60;
  const totalCost = (fuelCost + v.extraCost) * (1 + v.contingency / 100);
  return { liters, fuelCost, rangeKm, fuelStops, breaks, pauseMinutes, totalSec, totalCost };
}

export function formatDuration(seconds) {
  const minutes = Math.round(seconds / 60);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
}
