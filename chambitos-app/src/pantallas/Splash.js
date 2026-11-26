import { useEffect, useRef, useState } from 'react';
import { View, Image, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';
import Texto from '../componentes/Texto';
import { colores } from '../tema';
import { useApp, useEscritorio } from '../Contexto';

const logo = require('../../assets/logo-chambitos.png');

export default function Splash() {
  const { ir } = useApp();
  const escritorio = useEscritorio();
  const [ancho, setAncho] = useState(0);
  const sube = useRef(new Animated.Value(0)).current;
  const bus = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(sube, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }).start();
    Animated.timing(bus, { toValue: 1, duration: 1900, delay: 300, easing: Easing.bezier(0.5, 0, 0.3, 1), useNativeDriver: true }).start();
    const t = setTimeout(() => ir('login'), 2600);
    return () => clearTimeout(t);
  }, []);

  const y = sube.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const x = bus.interpolate({ inputRange: [0, 1], outputRange: [-90, ancho * 1.1] });
  const abajo = escritorio ? 200 : 120;

  return (
    <View style={styles.splash} onLayout={(e) => setAncho(e.nativeEvent.layout.width)}>
      <Animated.View style={{ opacity: sube, transform: [{ translateY: y }] }}>
        <Image source={logo} style={escritorio ? styles.logoGrande : styles.logo} resizeMode="contain" />
      </Animated.View>
      <View style={[styles.carretera, { bottom: abajo }]} />
      <Animated.View style={[styles.bus, { bottom: abajo + 2, transform: [{ translateX: x }] }]}>
        <Svg width={80} height={40} viewBox="0 0 80 40">
          <Rect x="2" y="4" width="74" height="26" rx="6" fill="#fff" />
          <Rect x="8" y="9" width="12" height="9" rx="2" fill={colores.rojo} />
          <Rect x="24" y="9" width="12" height="9" rx="2" fill={colores.rojo} />
          <Rect x="40" y="9" width="12" height="9" rx="2" fill={colores.rojo} />
          <Rect x="58" y="9" width="14" height="13" rx="2" fill={colores.oscuro} />
          <Circle cx="18" cy="32" r="6" fill={colores.oscuro} />
          <Circle cx="60" cy="32" r="6" fill={colores.oscuro} />
        </Svg>
      </Animated.View>
      <Texto style={[styles.lema, { bottom: abajo - 60 }]}>Más de 75 años de experiencia</Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colores.rojo, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logo: { width: 230, height: 77 },
  logoGrande: { width: 380, height: 127 },
  carretera: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.35)' },
  bus: { position: 'absolute', left: 0 },
  lema: { position: 'absolute', color: colores.blanco, opacity: 0.8, fontSize: 13 },
});
