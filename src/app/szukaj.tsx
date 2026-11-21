import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { szukaj, trasaUslugi, usluga } from '@/data/uslugi';
import { useApp } from '@/state/app';
import { Grupa, T, Wiersz } from '@/ui/elementy';
import { PoleSzukania } from '@/ui/wspolne';

const POPULARNE = ['zastrzez-pesel', 'zameldowanie', 'platnosci', 'punkty', 'zgubiony-dowod', 'niekaralnosc', 'mstluczka', 'historia-pojazdu'];
const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');

export default function Szukaj() {
  const { os, k, pesel, zaplacone } = useApp(); const ins = useSafeAreaInsets(); const [q, setQ] = useState('');
  const idz = (t: string) => { router.back(); setTimeout(() => router.push(t as never), 250); };
  const uslugi = szukaj(q, os, { pesel, zaplacone });
  const dok = q.trim() ? os.docs.filter(d => norm(d.name + ' ' + d.sub).includes(norm(q.trim()))) : [];
  return (
    <View style={{ flex: 1, backgroundColor: k.bg, paddingTop: ins.top + 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 }}>
        <View style={{ flex: 1 }}><PoleSzukania q={q} setQ={setQ} autoFocus /></View>
        <Pressable onPress={() => router.back()} hitSlop={10}><T v="bodyB" c={k.accInk}>Anuluj</T></Pressable>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 60 + ins.bottom }}>
        {!q.trim() ? (
          <>
            <T v="cap" style={{ marginBottom: 10, marginLeft: 4 }}>Najczęściej szukane</T>
            <Grupa>{POPULARNE.map(id => usluga(id)!).filter(u => !u.dostepna || u.dostepna(os, { pesel, zaplacone })).map(u => <Wiersz key={u.id} ik={u.ik} tytul={u.t} opis={u.opis} onPress={() => idz(trasaUslugi(u))} />)}</Grupa>
          </>
        ) : (
          <>
            {dok.length ? <><T v="cap" style={{ marginBottom: 10, marginLeft: 4 }}>Dokumenty</T><Grupa style={{ marginBottom: 20 }}>{dok.map(d => <Wiersz key={d.id} ik="id" tytul={d.name} opis={d.sub} onPress={() => idz(`/dokument/${d.id}`)} />)}</Grupa></> : null}
            {uslugi.length ? <><T v="cap" style={{ marginBottom: 10, marginLeft: 4 }}>Usługi</T><Grupa>{uslugi.map(u => <Wiersz key={u.id} ik={u.ik} tytul={u.t} opis={u.opis} onPress={() => idz(trasaUslugi(u))} />)}</Grupa></> : null}
            {!dok.length && !uslugi.length ? <View style={{ alignItems: 'center', paddingTop: 40, gap: 8 }}><T v="h3">Nic nie znaleźliśmy</T><T v="sub" center>Spróbuj prostszego słowa, np. „dowód”, „auto”, „podatek”, „dziecko”.</T></View> : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
