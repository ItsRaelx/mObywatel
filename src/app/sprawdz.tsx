import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, useWindowDimensions, View } from 'react-native';

import { OSOBY, OSOBY_IDS } from '@/data/typy';
import { useApp } from '@/state/app';
import { Ekran, Grupa, Ikona, Karta, KodQR, Para, Portret, Przycisk, T } from '@/ui/elementy';

export default function Sprawdz() {
  const { os, k } = useApp(); const { width } = useWindowDimensions();
  const [tok] = useState(() => Math.floor(Math.random() * 90000) + 10000);
  const [wynik, setWynik] = useState<string | null>(null); const [left, setLeft] = useState(180);
  useEffect(() => { if (!wynik) return; const i = setInterval(() => setLeft(l => Math.max(0, l - 1)), 1000); return () => clearInterval(i); }, [wynik]);
  if (wynik) {
    const o = OSOBY[wynik];
    return (
      <Ekran>
        <Karta style={{ padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: k.okBg }}>
          <Ikona n="check" size={26} color={k.ok} /><View style={{ flex: 1 }}><T v="bodyB" c={k.ok}>Dokument ważny</T><T v="sub">Dane z mObywatela, potwierdzone biometrią</T></View>
        </Karta>
        <View style={{ alignItems: 'center', marginTop: 22 }}>
          <Portret id={o.id} w={120} h={150} r={18} />
          <T v="h2" style={{ marginTop: 12 }}>{o.imie} {o.nazwisko}</T>
        </View>
        <Grupa style={{ marginTop: 18 }}>
          <Para k="Data urodzenia" w={o.moje.data_urodzenia} />
          <Para k="Pełnoletność" w="tak" />
          <Para k="Dowód osobisty" w={o.moje.nr_dowodu} />
        </Grupa>
        <T v="sub" center style={{ marginTop: 14 }}>Dane znikną z ekranu za {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</T>
        <Przycisk tytul="Zakończ" style={{ marginTop: 18 }} onPress={() => router.back()} />
      </Ekran>
    );
  }
  return (
    <Ekran>
      <T v="body" c={k.ink2}>Pokaż ten kod drugiej osobie. Zeskanuje go w swoim mObywatelu i sama zdecyduje, czy udostępni Ci dane.</T>
      <Karta style={{ marginTop: 16, padding: 20, alignItems: 'center' }}>
        <View style={{ padding: 10, borderRadius: 20, backgroundColor: '#fff' }}><KodQR tekst={`MOBYWATEL:W:${tok}`} size={Math.min(width - 110, 270)} /></View>
        <T v="h2" style={{ marginTop: 12, letterSpacing: 2 }}>{String(tok).slice(0, 2)} {String(tok).slice(2)}</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}><ActivityIndicator color={k.acc} /><T v="sub">Czekam na dane…</T></View>
      </Karta>
      <Grupa style={{ marginTop: 16 }}>
        {[['qr', '1. Pokaż kod', 'Kod zmienia się co 30 sekund.'], ['phone', '2. Druga osoba skanuje', 'W swoim mObywatelu wybiera Kod QR → Zeskanuj kod.'], ['check', '3. Widzisz potwierdzone dane', 'Ze zdjęciem i informacją, czy dokument jest ważny.']].map(([i, t, o]) => (
          <View key={t} style={{ flexDirection: 'row', gap: 12, padding: 14, alignItems: 'center' }}><Ikona n={i} size={22} color={k.ink2} /><View style={{ flex: 1 }}><T v="bodyB">{t}</T><T v="sub">{o}</T></View></View>
        ))}
      </Grupa>
      <Pressable onPress={() => setWynik(OSOBY_IDS.find(i => i !== os.id) ?? 'jan')} style={{ alignItems: 'center', padding: 16 }}>
        <T v="sub" c={k.accInk} style={{ fontWeight: '700' }}>Pokaz: zasymuluj odpowiedź drugiej osoby</T>
      </Pressable>
    </Ekran>
  );
}
