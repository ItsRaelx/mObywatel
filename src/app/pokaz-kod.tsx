import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ZAKRESY } from '@/data/zakresy';
import { useApp } from '@/state/app';
import { Ikona, Karta, KodQR, Portret, T } from '@/ui/elementy';
import { Pasek } from '@/ui/ruch';

const WSZYSTKIE = ['Imię i nazwisko', 'Data urodzenia', 'PESEL', 'Numer dowodu', 'Adres'];

export default function PokazKod() {
  const { zakres } = useLocalSearchParams<{ zakres?: string }>();
  const { os, k } = useApp(); const { width } = useWindowDimensions();
  const dost = ZAKRESY.filter(z => z.id !== 'ulga' || os.docs.some(d => d.id === 'leg' || d.id === 'kdr')).filter(z => z.id !== 'prawo_jazdy' || os.docs.some(d => d.id === 'pj'));
  const [wyb, setWyb] = useState(dost.find(z => z.id === zakres)?.id ?? 'tozsamosc');
  const [tok, setTok] = useState(() => Math.floor(Math.random() * 90000) + 10000); const [left, setLeft] = useState(30);
  useEffect(() => { const i = setInterval(() => setLeft(l => { if (l <= 1) { setTok(Math.floor(Math.random() * 90000) + 10000); return 30; } return l - 1; }), 1000); return () => clearInterval(i); }, []);
  const z = dost.find(x => x.id === wyb)!; const pola = z.pola(os);
  const ukryte = WSZYSTKIE.filter(n => !pola.some(p => p[0] === n || (n === 'Numer dowodu' && p[0] === 'Numer dowodu')));
  const size = Math.min(width - 96, 300);
  const tekst = useMemo(() => `MOBYWATEL:Z:${tok}:${wyb}`, [tok, wyb]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: k.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
      <T v="cap" style={{ marginLeft: 4, marginBottom: 8 }}>Co chcesz pokazać?</T>
      <View style={{ flexDirection: 'row', backgroundColor: k.surface2, borderRadius: 14, padding: 4 }}>
        {dost.map(x => (
          <Pressable key={x.id} onPress={() => setWyb(x.id)} accessibilityState={{ selected: x.id === wyb }} style={{ flex: 1, paddingVertical: 9, borderRadius: 11, backgroundColor: x.id === wyb ? k.surface : 'transparent', alignItems: 'center' }}>
            <T v="sub" c={x.id === wyb ? k.ink : k.ink2} style={{ fontWeight: '700' }}>{x.t}</T>
          </Pressable>
        ))}
      </View>

      <Karta style={{ marginTop: 16, padding: 20, alignItems: 'center' }}>
        <Animated.View key={tekst} entering={FadeIn.duration(450)} style={{ padding: 10, borderRadius: 20, backgroundColor: '#fff' }}><KodQR tekst={tekst} size={size} /></Animated.View>
        <T v="h2" style={{ marginTop: 12, letterSpacing: 2, fontVariant: ['tabular-nums'] }}>{String(tok).slice(0, 2)} {String(tok).slice(2)}</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <Ikona n="clock" size={15} color={k.ink2} /><T v="sub">Nowy kod za {left} s</T>
        </View>
        <View style={{ alignSelf: 'stretch', marginTop: 12 }}><Pasek f={left / 30} kolor={left <= 5 ? k.acc : k.ink3} tlo={k.surface2} h={4} /></View>
      </Karta>

      <Karta style={{ marginTop: 14, padding: 16 }}>
        <T v="bodyB">Osoba sprawdzająca zobaczy</T>
        <View style={{ flexDirection: 'row', gap: 14, marginTop: 12, alignItems: 'flex-start' }}>
          <Portret id={os.id} w={56} h={70} r={10} />
          <View style={{ flex: 1, gap: 8 }}>
            {pola.filter(p => p[0] !== 'Zdjęcie').map(([a, b]) => (
              <View key={a}><T v="small">{a}</T><T v="bodyB">{b}</T></View>
            ))}
          </View>
        </View>
        {ukryte.length ? (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: k.hair }}>
            <Ikona n="lock" size={17} color={k.ink2} />
            <T v="sub" style={{ flex: 1 }}>Nie zobaczy: {ukryte.map(n => (n === 'PESEL' ? n : n.toLowerCase())).join(', ')}.</T>
          </View>
        ) : null}
      </Karta>
      <T v="small" center style={{ marginTop: 14, paddingHorizontal: 20 }}>Pokaż ten ekran osobie, która sprawdza dokument. Skanuje go swoją aplikacją mObywatel albo mWeryfikator.</T>
    </ScrollView>
  );
}
