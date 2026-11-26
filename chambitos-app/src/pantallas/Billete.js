import { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import Texto from '../componentes/Texto';
import Boton from '../componentes/Boton';
import Marco from '../componentes/Marco';
import Noti from '../componentes/Noti';
import { Interruptor, Sube } from '../componentes/Piezas';
import { colores, fuentes } from '../tema';
import { useApp } from '../Contexto';
import { api } from '../api';
import { euros, fechaCorta } from '../utilidades';

export default function Billete() {
  const { datos, ir, aviso } = useApp();
  const [reserva, setReserva] = useState(datos.reserva);
  const [noti, setNoti] = useState(false);
  const check = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(check, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, []);

  async function cambiarAviso(valor) {
    try {
      await api.aviso(reserva.id, valor);
      setReserva({ ...reserva, aviso: valor });
      if (valor) setNoti(true);
      else aviso('Aviso desactivado');
    } catch (e) {
      aviso(e.message);
    }
  }

  const n = reserva.asientos.split(',').length;

  return (
    <View style={{ flex: 1 }}>
      <Marco titulo="Reserva hecha" ancho={560}>
        <Animated.View style={[styles.check, { opacity: check, transform: [{ scale: check }] }]}>
          <Svg width={64} height={64} viewBox="0 0 64 64">
            <Circle cx="32" cy="32" r="29" fill="none" stroke={colores.verde} strokeWidth="4" />
            <Path d="M19 33l9 9 17-19" fill="none" stroke={colores.verde} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Animated.View>
        <Sube retraso={400}>
          <Ticket reserva={reserva} n={n} />
        </Sube>
        <Interruptor valor={reserva.aviso} alCambiar={cambiarAviso} texto="Avisarme 30 minutos antes de salir" />
        <Boton texto="Ver mis reservas" onPress={() => ir('reservas')} />
        <Boton texto="Volver al inicio" tipo="ghost" onPress={() => ir('buscar')} />
      </Marco>
      {noti ? <Noti reserva={reserva} alTerminar={() => setNoti(false)} /> : null}
    </View>
  );
}

export function Ticket({ reserva, n }) {
  const filas = [
    ['Fecha', fechaCorta(reserva.fecha)],
    ['Salida', reserva.salida],
    ['Línea', reserva.linea],
    [n > 1 ? 'Plazas' : 'Plaza', reserva.asientos.replace(/,/g, ', ')],
    ['Viajeros', String(n)],
    ['Precio', euros(reserva.precio) + ' € (pago en el bus)'],
  ];
  return (
    <View style={styles.ticket}>
      <View style={styles.arriba}>
        <Texto style={styles.confirmada}>Reserva confirmada</Texto>
        <Texto style={styles.ruta}>{reserva.origen} → {reserva.destino}</Texto>
      </View>
      <View style={styles.lista}>
        {filas.map(([a, b]) => (
          <View key={a} style={styles.fila}>
            <Texto style={styles.clave}>{a}</Texto>
            <Texto style={styles.valor}>{b}</Texto>
          </View>
        ))}
      </View>
      <Texto style={styles.codigo}>Localizador {reserva.localizador}</Texto>
      <View style={styles.qr}>
        <QRCode value={'CHAMBITOS|' + reserva.localizador} size={130} color={colores.oscuro} backgroundColor="#fff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  check: { alignSelf: 'center' },
  ticket: { borderWidth: 1, borderColor: colores.linea, borderRadius: 12, overflow: 'hidden', backgroundColor: colores.blanco },
  arriba: { backgroundColor: colores.rojo, padding: 14 },
  confirmada: { color: colores.blanco, fontSize: 14 },
  ruta: { color: colores.blanco, fontFamily: fuentes.tituloFuerte, fontSize: 20 },
  lista: { paddingVertical: 12, paddingHorizontal: 14, gap: 6 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  clave: { color: colores.gris, fontSize: 14 },
  valor: { fontSize: 14, textAlign: 'right', flexShrink: 1 },
  codigo: {
    fontFamily: fuentes.mono,
    fontSize: 13,
    textAlign: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: colores.linea,
    color: colores.gris,
  },
  qr: { alignSelf: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 8, marginTop: 4, marginBottom: 10 },
});
