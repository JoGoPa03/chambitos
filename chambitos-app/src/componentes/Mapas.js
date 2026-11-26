import { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Polyline, Circle, Path, Text as SvgTexto, G } from 'react-native-svg';
import Texto from './Texto';
import { colores, fuentes } from '../tema';
import { coords, distancia, corto, recorridoLinea1 } from '../datos';

const linea2 = ['Benicolet', 'Pinet', 'Llutxent', 'Quatretonda', 'Genovés', 'Xàtiva', 'C.E. Xàtiva', 'Hospital Xàtiva'];

export function MapaCercana({ ubicacion, parada }) {
  const [ancho, setAncho] = useState(0);
  const [paso, setPaso] = useState(0);
  const pulso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bucle = Animated.loop(Animated.timing(pulso, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true }));
    bucle.start();
    const t = setInterval(() => setPaso((p) => (p + 1) % 12), 80);
    return () => {
      bucle.stop();
      clearInterval(t);
    };
  }, []);

  const W = 320;
  const H = 240;
  const pc = coords[parada];
  const puntos = [[ubicacion.lat, ubicacion.lng], pc];
  Object.values(coords).forEach((c) => {
    if (distancia(c, pc) < 1.3) puntos.push(c);
  });
  const lats = puntos.map((p) => p[0]);
  const lngs = puntos.map((p) => p[1]);
  const cla = (Math.min(...lats) + Math.max(...lats)) / 2;
  const clo = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  const sp = Math.max((Math.max(...lats) - Math.min(...lats)) * 111.2, (Math.max(...lngs) - Math.min(...lngs)) * 86.6, 0.8) * 1.35;
  const k = Math.min(W, H) / sp;
  const X = (lng) => W / 2 + (lng - clo) * 86.6 * k;
  const Y = (lat) => H / 2 - (lat - cla) * 111.2 * k;
  const km = sp / 1.35;
  const barra = km > 3 ? 1 : km > 1.2 ? 0.5 : 0.2;
  const ux = X(ubicacion.lng);
  const uy = Y(ubicacion.lat);

  const rejilla = [];
  for (let i = 0; i < W; i += 32) rejilla.push(<Line key={'v' + i} x1={i} y1={0} x2={i} y2={H} />);
  for (let i = 0; i < H; i += 32) rejilla.push(<Line key={'h' + i} x1={0} y1={i} x2={W} y2={i} />);

  const escala = ancho / W;
  const tam = pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 3] });
  const opacidad = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <View style={styles.mapa} onLayout={(e) => setAncho(e.nativeEvent.layout.width)}>
      <Svg width="100%" height="100%" viewBox={'0 0 ' + W + ' ' + H}>
        <Rect width={W} height={H} fill={colores.superficie} />
        <G stroke={colores.linea} strokeWidth="1">{rejilla}</G>
        {[recorridoLinea1, linea2].map((l, n) => (
          <Polyline
            key={n}
            points={l.map((p) => X(coords[p][1]).toFixed(1) + ',' + Y(coords[p][0]).toFixed(1)).join(' ')}
            fill="none"
            stroke={colores.ocupado}
            strokeWidth="3"
            strokeLinejoin="round"
            opacity="0.6"
          />
        ))}
        <Line x1={ux} y1={uy} x2={X(pc[1])} y2={Y(pc[0])} stroke={colores.oscuro} strokeWidth="4" strokeLinecap="round" strokeDasharray="6 6" strokeDashoffset={-paso} />
        {Object.keys(coords).map((n) => {
          const x = X(coords[n][1]);
          const y = Y(coords[n][0]);
          if (x < -20 || x > W + 20 || y < -20 || y > H + 20) return null;
          const elegida = n === parada;
          const pegada = !elegida && Math.hypot(x - X(pc[1]), y - Y(pc[0])) < 40;
          return (
            <G key={n}>
              <Circle cx={x} cy={y} r={elegida ? 9 : 5} fill={elegida ? colores.rojo : colores.blanco} stroke={colores.rojo} strokeWidth="3" />
              {pegada ? null : (
                <SvgTexto x={x + 11} y={y + 4} fontSize={elegida ? 12 : 10} fontWeight={elegida ? '700' : '400'} fill={colores.texto} fontFamily="Inter_500Medium">
                  {n}
                </SvgTexto>
              )}
            </G>
          );
        })}
        <Circle cx={ux} cy={uy} r="8" fill={colores.azul} stroke="#fff" strokeWidth="3" />
        <Line x1={10} y1={H - 12} x2={10 + barra * k} y2={H - 12} stroke={colores.texto} strokeWidth="2" />
        <SvgTexto x={10} y={H - 17} fontSize="9" fill={colores.texto} fontFamily="Inter_500Medium">
          {barra >= 1 ? barra + ' km' : barra * 1000 + ' m'}
        </SvgTexto>
      </Svg>
      {ancho ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.pulso, { left: ux * escala - 8, top: uy * escala - 8, opacity: opacidad, transform: [{ scale: tam }] }]}
        />
      ) : null}
      <View style={styles.etiqueta}>
        <Texto style={styles.textoEtiqueta}>{ubicacion.real ? 'GPS' : 'Simulada'}</Texto>
      </View>
    </View>
  );
}

