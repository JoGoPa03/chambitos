import { createContext, useContext } from 'react';
import { useWindowDimensions } from 'react-native';

export const Contexto = createContext(null);

export function useApp() {
  return useContext(Contexto);
}

export function useEscritorio() {
  return useWindowDimensions().width >= 900;
}
