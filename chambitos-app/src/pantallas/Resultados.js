import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Texto from '../componentes/Texto';
import Marco from '../componentes/Marco';
import { Chip, Esqueleto, ErrorRed, Sub, Sube, Vacio } from '../componentes/Piezas';
import { TarjetaViaje } from '../componentes/Viajes';
import { colores } from '../tema';
import { useApp, useEscritorio } from '../Contexto';
import { api } from '../api';
import { corto } from '../datos';
import { fechaLarga, minutos } from '../utilidades';

export default function Resultados() {
  const { busqueda, favs, cambiarFavs, ir, aviso } = useApp();
  const escritorio = useEscritorio();
  const { origen, destino, fecha } = busqueda;
  const [lista, setLista] = useState(null);
  const [error, setError] = useState(false);
  const [franja, setFranja] = useState('todos');

  function cargar() {
    setError(false);
    setLista(null);
    api.buscar(origen, destino, fecha).then(setLista).catch(() => setError(true));
  }

  useEffect(() => {
    cargar();
  }, []);

  const esFav = favs.some((f) => f[0] === origen && f[1] === destino);

  function estrella() {
    if (esFav) {
      cambiarFavs(favs.filter((f) => !(f[0] === origen && f[1] === destino)));
      aviso('Quitado de favoritos');
    } else {
      cambiarFavs([...favs, [origen, destino]]);
      aviso('Guardado en favoritos');
    }
  }

  const boton = (
    <Pressable onPress={estrella} style={escritorio ? styles.estrellaEscritorio : null}>
      <Texto style={[styles.estrella, escritorio && { color: colores.texto, fontSize: 15 }, esFav && (escritorio ? { color: colores.rojo } : styles.activa)]}>
        {esFav ? '★' : '☆'}{escritorio ? (esFav ? '  En favoritos' : '  Guardar en favoritos') : ''}
      </Texto>
    </Pressable>
  );

  const titulo = corto(origen) + ' → ' + corto(destino);

  if (error) {
    return (
      <Marco titulo="Sin conexión" atras="buscar" ancho={760}>
        <ErrorRed titulo="No hemos podido cargar los viajes" reintentar={cargar} />
      </Marco>
    );
  }

  const filtrados = (lista || []).filter((v) => {
    if (franja === 'manana') return minutos(v.salida) < 840;
    if (franja === 'tarde') return minutos(v.salida) >= 840;
    return true;
  });

  return (
    <Marco titulo={titulo} atras="buscar" derecha={boton} ancho={760}>
      <Sub texto={fechaLarga(fecha) + (lista ? ' · ' + filtrados.length + (filtrados.length === 1 ? ' viaje' : ' viajes') : '')} />
      <View style={styles.chips}>
        {[['todos', 'Todos'], ['manana', 'Mañana'], ['tarde', 'Tarde']].map(([k, t]) => (
          <Chip key={k} texto={t} activo={franja === k} onPress={() => setFranja(k)} />
        ))}
      </View>
      {lista === null ? (
        <>
          <Esqueleto />
          <Esqueleto />
          <Esqueleto />
        </>
      ) : filtrados.length ? (
        filtrados.map((v, k) => (
          <Sube key={v.id} retraso={k * 70}>
            <TarjetaViaje viaje={v} onPress={() => ir('plaza', { viaje: v })} />
          </Sube>
        ))
      ) : (
        <Vacio
          texto={
            'No hay viajes entre estas paradas ese día. ' +
            (franja !== 'todos'
              ? 'Prueba a quitar el filtro de ' + (franja === 'manana' ? 'mañana' : 'tarde') + '.'
              : 'Los fines de semana solo hay servicio entre La Font de la Figuera y Moixent.')
          }
        />
      )}
    </Marco>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row' },
  estrella: { color: colores.blanco, fontSize: 22, paddingHorizontal: 2 },
  activa: { color: '#FFD54A' },
  estrellaEscritorio: { borderWidth: 1, borderColor: colores.linea, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: colores.blanco },
});
