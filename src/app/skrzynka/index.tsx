import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useApp } from '@/state/app';
import { Ekran, Grupa, IkonaKafel, Pill, T } from '@/ui/elementy';

export default function Skrzynka() {
  const { os, k, skrzynka, przeczytane } = useApp(); const [f, setF] = useState<'all' | 'act'>('all');
  const L = skrzynka.filter(m => f === 'all' || m.pilne);
  return (
    <Ekran>
      <T v="sub" style={{ marginBottom: 14 }}>Pisma z urzędów przez e-Doręczenia. Mają moc listu poleconego. Adres: AE:PL-{os.moje.pesel.slice(0, 5)}-{os.moje.pesel.slice(5, 10)}-XQ</T>
      <View style={{ flexDirection: 'row', backgroundColor: k.surface2, borderRadius: 14, padding: 4, marginBottom: 14 }}>
        {([['all', 'Wszystkie'], ['act', 'Wymagają działania']] as const).map(([id, t]) => (
          <Pressable key={id} onPress={() => setF(id)} style={{ flex: 1, paddingVertical: 9, borderRadius: 11, alignItems: 'center', backgroundColor: f === id ? k.surface : 'transparent' }}><T v="sub" c={f === id ? k.ink : k.ink2} style={{ fontWeight: '700' }}>{t}</T></Pressable>
        ))}
      </View>
      <Grupa>
        {L.map(m => { const nowe = m.nowe && !przeczytane.includes(m.id); return (
          <Pressable key={m.id} onPress={() => router.push(`/skrzynka/${m.id}`)} style={({ pressed }) => [{ flexDirection: 'row', gap: 12, padding: 14 }, pressed && { backgroundColor: k.surface2 }]}>
            <View><IkonaKafel n="mail" />{nowe ? <View style={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: k.acc, borderWidth: 2, borderColor: k.surface }} /> : null}</View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}><T v="small" n={1} style={{ flex: 1, fontWeight: '600' }}>{m.od}</T><T v="small">{m.kiedy}</T></View>
              <T v="bodyB" style={{ fontWeight: nowe ? '800' : '600', marginTop: 1 }}>{m.t}</T>
              <T v="sub" n={2} style={{ marginTop: 2 }}>{m.skrot[0]}</T>
              {m.pilne ? <View style={{ flexDirection: 'row', marginTop: 8 }}><Pill t={m.pilne} ton="r" ik="clock" /></View> : null}
            </View>
          </Pressable>
        ); })}
      </Grupa>
      {!L.length ? <T v="sub" center style={{ marginTop: 20 }}>Nic, co wymaga działania. Wszystko załatwione.</T> : null}
    </Ekran>
  );
}
