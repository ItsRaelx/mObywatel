import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { useApp } from '@/state/app';
import { potwierdz } from '@/ui/potwierdzenie';
import { Ekran, Grupa, Ikona, Karta, Notka, Para, Portret, Przycisk, T } from '@/ui/elementy';
import { ZAKRESY } from '@/data/zakresy';

/* Kto prosi o dane. W makiecie odbiorca wynika z kodu (fikcyjne podmioty). */
const ODBIORCY = [
  { kto: 'Jedź24 Wypożyczalnia Samochodów', gdzie: 'Strona internetowa', ik: 'pc', zakres: 'prawo_jazdy' },
  { kto: 'Sklep Pod Kasztanem, kasa 2', gdzie: 'Kasa samoobsługowa', ik: 'receipt', zakres: 'pelnoletnosc' },
  { kto: 'Urząd Pocztowy, okienko 3', gdzie: 'Odbiór przesyłki', ik: 'gov', zakres: 'tozsamosc' },
];

export default function Potwierdz() {
  const { kod = '00000' } = useLocalSearchParams<{ kod: string }>();
  const { os, k, zmien } = useApp(); const [gotowe, setGotowe] = useState(false);
  const o = ODBIORCY[Number(kod) % 3]; const z = ZAKRESY.find(x => x.id === o.zakres)!; const pola = z.pola(os);
  const udostepnij = async () => {
    if (!(await potwierdz('Przekazanie danych', 'pin'))) return;
    zmien(s => ({ log: [{ id: 'n' + Date.now(), kiedy: 'Przed chwilą', kto: o.kto, typ: 'ty', co: 'Udostępnienie: ' + z.t.toLowerCase(), dane: pola.map(p => p[0]), jak: 'Kodem QR, za Twoją zgodą potwierdzoną biometrią.' }, ...s.log] }));
    setGotowe(true);
  };
  if (gotowe) return (
    <Ekran>
      <View style={{ alignItems: 'center', paddingVertical: 30 }}>
        <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: k.okBg, alignItems: 'center', justifyContent: 'center' }}><Ikona n="ok" size={46} color={k.ok} sw={2.4} /></View>
        <T v="h1" style={{ marginTop: 16, fontSize: 28 }}>Dane przekazane</T>
        <T v="sub" center style={{ marginTop: 6 }}>{o.kto}{'\n'}godz. {new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</T>
      </View>
      <Grupa>{pola.map(([a]) => <Para key={a} k={a} w="✓ przekazano" />)}</Grupa>
      <Notka ik="eye">Ten wpis znajdziesz w Centrum prywatności.</Notka>
      <Przycisk tytul="Gotowe" style={{ marginTop: 20 }} onPress={() => router.back()} />
    </Ekran>
  );
  return (
    <Ekran>
      <Karta style={{ padding: 16, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: k.surface2, alignItems: 'center', justifyContent: 'center' }}><Ikona n={o.ik} size={26} /></View>
        <View style={{ flex: 1 }}>
          <T v="sub">{o.gdzie} prosi o dane</T>
          <T v="h3">{o.kto}</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}><Ikona n="check" size={14} color={k.ok} /><T v="small" c={k.ok} style={{ fontWeight: '600' }}>Odbiorca zweryfikowany</T></View>
        </View>
      </Karta>
      <T v="cap" style={{ marginTop: 22, marginBottom: 8, marginLeft: 4 }}>Zobaczy tylko te dane</T>
      <Karta style={{ padding: 16, flexDirection: 'row', gap: 14 }}>
        <Portret id={os.id} w={60} h={76} r={10} />
        <View style={{ flex: 1, gap: 8 }}>{pola.filter(p => p[0] !== 'Zdjęcie').map(([a, b]) => <View key={a}><T v="small">{a}</T><T v="bodyB">{b}</T></View>)}</View>
      </Karta>
      <Notka ik="lock">Dane przekażemy jednorazowo. Odbiorca nie dostanie dostępu do niczego więcej.</Notka>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
        <Przycisk tytul="Odmów" rodzaj="drugi" style={{ flex: 1 }} onPress={() => router.back()} />
        <Przycisk tytul="Udostępnij" ik="key" style={{ flex: 1.6 }} onPress={udostepnij} />
      </View>
    </Ekran>
  );
}
