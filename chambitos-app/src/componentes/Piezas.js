import { useEffect, useRef } from 'react';
import { View, Pressable, Animated, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Texto from './Texto';
import Boton from './Boton';
import { colores, fuentes } from '../tema';

export function Cabeza({ texto, estilo }) {
  return <Texto style={[styles.cabeza, estilo]}>{texto.toUpperCase()}</Texto>;
}

export function Sub({ texto, estilo }) {
  return <Texto style={[styles.sub, estilo]}>{texto}</Texto>;
}

export function Pill({ texto, tipo }) {
  const fondo = {
    normal: colores.asiento,
    low: colores.naranja,
    ok: colores.verde,
    bad: colores.rojo,
    line: colores.oscuro,
    blanca: colores.blanco,
  }[tipo || 'normal'];
  const color = !tipo || tipo === 'normal' ? colores.texto : tipo === 'blanca' ? colores.rojo : colores.blanco;
  return (
    <View style={[styles.pill, { backgroundColor: fondo }]}>
      <Texto style={[styles.textoPill, { color }, (tipo === 'line' || tipo === 'blanca') && styles.mono]}>{texto}</Texto>
    </View>
  );
}

export function Chip({ texto, activo, onPress, colorActivo, children }) {
  const fondo = colorActivo || colores.rojo;
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }) => [styles.chip, hovered && styles.chipEncima, activo && { backgroundColor: fondo, borderColor: fondo }]}
    >
      {children ? children : <Texto style={[styles.textoChip, activo && { color: colores.blanco }]}>{texto}</Texto>}
    </Pressable>
  );
}

export function Seg({ opciones, valor, alCambiar }) {
  return (
    <View style={styles.seg}>
      {opciones.map((o) => (
        <Pressable key={o.valor} style={[styles.segBoton, valor === o.valor && styles.segActivo]} onPress={() => alCambiar(o.valor)}>
          <Texto style={[styles.segTexto, valor === o.valor && { color: colores.blanco }]} numberOfLines={1}>{o.texto}</Texto>
        </Pressable>
      ))}
    </View>
  );
}

export function Interruptor({ valor, alCambiar, texto }) {
  const pos = useRef(new Animated.Value(valor ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(pos, { toValue: valor ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [valor]);
  const izquierda = pos.interpolate({ inputRange: [0, 1], outputRange: [2, 16] });
  const fondo = pos.interpolate({ inputRange: [0, 1], outputRange: [colores.ocupado, colores.verde] });
  return (
    <Pressable style={styles.interruptor} onPress={() => alCambiar(!valor)}>
      <Animated.View style={[styles.carril, { backgroundColor: fondo }]}>
        <Animated.View style={[styles.bola, { left: izquierda }]} />
      </Animated.View>
      <Texto style={styles.textoInterruptor}>{texto}</Texto>
    </Pressable>
  );
}

export function Casilla({ valor, alCambiar, texto }) {
  return (
    <Pressable style={styles.casillaFila} onPress={() => alCambiar(!valor)}>
      <View style={[styles.casilla, valor && styles.casillaMarcada]}>
        {valor ? <Texto style={styles.tick}>✓</Texto> : null}
      </View>
      <Texto style={styles.textoCasilla}>{texto}</Texto>
    </Pressable>
  );
}

export function Entrada({ children, estilo }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  }, []);
  const x = v.interpolate({ inputRange: [0, 1], outputRange: [28, 0] });
  return <Animated.View style={[{ opacity: v, transform: [{ translateX: x }] }, estilo]}>{children}</Animated.View>;
}

export function Sube({ children, retraso, estilo }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 400, delay: retraso || 0, useNativeDriver: true }).start();
  }, []);
  const y = v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  return <Animated.View style={[{ opacity: v, transform: [{ translateY: y }] }, estilo]}>{children}</Animated.View>;
}

export function Esqueleto({ alto }) {
  const v = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const bucle = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.4, duration: 500, useNativeDriver: true }),
      ])
    );
    bucle.start();
    return () => bucle.stop();
  }, []);
  return <Animated.View style={[styles.esqueleto, { height: alto || 78, opacity: v }]} />;
}

