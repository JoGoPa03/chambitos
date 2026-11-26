import { useEffect, useRef, useState } from 'react';
import { View, Pressable, Animated, StyleSheet } from 'react-native';
import Texto from '../componentes/Texto';
import Boton from '../componentes/Boton';
import Marco from '../componentes/Marco';
import Tarjeta, { Columnas, Columna } from '../componentes/Tarjeta';
import { Esqueleto, ErrorRed, Pill, Sub } from '../componentes/Piezas';
import { colores, fuentes } from '../tema';
import { useApp, useEscritorio } from '../Contexto';
import { api } from '../api';
import { euros, fechaLarga } from '../utilidades';

export default function Plaza() {
  const { datos, busqueda, ir, aviso } = useApp();
  const escritorio = useEscritorio();
  const viaje = datos.viaje;
  const [asientos, setAsientos] = useState(null);
  const [error, setError] = useState(false);
  const [viajeros, setViajeros] = useState(1);
  const [elegidas, setElegidas] = useState([]);
  const [enviando, setEnviando] = useState(false);

  function cargar() {
    setError(false);
    api.asientos(viaje.id, busqueda.fecha).then(setAsientos).catch(() => setError(true));
  }

  useEffect(() => {
    cargar();
  }, []);

  function elegir(n) {
    if (elegidas.includes(n)) {
      setElegidas(elegidas.filter((x) => x !== n));
      return;
    }
    const nuevas = [...elegidas, n];
    if (nuevas.length > viajeros) nuevas.shift();
    setElegidas(nuevas);
  }

  function cambiarViajeros(d) {
    const n = viajeros + d;
    if (n > 4) {
      aviso('Máximo 4 viajeros por reserva');
      return;
    }
    if (n < 1 || n > viaje.libres) return;
    setViajeros(n);
    setElegidas(elegidas.slice(0, n));
  }

  async function reservar() {
    setEnviando(true);
    try {
      const r = await api.reservar({
        viajeId: viaje.id,
        fecha: busqueda.fecha,
        origen: busqueda.origen,
        destino: busqueda.destino,
        asientos: elegidas,
      });
      ir('billete', { reserva: r });
    } catch (e) {
      aviso(e.message);
      setEnviando(false);
      cargar();
      setElegidas([]);
    }
  }

  if (error) {
    return (
      <Marco titulo="Elige plaza" atras="resultados">
        <ErrorRed titulo="No hemos podido cargar las plazas" reintentar={cargar} />
      </Marco>
    );
  }

  const listo = elegidas.length === viajeros;
  const falta = viajeros - elegidas.length;
  const textoBoton = listo
    ? 'Confirmar ' + (viajeros > 1 ? 'plazas ' : 'plaza ') + [...elegidas].sort((a, b) => a - b).join(', ') + ' · ' + euros(viaje.precio * viajeros) + ' €'
    : 'Elige ' + falta + ' plaza' + (falta > 1 ? 's' : '') + ' más';

  const leyenda = (
    <View style={styles.leyenda}>
      <Muestra color={colores.asiento} texto="Libre" />
      <Muestra color={colores.ocupado} texto="Ocupada" />
      <Muestra color={colores.rojo} texto="Tuya" />
    </View>
  );

  const contador = (
    <View style={styles.contador}>
      <Sub texto="Viajeros" />
      <Pressable style={styles.mas} onPress={() => cambiarViajeros(-1)}>
        <Texto style={{ fontSize: 18 }}>−</Texto>
      </Pressable>
      <Texto style={styles.numero}>{viajeros}</Texto>
      <Pressable style={styles.mas} onPress={() => cambiarViajeros(1)}>
        <Texto style={{ fontSize: 18 }}>+</Texto>
      </Pressable>
    </View>
  );

  const bus = asientos ? <Autobus asientos={asientos} elegidas={elegidas} elegir={elegir} grande={escritorio} /> : <Esqueleto alto={360} />;
  const boton = <Boton texto={enviando ? 'Reservando...' : textoBoton} desactivado={!listo || enviando} onPress={reservar} />;
  const resumen = viaje.salida + ' ' + busqueda.origen + ' → ' + viaje.llegada + ' ' + busqueda.destino + ' · Bus ' + viaje.autobus;

  if (escritorio) {
    return (
      <Marco titulo="Elige plaza" atras="resultados" ancho={960}>
        <Columnas>
          <Columna>
            <Tarjeta estilo={{ alignItems: 'center' }}>
              {leyenda}
              {bus}
            </Tarjeta>
          </Columna>
          <Columna ancho={380}>
            <Tarjeta>
              <Pill texto={viaje.linea} tipo="line" />
              <Texto style={styles.ruta}>{busqueda.origen} → {busqueda.destino}</Texto>
              <Sub texto={fechaLarga(busqueda.fecha)} />
              <Fila a="Salida" b={viaje.salida} />
              <Fila a="Llegada" b={viaje.llegada} />
              <Fila a="Autobús" b={viaje.autobus} />
              <Fila a="Precio por plaza" b={euros(viaje.precio) + ' €'} />
              {contador}
              {boton}
            </Tarjeta>
          </Columna>
        </Columnas>
      </Marco>
    );
  }

  return (
    <Marco titulo="Elige plaza" atras="resultados">
      <Sub texto={resumen} />
      {leyenda}
      {contador}
      {bus}
      {boton}
    </Marco>
  );
}

