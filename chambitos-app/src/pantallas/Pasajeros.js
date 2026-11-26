import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Texto from '../componentes/Texto';
import Marco from '../componentes/Marco';
import Tarjeta from '../componentes/Tarjeta';
import { Esqueleto, ErrorRed, Sub, Vacio } from '../componentes/Piezas';
import { colores, fuentes } from '../tema';
import { useApp } from '../Contexto';
import { api } from '../api';
import { fechaLarga } from '../utilidades';

export default function Pasajeros() {
  const { datos } = useApp();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(false);

  function cargar() {
    setError(false);
    api.pasajeros(datos.viajeId).then(setInfo).catch(() => setError(true));
  }

  useEffect(() => {
    cargar();
  }, []);

  let contenido;
  if (error) contenido = <ErrorRed titulo="No hemos podido cargar los pasajeros" reintentar={cargar} />;
  else if (!info) contenido = [<Esqueleto key={1} alto={40} />, <Esqueleto key={2} alto={200} />];
  else {
    const v = info.viaje;
    const primera = v.paradas[0];
    const ultima = v.paradas[v.paradas.length - 1];
    contenido = (
      <>
        <Sub texto={primera.hora + ' · Línea ' + v.sublinea + ' ' + primera.nombre + ' → ' + ultima.nombre + ' · ' + v.autobus.matricula + ' · ' + info.reservadas + ' de ' + v.autobus.plazas} />
        <Sub texto={fechaLarga(info.fecha)} estilo={{ fontSize: 12 }} />
        <Tarjeta>
          {info.pasajeros.length ? (
            info.pasajeros.map((p, k) => (
              <View key={p.localizador} style={[styles.fila, k === info.pasajeros.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Texto style={styles.nombre}>{p.nombre}</Texto>
                  <Texto style={styles.detalle}>{p.origen} → {p.destino} · {p.localizador}</Texto>
                </View>
                <Texto style={styles.plaza}>{p.asientos.includes(',') ? 'Plazas ' : 'Plaza '}{p.asientos.replace(/,/g, ', ')}</Texto>
              </View>
            ))
          ) : (
            <Vacio texto="Todavía no hay pasajeros en este viaje." />
          )}
        </Tarjeta>
      </>
    );
  }

  return (
    <Marco titulo="Pasajeros" atras="admin" admin ancho={760}>
      {contenido}
    </Marco>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colores.linea,
    paddingVertical: 10,
  },
  nombre: { fontFamily: fuentes.semi },
  detalle: { color: colores.gris, fontSize: 12 },
  plaza: { fontFamily: fuentes.mono, color: colores.gris, fontSize: 13 },
});
