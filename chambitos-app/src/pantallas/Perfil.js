import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Texto from '../componentes/Texto';
import Boton from '../componentes/Boton';
import Campo from '../componentes/Campo';
import Marco from '../componentes/Marco';
import Tarjeta, { Columnas, Columna } from '../componentes/Tarjeta';
import { Cabeza, Sub, Tiembla } from '../componentes/Piezas';
import { colores, fuentes } from '../tema';
import { useApp, useEscritorio } from '../Contexto';
import { api } from '../api';

export default function Perfil() {
  const { usuario, favs, cambiarFavs, salir, aviso } = useApp();
  const escritorio = useEscritorio();
  const [reservas, setReservas] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repite, setRepite] = useState('');
  const [error, setError] = useState('');
  const [intentos, setIntentos] = useState(0);

  useEffect(() => {
    api.misReservas().then(setReservas).catch(() => {});
  }, []);

  function cerrarFormulario() {
    setAbierto(false);
    setActual('');
    setNueva('');
    setRepite('');
    setError('');
  }

  async function guardar() {
    let e = '';
    if (nueva.length < 8) e = 'La nueva contraseña necesita al menos 8 caracteres';
    else if (nueva !== repite) e = 'Las contraseñas no coinciden';
    if (!e) {
      try {
        await api.cambiarContrasena(actual, nueva);
        cerrarFormulario();
        aviso('Contraseña cambiada');
        return;
      } catch (err) {
        e = err.message;
      }
    }
    setError(e);
    setIntentos(intentos + 1);
  }

  const activas = reservas.filter((r) => r.estado === 'Confirmada').length;
  const hechas = reservas.filter((r) => r.estado === 'Realizada').length;

  const datos = (
    <Tarjeta>
      <View style={styles.avatar}>
        <Texto style={styles.letra}>{usuario.nombre.charAt(0).toUpperCase()}</Texto>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Texto style={styles.nombre}>{usuario.nombre}</Texto>
        <Sub texto={usuario.correo} />
      </View>
      <View style={styles.stats}>
        <Stat valor={activas} texto="reservas activas" />
        <Stat valor={hechas} texto="viajes hechos" />
        <Stat valor={favs.length} texto="favoritos" />
      </View>
    </Tarjeta>
  );

  const favoritos = (
    <Tarjeta>
      <Cabeza texto="Favoritos" />
      {favs.length ? (
        <View>
          {favs.map((f, k) => (
            <View key={k} style={[styles.fila, k === favs.length - 1 && { borderBottomWidth: 0 }]}>
              <Texto style={{ flex: 1, fontSize: 14 }}>★ {f[0]} → {f[1]}</Texto>
              <Boton texto="Quitar" tipo="ghost" pequeno onPress={() => cambiarFavs(favs.filter((x, i) => i !== k))} />
            </View>
          ))}
        </View>
      ) : (
        <Sub texto="Aún no tienes favoritos. Guárdalos con la estrella en los resultados." />
      )}
    </Tarjeta>
  );

  const seguridad = (
    <Tarjeta>
      <Cabeza texto="Seguridad" />
      {abierto ? (
        <Tiembla clave={intentos}>
          <Campo etiqueta="Contraseña actual" value={actual} onChangeText={setActual} secureTextEntry />
          <Campo etiqueta="Nueva contraseña" value={nueva} onChangeText={setNueva} secureTextEntry />
          <Campo etiqueta="Repite la nueva" value={repite} onChangeText={setRepite} secureTextEntry />
          {error ? <Texto style={styles.error}>{error}</Texto> : null}
          <View style={styles.botones}>
            <Boton texto="Guardar" onPress={guardar} estilo={{ flex: 1 }} />
            <Boton texto="Cancelar" tipo="ghost" onPress={cerrarFormulario} estilo={{ flex: 1 }} />
          </View>
        </Tiembla>
      ) : (
        <Boton texto="Cambiar contraseña" tipo="ghost" onPress={() => setAbierto(true)} />
      )}
    </Tarjeta>
  );

  return (
    <Marco titulo="Perfil" ancho={1000}>
      <Columnas>
        <Columna ancho={360}>
          {datos}
          {escritorio ? <Boton texto="Cerrar sesión" tipo="danger" onPress={salir} /> : null}
        </Columna>
        <Columna>
          {favoritos}
          {seguridad}
          {escritorio ? null : <Boton texto="Cerrar sesión" tipo="danger" onPress={salir} />}
        </Columna>
      </Columnas>
    </Marco>
  );
}

function Stat({ valor, texto }) {
  return (
    <View style={styles.stat}>
      <Texto style={styles.valor}>{valor}</Texto>
      <Texto style={styles.textoStat}>{texto}</Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colores.rojo, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  letra: { color: colores.blanco, fontFamily: fuentes.tituloFuerte, fontSize: 30 },
  nombre: { fontFamily: fuentes.titulo, fontSize: 19 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, borderWidth: 1, borderColor: colores.linea, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center' },
  valor: { fontFamily: fuentes.titulo, fontSize: 20 },
  textoStat: { fontSize: 11, color: colores.gris, textAlign: 'center' },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colores.linea,
    paddingVertical: 10,
  },
  error: { color: colores.rojo, fontSize: 12 },
  botones: { flexDirection: 'row', gap: 8 },
});
