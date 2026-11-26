import { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import Texto from './Texto';
import { colores, fuentes } from '../tema';
import { useEscritorio } from '../Contexto';

const logo = require('../../assets/logo-chambitos.png');

export default function Noti({ reserva, alTerminar }) {
  const v = useRef(new Animated.Value(0)).current;
  const escritorio = useEscritorio();

  useEffect(() => {
    Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(3200),
      Animated.timing(v, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => alTerminar());
  }, []);

  const y = v.interpolate({ inputRange: [0, 1], outputRange: [-140, 0] });
  const varias = reserva.asientos.includes(',');
  return (
    <Animated.View style={[styles.noti, escritorio && styles.escritorio, { transform: [{ translateY: y }] }]}>
      <View style={styles.icono}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={{ flex: 1 }}>
        <Texto style={styles.titulo}>Chambitos · dentro de 30 min</Texto>
        <Texto style={styles.texto}>
          Tu bus {reserva.origen} → {reserva.destino} sale a las {reserva.salida}. {varias ? 'Plazas' : 'Plaza'} {reserva.asientos.replace(/,/g, ', ')}.
        </Texto>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  noti: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    zIndex: 5,
  },
  escritorio: { left: undefined, right: 24, top: 84, width: 380 },
  icono: { width: 34, height: 34, borderRadius: 8, backgroundColor: colores.rojo, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 30, height: 10 },
  titulo: { fontFamily: fuentes.semi, fontSize: 13 },
  texto: { fontSize: 13, lineHeight: 18 },
});
