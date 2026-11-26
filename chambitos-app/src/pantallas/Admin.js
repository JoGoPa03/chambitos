import { useEffect, useRef, useState } from 'react';
import { View, Pressable, Animated, StyleSheet } from 'react-native';
import Texto from '../componentes/Texto';
import Boton from '../componentes/Boton';
import Marco from '../componentes/Marco';
import Tarjeta from '../componentes/Tarjeta';
import { Cabeza, Esqueleto, ErrorRed, Pill, Seg, Sub } from '../componentes/Piezas';
import { colores, fuentes } from '../tema';
import { useApp, useEscritorio } from '../Contexto';
import { api } from '../api';
import { corto } from '../datos';

export default function Admin() {
  const { adminTab, setAdminTab, ir, salir, aviso } = useApp();
  const escritorio = useEscritorio();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);
  const [borrando, setBorrando] = useState(null);

  function cargar() {
    setError(false);
    Promise.all([api.adminViajes(), api.lineas(), api.autobuses(), api.ocupacion()])
      .then(([viajes, lineas, autobuses, ocupacion]) => setDatos({ viajes, lineas, autobuses, ocupacion }))
      .catch(() => setError(true));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function borrar(tipo, id, texto) {
    try {
      await api.borrar(tipo, id);
      setBorrando(null);
      aviso(texto);
      cargar();
    } catch (e) {
      aviso(e.message);
    }
  }

  function abrir(tipo, item) {
    ir('formulario', { tipo, item, lineas: datos.lineas, autobuses: datos.autobuses });
  }

  const salirBoton = (
    <Pressable onPress={salir}>
      <Texto style={styles.salir}>Salir</Texto>
    </Pressable>
  );

  let contenido = null;
  if (error) contenido = <ErrorRed titulo="No hemos podido cargar los datos" reintentar={cargar} />;
  else if (!datos) contenido = [<Esqueleto key={1} alto={60} />, <Esqueleto key={2} alto={60} />, <Esqueleto key={3} alto={60} />];
  else if (adminTab === 'ocupacion') contenido = <Ocupacion lista={datos.ocupacion} />;
  else {
    let filas = [];
    if (adminTab === 'viajes') {
      filas = datos.viajes.map(({ viaje: v, reservadas }) => {
        const primera = v.paradas[0];
        const ultima = v.paradas[v.paradas.length - 1];
        return {
          clave: 'viaje' + v.id,
          nombre: primera.hora + ' · ' + v.sublinea + ' ' + corto(primera.nombre) + ' → ' + corto(ultima.nombre),
          detalle: (v.dias === 'L' ? 'Lun-Vie' : 'Sáb-Dom') + ' · ' + v.autobus.matricula + ' · ' + reservadas + '/' + v.autobus.plazas + ' reservas' + (v.precio ? ' · ' + String(v.precio.toFixed(2)).replace('.', ',') + ' €' : ''),
          aviso: reservadas ? 'Tiene ' + reservadas + ' reservas que se cancelarán.' : 'No tiene reservas.',
          sePuede: true,
          extra: <Pequeno texto="👥" onPress={() => ir('pasajeros', { viajeId: v.id })} />,
          editar: () => abrir('viaje', v),
          borrar: () => borrar('viajes', v.id, 'Viaje borrado'),
        };
      });
    }
    if (adminTab === 'lineas') {
      filas = datos.lineas.map((l) => {
        const n = datos.viajes.filter((x) => x.viaje.linea.id === l.id).length;
        return {
          clave: 'linea' + l.id,
          nombre: 'Línea ' + l.codigo + ' · ' + l.nombre,
          detalle: l.paradas.length + ' paradas · ' + n + ' viajes',
          aviso: n ? 'Tiene ' + n + ' viajes, primero hay que borrarlos.' : '',
          sePuede: n === 0,
          editar: () => abrir('linea', l),
          borrar: () => borrar('lineas', l.id, 'Línea borrada'),
        };
      });
    }
    if (adminTab === 'buses') {
      filas = datos.autobuses.map((b) => {
        const n = datos.viajes.filter((x) => x.viaje.autobus.id === b.id).length;
        return {
          clave: 'bus' + b.id,
          nombre: b.matricula,
          mono: true,
          detalle: b.plazas + ' plazas · ' + n + ' viajes asignados',
          aviso: n ? 'Tiene ' + n + ' viajes asignados, no se puede borrar hasta cambiarlos de autobús.' : '',
          sePuede: n === 0,
          editar: () => abrir('bus', b),
          borrar: () => borrar('autobuses', b.id, 'Autobús borrado'),
        };
      });
    }
    contenido = (
      <View>
        {filas.map((f) =>
          borrando === f.clave ? (
            <View key={f.clave} style={styles.aviso}>
              <Texto style={{ fontSize: 13 }}>
                ¿Seguro que quieres borrar <Texto style={{ fontFamily: fuentes.semi, fontSize: 13 }}>{f.nombre}</Texto>? {f.aviso}
              </Texto>
              <View style={styles.botones}>
                {f.sePuede ? <Boton texto="Sí, borrar" tipo="danger" pequeno estilo={{ flex: 1 }} onPress={f.borrar} /> : null}
                <Boton texto="Cancelar" tipo="ghost" pequeno estilo={{ flex: 1 }} onPress={() => setBorrando(null)} />
              </View>
            </View>
          ) : (
            <View key={f.clave} style={styles.fila}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Texto style={[styles.nombre, f.mono && { fontFamily: fuentes.mono }]}>{f.nombre}</Texto>
                <Texto style={styles.detalle}>{f.detalle}</Texto>
              </View>
              <View style={styles.acciones}>
                {f.extra}
                <Pequeno texto="Editar" onPress={f.editar} />
                <Pequeno texto="✕" rojo onPress={() => setBorrando(f.clave)} />
              </View>
            </View>
          )
        )}
      </View>
    );
  }

  const nuevo = { viajes: ['viaje', '+ Nuevo viaje'], lineas: ['linea', '+ Nueva línea'], buses: ['bus', '+ Nuevo autobús'] }[adminTab];

  return (
    <Marco titulo={escritorio ? 'Panel de administración' : 'Administración'} admin derecha={escritorio ? null : salirBoton} ancho={900}>
      <Seg
        opciones={[
          { valor: 'viajes', texto: 'Viajes' },
          { valor: 'lineas', texto: 'Líneas' },
          { valor: 'buses', texto: 'Buses' },
          { valor: 'ocupacion', texto: 'Ocupación' },
        ]}
        valor={adminTab}
        alCambiar={(v) => {
          setAdminTab(v);
          setBorrando(null);
        }}
      />
      {nuevo && datos ? <Boton texto={nuevo[1]} tipo="alt" onPress={() => abrir(nuevo[0], null)} /> : null}
      {escritorio ? <Tarjeta>{contenido}</Tarjeta> : contenido}
    </Marco>
  );
}

