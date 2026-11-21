import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import type { Dokument, Osoba } from '@/data/typy';
import { autoSvg, giloszSvg } from '@/lib/grafika';
import { Godlo, Ikona, KodQR, Portret } from '@/ui/elementy';

/* Karta dokumentu w proporcjach ID-1 (85,6 × 54 mm). Wszystkie wymiary skalowane od szerokości. */
export const PROPORCJA = 1.586;
type Wyglad = { grad: [string, string, string]; tekst: string; gil: string; nazwa: string; seed: number };
const TYTUL: Record<string, [string, string]> = { leg: ['Legitymacja studencka', 'mLegitymacja'] };
const WYGLAD: Record<string, Wyglad> = {
  dowod: { grad: ['#E61A40', '#C4102F', '#8C0A24'], tekst: '#FFFFFF', gil: '#FFFFFF', nazwa: 'Dowód osobisty', seed: 1 },
  pj: { grad: ['#464A54', '#2B2E35', '#17181C'], tekst: '#FFFFFF', gil: '#FFFFFF', nazwa: 'Prawo jazdy', seed: 3 },
  auto: { grad: ['#3A4760', '#252F42', '#141A25'], tekst: '#FFFFFF', gil: '#FFFFFF', nazwa: 'Pojazdy', seed: 5 },
  leg: { grad: ['#3E4752', '#282E36', '#171A1F'], tekst: '#FFFFFF', gil: '#FFFFFF', nazwa: 'Legitymacja studencka', seed: 7 },
  kdr: { grad: ['#FFFFFF', '#F4F5F8', '#E6E9EF'], tekst: '#17181C', gil: '#7D879B', nazwa: 'Karta Dużej Rodziny', seed: 2 },
};
const KDR = require('@/assets/img/kdr-znak.png');

export function Tablica({ nr, s = 1 }: { nr: string; s?: number }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 4 * s, borderWidth: 1.5 * s, borderColor: '#111', overflow: 'hidden', alignSelf: 'flex-start' }}>
      <View style={{ width: 13 * s, backgroundColor: '#1E3F9A', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2 * s }}>
        <Text style={{ color: '#fff', fontSize: 7 * s, fontWeight: '800' }}>PL</Text>
      </View>
      <Text style={{ color: '#111', fontSize: 17 * s, fontWeight: '800', letterSpacing: 1 * s, paddingHorizontal: 7 * s, paddingVertical: 2.5 * s, fontVariant: ['tabular-nums'] }}>{nr}</Text>
    </View>
  );
}

function Hologram({ w, h }: { w: number; h: number }) {
  const a = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const l = Animated.loop(Animated.timing(a, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
    l.start(); return () => l.stop();
  }, [a]);
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [-w, w] }) }] }]}>
      <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.22)', 'rgba(180,230,255,0.18)', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0.2 }} end={{ x: 1, y: 0.8 }} style={{ width: w * 0.7, height: h }} />
    </Animated.View>
  );
}

