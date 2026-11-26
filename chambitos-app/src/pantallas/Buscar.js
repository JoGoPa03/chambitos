import { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import Texto from '../componentes/Texto';
import Boton from '../componentes/Boton';
import Marco from '../componentes/Marco';
import Selector from '../componentes/Selector';
import Tarjeta, { Columnas, Columna } from '../componentes/Tarjeta';
import { Cabeza, Chip, Esqueleto, ErrorRed, Sub } from '../componentes/Piezas';
import { ProximoBus } from '../componentes/Viajes';
import { colores, fuentes } from '../tema';
import { useApp, useEscritorio } from '../Contexto';
import { corto } from '../datos';
import { fechaLarga, proximosDias } from '../utilidades';

export default function Buscar() {
  const { usuario, viajes, paradas, cargarViajes, favs, busqueda, setBusqueda, ir, aviso } = useApp();
  const escritorio = useEscritorio();
  const [error, setError] = useState(false);
  const { origen, destino, fecha } = busqueda;

  function cargar() {
    setError(false);
    cargarViajes().catch(() => setError(true));
  }

  useEffect(() => {
    if (viajes.length === 0) cargar();
  }, []);

  function buscar() {
    if (origen === destino) {
      aviso('El origen y el destino tienen que ser distintos');
      return;
    }
    ir('resultados');
  }

  const opciones = paradas.map((p) => ({ valor: p, texto: p }));
  const fechas = proximosDias(14).map((d) => ({ valor: d, texto: fechaLarga(d) }));

  if (error) {
    return (
      <Marco titulo={'Hola, ' + usuario.nombre}>
        <ErrorRed titulo="No hemos podido cargar los horarios" reintentar={cargar} />
      </Marco>
    );
  }

  const proximo = viajes.length ? <ProximoBus viajes={viajes} origen={origen} destino={destino} /> : <Esqueleto alto={84} />;

  const favoritos = favs.length ? (
    <View style={{ gap: 8 }}>
      <Cabeza texto="Tus favoritos" />
      <ScrollView horizontal={!escritorio} showsHorizontalScrollIndicator={false} contentContainerStyle={escritorio ? styles.favsEscritorio : null}>
        {favs.map((f, k) => (
          <Chip key={k} onPress={() => { setBusqueda({ ...busqueda, origen: f[0], destino: f[1] }); ir('resultados'); }}>
            <Texto style={styles.textoChip}>
              ★ {corto(f[0])} → <Texto style={styles.chipFuerte}>{corto(f[1])}</Texto>
            </Texto>
          </Chip>
        ))}
      </ScrollView>
    </View>
  ) : null;

  const formulario = (
    <Tarjeta>
      <Cabeza texto="¿A dónde vas?" />
      <View style={styles.cerca}>
        <Texto style={styles.textoCerca}>📍 ¿Qué parada tienes más cerca?</Texto>
        <Boton texto="Ver mapa" tipo="ghost" pequeno onPress={() => ir('cerca')} />
      </View>
      <Selector etiqueta="Origen" valor={origen} opciones={opciones} alCambiar={(v) => setBusqueda({ ...busqueda, origen: v })} />
      <Pressable
        style={({ pressed }) => [styles.cambiar, pressed && { transform: [{ rotate: '180deg' }] }]}
        onPress={() => setBusqueda({ ...busqueda, origen: destino, destino: origen })}
      >
        <Texto style={styles.textoCambiar}>⇅</Texto>
      </Pressable>
      <Selector etiqueta="Destino" valor={destino} opciones={opciones} alCambiar={(v) => setBusqueda({ ...busqueda, destino: v })} />
      <Selector etiqueta="Fecha" valor={fecha} opciones={fechas} alCambiar={(v) => setBusqueda({ ...busqueda, fecha: v })} />
      <Boton texto="Buscar viajes" onPress={buscar} />
    </Tarjeta>
  );

  if (escritorio) {
    return (
      <Marco titulo={'Hola, ' + usuario.nombre}>
        <Columnas>
          <Columna>{formulario}</Columna>
          <Columna ancho={420}>
            {proximo}
            {favoritos ? <Tarjeta>{favoritos}</Tarjeta> : null}
            <Tarjeta>
              <Cabeza texto="Cómo funciona" />
              <Sub texto="Busca tu trayecto, elige el autobús y marca tu plaza en el plano. El billete se paga al subir y lo llevas con código QR en Mis reservas." />
            </Tarjeta>
          </Columna>
        </Columnas>
      </Marco>
    );
  }

  return (
    <Marco titulo={'Hola, ' + usuario.nombre}>
      {proximo}
      {favoritos}
      {formulario}
    </Marco>
  );
}

const styles = StyleSheet.create({
  favsEscritorio: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  textoChip: { fontFamily: fuentes.medio, fontSize: 13 },
  chipFuerte: { color: colores.rojo, fontFamily: fuentes.semi, fontSize: 13 },
  cerca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colores.linea,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  textoCerca: { flex: 1, fontSize: 13 },
  cambiar: {
    alignSelf: 'flex-end',
    marginVertical: -6,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colores.linea,
    backgroundColor: colores.blanco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCambiar: { color: colores.rojo, fontSize: 18 },
});
