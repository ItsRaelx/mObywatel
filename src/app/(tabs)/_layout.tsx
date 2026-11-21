import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/state/app';
import { Ikona } from '@/ui/elementy';

const ZAKLADKI: Record<string, [string, string]> = { index: ['Start', 'home'], dokumenty: ['Dokumenty', 'wallet'], uslugi: ['Usługi', 'grid'], wiecej: ['Więcej', 'more'] };

function Pasek({ state, navigateToTab }: BottomTabBarProps) {
  const { k, skrzynka, przeczytane, log } = useApp(); const ins = useSafeAreaInsets();
  const nowe = skrzynka.filter(m => m.nowe && !przeczytane.includes(m.id)).length + (log.some(x => x.typ === 'alert' && !x.zgl && !x.zablok && !x.potw) ? 1 : 0);
  const przycisk = (name: string, i: number) => {
    const on = state.index === i, [t, ik] = ZAKLADKI[name], c = on ? k.accInk : k.ink3;
    return (
      <Pressable key={name} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={t}
        onPress={() => { Haptics.selectionAsync().catch(() => {}); navigateToTab(state.routes[i].key); }}
        style={st.tab}>
        <View style={[st.pigu, on && { backgroundColor: k.accBg }]}><Ikona n={ik} size={24} color={c} sw={on ? 2 : 1.75} /></View>
        <Text style={{ fontSize: 11, fontWeight: '600', color: c, marginTop: 2 }}>{t}</Text>
        {name === 'wiecej' && nowe ? <View style={[st.badge, { backgroundColor: k.acc, borderColor: k.tab }]}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{nowe}</Text></View> : null}
      </Pressable>
    );
  };
  const nazwy = state.routes.map(r => r.name);
  return (
    <View style={[st.pasek, { paddingBottom: Math.max(ins.bottom, 8), backgroundColor: k.tab, borderTopColor: k.hair }]}>
      {przycisk(nazwy[0], 0)}{przycisk(nazwy[1], 1)}
      <Pressable accessibilityRole="button" accessibilityLabel="Kod QR: pokaż albo zeskanuj" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); router.push('/kod-qr'); }} style={st.tab}>
        <View style={[st.qr, { backgroundColor: k.acc, borderColor: k.bg }]}><Ikona n="qr" size={28} color="#fff" sw={2} /></View>
        <Text style={{ fontSize: 11, fontWeight: '700', color: k.ink, marginTop: 2 }}>Kod QR</Text>
      </Pressable>
      {przycisk(nazwy[2], 2)}{przycisk(nazwy[3], 3)}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={p => <Pasek {...p} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="dokumenty" />
      <Tabs.Screen name="uslugi" />
      <Tabs.Screen name="wiecej" />
    </Tabs>
  );
}

const st = StyleSheet.create({
  pasek: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, alignItems: 'center' },
  pigu: { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  qr: { width: 58, height: 58, borderRadius: 20, marginTop: -24, alignItems: 'center', justifyContent: 'center', borderWidth: 4, shadowColor: '#A00A28', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  badge: { position: 'absolute', top: -2, left: '55%', minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
});
