import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Texto from '../componentes/Texto';
import Campo from '../componentes/Campo';
import Boton from '../componentes/Boton';
import Marco from '../componentes/Marco';
import Tarjeta from '../componentes/Tarjeta';
import { Cabeza, Casilla, Tiembla } from '../componentes/Piezas';
import { colores, fuentes } from '../tema';
import { useApp } from '../Contexto';
import { api } from '../api';
import { fuerza } from '../utilidades';

export default function Registro() {
  const { ir, entrar, aviso } = useApp();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [clave2, setClave2] = useState('');
  const [acepto, setAcepto] = useState(false);
  const [errores, setErrores] = useState({});
  const [intentos, setIntentos] = useState(0);
  const [cargando, setCargando] = useState(false);
  const barra = fuerza(clave);

  async function crear() {
    const e = {};
    if (nombre.trim().length < 3) e.nombre = 'Escribe tu nombre completo';
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) e.correo = 'El correo no tiene un formato válido';
    if (clave.length < 8) e.clave = 'La contraseña necesita al menos 8 caracteres';
    if (clave !== clave2) e.clave2 = 'Las contraseñas no coinciden';
    if (!acepto) e.acepto = 'Tienes que aceptar las condiciones';
    setErrores(e);
    if (Object.keys(e).length > 0) {
      setIntentos(intentos + 1);
      return;
    }
    setCargando(true);
    try {
      const u = await api.registro(nombre.trim(), correo.trim().toLowerCase(), clave);
      entrar(u);
      aviso('Cuenta creada. Bienvenido/a, ' + u.nombre.split(' ')[0]);
    } catch (err) {
      setErrores({ correo: err.message });
      setIntentos(intentos + 1);
      setCargando(false);
    }
  }

  return (
    <Marco titulo="Crear cuenta" atras="login" sinMenu ancho={560}>
      <Tarjeta>
        <Tiembla clave={intentos}>
          <Cabeza texto="Tus datos" />
          <Campo etiqueta="Nombre y apellidos" value={nombre} onChangeText={setNombre} placeholder="Ej. Laura Gómez" error={errores.nombre} />
          <Campo
            etiqueta="Correo electrónico"
            value={correo}
            onChangeText={setCorreo}
            placeholder="tucorreo@ejemplo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            error={errores.correo}
          />
          <Campo etiqueta="Contraseña" value={clave} onChangeText={setClave} placeholder="Mínimo 8 caracteres" secureTextEntry />
          <View style={styles.fuerza}>
            <View style={{ width: barra.ancho + '%', backgroundColor: barra.color, height: '100%' }} />
          </View>
          {errores.clave ? <Texto style={styles.error}>{errores.clave}</Texto> : null}
          <Campo etiqueta="Repite la contraseña" value={clave2} onChangeText={setClave2} secureTextEntry error={errores.clave2} />
          <Casilla valor={acepto} alCambiar={setAcepto} texto="Acepto las condiciones de uso y la política de privacidad" />
          {errores.acepto ? <Texto style={styles.error}>{errores.acepto}</Texto> : null}
          <Boton texto={cargando ? 'Creando...' : 'Crear cuenta'} onPress={crear} desactivado={cargando} />
          <Texto style={styles.pie}>
            ¿Ya tienes cuenta?{' '}
            <Texto style={styles.enlace} onPress={() => ir('login')}>Inicia sesión</Texto>
          </Texto>
        </Tiembla>
      </Tarjeta>
    </Marco>
  );
}

const styles = StyleSheet.create({
  fuerza: { height: 5, borderRadius: 3, backgroundColor: colores.asiento, overflow: 'hidden', marginTop: -6 },
  error: { color: colores.rojo, fontSize: 12, marginTop: -6 },
  pie: { color: colores.gris, fontSize: 14, textAlign: 'center' },
  enlace: { color: colores.rojo, fontFamily: fuentes.semi, fontSize: 14, textDecorationLine: 'underline' },
});
