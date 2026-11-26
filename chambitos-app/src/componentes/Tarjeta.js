import { View, StyleSheet } from 'react-native';
import { colores } from '../tema';
import { useEscritorio } from '../Contexto';

export default function Tarjeta({ children, estilo }) {
  const escritorio = useEscritorio();
  return <View style={[escritorio ? styles.tarjeta : styles.movil, estilo]}>{children}</View>;
}

export function Columnas({ children }) {
  const escritorio = useEscritorio();
  if (!escritorio) return <View style={{ gap: 12 }}>{children}</View>;
  return <View style={styles.columnas}>{children}</View>;
}

export function Columna({ children, ancho }) {
  const escritorio = useEscritorio();
  if (!escritorio) return <View style={{ gap: 12 }}>{children}</View>;
  return <View style={ancho ? [styles.fija, { width: ancho }] : styles.columna}>{children}</View>;
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: 14,
    padding: 22,
    gap: 12,
    borderWidth: 1,
    borderColor: colores.linea,
  },
  movil: { gap: 12 },
  columnas: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  columna: { flex: 1, gap: 16, minWidth: 0 },
  fija: { gap: 16, flexShrink: 0 },
});
