import { Pressable, StyleSheet } from 'react-native';
import Texto from './Texto';
import { colores, fuentes } from '../tema';

export default function Boton({ texto, onPress, tipo, desactivado, estilo, pequeno }) {
  const fondo = {
    normal: styles.normal,
    alt: styles.alt,
    ghost: styles.ghost,
    danger: styles.danger,
  }[tipo || 'normal'];
  const color = tipo === 'ghost' ? colores.texto : tipo === 'danger' ? colores.rojo : colores.blanco;
  return (
    <Pressable
      onPress={onPress}
      disabled={desactivado}
      style={({ pressed, hovered }) => [
        styles.boton,
        fondo,
        pequeno && styles.pequeno,
        desactivado && styles.desactivado,
        hovered && !desactivado && styles.encima,
        pressed && !desactivado && styles.pulsado,
        estilo,
      ]}
    >
      <Texto style={[styles.texto, { color }, pequeno && styles.textoPequeno]}>{texto.toUpperCase()}</Texto>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: { borderRadius: 8, paddingVertical: 13, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  normal: { backgroundColor: colores.rojo },
  alt: { backgroundColor: colores.oscuro },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colores.linea },
  danger: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colores.rojo },
  pequeno: { paddingVertical: 7, paddingHorizontal: 10 },
  desactivado: { opacity: 0.45 },
  encima: { opacity: 0.9 },
  pulsado: { transform: [{ scale: 0.97 }] },
  texto: { fontFamily: fuentes.semi, fontSize: 14, letterSpacing: 0.6 },
  textoPequeno: { fontSize: 12 },
});
