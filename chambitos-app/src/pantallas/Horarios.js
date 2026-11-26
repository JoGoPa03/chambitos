import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Texto from '../componentes/Texto';
import Marco from '../componentes/Marco';
import Tarjeta from '../componentes/Tarjeta';
import { Cabeza, Chip, Esqueleto, ErrorRed, Pill, Seg, Sub, Vacio } from '../componentes/Piezas';
import { colores, fuentes } from '../tema';
import { useApp, useEscritorio } from '../Contexto';
import { api } from '../api';
import { corto } from '../datos';
import { minutos } from '../utilidades';

export default function Horarios() {
  const { viajes, cargarViajes } = useApp();
  const escritorio = useEscritorio();
  const [lineas, setLineas] = useState(null);
  const [error, setError] = useState(false);
  const [num, setNum] = useState(0);
  const [sentido, setSentido] = useState('ida');
  const [dias, setDias] = useState('L');

  function cargar() {
    setError(false);
    Promise.all([api.lineas(), viajes.length ? Promise.resolve(viajes) : cargarViajes()])
      .then(([l]) => setLineas(l))
      .catch(() => setError(true));
  }

  useEffect(() => {
    cargar();
  }, []);

  if (error) {
    return (
      <Marco titulo="Horarios">
        <ErrorRed titulo="No hemos podido cargar los horarios" reintentar={cargar} />
      </Marco>
    );
  }

  if (!lineas) {
    return (
      <Marco titulo="Horarios">
        <Esqueleto alto={40} />
        <Esqueleto alto={260} />
      </Marco>
    );
  }

  const l = lineas[num] || lineas[0];
  const nombres = l.paradas.map((p) => p.nombre);
  const primera = nombres[0];
  const ultima = nombres[nombres.length - 1];
  const lista = viajes
    .filter((v) => v.linea.id === l.id && v.dias === dias && v.sentido === sentido)
    .sort((a, b) => minutos(a.paradas[0].hora) - minutos(b.paradas[0].hora));
  const orden = sentido === 'ida' ? nombres : [...nombres].reverse();
  const filas = orden.filter((n) => lista.some((v) => v.paradas.some((p) => p.nombre === n)));

  const tabla = lista.length ? (
    <>
      <View style={styles.tabla}>
        <View style={styles.fija}>
          <View style={[styles.celdaCabeza, styles.celdaParada]}>
            <Texto style={styles.textoCabeza}>Parada</Texto>
          </View>
          {filas.map((n, k) => (
            <View key={n} style={[styles.celda, styles.celdaParada, k % 2 === 1 && styles.par]}>
              <Texto style={styles.nombreParada} numberOfLines={1}>{corto(n)}</Texto>
            </View>
          ))}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ flexGrow: 1 }}>
          {lista.map((v) => (
            <View key={v.id} style={styles.columna}>
              <View style={styles.celdaCabeza}>
                <Pill texto={v.sublinea} tipo="blanca" />
              </View>
              {filas.map((n, k) => {
                const i = v.paradas.findIndex((p) => p.nombre === n);
                const extremo = i === 0 || i === v.paradas.length - 1;
                return (
                  <View key={n} style={[styles.celda, k % 2 === 1 && styles.par]}>
                    {i >= 0 ? (
                      <Texto style={[styles.hora, extremo && styles.extremo]}>{v.paradas[i].hora}</Texto>
                    ) : (
                      <Texto style={styles.no}>·</Texto>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>
      <Sub
        texto="Cada columna es un autobús. Lee hacia abajo para ver a qué hora pasa por cada parada. En rojo, donde sale y donde termina. Un punto: ese autobús no para ahí."
        estilo={{ fontSize: 12 }}
      />
    </>
  ) : (
    <Vacio texto={'No hay servicio ' + (dias === 'F' ? 'los fines de semana' : 'entre semana') + ' en este sentido.'} />
  );

  const filtros = (
    <>
      <Seg opciones={lineas.map((x, k) => ({ valor: k, texto: 'Línea ' + x.codigo }))} valor={num} alCambiar={setNum} />
      <View>
        <Texto style={styles.nombre}>{l.nombre}</Texto>
        <Sub texto={l.descripcion || ''} estilo={{ fontSize: 12, marginTop: 2 }} />
      </View>
      <Seg
        opciones={[
          { valor: 'ida', texto: corto(primera) + ' →' },
          { valor: 'vuelta', texto: '← ' + corto(ultima) },
        ]}
        valor={sentido}
        alCambiar={setSentido}
      />
      <View style={{ flexDirection: 'row' }}>
        <Chip texto="Lunes a viernes" activo={dias === 'L'} colorActivo={colores.oscuro} onPress={() => setDias('L')} />
        <Chip texto="Sáb, dom y festivos" activo={dias === 'F'} colorActivo={colores.oscuro} onPress={() => setDias('F')} />
      </View>
    </>
  );

  const cabeza = <Cabeza texto={sentido === 'ida' ? corto(primera) + ' → ' + corto(ultima) : corto(ultima) + ' → ' + corto(primera)} />;

  if (escritorio) {
    return (
      <Marco titulo="Horarios">
        <View style={styles.escritorio}>
          <View style={{ width: 340 }}>
            <Tarjeta>{filtros}</Tarjeta>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Tarjeta>
              {cabeza}
              {tabla}
            </Tarjeta>
          </View>
        </View>
      </Marco>
    );
  }

  return (
    <Marco titulo="Horarios">
      {filtros}
      {cabeza}
      {tabla}
    </Marco>
  );
}

const styles = StyleSheet.create({
  nombre: { fontFamily: fuentes.titulo, fontSize: 17 },
  escritorio: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  tabla: { flexDirection: 'row', borderWidth: 1, borderColor: colores.linea, borderRadius: 10, overflow: 'hidden', backgroundColor: colores.blanco },
  fija: { borderRightWidth: 1, borderRightColor: colores.linea, zIndex: 1, backgroundColor: colores.blanco },
  columna: { minWidth: 62, flexGrow: 1 },
  celdaCabeza: { backgroundColor: colores.rojo, height: 36, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 9 },
  celdaParada: { alignItems: 'flex-start' },
  textoCabeza: { color: colores.blanco, fontFamily: fuentes.semi, fontSize: 13 },
  celda: { height: 34, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 9, borderBottomWidth: 1, borderBottomColor: colores.linea },
  par: { backgroundColor: colores.superficie },
  nombreParada: { fontFamily: fuentes.semi, fontSize: 13 },
  hora: { fontFamily: fuentes.mono, fontSize: 13 },
  extremo: { color: colores.rojo, fontWeight: '700' },
  no: { color: colores.ocupado, fontSize: 13 },
});