function Autobus({ asientos, elegidas, elegir, grande }) {
  const filas = [];
  for (let n = 1; n <= asientos.plazas; n += 4) {
    filas.push([n, n + 1, null, n + 2, n + 3]);
  }
  return (
    <View style={[styles.bus, grande && { width: 260 }]}>
      <Texto style={styles.frente}>▲ CONDUCTOR</Texto>
      {filas.map((fila, k) => (
        <View key={k} style={styles.filaBus}>
          {fila.map((n, i) =>
            n === null ? (
              <View key={i} style={{ width: 18 }} />
            ) : n > asientos.plazas ? (
              <View key={i} style={{ flex: 1 }} />
            ) : (
              <Asiento key={i} n={n} ocupado={asientos.ocupadas.includes(n)} elegido={elegidas.includes(n)} alPulsar={() => elegir(n)} />
            )
          )}
        </View>
      ))}
    </View>
  );
}

function Asiento({ n, ocupado, elegido, alPulsar }) {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (elegido) {
      Animated.sequence([
        Animated.timing(v, { toValue: 1.25, duration: 150, useNativeDriver: true }),
        Animated.timing(v, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [elegido]);
  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: v }] }}>
      <Pressable
        disabled={ocupado}
        onPress={alPulsar}
        style={[styles.asiento, ocupado && styles.ocupado, elegido && styles.elegido]}
      >
        <Texto style={[styles.numeroAsiento, (ocupado || elegido) && { color: colores.blanco }]}>{n}</Texto>
      </Pressable>
    </Animated.View>
  );
}

function Muestra({ color, texto }) {
  return (
    <View style={styles.muestra}>
      <View style={[styles.cuadro, { backgroundColor: color }]} />
      <Texto style={styles.textoMuestra}>{texto}</Texto>
    </View>
  );
}

function Fila({ a, b }) {
  return (
    <View style={styles.fila}>
      <Texto style={{ color: colores.gris, fontSize: 14 }}>{a}</Texto>
      <Texto style={{ fontSize: 14 }}>{b}</Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  leyenda: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  muestra: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cuadro: { width: 12, height: 12, borderRadius: 3 },
  textoMuestra: { fontSize: 12, color: colores.gris },
  contador: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center' },
  mas: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.linea,
    backgroundColor: colores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: { fontFamily: fuentes.titulo, fontSize: 20, minWidth: 24, textAlign: 'center' },
  bus: {
    borderWidth: 2,
    borderColor: colores.linea,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    width: 200,
    alignSelf: 'center',
    gap: 7,
  },
  frente: { fontFamily: fuentes.mono, fontSize: 11, color: colores.gris, textAlign: 'center', marginBottom: 4 },
  filaBus: { flexDirection: 'row', gap: 7 },
  asiento: { aspectRatio: 1, borderRadius: 6, backgroundColor: colores.asiento, alignItems: 'center', justifyContent: 'center' },
  ocupado: { backgroundColor: colores.ocupado },
  elegido: { backgroundColor: colores.rojo },
  numeroAsiento: { fontFamily: fuentes.mono, fontSize: 11 },
  ruta: { fontFamily: fuentes.titulo, fontSize: 20 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colores.linea, paddingVertical: 8 },
});