export function MapaLinea() {
  const [ancho, setAncho] = useState(0);
  const avance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bucle = Animated.loop(Animated.timing(avance, { toValue: 1, duration: 16000, easing: Easing.linear, useNativeDriver: false }));
    bucle.start();
    return () => bucle.stop();
  }, []);

  const W = 320;
  const H = 260;
  const m = 28;
  const lats = recorridoLinea1.map((n) => coords[n][0]);
  const lngs = recorridoLinea1.map((n) => coords[n][1]);
  const sx = (W - 2 * m) / ((Math.max(...lngs) - Math.min(...lngs)) * 86.6);
  const sy = (H - 2 * m) / ((Math.max(...lats) - Math.min(...lats)) * 111.2);
  const k = Math.min(sx, sy);
  const cx = (Math.max(...lngs) + Math.min(...lngs)) / 2;
  const cy = (Math.max(...lats) + Math.min(...lats)) / 2;
  const X = (v) => W / 2 + (v - cx) * 86.6 * k;
  const Y = (v) => H / 2 - (v - cy) * 111.2 * k;
  const puntos = recorridoLinea1.map((n) => [X(coords[n][1]), Y(coords[n][0])]);
  const d = 'M' + puntos.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');

  const tramos = [0];
  for (let i = 1; i < puntos.length; i++) {
    tramos.push(tramos[i - 1] + Math.hypot(puntos[i][0] - puntos[i - 1][0], puntos[i][1] - puntos[i - 1][1]));
  }
  const total = tramos[tramos.length - 1];
  const entrada = tramos.map((t) => t / total);
  const escala = ancho / W;
  const left = avance.interpolate({ inputRange: entrada, outputRange: puntos.map((p) => p[0] * escala - 8) });
  const top = avance.interpolate({ inputRange: entrada, outputRange: puntos.map((p) => p[1] * escala - 8) });

  return (
    <View style={[styles.mapa, { aspectRatio: W / H }]} onLayout={(e) => setAncho(e.nativeEvent.layout.width)}>
      <Svg width="100%" height="100%" viewBox={'0 0 ' + W + ' ' + H}>
        <Rect width={W} height={H} fill={colores.superficie} />
        <Path d={d} stroke={colores.rojo} strokeWidth="4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {recorridoLinea1.map((n, i) => {
          const [x, y] = puntos[i];
          const izquierda = x > W - 90;
          let texto = null;
          if (n === 'La Llosa de Ranes') {
            texto = <SvgTexto x={x - 9} y={y - 4} textAnchor="end" fontSize="10" fill={colores.texto} fontFamily="Inter_400Regular">La Llosa</SvgTexto>;
          } else if (n === 'C.E. Xàtiva') {
            texto = <SvgTexto x={x - 6} y={y + 18} textAnchor="end" fontSize="10" fill={colores.texto} fontFamily="Inter_400Regular">Xàtiva · C.E. · Hospital</SvgTexto>;
          } else if (n !== 'Xàtiva' && n !== 'Hospital Xàtiva') {
            texto = (
              <SvgTexto x={izquierda ? x - 9 : x + 9} y={y + 4} textAnchor={izquierda ? 'end' : 'start'} fontSize="10" fill={colores.texto} fontFamily="Inter_400Regular">
                {corto(n)}
              </SvgTexto>
            );
          }
          return (
            <G key={n}>
              <Circle cx={x} cy={y} r="5" fill={colores.blanco} stroke={colores.rojo} strokeWidth="3" />
              {texto}
            </G>
          );
        })}
        <Line x1={12} y1={H - 12} x2={12 + 5 * k} y2={H - 12} stroke={colores.texto} strokeWidth="2" />
        <SvgTexto x={12} y={H - 17} fontSize="9" fill={colores.texto} fontFamily="Inter_400Regular">5 km</SvgTexto>
      </Svg>
      {ancho ? <Animated.View pointerEvents="none" style={[styles.bus, { left, top }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mapa: {
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colores.superficie,
    aspectRatio: 4 / 3,
    width: '100%',
  },
  pulso: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: colores.azul },
  etiqueta: { position: 'absolute', right: 8, bottom: 6, backgroundColor: colores.blanco, paddingVertical: 2, paddingHorizontal: 5, borderRadius: 4 },
  textoEtiqueta: { fontFamily: fuentes.mono, fontSize: 10, color: colores.gris },
  bus: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: colores.oscuro, borderWidth: 2, borderColor: colores.blanco },
});
