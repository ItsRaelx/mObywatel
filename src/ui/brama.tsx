import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import R, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OSOBY, OSOBY_IDS } from '@/data/typy';
import { biometria, useApp } from '@/state/app';
import { Klawiatura, Kropki, trzes } from '@/ui/klawiatura';
import { potwierdz } from '@/ui/potwierdzenie';
import { Avatar, Ikona, LogoBiale, Portret, Przycisk } from '@/ui/elementy';

/* ---------- ekran blokady ---------- */
export function Blokada() {
  const { os, pin, odblokuj, k, ustaw } = useApp(); const ins = useSafeAreaInsets();
  const [p, setP] = useState(''); const [msg, setMsg] = useState('Wpisz PIN, aby otworzyć aplikację');
  const blad = useState(() => new Animated.Value(0))[0];
  const bio = async () => { if (await biometria('Zaloguj się do mObywatela')) odblokuj(); };
  useEffect(() => { if (Platform.OS !== 'web') LocalAuthentication.isEnrolledAsync().then(e => { if (e) bio(); }).catch(() => {}); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const cyfra = (c: string) => {
    if (p.length >= 4) return; const n = p + c; setP(n);
    if (n.length === 4) setTimeout(() => { if (n === pin) odblokuj(); else { trzes(blad); setMsg('Nieprawidłowy PIN. Spróbuj jeszcze raz.'); setP(''); } }, 150);
  };
  return (
    <LinearGradient colors={k.hero} style={[StyleSheet.absoluteFill, { paddingTop: ins.top + 30, paddingBottom: ins.bottom + 20, alignItems: 'center' }]}>
      <LogoBiale w={150} />
      <R.View entering={FadeInDown.delay(150).duration(500)} style={{ marginTop: 26, alignItems: 'center' }}>
        <R.View entering={FadeIn.delay(150).duration(300)}><Avatar id={os.id} size={80} ramka="#fff" /></R.View>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 12 }}>Cześć, {os.wolacz}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 15, marginTop: 4 }}>{msg}</Text>
      </R.View>
      <View style={{ marginTop: 26, marginBottom: 'auto' }}><Kropki n={p.length} blad={blad} /></View>
      <R.View entering={FadeInUp.delay(300).duration(500)}><Klawiatura onCyfra={cyfra} onUsun={() => setP(p.slice(0, -1))} onBio={Platform.OS === 'web' ? undefined : bio} /></R.View>
      <Pressable onPress={() => ustaw({ wprowadzenie: false, pin: null })} style={{ marginTop: 18, padding: 6 }}>
        <Text style={{ color: '#fff', opacity: 0.9, fontWeight: '600' }}>Nie pamiętasz PIN-u? Ustaw nowy</Text>
      </Pressable>
    </LinearGradient>
  );
}

