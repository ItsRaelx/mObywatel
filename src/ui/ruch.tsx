/* Animacje: wejście elementów, sprężyste wciśnięcia, liczniki i ikony sukcesu (Reanimated 4). */
import * as Haptics from 'expo-haptics';
import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing, FadeInDown, FadeInUp, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming, FadeIn,
} from 'react-native-reanimated';
import { Circle } from 'react-native-svg';

/* płynne przejście bez sprężystości (bez „odbicia”) */
export const PLYNNIE = { duration: 220, easing: Easing.out(Easing.cubic) };

/* element wjeżdżający od dołu, z opóźnieniem zależnym od pozycji na liście */
export function Wejscie({ i = 0, children, style, gora, baza = 0 }: { i?: number; children: ReactNode; style?: StyleProp<ViewStyle>; gora?: boolean; baza?: number }) {
  const a = (gora ? FadeInUp : FadeInDown).delay(baza + Math.min(i, 6) * 35).duration(320).easing(Easing.out(Easing.cubic));
  return <Animated.View entering={a} style={style}>{children}</Animated.View>;
}

/* przycisk, który lekko się zapada pod palcem i sprężyście wraca */
export function Sprezyna({ children, style, onPress, skala = 0.98, haptyka = true, zewn, ...rest }: PressableProps & { children: ReactNode; style?: StyleProp<ViewStyle>; skala?: number; haptyka?: boolean; zewn?: StyleProp<ViewStyle> }) {
  const s = useSharedValue(1);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  /* właściwości układu (szerokość w rzędzie) muszą trafić na zewnętrzny Pressable, inaczej kafelki w rzędzie mają różne szerokości */
  const { flex, flexGrow, flexShrink, flexBasis, width, alignSelf, ...wnetrze } = StyleSheet.flatten(style) ?? {};
  const uklad = { flex, flexGrow, flexShrink, flexBasis, width, alignSelf };
  const maUklad = Object.values(uklad).some(x => x !== undefined);
  return (
    <Pressable {...rest} style={[maUklad && uklad, zewn]}
      onPressIn={() => { s.set(withTiming(skala, { duration: 90 })); }}
      onPressOut={() => { s.set(withTiming(1, { duration: 160 })); }}
      onPress={e => { if (haptyka) Haptics.selectionAsync().catch(() => {}); onPress?.(e); }}>
      <Animated.View style={[wnetrze, maUklad && (flex || flexGrow) ? { flex: 1 } : null, st]}>{children}</Animated.View>
    </Pressable>
  );
}

/* duża ikona na ekranie sukcesu: wskakuje i zostawia rozchodzący się pierścień */
export function Pop({ children, size = 92 }: { children: ReactNode; kolor?: string; size?: number }) {
  return <Animated.View entering={FadeIn.duration(250)} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>{children}</Animated.View>;
}

/* łuk postępu, który dorysowuje się po pojawieniu */
const ACircle = Animated.createAnimatedComponent(Circle);
export function Luk({ r, f, kolor, grub = 4, cx, cy, opoznienie = 200 }: { r: number; f: number; kolor: string; grub?: number; cx: number; cy: number; opoznienie?: number }) {
  const C = 2 * Math.PI * r, v = useSharedValue(0);
  useEffect(() => { v.set(withDelay(opoznienie, withTiming(f, { duration: 900, easing: Easing.out(Easing.cubic) }))); }, [f, v, opoznienie]);
  const ap = useAnimatedProps(() => ({ strokeDasharray: [C * v.value, C] }));
  return <ACircle cx={cx} cy={cy} r={r} stroke={kolor} strokeWidth={grub} fill="none" strokeLinecap="round" animatedProps={ap} />;
}

/* delikatne pulsowanie (np. kropka „w toku”) */
export function Puls({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const p = useSharedValue(1);
  useEffect(() => { p.set(withRepeat(withSequence(withTiming(1.12, { duration: 700 }), withTiming(1, { duration: 700 })), -1)); }, [p]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: p.value }] }));
  return <Animated.View style={[style, st]}>{children}</Animated.View>;
}

/* pasek postępu, który płynnie się wydłuża */
export function Pasek({ f, kolor, tlo, h = 6 }: { f: number; kolor: string; tlo: string; h?: number }) {
  const w = useSharedValue(0);
  useEffect(() => { w.set(withTiming(f, { duration: 600, easing: Easing.out(Easing.cubic) })); }, [f, w]);
  const st = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return <Animated.View style={{ height: h, borderRadius: h / 2, backgroundColor: tlo, overflow: 'hidden' }}><Animated.View style={[{ height: h, borderRadius: h / 2, backgroundColor: kolor }, st]} /></Animated.View>;
}
export { Animated };
