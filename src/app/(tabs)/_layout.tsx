import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/state/app';
import { Ikona } from '@/ui/elementy';
import { SPREZYNA } from '@/ui/ruch';

const ZAKLADKI: Record<string, [string, string]> = { index: ['Start', 'home'], dokumenty: ['Dokumenty', 'wallet'], uslugi: ['Usługi', 'grid'], wiecej: ['Więcej', 'more'] };
const POZYCJA = [0, 1, 3, 4]; // kolumny paska (środek zajmuje przycisk QR)

function Zakladka({ name, on, onPress, badge }: { name: string; on: boolean; onPress: () => void; badge: number }) {
  const { k } = useApp(); const [t, ik] = ZAKLADKI[name];
  const s = useSharedValue(1);
  useEffect(() => { if (on) s.set(withSequence(withTiming(0.92, { duration: 80 }), withSpring(1, { damping: 14, stiffness: 260 }))); }, [on, s]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const c = on ? k.accInk : k.ink3;
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={t} onPress={onPress} style={st_.tab}>
      <Animated.View style={[st_.ikona, st]}><Ikona n={ik} size={24} color={c} sw={on ? 2 : 1.75} /></Animated.View>
      <Text style={{ fontSize: 11, fontWeight: on ? '700' : '600', color: c, marginTop: 2 }}>{t}</Text>
      {badge ? <View style={[st_.badge, { backgroundColor: k.acc, borderColor: k.tab }]}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{badge}</Text></View> : null}
    </Pressable>
  );
}

function Pasek({ state, navigateToTab }: BottomTabBarProps) {
  const { k, skrzynka, przeczytane, log } = useApp(); const ins = useSafeAreaInsets();
  const [szer, setSzer] = useState(0);
  const x = useSharedValue(0), q = useSharedValue(1);
  const kol = szer / 5;
  useEffect(() => { if (kol) x.set(withSpring(POZYCJA[state.index] * kol + kol / 2 - 28, SPREZYNA)); }, [state.index, kol, x]);
  const wsk = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const qs = useAnimatedStyle(() => ({ transform: [{ scale: q.value }] }));
  const nowe = skrzynka.filter(m => m.nowe && !przeczytane.includes(m.id)).length + (log.some(z => z.typ === 'alert' && !z.zgl && !z.zablok && !z.potw) ? 1 : 0);
  const zak = (i: number) => {
    const r = state.routes[i];
    return <Zakladka key={r.key} name={r.name} on={state.index === i} badge={r.name === 'wiecej' ? nowe : 0}
      onPress={() => { Haptics.selectionAsync().catch(() => {}); navigateToTab(r.key); }} />;
  };
  return (
    <View onLayout={(e: LayoutChangeEvent) => setSzer(e.nativeEvent.layout.width)} style={[st_.pasek, { paddingBottom: Math.max(ins.bottom, 8), backgroundColor: k.tab, borderTopColor: k.hair }]}>
      {kol ? <Animated.View style={[st_.wsk, { backgroundColor: k.accBg }, wsk]} /> : null}
      {zak(0)}{zak(1)}
      <Pressable accessibilityRole="button" accessibilityLabel="Kod QR: pokaż albo zeskanuj"
        onPressIn={() => { q.set(withSpring(0.88, SPREZYNA)); }} onPressOut={() => { q.set(withSpring(1, { damping: 8, stiffness: 240 })); }}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); router.push('/kod-qr'); }} style={st_.tab}>
        <Animated.View style={[st_.qr, { backgroundColor: k.acc, borderColor: k.bg }, qs]}><Ikona n="qr" size={28} color="#fff" sw={2} /></Animated.View>
        <Text style={{ fontSize: 11, fontWeight: '700', color: k.ink, marginTop: 2 }}>Kod QR</Text>
      </Pressable>
      {zak(2)}{zak(3)}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={p => <Pasek {...p} />} screenOptions={{ headerShown: false, animation: 'shift' }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="dokumenty" />
      <Tabs.Screen name="uslugi" />
      <Tabs.Screen name="wiecej" />
    </Tabs>
  );
}

const st_ = StyleSheet.create({
  pasek: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, alignItems: 'center' },
  ikona: { width: 56, height: 32, alignItems: 'center', justifyContent: 'center' },
  wsk: { position: 'absolute', top: 6, left: 0, width: 56, height: 32, borderRadius: 16 },
  qr: { width: 58, height: 58, borderRadius: 20, marginTop: -24, alignItems: 'center', justifyContent: 'center', borderWidth: 4, shadowColor: '#A00A28', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  badge: { position: 'absolute', top: -2, left: '55%', minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
});
