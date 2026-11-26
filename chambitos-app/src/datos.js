export const coords = {
  'La Font de la Figuera': [38.80494, -0.87985],
  Moixent: [38.87532, -0.74954],
  Vallada: [38.89594, -0.6891],
  Montesa: [38.94816, -0.64927],
  'La Llosa de Ranes': [39.01854, -0.53359],
  Xàtiva: [38.99233, -0.52162],
  'C.E. Xàtiva': [38.98763, -0.52364],
  'Hospital Xàtiva': [39.00678, -0.50957],
  Benicolet: [38.91935, -0.34601],
  Pinet: [38.98276, -0.33839],
  Llutxent: [38.94271, -0.3566],
  Quatretonda: [38.9457, -0.40163],
  Genovés: [38.98842, -0.47042],
};

export const sitios = [
  { nombre: 'Xàtiva', lat: 38.9872, lng: -0.516 },
  { nombre: 'Moixent', lat: 38.876, lng: -0.753 },
  { nombre: 'Llutxent', lat: 38.9405, lng: -0.354 },
  { nombre: 'Hospital', lat: 39.005, lng: -0.5115 },
];

export const recorridoLinea1 = [
  'La Font de la Figuera',
  'Moixent',
  'Vallada',
  'Montesa',
  'La Llosa de Ranes',
  'Xàtiva',
  'C.E. Xàtiva',
  'Hospital Xàtiva',
];

export function corto(parada) {
  return parada
    .replace('La Font de la Figuera', 'La Font')
    .replace('Hospital Xàtiva', 'Hosp. Xàtiva')
    .replace('La Llosa de Ranes', 'La Llosa');
}

export function distancia(a, b) {
  return Math.hypot((a[0] - b[0]) * 111.2, (a[1] - b[1]) * 86.6);
}

export function paradaMasCercana(lat, lng) {
  let mejor = null;
  let minima = 99999;
  Object.keys(coords).forEach((nombre) => {
    const d = distancia(coords[nombre], [lat, lng]);
    if (d < minima) {
      minima = d;
      mejor = nombre;
    }
  });
  return { parada: mejor, km: minima };
}
