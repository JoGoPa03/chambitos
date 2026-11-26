import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Texto from '../componentes/Texto';
import Boton from '../componentes/Boton';
import Campo from '../componentes/Campo';
import Selector from '../componentes/Selector';
import Marco from '../componentes/Marco';
import Tarjeta from '../componentes/Tarjeta';
import { Cabeza, Casilla, Sub, Tiembla } from '../componentes/Piezas';
import { colores } from '../tema';
import { useApp } from '../Contexto';
import { api } from '../api';
import { coords, corto } from '../datos';

function inicial(tipo, item, lineas, autobuses) {
  if (tipo === 'bus') return item ? { matricula: item.matricula, plazas: String(item.plazas) } : { matricula: '', plazas: '40' };
  if (tipo === 'linea') {
    if (item) return { codigo: item.codigo, nombre: item.nombre, descripcion: item.descripcion || '', paradas: item.paradas.map((p) => p.nombre) };
    return { codigo: String(lineas.length + 1), nombre: '', descripcion: '', paradas: [] };
  }
  if (item) {
    return {
      lineaId: item.linea.id,
      sublinea: item.sublinea,
      salida: item.paradas[0].hora,
      dias: item.dias,
      sentido: item.sentido,
      autobusId: item.autobus.id,
      precio: item.precio ? String(item.precio).replace('.', ',') : '',
    };
  }
  return {
    lineaId: lineas[0] ? lineas[0].id : null,
    sublinea: lineas[0] ? lineas[0].codigo + 'a' : '',
    salida: '08:00',
    dias: 'L',
    sentido: 'ida',
    autobusId: autobuses[0] ? autobuses[0].id : null,
    precio: '',
  };
}

