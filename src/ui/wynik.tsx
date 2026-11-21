/* Elementy ekranu wyniku: wydany dokument na „papierze”, wykres słupkowy, oś czasu, lista kontrolna. */
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import type { Dok, Wynik } from '@/data/uslugi';
import { useApp } from '@/state/app';
import { Godlo, Ikona, Karta, KodQR, T } from '@/ui/elementy';

export function DokumentPapier({ d }: { d: Dok }) {
  const { k } = useApp();
  const ink = '#1B1C21', ink2 = '#666A75', hair = '#E6E1DC';
  return (
    <View style={{ borderRadius: 18, backgroundColor: '#FFFDF9', padding: 18, borderWidth: k.dark ? 0 : 1, borderColor: hair, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4, transform: [{ rotate: '-0.6deg' }] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: hair }}>
        <Godlo size={30} />
        <View style={{ flex: 1 }}>
          <T v="cap" c={ink2} style={{ fontSize: 10 }}>Rzeczpospolita Polska</T>
          <T v="small" c={ink} style={{ fontWeight: '700' }}>{d.naglowek}</T>
        </View>
        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#E1F3EA' }}><T v="small" c="#14784F" style={{ fontWeight: '800', fontSize: 10.5 }}>PODPISANY</T></View>
      </View>
      <T v="h3" c={ink} style={{ marginTop: 14 }}>{d.tytul}</T>
      <T v="small" c={ink2} style={{ marginTop: 2 }}>Nr {d.nr}</T>
      <View style={{ marginTop: 12, gap: 8 }}>
        {d.tresc.map(([a, b]) => (
          <View key={a} style={{ flexDirection: 'row', gap: 10 }}>
            <T v="small" c={ink2} style={{ width: 108 }}>{a}</T>
            <T v="small" c={ink} style={{ flex: 1, fontWeight: '600' }}>{b}</T>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: hair, borderStyle: 'dashed' }}>
        <View style={{ flex: 1 }}>
          <T v="small" c={ink2} style={{ fontSize: 11 }}>{d.stopka}</T>
          <T v="small" c={ink2} style={{ fontSize: 11, marginTop: 2 }}>Wydano 18.10.2026 · sprawdź autentyczność kodem QR</T>
        </View>
        <KodQR tekst={`https://weryfikacja.prototyp/${d.nr}`} size={58} logo={false} />
      </View>
    </View>
  );
}

function Slupek({ f, kolor, i }: { f: number; kolor: string; i: number }) {
  const h = useSharedValue(0);
  useEffect(() => { h.set(withDelay(300 + i * 90, withTiming(f, { duration: 700, easing: Easing.out(Easing.cubic) }))); }, [f, h, i]);
  const st = useAnimatedStyle(() => ({ height: `${h.value * 100}%` }));
  return <Animated.View style={[{ width: '62%', borderRadius: 7, backgroundColor: kolor }, st]} />;
}
export function Wykres({ w }: { w: NonNullable<Wynik['wykres']> }) {
  const { k } = useApp();
  const max = Math.max(...w.dane.map(d => d[1]));
  return (
    <Karta style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', height: 150, alignItems: 'flex-end', gap: 6 }}>
        {w.dane.map(([t, n, zle], i) => (
          <View key={t} style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
            <T v="small" c={zle ? k.accInk : k.ink2} style={{ fontWeight: '700', marginBottom: 4 }}>{n}</T>
            <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-end' }}><Slupek f={n / max} kolor={zle ? k.acc : k.ink3} i={i} /></View>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
        {w.dane.map(([t]) => <T key={t} v="small" center style={{ flex: 1 }}>{t}</T>)}
      </View>
      <T v="small" style={{ marginTop: 10 }}>Wartości w {w.jedn}. {w.dane.some(d => d[2]) ? 'Na czerwono odczyt niższy niż poprzedni.' : ''}</T>
    </Karta>
  );
}

export function Os({ dane }: { dane: [string, string, boolean?][] }) {
  const { k } = useApp();
  return (
    <Karta style={{ padding: 16 }}>
      {dane.map(([d, t, zle], i) => (
        <Animated.View key={d + t} entering={FadeIn.delay(150 + i * 40).duration(240)} style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ alignItems: 'center', width: 14 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, marginTop: 4, backgroundColor: zle ? k.acc : k.ink3 }} />
            {i < dane.length - 1 ? <View style={{ width: 2, flex: 1, backgroundColor: k.hair, marginVertical: 3 }} /> : null}
          </View>
          <View style={{ flex: 1, paddingBottom: i < dane.length - 1 ? 14 : 0 }}>
            <T v="small" style={{ fontWeight: '700' }}>{d}</T>
            <T v="body" c={zle ? k.accInk : k.ink} style={{ marginTop: 1, fontWeight: zle ? '600' : '400' }}>{t}</T>
          </View>
        </Animated.View>
      ))}
    </Karta>
  );
}

export function Kontrola({ dane }: { dane: [string, string, boolean][] }) {
  const { k } = useApp();
  return (
    <Karta>
      {dane.map(([t, w, ok], i) => (
        <Animated.View key={t} entering={FadeIn.delay(120 + i * 50).duration(240)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderTopWidth: i ? 0.5 : 0, borderTopColor: k.hair }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: ok ? k.okBg : k.accBg, alignItems: 'center', justifyContent: 'center' }}>
            <Ikona n={ok ? 'ok' : 'x'} size={15} color={ok ? k.ok : k.accInk} sw={2.6} />
          </View>
          <T v="body" style={{ flex: 1 }}>{t}</T>
          <T v="sub" c={ok ? k.ink2 : k.accInk} style={{ fontWeight: '600' }}>{w}</T>
        </Animated.View>
      ))}
    </Karta>
  );
}
