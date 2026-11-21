import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { OSOBY, type Osoba, type Pismo, type Sprawa, type Wpis } from '@/data/typy';
import { PALETA, type Kolory } from '@/ui/motyw';

export type Motyw = 'system' | 'jasny' | 'ciemny';
type Trwale = { osobaId: string; motyw: Motyw; pin: string | null; wprowadzenie: boolean };
type Sesja = {
  pesel: boolean; log: Wpis[]; zgody: [string, string, string][]; przeczytane: string[]; zaplacone: string[];
  pisma: Pismo[]; historia: [string, string, string, string][]; zalatwione: string[]; noweSprawy: Sprawa[];
};
type Ctx = Trwale & Sesja & {
  gotowe: boolean; odblokowana: boolean; os: Osoba; k: Kolory; skrzynka: Pismo[]; sprawy: Sprawa[];
  ustaw: (z: Partial<Trwale>) => void; odblokuj: () => void; zablokuj: () => void;
  zmien: (z: Partial<Sesja> | ((s: Sesja) => Partial<Sesja>)) => void;
  toast: (t: string) => void; toastTxt: string | null;
};

const KLUCZ = 'mobywatel-prototyp';
const sesjaDla = (o: Osoba): Sesja => ({
  pesel: o.priv.pesel, log: o.priv.log.map(x => ({ ...x })), zgody: o.priv.zgody.slice(), przeczytane: [], zaplacone: [],
  pisma: [], historia: o.platnosci.slice(), zalatwione: [], noweSprawy: [],
});

const C = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const sys = useColorScheme();
  const [gotowe, setGotowe] = useState(false);
  const [t, setT] = useState<Trwale>({ osobaId: 'marta', motyw: 'system', pin: null, wprowadzenie: false });
  const [odblokowana, setOdbl] = useState(false);
  const [s, setS] = useState<Sesja>(() => sesjaDla(OSOBY.marta));
  const [toastTxt, setToast] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KLUCZ).then(v => {
      if (v) { const z = JSON.parse(v) as Trwale; if (!OSOBY[z.osobaId]) z.osobaId = 'marta'; setT(z); setS(sesjaDla(OSOBY[z.osobaId])); }
    }).finally(() => setGotowe(true));
  }, []);

  const ustaw = useCallback((z: Partial<Trwale>) => {
    setT(prev => {
      const n = { ...prev, ...z };
      if (z.osobaId && z.osobaId !== prev.osobaId) setS(sesjaDla(OSOBY[z.osobaId]));
      AsyncStorage.setItem(KLUCZ, JSON.stringify(n));
      return n;
    });
  }, []);
  const zmien = useCallback((z: Partial<Sesja> | ((s: Sesja) => Partial<Sesja>)) => setS(prev => ({ ...prev, ...(typeof z === 'function' ? z(prev) : z) })), []);
  const toast = useCallback((txt: string) => { setToast(txt); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); setTimeout(() => setToast(c => (c === txt ? null : c)), 2600); }, []);

  const ciemny = t.motyw === 'ciemny' || (t.motyw === 'system' && sys === 'dark');
  const os = OSOBY[t.osobaId] ?? OSOBY.marta;
  const skrzynka = useMemo(() => [...s.pisma, ...os.skrzynka], [s.pisma, os]);
  const sprawy = useMemo(() => [...s.noweSprawy, ...os.toku], [s.noweSprawy, os]);
  const v: Ctx = {
    ...t, ...s, gotowe, odblokowana, os, k: ciemny ? PALETA.dark : PALETA.light, skrzynka, sprawy,
    ustaw, zmien, toast, toastTxt, odblokuj: () => setOdbl(true), zablokuj: () => setOdbl(false),
  };
  return <C.Provider value={v}>{children}</C.Provider>;
}

export function useApp() { const c = useContext(C); if (!c) throw new Error('Brak AppProvider'); return c; }
export const useK = () => useApp().k;

/* Logowanie biometrią: prawdziwe Face ID / odcisk palca, bez przechodzenia na kod telefonu.
   Bez czujnika albo po anulowaniu zostaje PIN mObywatela na ekranie blokady. */
export async function biometria(powod = 'Zaloguj się'): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const ma = (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
    if (!ma) return false;
    const r = await LocalAuthentication.authenticateAsync({ promptMessage: powod, cancelLabel: 'Użyj PIN-u', disableDeviceFallback: true });
    return r.success;
  } catch { return false; }
}
/* sprawy z listy „Do załatwienia”, których użytkownik jeszcze nie załatwił */
export function useZadania() {
  const { os, zalatwione, zaplacone } = useApp();
  return os.tiles.filter(z => {
    if (zalatwione.includes(z.k)) return false;
    if (z.k === 'pay') { const w = z.h.toLowerCase().split(' ')[0]; return !zaplacone.some(t => t.toLowerCase().startsWith(w)); }
    return true;
  });
}
export const rodz = (o: Osoba, k: string, m: string) => (o.plec === 'K' ? k : m);
