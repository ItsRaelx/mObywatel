import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Switch, View } from 'react-native';

import type { Wpis } from '@/data/typy';
import { useApp } from '@/state/app';
import { potwierdz } from '@/ui/potwierdzenie';
import { Ekran, Grupa, Ikona, IkonaKafel, Karta, Pill, Sekcja, T } from '@/ui/elementy';
import { AlertPrywatnosci } from '@/ui/wspolne';

const IK = { alert: 'alert', urzad: 'gov', firma: 'brief', ty: 'user' } as const;
const FILTRY = [['all', 'Wszystko'], ['urzad', 'Urzędy'], ['firma', 'Firmy'], ['ty', 'Ty']] as const;

function WpisWiersz({ x }: { x: Wpis }) {
  const { k } = useApp(); const [otw, setOtw] = useState(false);
  return (
    <Pressable onPress={() => setOtw(!otw)} accessibilityState={{ expanded: otw }} style={({ pressed }) => [{ padding: 14 }, pressed && { backgroundColor: k.surface2 }]}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <IkonaKafel n={IK[x.typ]} akcent={x.typ === 'alert' && !x.zgl && !x.zablok && !x.potw} />
        <View style={{ flex: 1 }}><T v="bodyB">{x.kto}</T><T v="sub">{x.co}</T></View>
        <T v="small">{x.kiedy}</T>
      </View>
      {otw ? (
        <View style={{ marginTop: 10, marginLeft: 52, gap: 8 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{x.dane.map(d => <Pill key={d} t={d} />)}</View>
          <T v="sub">{x.jak}</T>
          {x.zablok ? <T v="sub" c={k.ok} style={{ fontWeight: '600' }}>✓ Zablokowane dzięki zastrzeżeniu PESEL</T> : null}
          {x.zgl ? <T v="sub" c={k.ok} style={{ fontWeight: '600' }}>✓ Zgłoszone do CERT Polska</T> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

export default function Prywatnosc() {
  const { k, pesel, log, zgody, zmien, toast } = useApp(); const [f, setF] = useState<string>('all');
  const L = log.filter(x => f === 'all' || x.typ === f || (f === 'firma' && x.typ === 'alert'));
  const przelacz = async (v: boolean) => {
    if (v) { if (await potwierdz('Zastrzeżenie PESEL', 'pin')) { zmien({ pesel: true }); toast('PESEL zastrzeżony'); } }
    else router.push('/usluga/cofnij-zastrzezenie');
  };
  return (
    <Ekran>
      <T v="body" c={k.ink2} style={{ marginBottom: 16 }}>Kto, kiedy i po co sprawdzał Twoje dane w rejestrach państwowych. Dotknij wpisu, aby zobaczyć szczegóły.</T>
      <Karta style={{ padding: 16, flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: pesel ? k.okBg : k.surface }}>
        <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: pesel ? k.ok : k.accBg, alignItems: 'center', justifyContent: 'center' }}><Ikona n={pesel ? 'lock' : 'shield'} size={24} color={pesel ? '#fff' : k.accInk} /></View>
        <View style={{ flex: 1 }}>
          <T v="bodyB">Zastrzeżenie PESEL</T>
          <T v="sub">{pesel ? 'Włączone. Nikt nie weźmie kredytu na Twoje dane.' : 'Wyłączone. Banki mogą sprawdzić Twój PESEL.'}</T>
        </View>
        <Switch value={pesel} onValueChange={przelacz} trackColor={{ true: k.ok, false: k.surface2 }} accessibilityLabel="Zastrzeżenie PESEL" />
      </Karta>
      <View style={{ marginTop: 14 }}><AlertPrywatnosci /></View>
      <Sekcja tytul="Dziennik dostępu">
        <View style={{ flexDirection: 'row', backgroundColor: k.surface2, borderRadius: 14, padding: 4, marginBottom: 12 }}>
          {FILTRY.map(([id, t]) => <Pressable key={id} onPress={() => setF(id)} style={{ flex: 1, paddingVertical: 8, borderRadius: 11, alignItems: 'center', backgroundColor: f === id ? k.surface : 'transparent' }}><T v="sub" c={f === id ? k.ink : k.ink2} style={{ fontWeight: '700' }}>{t}</T></Pressable>)}
        </View>
        {L.length ? <Grupa>{L.map(x => <WpisWiersz key={x.id} x={x} />)}</Grupa> : <T v="sub" center>Brak wpisów.</T>}
      </Sekcja>
      <Sekcja tytul="Twoje zgody">
        {zgody.length ? <Grupa>{zgody.map((z, i) => (
          <View key={z[0]} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
            <View style={{ flex: 1 }}><T v="bodyB">{z[0]}</T><T v="sub">{z[1]} · {z[2]}</T></View>
            <Pressable onPress={() => Alert.alert('Cofnąć zgodę?', `${z[0]} straci dostęp: ${z[1].charAt(0).toLowerCase() + z[1].slice(1)}.`, [{ text: 'Anuluj', style: 'cancel' }, { text: 'Cofnij', style: 'destructive', onPress: async () => { if (await potwierdz('Cofnij zgodę')) { zmien(s => ({ zgody: s.zgody.filter((_, j) => j !== i) })); toast('Zgoda cofnięta'); } } }])}
              style={{ paddingHorizontal: 14, height: 36, borderRadius: 12, borderWidth: 1.5, borderColor: k.acc, justifyContent: 'center' }}><T v="sub" c={k.accInk} style={{ fontWeight: '700' }}>Cofnij</T></Pressable>
          </View>
        ))}</Grupa> : <T v="sub" center>Nie masz aktywnych zgód.</T>}
      </Sekcja>
      <T v="small" center style={{ marginTop: 18 }}>Dziennik obejmuje odczyty z rejestrów PESEL, CEPiK, dowodów osobistych i eWUŚ. W prototypie wpisy są fikcyjne.</T>
    </Ekran>
  );
}
