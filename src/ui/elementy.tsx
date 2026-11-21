import { useEffect, useMemo, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, SvgXml } from 'react-native-svg';

import { kiedy, pl3 } from '@/data/typy';
import { portretSvg } from '@/lib/grafika';
import { IKONY } from '@/lib/ikony';
import { QR } from '@/lib/qr';
import { useApp, useK } from '@/state/app';
import { CIEN, R } from '@/ui/motyw';
import { Luk, Sprezyna, Wejscie } from '@/ui/ruch';

/* ---------- ikona z własnego zestawu ---------- */
export function Ikona({ n, size = 22, color, sw = 1.75 }: { n: string; size?: number; color?: string; sw?: number }) {
  const k = useK(); const c = color ?? k.ink;
  const xml = `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${(IKONY[n] ?? IKONY.doc).replace(/currentColor/g, c)}</svg>`;
  return <SvgXml xml={xml} width={size} height={size} />;
}

/* ---------- tekst ---------- */
type Wariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodyB' | 'sub' | 'small' | 'cap';
const TXT: Record<Wariant, TextStyle> = {
  h1: { fontSize: 32, lineHeight: 37, fontWeight: '800', letterSpacing: -0.6 },
  h2: { fontSize: 21, lineHeight: 26, fontWeight: '800', letterSpacing: -0.3 },
  h3: { fontSize: 17, lineHeight: 22, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 22 },
  bodyB: { fontSize: 16, lineHeight: 21, fontWeight: '600' },
  sub: { fontSize: 14, lineHeight: 19 },
  small: { fontSize: 12.5, lineHeight: 17 },
  cap: { fontSize: 12, lineHeight: 15, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
};
export function T({ v = 'body', c, style, children, n, center }: { v?: Wariant; c?: string; style?: StyleProp<TextStyle>; children: ReactNode; n?: number; center?: boolean }) {
  const k = useK();
  const kolor = c ?? (v === 'sub' || v === 'small' || v === 'cap' ? k.ink2 : k.ink);
  return <Text numberOfLines={n} style={[TXT[v], { color: kolor }, center && { textAlign: 'center' }, style]}>{children}</Text>;
}

/* ---------- ekran z dużym tytułem (zakładki) ---------- */
export function Ekran({ tytul, podtytul, prawa, children, tab }: { tytul?: string; podtytul?: string; prawa?: ReactNode; children: ReactNode; tab?: boolean }) {
  const k = useK(); const ins = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: k.bg }} contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingTop: tab ? ins.top + 10 : 8, paddingHorizontal: 16, paddingBottom: (tab ? 110 : 40) + ins.bottom }}>
      {tytul ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, marginTop: tab ? 6 : 0 }}>
          <View style={{ flex: 1 }}>
            <T v="h1">{tytul}</T>
            {podtytul ? <T v="sub" style={{ marginTop: 4 }}>{podtytul}</T> : null}
          </View>
          {prawa}
        </View>
      ) : null}
      {children}
    </ScrollView>
  );
}

