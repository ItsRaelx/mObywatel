/* Potwierdzanie operacji w demo, bez systemowych okien telefonu:
   - 'pin'    podpis PIN-em mObywatela (wnioski, zastrzeżenia, przekazanie danych),
   - 'faceid' sama animacja Face ID (płatności).
   potwierdz() można wywołać z dowolnego miejsca; okno rysuje PotwierdzenieHost w głównym layoucie. */
import * as Haptics from 'expo-haptics';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Animated as RNAnimated, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/state/app';
import { Ikona } from '@/ui/elementy';
import { Klawiatura, Kropki, trzes } from '@/ui/klawiatura';

export type Tryb = 'pin' | 'faceid';
type Zadanie = { id: number; powod: string; tryb: Tryb; koniec: (ok: boolean) => void };

let biezace: Zadanie | null = null; let nr = 0;
const sluchacze = new Set<() => void>();
const ustawBiezace = (z: Zadanie | null) => { biezace = z; sluchacze.forEach(f => f()); };
const subskrybuj = (f: () => void) => { sluchacze.add(f); return () => { sluchacze.delete(f); }; };

export function potwierdz(powod: string, tryb: Tryb = 'pin'): Promise<boolean> {
  biezace?.koniec(false);
  return new Promise(res => ustawBiezace({ id: ++nr, powod, tryb, koniec: ok => { ustawBiezace(null); res(ok); } }));
}

const czekaj = (ms: number) => new Promise(r => setTimeout(r, ms));

/* ---------- podpis PIN-em mObywatela ---------- */
function OknoPin({ z }: { z: Zadanie }) {
  const { k, pin } = useApp(); const ins = useSafeAreaInsets();
  const [p, setP] = useState(''); const [msg, setMsg] = useState<string | null>(null); const [ok, setOk] = useState(false);
  const blad = useState(() => new RNAnimated.Value(0))[0];
  const cyfra = (c: string) => {
    if (ok || p.length >= 4) return; const n = p + c; setP(n);
    if (n.length === 4) setTimeout(async () => {
      if (n === (pin ?? '1234')) {
        setOk(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        await czekaj(650); z.koniec(true);
      } else { trzes(blad); setMsg('Nieprawidłowy PIN. Spróbuj jeszcze raz.'); setP(''); }
    }, 150);
  };
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={[StyleSheet.absoluteFill, { backgroundColor: k.scrim }]}>
        <Pressable style={{ flex: 1 }} onPress={() => z.koniec(false)} accessibilityLabel="Anuluj" />
      </Animated.View>
      <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(180)}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: k.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingBottom: ins.bottom + 16, alignItems: 'center' }}>
        <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: k.hair, marginBottom: 18 }} />
        {ok ? (
          <Animated.View entering={FadeIn.duration(200)} style={{ alignItems: 'center', paddingVertical: 70 }}>
            <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: k.okBg, alignItems: 'center', justifyContent: 'center' }}><Ikona n="ok" size={38} color={k.ok} sw={2.4} /></View>
            <Text style={{ color: k.ink, fontSize: 20, fontWeight: '800', marginTop: 14 }}>Podpisano</Text>
          </Animated.View>
        ) : (
          <>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: k.accBg, alignItems: 'center', justifyContent: 'center' }}><Ikona n="key" size={24} color={k.accInk} /></View>
            <Text style={{ color: k.ink, fontSize: 21, fontWeight: '800', marginTop: 12 }}>Podpisz PIN-em mObywatela</Text>
            <Text style={{ color: msg ? k.accInk : k.ink2, fontSize: 15, marginTop: 4, textAlign: 'center', paddingHorizontal: 24, fontWeight: msg ? '600' : '400' }}>{msg ?? z.powod}</Text>
            <View style={{ marginTop: 22, marginBottom: 24 }}><Kropki n={p.length} blad={blad} kolor={k.ink} /></View>
            <Klawiatura jasna={!k.dark} onCyfra={cyfra} onUsun={() => setP(p.slice(0, -1))} />
            <Pressable onPress={() => z.koniec(false)} style={{ padding: 14, marginTop: 6 }}><Text style={{ color: k.accInk, fontSize: 16, fontWeight: '700' }}>Anuluj</Text></Pressable>
          </>
        )}
      </Animated.View>
    </View>
  );
}

/* ---------- animacja Face ID (płatności) ---------- */
function OknoFaceId({ z }: { z: Zadanie }) {
  const [gotowe, setGotowe] = useState(false);
  const skan = useSharedValue(0.35);
  useEffect(() => {
    skan.set(withRepeat(withTiming(1, { duration: 450, easing: Easing.inOut(Easing.quad) }), -1, true));
    let zyje = true;
    (async () => {
      await czekaj(1000); if (!zyje) return;
      setGotowe(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await czekaj(700); if (zyje) z.koniec(true);
    })();
    return () => { zyje = false; };
  }, [z, skan]);
  const st = useAnimatedStyle(() => ({ opacity: skan.value }));
  return (
    <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(200)} style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }]}>
      <View style={{ width: 170, height: 170, borderRadius: 34, backgroundColor: 'rgba(28,28,32,0.94)', alignItems: 'center', justifyContent: 'center' }}>
        {gotowe ? (
          <Animated.View key="ok" entering={FadeIn.duration(180)} style={{ alignItems: 'center' }}>
            <Ikona n="ok" size={64} color="#4CD39A" sw={2} />
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 12 }}>Potwierdzono</Text>
          </Animated.View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Animated.View style={st}><Ikona n="faceid" size={64} color="#fff" sw={1.6} /></Animated.View>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 12 }}>Face ID</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

export function PotwierdzenieHost() {
  const z = useSyncExternalStore(subskrybuj, () => biezace, () => null);
  if (!z) return null;
  return z.tryb === 'pin' ? <OknoPin key={z.id} z={z} /> : <OknoFaceId key={z.id} z={z} />;
}
