import { useState } from 'react';
import { View } from 'react-native';

import { useApp } from '@/state/app';
import { Przelacznik, Ekran, Grupa, Ikona, Karta, Sekcja, T } from '@/ui/elementy';

export default function Alerty() {
  const { os, k } = useApp(); const [woj, setWoj] = useState(true); const [lok, setLok] = useState(false);
  return (
    <Ekran>
      <T v="body" c={k.ink2} style={{ marginBottom: 16 }}>Ostrzeżenia Rządowego Centrum Bezpieczeństwa dla miejsca, w którym mieszkasz: {os.sc.miasto}.</T>
      <View style={{ gap: 10 }}>
        {os.rcb.map(r => (
          <Karta key={r[0]} style={{ padding: 14, flexDirection: 'row', gap: 12, backgroundColor: r[3] ? k.warnBg : k.surface }}>
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: r[3] ? k.warn : k.surface2, alignItems: 'center', justifyContent: 'center' }}><Ikona n={r[3] ? 'alert' : 'megaphone'} size={21} color={r[3] ? '#fff' : k.ink} /></View>
            <View style={{ flex: 1 }}><T v="small">{r[0]}</T><T v="bodyB">{r[1]}</T><T v="sub" style={{ marginTop: 3 }}>{r[2]}</T></View>
          </Karta>
        ))}
      </View>
      <Sekcja tytul="Gdzie chcesz dostawać alerty?">
        <Grupa>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }}><View style={{ flex: 1 }}><T v="bodyB">Moje województwo</T><T v="sub">Według adresu zameldowania</T></View><Przelacznik value={woj} onValueChange={setWoj} /></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }}><View style={{ flex: 1 }}><T v="bodyB">Tam, gdzie jestem</T><T v="sub">Gdy podróżujesz po Polsce</T></View><Przelacznik value={lok} onValueChange={setLok} /></View>
        </Grupa>
      </Sekcja>
      <T v="small" center style={{ marginTop: 16 }}>W prototypie alerty są fikcyjne.</T>
    </Ekran>
  );
}
