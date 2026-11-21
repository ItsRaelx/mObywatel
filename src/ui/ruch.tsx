/* Animacje: wejście elementów, sprężyste wciśnięcia, liczniki i ikony sukcesu (Reanimated 4). */
import * as Haptics from 'expo-haptics';
import { useEffect, type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing, FadeInDown, FadeInUp, interpolate, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming, ZoomIn,
} from 'react-native-reanimated';
import { Circle } from 'react-native-svg';

export const SPREZYNA = { damping: 16, stiffness: 180, mass: 0.8 };

/* element wjeżdżający od dołu, z opóźnieniem zależnym od pozycji na liście */
export function Wejscie({ i = 0, children, style, gora, baza = 0 }: { i?: number; children: ReactNode; style?: StyleProp<ViewStyle>; gora?: boolean; baza?: number }) {
  const a = (gora ? FadeInUp : FadeInDown).delay(baza + Math.min(i, 10) * 55).duration(460).easing(Easing.out(Easing.cubic));
  return <Animated.View entering={a} style={style}>{children}</Animated.View>;
}

/* przycisk, który lekko się zapada pod palcem i sprężyście wraca */
export function Sprezyna({ children, style, onPress, skala = 0.965, haptyka = true, zewn, ...rest }: PressableProps & { children: ReactNode; style?: StyleProp<ViewStyle>; skala?: number; haptyka?: boolean; zewn?: StyleProp<ViewStyle> }) {
  const s = useSharedValue(1);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Pressable {...rest} style={zewn}
      onPressIn={() => { s.set(withSpring(skala, SPREZYNA)); }}
      onPressOut={() => { s.set(withSpring(1, SPREZYNA)); }}
      onPress={e => { if (haptyka) Haptics.selectionAsync().catch(() => {}); onPress?.(e); }}>
      <Animated.View style={[style, st]}>{children}</Animated.View>
    </Pressable>
  );
}

/* duża ikona na ekranie sukcesu: wskakuje i zostawia rozchodzący się pierścień */
export function Pop({ children, kolor, size = 92 }: { children: ReactNode; kolor: string; size?: number }) {
  const p = useSharedValue(0);
  useEffect(() => { p.set(withDelay(250, withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), 2, false))); }, [p]);
  const fala = useAnimatedStyle(() => ({ opacity: interpolate(p.value, [0, 1], [0.5, 0]), transform: [{ scale: interpolate(p.value, [0, 1], [1, 1.8]) }] }));
  return (
    <Animated.View entering={ZoomIn.springify().damping(11).stiffness(160)} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: kolor }, fala]} />
      {children}
    </Animated.View>
  );
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
  useEffect(() => { p.set(withRepeat(withSequence(withTiming(1.25, { duration: 700 }), withTiming(1, { duration: 700 })), -1)); }, [p]);
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
