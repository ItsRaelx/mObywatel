import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Switch, View } from 'react-native';

import { useApp } from '@/state/app';
import { Ekran, Ikona, Karta, Notka, Pill, T } from '@/ui/elementy';

export default function SprawaEkran() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { k, sprawy } = useApp(); const s = sprawy.find(x => x.id === id); const [pow, setPow] = useState(true);
  if (!s) return <Ekran><T>Nie znaleziono sprawy.</T></Ekran>;
  const koniec = s.steps.every(x => x[2] === 2);
  return (
    <Ekran>
      <Stack.Screen options={{ title: s.t }} />
      <T v="sub">{s.s}</T>
      <T v="h1" style={{ fontSize: 28, marginTop: 4 }}>{s.t}</T>
      <View style={{ flexDirection: 'row', marginTop: 10 }}><Pill t={s.eta} ton={koniec ? 'g' : 'n'} ik={koniec ? 'ok' : 'clock'} /></View>
      <Karta style={{ marginTop: 18, padding: 18 }}>
        {s.steps.map((x, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 14, minHeight: 58 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: x[2] === 2 ? k.acc : k.surface2, borderWidth: x[2] === 1 ? 3 : 0, borderColor: k.acc }}>
                {x[2] === 2 ? <Ikona n="ok" size={16} color="#fff" sw={2.6} /> : x[2] === 1 ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: k.acc }} /> : null}
              </View>
              {i < s.steps.length - 1 ? <View style={{ flex: 1, width: 2, backgroundColor: x[2] === 2 ? k.acc : k.hair, marginVertical: 3 }} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: 14 }}>
              <T v="bodyB" c={x[2] === 0 ? k.ink3 : k.ink}>{x[0]}</T>
              {x[1] ? <T v="sub">{x[1]}</T> : null}
            </View>
          </View>
        ))}
      </Karta>
      <Notka ik="bell">{s.note}</Notka>
      <Karta style={{ marginTop: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}><T v="bodyB">Powiadom mnie o zmianie</T><T v="sub">Powiadomienie w telefonie</T></View>
        <Switch value={pow} onValueChange={setPow} trackColor={{ true: k.acc, false: k.surface2 }} />
      </Karta>
    </Ekran>
  );
}
