import { useState } from 'react';
import { View, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import Texto from '../componentes/Texto';
import Campo from '../componentes/Campo';
import Boton from '../componentes/Boton';
import { Tiembla, Entrada } from '../componentes/Piezas';
import { colores, fuentes } from '../tema';
import { useApp, useEscritorio } from '../Contexto';
import { api } from '../api';

const logo = require('../../assets/logo-chambitos.png');

export default function Login() {
  const { entrar, ir, aviso } = useApp();
  const escritorio = useEscritorio();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [intentos, setIntentos] = useState(0);
  const [cargando, setCargando] = useState(false);

  async function iniciar() {
    if (!correo.trim() || !contrasena) {
      setError('Escribe tu correo y tu contraseña');
      setIntentos(intentos + 1);
      return;
    }
    setCargando(true);
    try {
      const u = await api.login(correo.trim().toLowerCase(), contrasena);
      setError('');
      entrar(u);
    } catch (e) {
      setError(e.message === 'No se puede conectar con el servidor' ? e.message : 'Correo o contraseña incorrectos');
      setIntentos(intentos + 1);
      setCargando(false);
    }
  }

  const formulario = (
    <Tiembla clave={intentos}>
      <Campo
        etiqueta="Correo electrónico"
        value={correo}
        onChangeText={setCorreo}
        placeholder="tucorreo@ejemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Campo etiqueta="Contraseña" value={contrasena} onChangeText={setContrasena} placeholder="Tu contraseña" secureTextEntry onSubmitEditing={iniciar} />
      {error ? <Texto style={styles.error}>{error}</Texto> : null}
      <Pressable style={styles.olvido} onPress={() => aviso('Te enviaríamos un correo para cambiar la contraseña')}>
        <Texto style={styles.textoOlvido}>¿Has olvidado tu contraseña?</Texto>
      </Pressable>
      <Boton texto={cargando ? 'Entrando...' : 'Iniciar sesión'} onPress={iniciar} desactivado={cargando} />
    </Tiembla>
  );

  const registro = (
    <Texto style={styles.pie}>
      ¿No tienes cuenta?{' '}
      <Texto style={styles.enlace} onPress={() => ir('registro')}>Regístrate</Texto>
    </Texto>
  );

  if (escritorio) {
    return (
      <View style={styles.escritorio}>
        <View style={styles.lado}>
          <Image source={logo} style={styles.logoGrande} resizeMode="contain" />
          <Texto style={styles.lemaGrande}>Más de 75 años de experiencia</Texto>
          <Texto style={styles.textoLado}>Consulta horarios de las líneas 1 y 2, reserva tu plaza y lleva el billete en el móvil.</Texto>
        </View>
        <View style={styles.derecha}>
          <Entrada estilo={styles.caja}>
            <Texto style={styles.tituloCaja}>Inicia sesión</Texto>
            <Texto style={styles.subCaja}>Entra con tu cuenta de viajero o de administrador.</Texto>
            {formulario}
            {registro}
          </Entrada>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.raiz} contentContainerStyle={styles.pantalla}>
      <View style={styles.hero}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Texto style={styles.lema}>Más de 75 años de experiencia</Texto>
      </View>
      <Entrada estilo={{ gap: 12 }}>
        {formulario}
        {registro}
      </Entrada>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: colores.blanco },
  pantalla: { padding: 16, gap: 12 },
  hero: {
    backgroundColor: colores.rojo,
    marginTop: -16,
    marginHorizontal: -16,
    marginBottom: 4,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  logo: { width: 220, height: 73 },
  lema: { color: colores.blanco, fontSize: 13, opacity: 0.85 },
  error: { color: colores.rojo, fontSize: 13, textAlign: 'center' },
  olvido: { alignSelf: 'flex-end', marginTop: -4 },
  textoOlvido: { color: colores.gris, fontSize: 13, textDecorationLine: 'underline' },
  pie: { color: colores.gris, fontSize: 14, textAlign: 'center', marginTop: 8 },
  enlace: { color: colores.rojo, fontFamily: fuentes.semi, fontSize: 14, textDecorationLine: 'underline' },
  escritorio: { flex: 1, flexDirection: 'row', backgroundColor: colores.fondo },
  lado: { flex: 1, backgroundColor: colores.rojo, justifyContent: 'center', paddingHorizontal: 64, gap: 14 },
  logoGrande: { width: 360, height: 120 },
  lemaGrande: { color: colores.blanco, fontFamily: fuentes.titulo, fontSize: 24 },
  textoLado: { color: colores.blanco, opacity: 0.85, fontSize: 16, maxWidth: 420, lineHeight: 24 },
  derecha: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  caja: {
    width: 420,
    backgroundColor: colores.blanco,
    borderRadius: 16,
    padding: 32,
    gap: 12,
    borderWidth: 1,
    borderColor: colores.linea,
  },
  tituloCaja: { fontFamily: fuentes.tituloFuerte, fontSize: 26 },
  subCaja: { color: colores.gris, fontSize: 14, marginBottom: 6 },
});
