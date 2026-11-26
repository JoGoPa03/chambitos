import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Texto from './Texto';
import { colores } from '../tema';
import { useEscritorio } from '../Contexto';

export default function Toast({ texto }) {
  const v = useRef(new Animated.Value(0)).current;
  const escritorio = useEscritorio();
  useEffect(() => {
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [texto]);
  const y = v.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  return (
    <Animated.View pointerEvents="none" style={[styles.toast, escritorio && styles.escritorio, { opacity: v, transform: [{ translateY: y }] }]}>
      <Texto style={styles.texto}>{texto}</Texto>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 74,
    backgroundColor: colores.oscuro,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  escritorio: { left: undefined, right: 32, bottom: 32, maxWidth: 380 },
  texto: { color: colores.blanco, fontSize: 14 },
});
