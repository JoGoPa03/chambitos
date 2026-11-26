import { Text } from 'react-native';
import { colores, fuentes } from '../tema';

export default function Texto({ style, ...resto }) {
  return <Text style={[{ fontFamily: fuentes.normal, color: colores.texto, fontSize: 15 }, style]} {...resto} />;
}
