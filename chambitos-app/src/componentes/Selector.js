import { useState } from 'react';
import { View, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import Texto from './Texto';
import { estilosCampo } from './Campo';
import { colores, fuentes } from '../tema';
import { useEscritorio } from '../Contexto';

export default function Selector({ etiqueta, valor, opciones, alCambiar, error }) {
  const [abierto, setAbierto] = useState(false);
  const escritorio = useEscritorio();
  const elegida = opciones.find((o) => o.valor === valor);

  return (
    <View style={styles.caja}>
      {etiqueta ? <Texto style={styles.etiqueta}>{etiqueta}</Texto> : null}
      <Pressable style={[estilosCampo.campo, styles.fila]} onPress={() => setAbierto(true)}>
        <Texto style={styles.valor} numberOfLines={1}>{elegida ? elegida.texto : 'Elige una opción'}</Texto>
        <Texto style={styles.flecha}>▾</Texto>
      </Pressable>
      {error ? <Texto style={styles.error}>{error}</Texto> : null}

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable style={[styles.fondo, escritorio && styles.fondoCentro]} onPress={() => setAbierto(false)}>
          <View style={[styles.hoja, escritorio && styles.hojaEscritorio]}>
            <Texto style={styles.titulo}>{etiqueta}</Texto>
            <ScrollView>
              {opciones.map((o) => (
                <Pressable
                  key={String(o.valor)}
                  style={({ hovered }) => [styles.opcion, hovered && styles.encima]}
                  onPress={() => {
                    alCambiar(o.valor);
                    setAbierto(false);
                  }}
                >
                  <Texto style={[styles.textoOpcion, o.valor === valor && styles.elegida]}>{o.texto}</Texto>
                  {o.valor === valor ? <Texto style={styles.elegida}>✓</Texto> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { gap: 4 },
  etiqueta: { fontFamily: fuentes.medio, fontSize: 12, color: colores.gris },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  valor: { flex: 1 },
  flecha: { color: colores.gris, marginLeft: 8 },
  error: { color: colores.rojo, fontSize: 12 },
  fondo: { flex: 1, backgroundColor: 'rgba(30,24,16,0.45)', justifyContent: 'flex-end' },
  fondoCentro: { justifyContent: 'center', alignItems: 'center' },
  hoja: {
    backgroundColor: colores.blanco,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '70%',
  },
  hojaEscritorio: { borderRadius: 14, width: 420 },
  titulo: { fontFamily: fuentes.titulo, fontSize: 17, marginBottom: 8 },
  opcion: {
    paddingVertical: 13,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colores.linea,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  encima: { backgroundColor: colores.superficie },
  textoOpcion: { fontSize: 15 },
  elegida: { color: colores.rojo, fontFamily: fuentes.semi },
});
