import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Texto from './Texto';
import { Pill } from './Piezas';
import { colores, fuentes } from '../tema';
import { corto } from '../datos';
import { cuentaAtras, duracion, euros, proximoBus } from '../utilidades';

const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export function ProximoBus({ viajes, origen, destino }) {
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const p = proximoBus(viajes, origen, destino);
  if (!p) {
    return (
      <View style={styles.prox}>
        <Texto style={styles.proxPeque}>Próximo bus</Texto>
        <Texto style={styles.proxRuta}>{corto(origen)} → {corto(destino)}</Texto>
        <Texto style={styles.proxTexto}>No hay servicio en este trayecto</Texto>
      </View>
    );
  }
  const esHoy = new Date().toDateString() === p.salida.toDateString();
  return (
    <View style={styles.prox}>
      <View style={{ flex: 1, gap: 2 }}>
        <Texto style={styles.proxPeque}>Próximo bus · Línea {p.viaje.sublinea}</Texto>
        <Texto style={styles.proxRuta}>{corto(origen)} → {corto(destino)}</Texto>
        <Texto style={styles.proxTexto}>
          {esHoy ? 'Hoy' : dias[p.salida.getDay()].charAt(0).toUpperCase() + dias[p.salida.getDay()].slice(1)} a las {p.viaje.paradas[p.i].hora} · llega {p.viaje.paradas[p.j].hora}
        </Texto>
      </View>
      <Texto style={styles.cuenta}>{cuentaAtras(p.salida.getTime() - ahora)}</Texto>
    </View>
  );
}

export function TarjetaViaje({ viaje, onPress }) {
  const completo = viaje.libres === 0;
  let plazas = <Pill texto={viaje.libres + ' libres'} />;
  if (completo) plazas = <Pill texto="Completo" tipo="bad" />;
  else if (viaje.libres < 6) plazas = <Pill texto={'Quedan ' + viaje.libres} tipo="low" />;
  const intermedias = viaje.paradas - 1;

  return (
    <Pressable
      onPress={onPress}
      disabled={completo}
      style={({ pressed, hovered }) => [styles.viaje, completo && styles.completo, hovered && !completo && styles.sombra, pressed && styles.pulsado]}
    >
      <View style={styles.filaViaje}>
        <Texto style={styles.horas}>{viaje.salida} → {viaje.llegada}</Texto>
        <Texto style={styles.precio}>{euros(viaje.precio)} €</Texto>
      </View>
      <View style={styles.filaViaje}>
        <Texto style={styles.detalle}>
          {duracion(viaje.salida, viaje.llegada)} · {intermedias > 0 ? intermedias + ' paradas intermedias' : 'Directo'}
        </Texto>
        {plazas}
      </View>
      <Pill texto={viaje.linea} tipo="line" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  prox: {
    backgroundColor: colores.oscuro,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proxPeque: { color: colores.blanco, opacity: 0.75, fontSize: 12 },
  proxRuta: { color: colores.blanco, fontFamily: fuentes.titulo, fontSize: 17 },
  proxTexto: { color: colores.blanco, opacity: 0.85, fontSize: 13 },
  cuenta: { color: colores.blanco, fontFamily: fuentes.mono, fontSize: 26 },
  viaje: {
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 10,
    padding: 12,
    gap: 4,
    backgroundColor: colores.blanco,
  },
  completo: { opacity: 0.55 },
  sombra: { shadowColor: colores.oscuro, shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } },
  pulsado: { transform: [{ scale: 0.97 }] },
  filaViaje: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  horas: { fontFamily: fuentes.titulo, fontSize: 18 },
  precio: { fontFamily: fuentes.titulo, fontSize: 17, color: colores.rojo },
  detalle: { color: colores.gris, fontSize: 13, flex: 1 },
});