export function ErrorRed({ titulo, texto, reintentar }) {
  return (
    <View style={styles.estado}>
      <Svg width={90} height={90} viewBox="0 0 90 90">
        <Circle cx="45" cy="45" r="42" fill={colores.superficie} />
        <Path d="M22 40a32 32 0 0146 0M30 49a20 20 0 0130 0M38 58a8 8 0 0114 0" fill="none" stroke={colores.ocupado} strokeWidth="5" strokeLinecap="round" />
        <Circle cx="45" cy="66" r="4" fill={colores.ocupado} />
        <Path d="M24 24l42 42" stroke={colores.rojo} strokeWidth="5" strokeLinecap="round" />
      </Svg>
      <Texto style={styles.estadoTitulo}>{titulo || 'No hemos podido cargar los datos'}</Texto>
      <Texto style={styles.estadoTexto}>{texto || 'Comprueba tu conexión a internet e inténtalo otra vez.'}</Texto>
      {reintentar ? <Boton texto="Reintentar" onPress={reintentar} estilo={{ alignSelf: 'stretch' }} /> : null}
    </View>
  );
}

export function Vacio({ texto }) {
  return (
    <View style={styles.vacio}>
      <Texto style={styles.textoVacio}>{texto}</Texto>
    </View>
  );
}

export function Tiembla({ clave, children }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!clave) return;
    Animated.sequence([
      Animated.timing(v, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(v, { toValue: 6, duration: 70, useNativeDriver: true }),
      Animated.timing(v, { toValue: -6, duration: 70, useNativeDriver: true }),
      Animated.timing(v, { toValue: 6, duration: 70, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [clave]);
  return <Animated.View style={{ gap: 12, transform: [{ translateX: v }] }}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  cabeza: { fontFamily: fuentes.semi, fontSize: 12, color: colores.gris, letterSpacing: 1, marginTop: 4 },
  sub: { color: colores.gris, fontSize: 14 },
  pill: { borderRadius: 99, paddingVertical: 3, paddingHorizontal: 8, alignSelf: 'flex-start' },
  textoPill: { fontFamily: fuentes.semi, fontSize: 11 },
  mono: { fontFamily: fuentes.mono },
  chip: {
    borderWidth: 1,
    borderColor: colores.linea,
    backgroundColor: colores.superficie,
    borderRadius: 99,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  chipEncima: { borderColor: colores.gris },
  textoChip: { fontFamily: fuentes.medio, fontSize: 13 },
  seg: { flexDirection: 'row', borderWidth: 1, borderColor: colores.linea, borderRadius: 8, overflow: 'hidden' },
  segBoton: { flex: 1, paddingVertical: 9, paddingHorizontal: 4, backgroundColor: colores.superficie, alignItems: 'center' },
  segActivo: { backgroundColor: colores.rojo },
  segTexto: { fontFamily: fuentes.medio, fontSize: 13 },
  interruptor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  carril: { width: 34, height: 20, borderRadius: 99 },
  bola: { position: 'absolute', top: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: colores.blanco },
  textoInterruptor: { fontSize: 13 },
  casillaFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  casilla: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: colores.gris, alignItems: 'center', justifyContent: 'center' },
  casillaMarcada: { backgroundColor: colores.rojo, borderColor: colores.rojo },
  tick: { color: colores.blanco, fontSize: 12, lineHeight: 14 },
  textoCasilla: { fontSize: 13, flex: 1 },
  esqueleto: { borderRadius: 10, backgroundColor: colores.asiento },
  estado: { alignItems: 'center', gap: 10, paddingVertical: 30, paddingHorizontal: 10 },
  estadoTitulo: { fontFamily: fuentes.titulo, fontSize: 17, textAlign: 'center' },
  estadoTexto: { color: colores.gris, textAlign: 'center' },
  vacio: { borderWidth: 1, borderStyle: 'dashed', borderColor: colores.linea, borderRadius: 10, padding: 16 },
  textoVacio: { color: colores.gris, fontSize: 14, textAlign: 'center' },
});