/* ---------- sekcja, grupa, wiersz ---------- */
export function Sekcja({ tytul, akcja, onAkcja, children, style, i = 1 }: { tytul?: string; akcja?: string; onAkcja?: () => void; children: ReactNode; style?: StyleProp<ViewStyle>; i?: number }) {
  const k = useK();
  return (
    <Wejscie i={i} style={[{ marginTop: 26 }, style]}>
      {tytul ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 4 }}>
          <T v="h2" style={{ fontSize: 19 }}>{tytul}</T>
          {akcja ? <Pressable hitSlop={10} onPress={onAkcja}><T v="sub" c={k.accInk} style={{ fontWeight: '600' }}>{akcja}</T></Pressable> : null}
        </View>
      ) : null}
      {children}
    </Wejscie>
  );
}
export function Karta({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const k = useK();
  const st = [{ backgroundColor: k.surface, borderRadius: R.l, overflow: 'hidden' as const }, k.dark ? { borderWidth: StyleSheet.hairlineWidth, borderColor: k.hair } : CIEN, style];
  if (!onPress) return <View style={st}>{children}</View>;
  return <Sprezyna onPress={onPress} style={st} skala={0.975}>{children}</Sprezyna>;
}
export function Grupa({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const k = useK(); const arr = (Array.isArray(children) ? children : [children]).flat().filter(Boolean);
  return <Karta style={style}>{arr.map((c, i) => <Animated.View key={i} entering={FadeInDown.delay(80 + Math.min(i, 8) * 45).duration(380)} style={i ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: k.hair } : null}>{c}</Animated.View>)}</Karta>;
}
export function IkonaKafel({ n, akcent, size = 40 }: { n: string; akcent?: boolean; size?: number }) {
  const k = useK();
  return <View style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: akcent ? k.acc : k.surface2, alignItems: 'center', justifyContent: 'center' }}><Ikona n={n} size={size * 0.54} color={akcent ? '#fff' : k.ink} /></View>;
}
export function Wiersz({ ik, ikAkcent, tytul, opis, prawa, onPress, strzalka = true, lewa }: { ik?: string; ikAkcent?: boolean; tytul: string; opis?: string; prawa?: ReactNode; onPress?: () => void; strzalka?: boolean; lewa?: ReactNode }) {
  const k = useK();
  const tresc = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 14, minHeight: 62 }}>
      {lewa ?? (ik ? <IkonaKafel n={ik} akcent={ikAkcent} /> : null)}
      <View style={{ flex: 1 }}>
        <T v="bodyB">{tytul}</T>
        {opis ? <T v="sub" style={{ marginTop: 2 }}>{opis}</T> : null}
      </View>
      {prawa}
      {onPress && strzalka ? <Ikona n="chev" size={18} color={k.ink3} /> : null}
    </View>
  );
  if (!onPress) return tresc;
  return <Pressable onPress={onPress} style={({ pressed }) => pressed && { backgroundColor: k.surface2 }}>{tresc}</Pressable>;
}
export function Para({ k: klucz, w }: { k: string; w: string }) {
  const k = useK();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 13, paddingHorizontal: 16 }}>
      <T v="sub" c={k.ink2}>{klucz}</T>
      <T v="sub" c={k.ink} style={{ fontWeight: '600', flex: 1, textAlign: 'right' }}>{w}</T>
    </View>
  );
}

/* ---------- przyciski i etykiety ---------- */
export function Przycisk({ tytul, ik, onPress, rodzaj = 'glowny', style, maly }: { tytul: string; ik?: string; onPress?: () => void; rodzaj?: 'glowny' | 'drugi' | 'link'; style?: StyleProp<ViewStyle>; maly?: boolean }) {
  const k = useK();
  const bg = rodzaj === 'glowny' ? k.acc : rodzaj === 'drugi' ? k.surface : 'transparent';
  const fg = rodzaj === 'glowny' ? '#fff' : rodzaj === 'drugi' ? k.ink : k.accInk;
  return (
    <Sprezyna onPress={() => onPress?.()} accessibilityRole="button" skala={0.96}
      style={[{ height: maly ? 44 : 54, borderRadius: maly ? 14 : 17, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
        rodzaj === 'drugi' && (k.dark ? { borderWidth: StyleSheet.hairlineWidth, borderColor: k.hair } : CIEN), style]}>
      {ik ? <Ikona n={ik} size={20} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: maly ? 15 : 16.5, fontWeight: '700' }}>{tytul}</Text>
    </Sprezyna>
  );
}
export function Pill({ t, ton = 'n', ik }: { t: string; ton?: 'r' | 'g' | 'n' | 'a'; ik?: string }) {
  const k = useK();
  const [bg, fg] = ton === 'r' ? [k.accBg, k.accInk] : ton === 'g' ? [k.okBg, k.ok] : ton === 'a' ? [k.warnBg, k.warn] : [k.surface2, k.ink2];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: bg }}>
      {ik ? <Ikona n={ik} size={13} color={fg} sw={2.2} /> : null}
      <Text style={{ color: fg, fontSize: 12, fontWeight: '700' }}>{t}</Text>
    </View>
  );
}
export function Notka({ ik = 'info', children }: { ik?: string; children: ReactNode }) {
  const k = useK();
  return (
    <Karta style={{ flexDirection: 'row', gap: 12, padding: 14, marginTop: 14 }}>
      <Ikona n={ik} size={20} color={k.ink2} />
      <T v="sub" style={{ flex: 1 }}>{children}</T>
    </Karta>
  );
}

