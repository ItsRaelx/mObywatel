/* Klawiatura PIN i kropki: ekran blokady, wprowadzenie i podpis PIN-em mObywatela. */
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import R, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Ikona } from '@/ui/elementy';

const KLAW = { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center' } as const;

export function Klawiatura({ onCyfra, onUsun, onBio, jasna }: { onCyfra: (c: string) => void; onUsun: () => void; onBio?: () => void; jasna?: boolean }) {
  const fg = jasna ? '#17181C' : '#fff', bg = jasna ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.14)';
  const k = (t: string) => (
    <Pressable key={t} onPress={() => { Haptics.selectionAsync().catch(() => {}); onCyfra(t); }} accessibilityLabel={t}
      style={({ pressed }) => [KLAW, { backgroundColor: pressed ? (jasna ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.3)') : bg }]}>
      <Text style={{ color: fg, fontSize: 30, fontWeight: '500' }}>{t}</Text>
    </Pressable>
  );
  return (
    <View style={{ width: 290, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 }}>
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(k)}
      {onBio ? <Pressable onPress={onBio} accessibilityLabel="Zaloguj biometrią" style={KLAW}><Ikona n="faceid" size={32} color={fg} /></Pressable> : <View style={KLAW} />}
      {k('0')}
      <Pressable onPress={onUsun} accessibilityLabel="Usuń cyfrę" style={KLAW}><Ikona n="back" size={28} color={fg} /></Pressable>
    </View>
  );
}
export function Kropki({ n, kolor = '#fff' }: { n: number; kolor?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 18 }}>
      {[0, 1, 2, 3].map(i => <Kropka key={i} pelna={i < n} kolor={kolor} />)}
    </View>
  );
}
function Kropka({ pelna, kolor }: { pelna: boolean; kolor: string }) {
  const s = useSharedValue(1);
  useEffect(() => { s.set(withTiming(pelna ? 1 : 0.9, { duration: 120 })); }, [pelna, s]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <R.View style={[{ width: 15, height: 15, borderRadius: 8, borderWidth: 2, borderColor: kolor, backgroundColor: pelna ? kolor : 'transparent' }, st]} />;
}