export default function Formulario() {
  const { datos, ir, aviso, setAdminTab } = useApp();
  const { tipo, item, lineas, autobuses } = datos;
  const [f, setF] = useState(inicial(tipo, item, lineas, autobuses));
  const [errores, setErrores] = useState({});
  const [intentos, setIntentos] = useState(0);
  const [guardando, setGuardando] = useState(false);

  function poner(campo, valor) {
    setF({ ...f, [campo]: valor });
  }

  function marcar(nombre, valor) {
    poner('paradas', valor ? [...f.paradas, nombre] : f.paradas.filter((p) => p !== nombre));
  }

  async function guardar() {
    const e = {};
    if (tipo === 'bus') {
      if (!/^\d{4} ?[A-Z]{3}$/.test(f.matricula.trim())) e.matricula = 'Formato de matrícula: 4 números y 3 letras (1234 ABC)';
      const n = Number(f.plazas);
      if (!(n >= 10 && n <= 70)) e.plazas = 'Las plazas tienen que estar entre 10 y 70';
    }
    if (tipo === 'linea') {
      if (!/^\d{1,2}$/.test(f.codigo.trim())) e.codigo = 'Pon un número de línea';
      if (f.nombre.trim().length < 3) e.nombre = 'Pon un nombre a la línea';
      if (f.paradas.length < 2) e.paradas = 'Marca al menos dos paradas';
    }
    if (tipo === 'viaje') {
      const l = lineas.find((x) => x.id === f.lineaId);
      if (!l || !new RegExp('^' + l.codigo + '[a-z]$').test(f.sublinea.trim().toLowerCase())) {
        e.sublinea = 'La sublínea tiene que ser el número de la línea y una letra (' + (l ? l.codigo : '') + 'a)';
      }
      if (!/^\d\d:\d\d$/.test(f.salida.trim())) e.salida = 'Pon la hora como 08:30';
      const p = Number(f.precio.replace(',', '.'));
      if (f.precio.trim() !== '' && !(p > 0 && p <= 50)) e.precio = 'El precio tiene que estar entre 0 y 50 €';
    }
    setErrores(e);
    if (Object.keys(e).length) {
      setIntentos(intentos + 1);
      return;
    }

    let cuerpo = f;
    if (tipo === 'bus') {
      cuerpo = { matricula: f.matricula.trim().replace(/^(\d{4})([A-Z])/, '$1 $2'), plazas: Number(f.plazas) };
    }
    const ruta = { bus: 'autobuses', linea: 'lineas', viaje: 'viajes' }[tipo];
    setGuardando(true);
    try {
      await api.guardar(ruta, item ? item.id : null, cuerpo);
      setAdminTab({ bus: 'buses', linea: 'lineas', viaje: 'viajes' }[tipo]);
      ir('admin');
      aviso({ bus: 'Autobús', linea: 'Línea', viaje: 'Viaje' }[tipo] + (item ? ' guardad' : ' cread') + (tipo === 'linea' ? 'a' : 'o'));
    } catch (err) {
      setErrores({ general: err.message });
      setIntentos(intentos + 1);
      setGuardando(false);
    }
  }

  let campos = null;
  if (tipo === 'bus') {
    campos = (
      <>
        <Campo etiqueta="Matrícula" value={f.matricula} onChangeText={(t) => poner('matricula', t.toUpperCase())} placeholder="1234 ABC" error={errores.matricula} />
        <Campo etiqueta="Número de plazas" value={f.plazas} onChangeText={(t) => poner('plazas', t)} keyboardType="numeric" error={errores.plazas} />
      </>
    );
  }
  if (tipo === 'linea') {
    campos = (
      <>
        <Campo etiqueta="Número" value={f.codigo} onChangeText={(t) => poner('codigo', t)} placeholder="3" keyboardType="numeric" error={errores.codigo} />
        <Campo etiqueta="Nombre" value={f.nombre} onChangeText={(t) => poner('nombre', t)} placeholder="Xàtiva - Canals" error={errores.nombre} />
        <Campo etiqueta="Descripción" value={f.descripcion} onChangeText={(t) => poner('descripcion', t)} placeholder="3a Xàtiva - Canals" />
        <Cabeza texto="Paradas (en orden de marcado)" />
        <View style={styles.casillas}>
          {Object.keys(coords).map((n) => (
            <View key={n} style={styles.casilla}>
              <Casilla valor={f.paradas.includes(n)} alCambiar={(v) => marcar(n, v)} texto={corto(n)} />
            </View>
          ))}
        </View>
        <Sub texto={f.paradas.join(' → ') || 'Ninguna parada marcada'} estilo={{ fontSize: 12 }} />
        {errores.paradas ? <Texto style={styles.error}>{errores.paradas}</Texto> : null}
      </>
    );
  }
  if (tipo === 'viaje') {
    campos = (
      <>
        <Selector
          etiqueta="Línea"
          valor={f.lineaId}
          opciones={lineas.map((l) => ({ valor: l.id, texto: 'Línea ' + l.codigo + ' · ' + l.nombre }))}
          alCambiar={(v) => setF({ ...f, lineaId: v, sublinea: lineas.find((l) => l.id === v).codigo + 'a' })}
        />
        <View style={styles.dos}>
          <View style={{ flex: 1 }}>
            <Campo etiqueta="Sublínea" value={f.sublinea} onChangeText={(t) => poner('sublinea', t)} placeholder="1a" />
          </View>
          <View style={{ flex: 1 }}>
            <Campo etiqueta="Hora de salida" value={f.salida} onChangeText={(t) => poner('salida', t)} placeholder="08:00" />
          </View>
        </View>
        {errores.sublinea ? <Texto style={styles.error}>{errores.sublinea}</Texto> : null}
        {errores.salida ? <Texto style={styles.error}>{errores.salida}</Texto> : null}
        <View style={styles.dos}>
          <View style={{ flex: 1 }}>
            <Selector
              etiqueta="Días"
              valor={f.dias}
              opciones={[
                { valor: 'L', texto: 'Lunes a viernes' },
                { valor: 'F', texto: 'Sábados, domingos y festivos' },
              ]}
              alCambiar={(v) => poner('dias', v)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Selector
              etiqueta="Sentido"
              valor={f.sentido}
              opciones={[
                { valor: 'ida', texto: 'Ida' },
                { valor: 'vuelta', texto: 'Vuelta' },
              ]}
              alCambiar={(v) => poner('sentido', v)}
            />
          </View>
        </View>
        <View style={styles.dos}>
          <View style={{ flex: 1 }}>
            <Selector
              etiqueta="Autobús"
              valor={f.autobusId}
              opciones={autobuses.map((b) => ({ valor: b.id, texto: b.matricula + ' (' + b.plazas + ')' }))}
              alCambiar={(v) => poner('autobusId', v)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Campo etiqueta="Precio (€)" value={f.precio} onChangeText={(t) => poner('precio', t)} placeholder="2,95" keyboardType="decimal-pad" />
          </View>
        </View>
        {errores.precio ? <Texto style={styles.error}>{errores.precio}</Texto> : null}
        <Sub texto="Las horas del resto de paradas se calculan con los tiempos de la línea. Si dejas el precio vacío se calcula por paradas." estilo={{ fontSize: 12 }} />
      </>
    );
  }

  const nombre = { bus: 'autobús', linea: 'línea', viaje: 'viaje' }[tipo];
  const titulo = item ? 'Editar ' + nombre : (tipo === 'linea' ? 'Nueva ' : 'Nuevo ') + nombre;

  return (
    <Marco titulo={titulo} atras="admin" admin ancho={620}>
      <Tarjeta>
        <Tiembla clave={intentos}>
          {campos}
          {errores.general ? <Texto style={styles.error}>{errores.general}</Texto> : null}
          <Boton texto={guardando ? 'Guardando...' : item ? 'Guardar cambios' : 'Crear'} desactivado={guardando} onPress={guardar} />
          <Boton texto="Cancelar" tipo="ghost" onPress={() => ir('admin')} />
        </Tiembla>
      </Tarjeta>
    </Marco>
  );
}

const styles = StyleSheet.create({
  dos: { flexDirection: 'row', gap: 10 },
  casillas: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
  casilla: { width: '50%' },
  error: { color: colores.rojo, fontSize: 12, marginTop: -6 },
});
