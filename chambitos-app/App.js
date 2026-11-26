import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Archivo_700Bold, Archivo_800ExtraBold } from '@expo-google-fonts/archivo';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { Contexto } from './src/Contexto';
import { api, guardarToken } from './src/api';
import { colores } from './src/tema';
import { proximosDias, esFinDeSemana } from './src/utilidades';
import Toast from './src/componentes/Toast';
import Splash from './src/pantallas/Splash';
import Login from './src/pantallas/Login';
import Registro from './src/pantallas/Registro';
import Buscar from './src/pantallas/Buscar';
import Cerca from './src/pantallas/Cerca';
import Resultados from './src/pantallas/Resultados';
import Plaza from './src/pantallas/Plaza';
import Billete from './src/pantallas/Billete';
import Reservas from './src/pantallas/Reservas';
import Horarios from './src/pantallas/Horarios';
import Directo from './src/pantallas/Directo';
import Perfil from './src/pantallas/Perfil';
import Admin from './src/pantallas/Admin';
import Formulario from './src/pantallas/Formulario';
import Pasajeros from './src/pantallas/Pasajeros';

const pantallas = {
  splash: Splash,
  login: Login,
  registro: Registro,
  buscar: Buscar,
  cerca: Cerca,
  resultados: Resultados,
  plaza: Plaza,
  billete: Billete,
  reservas: Reservas,
  horarios: Horarios,
  directo: Directo,
  perfil: Perfil,
  admin: Admin,
  formulario: Formulario,
  pasajeros: Pasajeros,
};

function primeraFecha() {
  return proximosDias(7).find((d) => !esFinDeSemana(d)) || proximosDias(1)[0];
}

export default function App() {
  const [fuentesListas] = useFonts({
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_500Medium,
  });
  const [pantalla, setPantalla] = useState('splash');
  const [datos, setDatos] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [toast, setToast] = useState('');
  const [viajes, setViajes] = useState([]);
  const [paradas, setParadas] = useState([]);
  const [favs, setFavs] = useState([]);
  const [busqueda, setBusqueda] = useState({ origen: 'La Font de la Figuera', destino: 'Xàtiva', fecha: primeraFecha() });
  const [adminTab, setAdminTab] = useState('viajes');

  useEffect(() => {
    AsyncStorage.getItem('favs')
      .then((t) => setFavs(t ? JSON.parse(t) : [['Moixent', 'Hospital Xàtiva']]))
      .catch(() => setFavs([]));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  function ir(nueva, nuevosDatos) {
    setDatos(nuevosDatos || null);
    setPantalla(nueva);
  }

  async function cargarViajes() {
    const [v, p] = await Promise.all([api.viajes(), api.paradas()]);
    setViajes(v);
    setParadas(p);
    return v;
  }

  function entrar(u) {
    guardarToken(u.token);
    setUsuario(u);
    cargarViajes().catch(() => {});
    ir(u.rol === 'admin' ? 'admin' : 'buscar');
  }

  function salir() {
    api.salir().catch(() => {});
    guardarToken(null);
    setUsuario(null);
    ir('login');
  }

  function cambiarFavs(lista) {
    setFavs(lista);
    AsyncStorage.setItem('favs', JSON.stringify(lista)).catch(() => {});
  }

  if (!fuentesListas) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator color={colores.blanco} />
      </View>
    );
  }

  const Pantalla = pantallas[pantalla];
  const valor = {
    pantalla,
    datos,
    ir,
    usuario,
    setUsuario,
    entrar,
    salir,
    aviso: setToast,
    viajes,
    paradas,
    cargarViajes,
    favs,
    cambiarFavs,
    busqueda,
    setBusqueda,
    adminTab,
    setAdminTab,
  };

  return (
    <Contexto.Provider value={valor}>
      <View style={styles.raiz}>
        <StatusBar style="light" />
        <Pantalla key={pantalla} />
        {toast ? <Toast texto={toast} /> : null}
      </View>
    </Contexto.Provider>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: colores.blanco },
  cargando: { flex: 1, backgroundColor: colores.rojo, alignItems: 'center', justifyContent: 'center' },
});
