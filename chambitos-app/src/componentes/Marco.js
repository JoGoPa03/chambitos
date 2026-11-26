import { View, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import Texto from './Texto';
import { Entrada } from './Piezas';
import { colores, fuentes } from '../tema';
import { useApp, useEscritorio } from '../Contexto';

const logo = require('../../assets/logo-chambitos.png');

const menu = [
  { pantalla: 'buscar', icono: '⌕', texto: 'Buscar' },
  { pantalla: 'horarios', icono: '⇄', texto: 'Líneas' },
  { pantalla: 'directo', icono: '◉', texto: 'En directo' },
  { pantalla: 'reservas', icono: '▤', texto: 'Reservas' },
  { pantalla: 'perfil', icono: '☺', texto: 'Perfil' },
];

const activos = { cerca: 'buscar', resultados: 'buscar', plaza: 'buscar', billete: 'reservas' };

export default function Marco({ titulo, atras, derecha, sinMenu, admin, children, ancho, sinScroll }) {
  const { ir, pantalla, salir } = useApp();
  const escritorio = useEscritorio();
  const activo = activos[pantalla] || pantalla;
  const volver = typeof atras === 'string' ? () => ir(atras) : atras;

  const contenido = sinScroll ? (
    <View style={[styles.pantalla, escritorio && styles.pantallaEscritorio, { maxWidth: escritorio ? ancho || 1100 : undefined }]}>{children}</View>
  ) : (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.pantalla, escritorio && styles.pantallaEscritorio, { maxWidth: escritorio ? ancho || 1100 : undefined }]}>
      {children}
    </ScrollView>
  );

  if (escritorio) {
    return (
      <View style={styles.raiz}>
        <View style={styles.cabecera}>
          <View style={styles.cabeceraDentro}>
            <Pressable onPress={() => ir(admin ? 'admin' : 'buscar')}>
              <Image source={logo} style={styles.logoGrande} resizeMode="contain" />
            </Pressable>
            {admin ? (
              <Texto style={styles.tituloAdmin}>Administración</Texto>
            ) : sinMenu ? null : (
              <View style={styles.menuArriba}>
                {menu.map((m) => (
                  <Pressable
                    key={m.pantalla}
                    onPress={() => ir(m.pantalla)}
                    style={({ hovered }) => [styles.opcionArriba, hovered && styles.opcionEncima, activo === m.pantalla && styles.opcionActiva]}
                  >
                    <Texto style={styles.textoArriba}>{m.icono}  {m.texto}</Texto>
                  </Pressable>
                ))}
              </View>
            )}
            {admin ? (
              <Pressable onPress={salir} style={({ hovered }) => [styles.opcionArriba, hovered && styles.opcionEncima]}>
                <Texto style={styles.textoArriba}>Salir</Texto>
              </Pressable>
            ) : null}
          </View>
        </View>
        <View style={styles.cuerpo}>
          <Entrada estilo={{ flex: 1 }}>
            {sinScroll ? (
              <View style={styles.centro}>
                <TituloEscritorio titulo={titulo} volver={volver} derecha={derecha} ancho={ancho} />
                {contenido}
              </View>
            ) : (
              <ScrollView style={styles.scroll} contentContainerStyle={styles.centro}>
                <TituloEscritorio titulo={titulo} volver={volver} derecha={derecha} ancho={ancho} />
                <View style={[styles.pantalla, styles.pantallaEscritorio, { maxWidth: ancho || 1100 }]}>{children}</View>
              </ScrollView>
            )}
          </Entrada>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.raiz}>
      <View style={styles.barra}>
        {volver ? (
          <Pressable onPress={volver} style={styles.botonBarra}>
            <Texto style={styles.flecha}>←</Texto>
          </Pressable>
        ) : null}
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Texto style={styles.titulo} numberOfLines={1}>{titulo}</Texto>
        {derecha}
      </View>
      <Entrada estilo={{ flex: 1 }}>{contenido}</Entrada>
      {sinMenu || admin ? null : (
        <View style={styles.menu}>
          {menu.map((m) => (
            <Pressable key={m.pantalla} style={styles.opcion} onPress={() => ir(m.pantalla)}>
              <Texto style={[styles.icono, activo === m.pantalla && styles.activo]}>{m.icono}</Texto>
              <Texto style={[styles.textoMenu, activo === m.pantalla && styles.activoTexto]}>{m.texto}</Texto>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function TituloEscritorio({ titulo, volver, derecha, ancho }) {
  return (
    <View style={[styles.tituloFila, { maxWidth: ancho || 1100 }]}>
      {volver ? (
        <Pressable onPress={volver} style={({ hovered }) => [styles.volver, hovered && { borderColor: colores.gris }]}>
          <Texto style={styles.textoVolver}>← Volver</Texto>
        </Pressable>
      ) : null}
      <Texto style={styles.tituloGrande} numberOfLines={1}>{titulo}</Texto>
      {derecha}
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: colores.blanco },
  barra: {
    backgroundColor: colores.rojo,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botonBarra: { paddingHorizontal: 4 },
  flecha: { color: colores.blanco, fontSize: 20 },
  logo: { height: 34, width: 102 },
  titulo: { flex: 1, textAlign: 'right', color: colores.blanco, fontFamily: fuentes.titulo, fontSize: 16 },
  scroll: { flex: 1 },
  pantalla: { padding: 16, gap: 12, width: '100%', alignSelf: 'center' },
  pantallaEscritorio: { paddingHorizontal: 32, paddingTop: 8, paddingBottom: 40, gap: 16 },
  menu: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colores.linea, backgroundColor: colores.blanco },
  opcion: { flex: 1, paddingTop: 10, paddingBottom: 12, alignItems: 'center', gap: 2 },
  icono: { fontSize: 18, color: colores.gris },
  textoMenu: { fontFamily: fuentes.medio, fontSize: 11, color: colores.gris },
  activo: { color: colores.rojo },
  activoTexto: { color: colores.rojo, fontFamily: fuentes.semi },
  cabecera: { backgroundColor: colores.rojo },
  cabeceraDentro: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  logoGrande: { height: 46, width: 138 },
  menuArriba: { flexDirection: 'row', gap: 4, flex: 1, justifyContent: 'flex-end' },
  opcionArriba: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 8 },
  opcionEncima: { backgroundColor: 'rgba(255,255,255,0.12)' },
  opcionActiva: { backgroundColor: 'rgba(255,255,255,0.22)' },
  textoArriba: { color: colores.blanco, fontFamily: fuentes.medio, fontSize: 14 },
  tituloAdmin: { flex: 1, textAlign: 'right', color: colores.blanco, fontFamily: fuentes.titulo, fontSize: 18 },
  cuerpo: { flex: 1, backgroundColor: colores.fondo },
  centro: { alignItems: 'center', paddingTop: 28 },
  tituloFila: {
    width: '100%',
    paddingHorizontal: 32,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  volver: { borderWidth: 1, borderColor: colores.linea, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: colores.blanco },
  textoVolver: { fontFamily: fuentes.medio, fontSize: 13 },
  tituloGrande: { flex: 1, fontFamily: fuentes.tituloFuerte, fontSize: 28 },
});
