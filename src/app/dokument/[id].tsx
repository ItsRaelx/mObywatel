import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { autoSvg } from '@/lib/grafika';
import { useApp } from '@/state/app';
import { Ekran, Grupa, Ikona, Karta, Para, Przycisk, Sekcja, T, Wiersz } from '@/ui/elementy';
import { KartaDokumentu, Tablica } from '@/ui/karta';

const AKCJE: Record<string, [string, string, string][]> = {
  dowod: [['qr', 'Pokaż kod', '/pokaz-kod?zakres=tozsamosc'], ['shield', 'Zastrzeż PESEL', '/usluga/zastrzez-pesel'], ['alert', 'Zgubiony dowód', '/usluga/zgubiony-dowod']],
  pj: [['qr', 'Pokaż kod', '/pokaz-kod?zakres=prawo_jazdy'], ['clock', 'Punkty karne', '/usluga/punkty'], ['id', 'Wymiana', '/usluga/prawo-jazdy']],
  auto: [['clock', 'OC i badanie', '/usluga/oc-badanie'], ['swap', 'Sprzedaż auta', '/usluga/zbycie'], ['car', 'mStłuczka', '/usluga/mstluczka']],
  kdr: [['qr', 'Pokaż kod', '/pokaz-kod?zakres=ulga'], ['coin', 'Zniżki', '/usluga/kdr']],
  leg: [['qr', 'Pokaż kod', '/pokaz-kod?zakres=ulga'], ['coin', 'Ulgi', '/usluga/ulgi-studenta']],
};
const DANE_DOK: Record<string, string[]> = { dowod: ['PESEL', 'Dowód osobisty', 'Imię i nazwisko', 'Pełnoletność', 'Zdjęcie'], pj: ['Prawo jazdy', 'Punkty karne'], auto: ['OC pojazdu', 'Dane pojazdu'], leg: ['Status studenta', 'Ważność legitymacji'], kdr: [] };

function Zegar() {
  const [t, setT] = useState(new Date()); const { k } = useApp();
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return <T v="small" center style={{ marginTop: 10, fontVariant: ['tabular-nums'] }} c={k.ink2}>Sprawdzono w rejestrze · {t.toLocaleTimeString('pl-PL')} {t.toLocaleDateString('pl-PL')}</T>;
}

export default function Dok() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { os, k, log } = useApp(); const { width } = useWindowDimensions();
  const d = os.docs.find(x => x.id === id); const [ukryte, setUkryte] = useState(id === 'dowod');
  if (!d) return <Ekran tytul="Nie znaleziono dokumentu"><T>Ten dokument nie jest w Twoim portfelu.</T></Ekran>;
  const w = Math.min(width - 32, 440);
  const widzieli = log.filter(x => x.dane.some(z => (DANE_DOK[d.id] ?? []).includes(z))).slice(0, 3);
  const auta = d.plate ? [{ plate: d.plate, model: d.model!, kolor: d.kolor! }, ...(d.more ?? [])] : [];

  return (
    <Ekran>
      <Stack.Screen options={{ title: d.name }} />
      <Animated.View entering={ZoomIn.duration(450).springify().damping(16)}><KartaDokumentu d={d} os={os} w={w} ukryte={ukryte} hologram onQR={() => router.push('/pokaz-kod?zakres=tozsamosc')} onPokaz={() => setUkryte(false)} /></Animated.View>
      <Zegar />

      <Karta style={{ marginTop: 14, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: d.alert ? k.accBg : k.okBg }}>
        <Ikona n={d.alert ? 'alert' : 'check'} size={28} color={d.alert ? k.accInk : k.ok} />
        <View style={{ flex: 1 }}>
          <T v="bodyB" c={d.alert ? k.accInk : k.ok}>{d.alert ?? 'Dokument ważny'}</T>
          <T v="sub">{d.sub}</T>
        </View>
      </Karta>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
        {(AKCJE[d.id] ?? []).map(([ik, t, tr], i) => (
          <Pressable key={t} onPress={() => router.push(tr as never)} accessibilityRole="button" style={{ flex: 1, alignItems: 'center', gap: 7 }}>
            <View style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: i === 0 ? k.acc : k.surface, alignItems: 'center', justifyContent: 'center', borderWidth: k.dark && i ? 1 : 0, borderColor: k.hair }}>
              <Ikona n={ik} size={25} color={i === 0 ? '#fff' : k.ink} />
            </View>
            <T v="small" c={k.ink} center style={{ fontWeight: '600' }}>{t}</T>
          </Pressable>
        ))}
      </View>

      {auta.length ? (
        <Sekcja tytul={auta.length > 1 ? 'Twoje pojazdy' : 'Pojazd'}>
          <View style={{ gap: 12 }}>
            {auta.map(a => (
              <Karta key={a.plate} style={{ padding: 14 }}>
                <SvgXml xml={autoSvg(a.model, a.kolor)} width="100%" height={(w - 28) * 0.42} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <Tablica nr={a.plate} s={0.95} />
                  <T v="bodyB" style={{ flex: 1 }}>{a.model}</T>
                </View>
              </Karta>
            ))}
          </View>
        </Sekcja>
      ) : null}

      <Sekcja tytul="Dane dokumentu" akcja={d.id === 'dowod' ? (ukryte ? 'Pokaż dane' : 'Ukryj') : undefined} onAkcja={() => setUkryte(!ukryte)}>
        <Grupa>{d.rows.map(([a, b]) => <Para key={a} k={a} w={ukryte && d.id === 'dowod' && a !== 'Imię' ? '••••••' : b} />)}</Grupa>
        {ukryte && d.id === 'dowod' ? <Przycisk tytul="Pokaż dane" ik="eye" rodzaj="drugi" maly style={{ marginTop: 10 }} onPress={() => setUkryte(false)} /> : null}
      </Sekcja>

      {widzieli.length ? (
        <Sekcja tytul="Kto ostatnio sprawdzał" akcja="Wszystko" onAkcja={() => router.push('/prywatnosc')}>
          <Grupa>{widzieli.map(x => <Wiersz key={x.id} ik={x.typ === 'alert' ? 'alert' : x.typ === 'urzad' ? 'gov' : x.typ === 'ty' ? 'user' : 'brief'} ikAkcent={x.typ === 'alert'} tytul={x.kto} opis={`${x.co} · ${x.kiedy}`} onPress={() => router.push('/prywatnosc')} />)}</Grupa>
        </Sekcja>
      ) : null}
    </Ekran>
  );
}