export function KartaDokumentu({ d, os, w, ukryte, onQR, onPokaz, hologram }: {
  d: Dokument; os: Osoba; w: number; ukryte?: boolean; onQR?: () => void; onPokaz?: () => void; hologram?: boolean;
}) {
  const wy = WYGLAD[d.id] ?? WYGLAD.pj;
  const s = w / 340, h = w / PROPORCJA, maly = w < 240;
  const kdr = d.id === 'kdr';
  const gil = useMemo(() => giloszSvg(wy.seed, wy.gil, kdr ? 0.5 : 0.18), [wy, kdr]);
  const auto = useMemo(() => (d.model ? autoSvg(d.model, d.kolor) : null), [d.model, d.kolor]);
  const auto2 = useMemo(() => (d.more?.[0] ? autoSvg(d.more[0].model, d.more[0].kolor, false) : null), [d.more]);
  const c = wy.tekst, c2 = d.id === 'kdr' ? 'rgba(23,24,28,0.6)' : 'rgba(255,255,255,0.72)';
  const imie = ukryte ? os.imie.toUpperCase() : d.holder;
  const pola = d.f.slice(0, maly ? 0 : 4);

  return (
    <View style={{ width: w, height: h, borderRadius: 18 * s, overflow: 'hidden', backgroundColor: wy.grad[1] }}>
      <LinearGradient colors={wy.grad} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
      <SvgXml xml={gil} width="100%" height="100%" style={StyleSheet.absoluteFill} preserveAspectRatio="none" />

      {/* nagłówek */}
      <View style={{ position: 'absolute', left: 16 * s, top: 15 * s, right: 90 * s, flexDirection: 'row', alignItems: 'center', gap: 9 * s }}>
        <Godlo size={28 * s} />
        <View style={{ flex: 1 }}>
          {!maly ? <Text numberOfLines={1} style={{ color: c2, fontSize: 9 * s, fontWeight: '700', letterSpacing: 1.3 * s, textTransform: 'uppercase' }}>{TYTUL[d.id]?.[0] ?? 'Rzeczpospolita Polska'}</Text> : null}
          <Text numberOfLines={1} style={{ color: c, fontSize: (maly ? 21 : 17) * s, fontWeight: '800', letterSpacing: -0.2 }}>{TYTUL[d.id]?.[1] ?? d.name}</Text>
        </View>
      </View>

      {/* prawy górny róg */}
      {d.id === 'dowod' && !maly ? (
        <Pressable onPress={onQR} accessibilityLabel="Pokaż kod QR dokumentu" style={{ position: 'absolute', right: 14 * s, top: 13 * s, padding: 4 * s, borderRadius: 10 * s, backgroundColor: '#fff' }}>
          <KodQR tekst={`MOBYWATEL:D:${os.moje.nr_dowodu}`} size={54 * s} logo={false} />
        </Pressable>
      ) : d.id === 'kdr' ? (
        <Image source={KDR} style={{ position: 'absolute', right: 14 * s, top: 12 * s, width: 70 * s, height: 52 * s, borderRadius: 8 * s }} />
      ) : !maly ? (
        <View style={{ position: 'absolute', right: 14 * s, top: 15 * s, flexDirection: 'row', alignItems: 'center', gap: 4 * s, paddingHorizontal: 9 * s, paddingVertical: 4 * s, borderRadius: 99, backgroundColor: d.alert ? '#fff' : 'rgba(255,255,255,0.16)' }}>
          <Ikona n={d.alert ? 'alert' : 'check'} size={12 * s} color={d.alert ? '#B00F30' : '#fff'} sw={2.2} />
          <Text style={{ color: d.alert ? '#B00F30' : '#fff', fontSize: 10.5 * s, fontWeight: '700' }}>{d.alert ?? 'Ważny'}</Text>
        </View>
      ) : null}

      {/* treść */}
      {auto ? (
        <>
          <View style={{ position: 'absolute', right: 6 * s, top: (maly ? 46 : 52) * s, width: (maly ? 230 : 205) * s, height: (maly ? 96 : 86) * s }}>
            {auto2 ? <View style={{ position: 'absolute', left: -60 * s, top: -12 * s, width: 140 * s, height: 60 * s, opacity: 0.85 }}><SvgXml xml={auto2} width="100%" height="100%" /></View> : null}
            <SvgXml xml={auto} width="100%" height="100%" />
          </View>
          <View style={{ position: 'absolute', left: 16 * s, bottom: 15 * s, right: 16 * s, gap: 7 * s }}>
            <Tablica nr={d.plate ?? ''} s={s} />
            {!maly ? <Text numberOfLines={1} style={{ color: c, fontSize: 14 * s, fontWeight: '800' }}>{d.who ?? d.holder}</Text> : null}
            {!maly ? <View style={{ flexDirection: 'row', gap: 18 * s }}>{d.f.slice(0, 2).map(([a, b]) => <Pole key={a} a={a} b={b} s={s} c={c} c2={c2} />)}</View> : null}
          </View>
        </>
      ) : (
        <View style={{ position: 'absolute', left: 16 * s, right: 16 * s, bottom: 15 * s, flexDirection: 'row', alignItems: 'flex-end', gap: 13 * s }}>
          {d.photo ? <Portret id={os.id} w={(maly ? 62 : 72) * s} h={(maly ? 80 : 92) * s} r={9 * s} ramka={d.id === 'kdr' ? '#fff' : 'rgba(255,255,255,0.85)'} /> : null}
          <View style={{ flex: 1, gap: 6 * s }}>
            <Text numberOfLines={2} style={{ color: c, fontSize: (maly ? 19 : 16) * s, fontWeight: '800', letterSpacing: 0.3 }}>{imie}</Text>
            {ukryte && d.id === 'dowod' ? (
              !maly ? <Pressable onPress={onPokaz} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6 * s, paddingHorizontal: 11 * s, paddingVertical: 6 * s, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' }}>
                <Ikona n="eye" size={14 * s} color="#fff" /><Text style={{ color: '#fff', fontSize: 12 * s, fontWeight: '700' }}>Pokaż dane</Text>
              </Pressable> : null
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 6 * s, columnGap: 14 * s }}>
                {pola.map(([a, b]) => <Pole key={a} a={a} b={b} s={s} c={c} c2={c2} />)}
              </View>
            )}
          </View>
        </View>
      )}
      {hologram ? <Hologram w={w} h={h} /> : null}
    </View>
  );
}
function Pole({ a, b, s, c, c2 }: { a: string; b: string; s: number; c: string; c2: string }) {
  return (
    <View style={{ minWidth: 96 * s }}>
      <Text style={{ color: c2, fontSize: 8.5 * s, fontWeight: '700', letterSpacing: 0.6 * s, textTransform: 'uppercase' }}>{a}</Text>
      <Text numberOfLines={1} style={{ color: c, fontSize: 12.5 * s, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{b}</Text>
    </View>
  );
}
