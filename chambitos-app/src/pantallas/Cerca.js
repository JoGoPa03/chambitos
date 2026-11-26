import { useEffect, useState } from 'react';
import { View, Linking, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import Texto from '../componentes/Texto';
import Boton from '../componentes/Boton';
import Marco from '../componentes/Marco';
import Tarjeta, { Columnas, Columna } from '../componentes/Tarjeta';
import { Cabeza, Esqueleto, Pill, Seg, Sub } from '../componentes/Piezas';
import { MapaCercana } from '../componentes/Mapas';
import { colores, fuentes } from '../tema';
import { useApp } from '../Contexto';
import { coords, paradaMasCercana, sitios } from '../datos';
import { salidasDesde } from '../utilidades';

export default function Cerca() {
  const { viajes, busqueda, setBusqueda, ir, aviso } = useApp();
  const [ubicacion, setUbicacion] = useState(null);
  const [sitio, setSitio] = useState(0);

  function simular(k) {
    setSitio(k);
    setUbicacion({ lat: sitios[k].lat, lng: sitios[k].lng, real: false });
  }

  useEffect(() => {
    let hecho = false;
    const t = setTimeout(() => {
      if (!hecho) {
        hecho = true;
        simular(0);
      }
    }, 2500);
    Location.requestForegroundPermissionsAsync()
      .then((permiso) => {
        if (permiso.status !== 'granted') throw new Error('sin permiso');
        return Location.getCurrentPositionAsync({});
      })
      .then((p) => {
        if (hecho) return;
        hecho = true;
        clearTimeout(t);
        setUbicacion({ lat: p.coords.latitude, lng: p.coords.longitude, real: true });
      })
      .catch(() => {
        if (hecho) return;
        hecho = true;
        clearTimeout(t);
        simular(0);
      });
    return () => clearTimeout(t);
  }, []);

  if (!ubicacion) {
    return (
      <Marco titulo="Parada cercana" atras="buscar" ancho={900}>
        <Esqueleto alto={240} />
        <Sub texto="Buscando tu ubicación…" estilo={{ textAlign: 'center' }} />
      </Marco>
    );
  }

  const { parada, km } = paradaMasCercana(ubicacion.lat, ubicacion.lng);
  const andando = Math.max(1, Math.round(((km * 1.3) / 4.8) * 60));
  const salidas = salidasDesde(viajes, parada);
  const pc = coords[parada];
  const enlace = 'https://www.google.com/maps/dir/?api=1&destination=' + pc[0] + ',' + pc[1] + '&travelmode=walking';

  function salirDesde() {
    setBusqueda({ ...busqueda, origen: parada });
    ir('buscar');
    aviso('Origen cambiado a ' + parada);
  }

  return (
    <Marco titulo="Parada cercana" atras="buscar" ancho={1000}>
      <Columnas>
        <Columna>
          <MapaCercana ubicacion={ubicacion} parada={parada} />
        </Columna>
        <Columna ancho={380}>
          <Tarjeta>
            <View>
              <Cabeza texto="Parada más cercana" />
              <Texto style={styles.parada}>{parada}</Texto>
            </View>
            <View style={styles.datos}>
              <Dato valor={km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km'} texto="distancia" />
              <Dato valor={andando + ' min'} texto="andando" />
              <Dato valor={salidas[0] ? salidas[0].hora : '--'} texto="próxima salida" />
            </View>
            {salidas.length ? (
              <View>
                {salidas.map((s, k) => (
                  <View key={k} style={[styles.fila, k === salidas.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={styles.hacia}>
                      <Pill texto={s.linea} tipo="line" />
                      <Texto style={{ fontSize: 14 }}>hacia {s.hacia}</Texto>
                    </View>
                    <Texto style={styles.hora}>{s.hora}</Texto>
                  </View>
                ))}
              </View>
            ) : (
              <Sub texto="Hoy ya no salen más autobuses desde esta parada." />
            )}
            <Boton texto="Salir desde esta parada" onPress={salirDesde} />
            <Boton texto="Cómo llegar en Google Maps" tipo="ghost" onPress={() => Linking.openURL(enlace)} />
            {ubicacion.real ? null : (
              <View style={{ gap: 8 }}>
                <Cabeza texto="Simular que estoy en" />
                <Seg opciones={sitios.map((s, k) => ({ valor: k, texto: s.nombre }))} valor={sitio} alCambiar={simular} />
              </View>
            )}
          </Tarjeta>
        </Columna>
      </Columnas>
    </Marco>
  );
}

function Dato({ valor, texto }) {
  return (
    <View style={styles.dato}>
      <Texto style={styles.valor}>{valor}</Texto>
      <Texto style={styles.textoDato}>{texto}</Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  parada: { fontFamily: fuentes.titulo, fontSize: 20 },
  datos: { flexDirection: 'row', gap: 8 },
  dato: { flex: 1, backgroundColor: colores.superficie, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center' },
  valor: { fontFamily: fuentes.titulo, fontSize: 18, color: colores.rojo },
  textoDato: { fontSize: 11, color: colores.gris },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colores.linea,
    paddingVertical: 10,
  },
  hacia: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  hora: { fontFamily: fuentes.mono, color: colores.gris, fontSize: 13 },
});
