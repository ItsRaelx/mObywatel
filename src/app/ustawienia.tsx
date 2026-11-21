import { useState } from 'react';
import { Alert, Pressable, Switch, View } from 'react-native';

import { useApp, type Motyw } from '@/state/app';
import { Ekran, Grupa, Ikona, Sekcja, T, Wiersz } from '@/ui/elementy';
import { PALETA } from '@/ui/motyw';

const MOTYWY: [Motyw, string, string][] = [['jasny', 'Jasny', 'sun'], ['ciemny', 'Ciemny', 'moon'], ['system', 'Jak w telefonie', 'auto']];

function Podglad({ m }: { m: Motyw }) {
  const c = (d: boolean) => (d ? PALETA.dark : PALETA.light);
  const pol = (d: boolean) => (
    <View style={{ flex: 1, padding: 7, backgroundColor: c(d).bg, gap: 5 }}>
      <View style={{ height: 14, borderRadius: 4, backgroundColor: c(d).hero[1] }} />
      <View style={{ height: 8, borderRadius: 3, backgroundColor: c(d).surface }} /><View style={{ height: 8, borderRadius: 3, backgroundColor: c(d).surface, width: '70%' }} />
    </View>
  );
  return <View style={{ height: 78, borderRadius: 12, overflow: 'hidden', flexDirection: 'row' }}>{m === 'system' ? <>{pol(false)}{pol(true)}</> : pol(m === 'ciemny')}</View>;
}

export default function Ustawienia() {
  const { k, motyw, ustaw, toast } = useApp();
  const [p, setP] = useState({ terminy: true, pisma: true, dane: true, rcb: true, bio: true });
  const sw = (key: keyof typeof p, t: string, o: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}><View style={{ flex: 1 }}><T v="bodyB">{t}</T><T v="sub">{o}</T></View><Switch value={p[key]} onValueChange={v => setP({ ...p, [key]: v })} trackColor={{ true: k.acc, false: k.surface2 }} /></View>
  );
  return (
    <Ekran>
      <Sekcja tytul="Wygląd" style={{ marginTop: 0 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {MOTYWY.map(([m, t, ik]) => (
            <Pressable key={m} onPress={() => ustaw({ motyw: m })} accessibilityState={{ selected: motyw === m }} style={{ flex: 1, padding: 8, borderRadius: 18, backgroundColor: k.surface, borderWidth: 2, borderColor: motyw === m ? k.acc : k.hair }}>
              <Podglad m={m} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}><Ikona n={ik} size={15} /><T v="small" c={k.ink} style={{ fontWeight: '700', flex: 1 }}>{t}</T></View>
            </Pressable>
          ))}
        </View>
      </Sekcja>
      <Sekcja tytul="Powiadomienia">
        <Grupa>{sw('terminy', 'Terminy i przypomnienia', 'OC, badanie, podatki, ważność dokumentów')}{sw('pisma', 'Nowe pisma', 'e-Doręczenia')}{sw('dane', 'Sprawdzenia Twoich danych', 'Centrum prywatności')}{sw('rcb', 'Alerty RCB', 'Ostrzeżenia dla Twojej okolicy')}</Grupa>
      </Sekcja>
      <Sekcja tytul="Logowanie">
        <Grupa>
          {sw('bio', 'Face ID / odcisk palca', 'Do otwierania aplikacji. Wnioski podpisujesz PIN-em mObywatela')}
          <Wiersz ik="key" tytul="Zmień PIN" onPress={() => Alert.alert('Zmienić PIN?', 'Przejdziesz przez krótkie ustawienie od nowa.', [{ text: 'Anuluj', style: 'cancel' }, { text: 'Zmień', onPress: () => ustaw({ wprowadzenie: false, pin: null }) }])} />
          <Wiersz ik="phone" tytul="Aktywne urządzenia" opis="Ten telefon" onPress={() => toast('Wylogowano z pozostałych urządzeń (pokaz)')} />
        </Grupa>
      </Sekcja>
    </Ekran>
  );
}