/* ---------- portret i godło ---------- */
export function Portret({ id, w = 64, h, r = 12, ramka }: { id: string; w?: number; h?: number; r?: number; ramka?: string }) {
  const xml = useMemo(() => portretSvg(id), [id]);
  const hh = h ?? w * 1.25;
  return (
    <View style={{ width: w, height: hh, borderRadius: r, overflow: 'hidden', borderWidth: ramka ? 2 : 0, borderColor: ramka }}>
      <SvgXml xml={xml} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
    </View>
  );
}
export function Avatar({ id, size = 44, ramka }: { id: string; size?: number; ramka?: string }) {
  return <Portret id={id} w={size} h={size} r={size / 2} ramka={ramka} />;
}
/* oficjalne znaki z info.mobywatel.gov.pl (zob. assets/ZRODLA.md), jako PNG dla płynności */
const GODLO = require('@/assets/img/godlo.png');
const LOGO_BIALE = require('@/assets/img/logo-biale.png');
export function Godlo({ size = 32 }: { size?: number }) {
  return <Image source={GODLO} style={{ width: size, height: size }} accessibilityIgnoresInvertColors />;
}
export function LogoBiale({ w = 136 }: { w?: number }) {
  return <Image source={LOGO_BIALE} style={{ width: w, height: (w * 40) / 176 }} accessibilityLabel="mObywatel" />;
}

/* ---------- kod QR (własny generator) z godłem w środku ---------- */
export function KodQR({ tekst, size, logo = true }: { tekst: string; size: number; logo?: boolean }) {
  const r = useMemo(() => (QR.svg as any)(tekst, { logo, bg: '#fff', quiet: 2, color: '#111' }) as { xml: string; logo: { x: number; w: number } | null }, [tekst, logo]);
  return (
    <View style={{ width: size, height: size }}>
      <SvgXml xml={r.xml} width={size} height={size} />
      {r.logo ? <View style={{ position: 'absolute', left: r.logo.x * size, top: r.logo.x * size, width: r.logo.w * size, height: r.logo.w * size }}><Godlo size={r.logo.w * size} /></View> : null}
    </View>
  );
}

/* ---------- licznik dni do terminu ---------- */
export function Dni({ n }: { n: number | null }) {
  const k = useK();
  if (n == null) return null;
  const f = Math.max(0.05, Math.min(1, n / 30));
  const kol = n <= 7 ? k.acc : n <= 14 ? k.warn : k.ink3;
  return (
    <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={kiedy(n)}>
      <Svg width={50} height={50} viewBox="0 0 44 44" style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={22} cy={22} r={19} stroke={k.surface2} strokeWidth={4} fill="none" />
        <Luk cx={22} cy={22} r={19} f={f} kolor={kol} />
      </Svg>
      <Text style={{ fontSize: 16, fontWeight: '800', color: n <= 7 ? k.accInk : k.ink, lineHeight: 17 }}>{n}</Text>
      <Text style={{ fontSize: 9, fontWeight: '600', color: k.ink2 }}>{pl3(n, 'dzień', 'dni', 'dni')}</Text>
    </View>
  );
}

/* ---------- komunikat na dole ekranu ---------- */
export function ToastHost() {
  const { toastTxt, k } = useApp(); const ins = useSafeAreaInsets();
  const a = useSharedValue(0);
  useEffect(() => { a.set(toastTxt ? withSpring(1, { damping: 14, stiffness: 170 }) : withTiming(0, { duration: 200 })); }, [toastTxt, a]);
  const st = useAnimatedStyle(() => ({ opacity: Math.min(1, a.value), transform: [{ translateY: (1 - a.value) * 30 }, { scale: 0.94 + a.value * 0.06 }] }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 16, right: 16, bottom: ins.bottom + 96 }, st]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 18, backgroundColor: k.dark ? '#F2F2F4' : '#1B1C21' }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#2FBF71', alignItems: 'center', justifyContent: 'center' }}><Ikona n="ok" size={14} color="#fff" sw={2.6} /></View>
        <Text style={{ flex: 1, color: k.dark ? '#17181C' : '#fff', fontSize: 14.5, fontWeight: '500' }}>{toastTxt}</Text>
      </View>
    </Animated.View>
  );
}
