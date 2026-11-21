import { View } from 'react-native';

import { useApp } from '@/state/app';
import { potwierdz } from '@/ui/potwierdzenie';
import { Ekran, Grupa, IkonaKafel, Karta, Przycisk, Sekcja, T } from '@/ui/elementy';

export default function Platnosci() {
  const { os, k, zaplacone, historia, zmien, toast } = useApp();
  const doZap = os.sc.pay.filter(p => !zaplacone.includes(p.title));
  const termin = (rows: [string, string][]) => rows.find(r => /termin/i.test(r[0]))?.[1];
  const zaplac = async (t: string, kw: string) => {
    if (!(await potwierdz(`Zapłać ${kw}`, 'faceid'))) return;
    zmien(s => ({ zaplacone: [...s.zaplacone, t], historia: [['18.10', t, kw, 'EP/2026/7 2' + String(Date.now()).slice(-5)], ...s.historia] }));
    toast(`Zapłacono ${kw}`);
  };
  return (
    <Ekran>
      <T v="body" c={k.ink2}>Podatki lokalne, mandaty i opłaty urzędowe. Bez przepisywania numeru konta.</T>
      <Sekcja tytul="Do zapłaty">
        {doZap.length ? <View style={{ gap: 12 }}>{doZap.map(p => (
          <Karta key={p.title} style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <IkonaKafel n="receipt" akcent />
              <View style={{ flex: 1 }}><T v="bodyB">{p.title}</T><T v="sub">{p.source.replace('ePłatności, ', '')}{termin(p.rows) ? ` · do ${termin(p.rows)}` : ''}</T></View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <T v="h2">{p.kwota}</T>
              <Przycisk tytul="Zapłać" ik="faceid" maly onPress={() => zaplac(p.title, p.kwota)} />
            </View>
          </Karta>
        ))}</View> : <Karta style={{ padding: 22, alignItems: 'center' }}><T v="h3">Wszystko opłacone</T><T v="sub" center style={{ marginTop: 4 }}>Nowe należności pojawią się tu same.</T></Karta>}
      </Sekcja>
      <Sekcja tytul="Historia">
        <Grupa>{historia.map((h, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
            <IkonaKafel n="ok" />
            <View style={{ flex: 1 }}><T v="bodyB">{h[1]}</T><T v="sub">{h[0]} · {h[3]}</T></View>
            <T v="bodyB" style={{ fontVariant: ['tabular-nums'] }}>{h[2]}</T>
          </View>
        ))}</Grupa>
      </Sekcja>
      <T v="small" center style={{ marginTop: 16 }}>Płacisz BLIK-iem albo kartą. Potwierdzenie trafia do historii od razu.</T>
    </Ekran>
  );
}
