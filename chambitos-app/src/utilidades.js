const diasLargos = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function aTexto(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return fecha.getFullYear() + '-' + mes + '-' + dia;
}

export function aFecha(texto) {
  const p = texto.split('-');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

export function hoy() {
  return aTexto(new Date());
}

export function proximosDias(cuantos) {
  const lista = [];
  for (let i = 0; i < cuantos; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    lista.push(aTexto(d));
  }
  return lista;
}

export function fechaLarga(texto) {
  const d = aFecha(texto);
  const t = diasLargos[d.getDay()] + ', ' + d.getDate() + ' de ' + meses[d.getMonth()];
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function fechaCorta(texto) {
  const p = texto.split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}

export function esFinDeSemana(texto) {
  const dia = aFecha(texto).getDay();
  return dia === 0 || dia === 6;
}

export function minutos(hora) {
  const p = hora.split(':');
  return Number(p[0]) * 60 + Number(p[1]);
}

export function duracion(salida, llegada) {
  const d = minutos(llegada) - minutos(salida);
  if (d >= 60) return Math.floor(d / 60) + ' h ' + (d % 60) + ' min';
  return d + ' min';
}

export function euros(numero) {
  return numero.toFixed(2).replace('.', ',');
}

export function cuentaAtras(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const x = s % 60;
  if (h >= 24) return Math.floor(h / 24) + ' d';
  if (h > 0) return h + 'h ' + String(m).padStart(2, '0') + 'm';
  return String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0');
}

export function proximoBus(viajes, origen, destino) {
  const ahora = new Date();
  for (let k = 0; k < 8; k++) {
    const dia = new Date(ahora);
    dia.setDate(dia.getDate() + k);
    const tipo = dia.getDay() === 0 || dia.getDay() === 6 ? 'F' : 'L';
    let mejor = null;
    viajes.forEach((v) => {
      if (v.dias !== tipo) return;
      const i = v.paradas.findIndex((p) => p.nombre === origen);
      const j = v.paradas.findIndex((p) => p.nombre === destino);
      if (i < 0 || j <= i) return;
      const salida = new Date(dia);
      salida.setHours(Number(v.paradas[i].hora.split(':')[0]), Number(v.paradas[i].hora.split(':')[1]), 0, 0);
      if (salida > ahora && (!mejor || salida < mejor.salida)) {
        mejor = { viaje: v, i, j, salida };
      }
    });
    if (mejor) return mejor;
  }
  return null;
}

export function salidasDesde(viajes, parada) {
  const tipo = esFinDeSemana(hoy()) ? 'F' : 'L';
  const ahora = new Date().getHours() * 60 + new Date().getMinutes();
  const lista = [];
  viajes.forEach((v) => {
    if (v.dias !== tipo) return;
    const i = v.paradas.findIndex((p) => p.nombre === parada);
    if (i < 0 || i === v.paradas.length - 1) return;
    if (minutos(v.paradas[i].hora) < ahora) return;
    lista.push({ id: v.id, linea: v.sublinea, hora: v.paradas[i].hora, hacia: v.paradas[v.paradas.length - 1].nombre });
  });
  lista.sort((a, b) => minutos(a.hora) - minutos(b.hora));
  return lista.slice(0, 3);
}

export function fuerza(clave) {
  let n = 0;
  if (clave.length >= 8) n++;
  if (/[A-Z]/.test(clave)) n++;
  if (/[0-9]/.test(clave)) n++;
  if (/[^A-Za-z0-9]/.test(clave)) n++;
  if (clave === '') return { ancho: 0, color: 'transparent' };
  const niveles = [
    { ancho: 25, color: '#A80607' },
    { ancho: 25, color: '#A80607' },
    { ancho: 50, color: '#FF5100' },
    { ancho: 75, color: '#C9A400' },
    { ancho: 100, color: '#1D7A46' },
  ];
  return niveles[n];
}
