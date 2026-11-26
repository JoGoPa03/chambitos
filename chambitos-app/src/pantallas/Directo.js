import { View, StyleSheet } from 'react-native';
import Texto from '../componentes/Texto';
import Marco from '../componentes/Marco';
import Tarjeta, { Columnas, Columna } from '../componentes/Tarjeta';
import { Sub } from '../componentes/Piezas';
import { MapaLinea } from '../componentes/Mapas';
import { colores, fuentes } from '../tema';

export default function Directo() {
  return (
    <Marco titulo="En directo" ancho={1000}>
      <View style={styles.tag}>
        <Texto style={styles.textoTag}>Fase 2 · fuera del MVP</Texto>
      </View>
      <Columnas>
        <Columna>
          <MapaLinea />
        </Columna>
        <Columna ancho={340}>
          <View style={styles.tarjeta}>
            <Texto style={styles.titulo}>Línea 1a · Bus 4721 LKM</Texto>
            <Sub texto="Entre Vallada y Montesa · llega a Hospital Xàtiva sobre las 07:49 (+2 min)" />
          </View>
          <Tarjeta>
            <Sub texto="El recorrido de la Línea 1 está dibujado con la posición real de cada parada. Cuando los autobuses manden su GPS, el punto se moverá con la posición de verdad." />
          </Tarjeta>
        </Columna>
      </Columnas>
    </Marco>
  );
}

const styles = StyleSheet.create({
  tag: { backgroundColor: colores.naranja, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6, alignSelf: 'flex-start' },
  textoTag: { fontFamily: fuentes.semi, fontSize: 11, color: colores.blanco },
  tarjeta: { borderWidth: 1, borderColor: colores.linea, borderRadius: 10, padding: 12, gap: 6, backgroundColor: colores.blanco },
  titulo: { fontFamily: fuentes.semi },
});
