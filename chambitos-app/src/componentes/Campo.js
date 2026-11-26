import { View, TextInput, StyleSheet } from 'react-native';
import Texto from './Texto';
import { colores, fuentes } from '../tema';

export default function Campo({ etiqueta, error, ...resto }) {
  return (
    <View style={styles.caja}>
      <Texto style={styles.etiqueta}>{etiqueta}</Texto>
      <TextInput style={styles.campo} placeholderTextColor="#9A928F" {...resto} />
      {error ? <Texto style={styles.error}>{error}</Texto> : null}
    </View>
  );
}

export const estilosCampo = StyleSheet.create({
  campo: {
    fontFamily: fuentes.normal,
    fontSize: 15,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 8,
    backgroundColor: colores.superficie,
    color: colores.texto,
  },
});

const styles = StyleSheet.create({
  caja: { gap: 4 },
  etiqueta: { fontFamily: fuentes.medio, fontSize: 12, color: colores.gris },
  campo: estilosCampo.campo,
  error: { color: colores.rojo, fontSize: 12 },
});
