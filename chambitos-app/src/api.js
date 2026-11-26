import { Platform } from 'react-native';

const URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/api' : 'http://localhost:8080/api';

let token = null;

export function guardarToken(nuevo) {
  token = nuevo;
}

async function peticion(metodo, ruta, cuerpo) {
  const opciones = { method: metodo, headers: { 'Content-Type': 'application/json' } };
  if (token) opciones.headers.Authorization = token;
  if (cuerpo) opciones.body = JSON.stringify(cuerpo);

  let respuesta;
  try {
    respuesta = await fetch(URL + ruta, opciones);
  } catch (e) {
    throw new Error('No se puede conectar con el servidor');
  }

  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) : null;
  if (!respuesta.ok) {
    throw new Error(datos && datos.message ? datos.message : 'Error ' + respuesta.status);
  }
  return datos;
}

export const api = {
  login: (correo, contrasena) => peticion('POST', '/auth/login', { correo, contrasena }),
  registro: (nombre, correo, contrasena) => peticion('POST', '/auth/registro', { nombre, correo, contrasena }),
  salir: () => peticion('POST', '/auth/salir'),
  cambiarContrasena: (actual, nueva) => peticion('PUT', '/usuarios/contrasena', { actual, nueva }),

  paradas: () => peticion('GET', '/paradas'),
  lineas: () => peticion('GET', '/lineas'),
  viajes: () => peticion('GET', '/viajes'),
  buscar: (origen, destino, fecha) =>
    peticion('GET', '/viajes/buscar?origen=' + encodeURIComponent(origen) + '&destino=' + encodeURIComponent(destino) + '&fecha=' + fecha),
  asientos: (viajeId, fecha) => peticion('GET', '/viajes/' + viajeId + '/asientos?fecha=' + fecha),

  misReservas: () => peticion('GET', '/reservas'),
  reservar: (datos) => peticion('POST', '/reservas', datos),
  cancelar: (id) => peticion('PUT', '/reservas/' + id + '/cancelar'),
  aviso: (id, aviso) => peticion('PUT', '/reservas/' + id + '/aviso', { aviso }),

  adminViajes: () => peticion('GET', '/admin/viajes'),
  autobuses: () => peticion('GET', '/admin/autobuses'),
  guardar: (tipo, id, datos) =>
    id ? peticion('PUT', '/admin/' + tipo + '/' + id, datos) : peticion('POST', '/admin/' + tipo, datos),
  borrar: (tipo, id) => peticion('DELETE', '/admin/' + tipo + '/' + id),
  pasajeros: (viajeId) => peticion('GET', '/admin/viajes/' + viajeId + '/pasajeros'),
  ocupacion: () => peticion('GET', '/admin/ocupacion'),
};