/* ---------- wprowadzenie przy pierwszym uruchomieniu ---------- */
const SLAJDY = [
  { ik: 'wallet', t: 'Dokumenty zawsze przy Tobie', o: 'mDowód, prawo jazdy i dane pojazdów w telefonie. W Polsce ważne tak samo jak plastikowe.' },
  { ik: 'grid', t: 'Sprawy bez kolejki', o: 'Zastrzeżesz PESEL, zameldujesz się, zapłacisz podatek i odbierzesz pisma z urzędów. Wszystko w kilku krokach.' },
  { ik: 'shield', t: 'Ty decydujesz, co pokazujesz', o: 'W sklepie pokażesz tylko pełnoletność, bez PESEL i adresu. Zobaczysz też, kto i kiedy sprawdzał Twoje dane.' },
];
export function Wprowadzenie() {
  const { ustaw, k, osobaId, odblokuj } = useApp(); const ins = useSafeAreaInsets();
  const [krok, setKrok] = useState(0); const [wybor, setWybor] = useState(osobaId);
  const [p1, setP1] = useState(''); const [p2, setP2] = useState(''); const [pierwszy, setPierwszy] = useState<string | null>(null);
  const blad = useState(() => new Animated.Value(0))[0];
  const dalej = () => setKrok(krok + 1);

  if (krok < 3) {
    const s = SLAJDY[krok];
    return (
      <LinearGradient colors={k.hero} style={[StyleSheet.absoluteFill, { paddingTop: ins.top + 16, paddingBottom: ins.bottom + 20, paddingHorizontal: 24 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <LogoBiale w={132} />
          <Pressable onPress={() => setKrok(3)} hitSlop={12}><Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Pomiń</Text></Pressable>
        </View>
        <R.View key={krok} entering={FadeIn.duration(260)} style={{ flex: 1, justifyContent: 'center' }}>
          <R.View entering={FadeIn.delay(80).duration(300)} style={{ width: 120, height: 120, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
            <Ikona n={s.ik} size={62} color="#fff" sw={1.5} />
          </R.View>
          <R.Text entering={FadeInDown.delay(180).duration(450)} style={{ color: '#fff', fontSize: 34, lineHeight: 39, fontWeight: '800', letterSpacing: -0.6 }}>{s.t}</R.Text>
          <R.Text entering={FadeInDown.delay(260).duration(450)} style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, lineHeight: 26, marginTop: 14 }}>{s.o}</R.Text>
        </R.View>
        <View style={{ flexDirection: 'row', gap: 7, marginBottom: 22 }}>
          {SLAJDY.map((_, i) => <R.View key={i + '-' + (i === krok)} entering={FadeIn.duration(300)} style={{ height: 7, width: i === krok ? 26 : 7, borderRadius: 4, backgroundColor: i === krok ? '#fff' : 'rgba(255,255,255,0.4)' }} />)}
        </View>
        <Pressable onPress={dalej} style={({ pressed }) => [st.biały, pressed && { opacity: 0.85 }]}><Text style={{ color: '#B00F30', fontSize: 17, fontWeight: '800' }}>{krok < 2 ? 'Dalej' : 'Zaczynamy'}</Text></Pressable>
      </LinearGradient>
    );
  }
  if (krok === 3) {
    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: k.bg }]}>
        <ScrollView contentContainerStyle={{ paddingTop: ins.top + 28, paddingHorizontal: 20, paddingBottom: ins.bottom + 120 }}>
          <Text style={{ color: k.ink, fontSize: 30, fontWeight: '800', letterSpacing: -0.5 }}>Wybierz osobę do pokazu</Text>
          <Text style={{ color: k.ink2, fontSize: 16, lineHeight: 22, marginTop: 8 }}>To prototyp na fikcyjnych danych. Każda osoba ma inne dokumenty i sprawy. Zmienisz ją później w zakładce Więcej.</Text>
          <View style={{ gap: 12, marginTop: 22 }}>
            {OSOBY_IDS.map((id, i) => { const o = OSOBY[id], on = wybor === id; return (
              <R.View key={id} entering={FadeInDown.delay(100 + i * 70).duration(420)}><Pressable onPress={() => setWybor(id)} accessibilityState={{ selected: on }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 22, backgroundColor: k.surface, borderWidth: 2, borderColor: on ? k.acc : k.dark ? k.hair : 'transparent' }}>
                <Portret id={id} w={58} h={72} r={12} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: k.ink, fontSize: 18, fontWeight: '700' }}>{o.imie} {o.nazwisko}</Text>
                  <Text style={{ color: k.ink2, fontSize: 14, lineHeight: 19, marginTop: 3 }}>{o.opis}</Text>
                </View>
                <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: on ? k.acc : k.ink3, backgroundColor: on ? k.acc : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{on ? <R.View entering={FadeIn.duration(150)}><Ikona n="ok" size={15} color="#fff" sw={2.6} /></R.View> : null}</View>
              </Pressable></R.View>
            ); })}
          </View>
        </ScrollView>
        <View style={{ position: 'absolute', left: 20, right: 20, bottom: ins.bottom + 20 }}>
          <Przycisk tytul="Dalej" onPress={() => { ustaw({ osobaId: wybor }); dalej(); }} />
        </View>
      </View>
    );
  }
  if (krok === 4) {
    const potw = pierwszy !== null;
    const cyfra = (c: string) => {
      const cur = potw ? p2 : p1; if (cur.length >= 4) return; const n = cur + c;
      if (!potw) { setP1(n); if (n.length === 4) setTimeout(() => { setPierwszy(n); setP1(''); }, 150); }
      else { setP2(n); if (n.length === 4) setTimeout(() => { if (n === pierwszy) { ustaw({ pin: n }); dalej(); } else { trzes(blad); setP2(''); setPierwszy(null); } }, 150); }
    };
    return (
      <LinearGradient colors={k.hero} style={[StyleSheet.absoluteFill, { paddingTop: ins.top + 40, paddingBottom: ins.bottom + 30, alignItems: 'center' }]}>
        <View style={{ width: 70, height: 70, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}><Ikona n="lock" size={36} color="#fff" /></View>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 18 }}>{potw ? 'Powtórz PIN' : 'Ustaw PIN'}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15.5, lineHeight: 21, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>{potw ? 'Wpisz te same 4 cyfry jeszcze raz.' : 'Wymyśl 4 cyfry. Będziesz je wpisywać przy otwieraniu aplikacji.'}</Text>
        <View style={{ marginTop: 28, marginBottom: 'auto' }}><Kropki n={(potw ? p2 : p1).length} blad={blad} /></View>
        <Klawiatura onCyfra={cyfra} onUsun={() => (potw ? setP2(p2.slice(0, -1)) : setP1(p1.slice(0, -1)))} />
      </LinearGradient>
    );
  }
  return (
    <LinearGradient colors={k.hero} style={[StyleSheet.absoluteFill, { paddingTop: ins.top + 40, paddingBottom: ins.bottom + 24, paddingHorizontal: 24 }]}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 120, height: 120, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}><Ikona n="faceid" size={64} color="#fff" sw={1.4} /></View>
        <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 26, textAlign: 'center' }}>Logowanie twarzą</Text>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 17, lineHeight: 24, marginTop: 12, textAlign: 'center' }}>Face ID albo odcisk palca zamiast PIN-u przy otwieraniu aplikacji. Wnioski podpiszesz PIN-em mObywatela.</Text>
      </View>
      <Pressable onPress={async () => { await potwierdz('Face ID włączone', 'faceid'); ustaw({ wprowadzenie: true }); odblokuj(); }} style={({ pressed }) => [st.biały, pressed && { opacity: 0.85 }]}><Text style={{ color: '#B00F30', fontSize: 17, fontWeight: '800' }}>Włącz</Text></Pressable>
      <Pressable onPress={() => { ustaw({ wprowadzenie: true }); odblokuj(); }} style={{ alignItems: 'center', padding: 16 }}><Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Nie teraz</Text></Pressable>
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  klaw: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center' },
  biały: { height: 56, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});