function Pequeno({ texto, onPress, rojo }) {
  return (
    <Pressable onPress={onPress} style={({ hovered }) => [styles.pequeno, rojo && styles.rojo, hovered && { backgroundColor: colores.superficie }]}>
      <Texto style={[styles.textoPequeno, rojo && { color: colores.rojo }]}>{texto}</Texto>
    </Pressable>
  );
}

function Ocupacion({ lista }) {
  const ocupadas = lista.reduce((a, x) => a + x.ocupadas, 0);
  const plazas = lista.reduce((a, x) => a + x.plazas, 0);
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.kpis}>
        <View style={styles.kpi}>
          <Texto style={styles.kpiValor}>{plazas ? Math.round((ocupadas / plazas) * 100) : 0} %</Texto>
          <Texto style={styles.kpiTexto}>ocupación media</Texto>
        </View>
        <View style={styles.kpi}>
          <Texto style={styles.kpiValor}>{ocupadas}</Texto>
          <Texto style={styles.kpiTexto}>plazas reservadas</Texto>
        </View>
      </View>
      <Cabeza texto="Por sublínea" estilo={{ marginTop: 14 }} />
      {lista.map((o) => (
        <Barra key={o.sublinea} o={o} />
      ))}
      <Sub texto="Verde menos del 50 %, naranja hasta el 80 % y rojo por encima. Cuenta las reservas del próximo día que sale cada viaje." estilo={{ marginTop: 10 }} />
    </View>
  );
}

function Barra({ o }) {
  const v = useRef(new Animated.Value(0)).current;
  const pc = o.plazas ? Math.round((o.ocupadas / o.plazas) * 100) : 0;
  useEffect(() => {
    Animated.timing(v, { toValue: pc, duration: 800, useNativeDriver: false }).start();
  }, []);
  const color = pc > 80 ? colores.rojo : pc > 50 ? colores.naranja : colores.verde;
  const ancho = v.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.barra}>
      <View style={{ width: 40 }}>
        <Pill texto={o.sublinea} tipo="line" />
      </View>
      <View style={styles.pista}>
        <Animated.View style={{ height: '100%', width: ancho, backgroundColor: color, borderRadius: 7 }} />
      </View>
      <Texto style={styles.porcentaje}>{pc} %</Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  salir: { color: colores.blanco, fontSize: 13 },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colores.linea,
    paddingVertical: 10,
  },
  nombre: { fontFamily: fuentes.semi, fontSize: 14 },
  detalle: { color: colores.gris, fontSize: 12 },
  acciones: { flexDirection: 'row', gap: 4 },
  pequeno: { borderWidth: 1, borderColor: colores.linea, backgroundColor: colores.blanco, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 8 },
  rojo: { borderColor: colores.rojo },
  textoPequeno: { fontFamily: fuentes.medio, fontSize: 12 },
  aviso: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.rojo,
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginVertical: 6,
  },
  botones: { flexDirection: 'row', gap: 8 },
  kpis: { flexDirection: 'row', gap: 8 },
  kpi: { flex: 1, backgroundColor: colores.superficie, borderRadius: 8, padding: 10 },
  kpiValor: { fontFamily: fuentes.titulo, fontSize: 22, color: colores.rojo },
  kpiTexto: { fontSize: 12, color: colores.gris },
  barra: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pista: { flex: 1, height: 14, backgroundColor: colores.asiento, borderRadius: 7, overflow: 'hidden' },
  porcentaje: { width: 44, textAlign: 'right', fontFamily: fuentes.mono, fontSize: 13 },
});
