import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Texto from '../componentes/Texto';
import Boton from '../componentes/Boton';
import Marco from '../componentes/Marco';
import Noti from '../componentes/Noti';
import { Esqueleto, ErrorRed, Interruptor, Pill, Sub, Sube, Vacio } from '../componentes/Piezas';
import { colores, fuentes } from '../tema';
import { useApp, useEscritorio } from '../Contexto';
import { api } from '../api';
import { fechaCorta } from '../utilidades';

export default function Reservas() {
  const { aviso } = useApp();
  const escritorio = useEscritorio();
  const [lista, setLista] = useState(null);
  const [error, setError] = useState(false);
  const [qr, setQr] = useState(null);
  const [pregunta, setPregunta] = useState(null);
  const [noti, setNoti] = useState(null);

  function cargar() {
    setError(false);
    api.misReservas().then(setLista).catch(() => setError(true));
  }

  useEffect(() => {
    cargar();
  }, []);

  function cambiar(r) {
    setLista(lista.map((x) => (x.id === r.id ? r : x)));
  }

  async function cambiarAviso(r, valor) {
    try {
      await api.aviso(r.id, valor);
      cambiar({ ...r, aviso: valor });
      if (valor) setNoti(r);
      else aviso('Aviso desactivado');
    } catch (e) {
      aviso(e.message);
    }
  }

  async function cancelar(r) {
    try {
      const nueva = await api.cancelar(r.id);
      cambiar(nueva);
      setPregunta(null);
      const varias = r.asientos.includes(',');
      aviso('Reserva cancelada. ' + (varias ? 'Las plazas ' + r.asientos + ' vuelven a estar libres' : 'La plaza ' + r.asientos + ' vuelve a estar libre'));
    } catch (e) {
      aviso(e.message);
    }
  }

  let contenido;
  if (error) contenido = <ErrorRed titulo="No hemos podido cargar tus reservas" reintentar={cargar} />;
  else if (lista === null) contenido = [<Esqueleto key={1} alto={120} />, <Esqueleto key={2} alto={120} />];
  else if (lista.length === 0) contenido = <Vacio texto="Todavía no tienes reservas. Busca un viaje y reserva tu plaza." />;
  else {
    contenido = (
      <View style={escritorio ? styles.rejilla : styles.columna}>
        {lista.map((r, k) => {
          const tipo = r.estado === 'Confirmada' ? 'ok' : r.estado === 'Cancelada' ? 'bad' : null;
          const varias = r.asientos.includes(',');
          const confirmada = r.estado === 'Confirmada';
          return (
            <Sube key={r.id} retraso={k * 70} estilo={escritorio ? styles.celda : null}>
              <View style={styles.tarjeta}>
                <View style={styles.cabecera}>
                  <Texto style={styles.ruta}>{r.origen} → {r.destino}</Texto>
                  <Pill texto={r.estado} tipo={tipo} />
                </View>
                <Sub texto={fechaCorta(r.fecha) + ' · ' + r.salida + ' · ' + (varias ? 'Plazas ' : 'Plaza ') + r.asientos.replace(/,/g, ', ') + ' · ' + r.localizador} />
                {confirmada ? <Interruptor valor={r.aviso} alCambiar={(v) => cambiarAviso(r, v)} texto="Aviso 30 min antes" /> : null}
                {confirmada && qr === r.id ? (
                  <>
                    <View style={styles.qr}>
                      <QRCode value={'CHAMBITOS|' + r.localizador} size={130} color={colores.oscuro} backgroundColor="#fff" />
                    </View>
                    <Boton texto="Ocultar billete" tipo="ghost" onPress={() => setQr(null)} />
                  </>
                ) : null}
                {confirmada && qr !== r.id ? <Boton texto="Ver billete QR" onPress={() => setQr(r.id)} /> : null}
                {confirmada && pregunta === r.id ? (
                  <View style={styles.confirmar}>
                    <Boton texto="Sí, cancelar" tipo="danger" estilo={{ flex: 1 }} onPress={() => cancelar(r)} />
                    <Boton texto="No" tipo="ghost" estilo={{ flex: 1 }} onPress={() => setPregunta(null)} />
                  </View>
                ) : null}
                {confirmada && pregunta !== r.id ? <Boton texto="Cancelar reserva" tipo="ghost" onPress={() => setPregunta(r.id)} /> : null}
              </View>
            </Sube>
          );
        })}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Marco titulo="Mis reservas" ancho={1000}>
        {contenido}
      </Marco>
      {noti ? <Noti reserva={noti} alTerminar={() => setNoti(null)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  columna: { gap: 12 },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  celda: { width: '48%', flexGrow: 1 },
  tarjeta: { borderWidth: 1, borderColor: colores.linea, borderRadius: 10, padding: 12, gap: 6, backgroundColor: colores.blanco },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' },
  ruta: { fontFamily: fuentes.semi, flex: 1 },
  qr: { alignSelf: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 8, marginTop: 4, marginBottom: 6 },
  confirmar: { flexDirection: 'row', gap: 8 },
});
