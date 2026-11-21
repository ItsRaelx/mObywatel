import { router, Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { pl3 } from '@/data/typy';
import { trasaDla } from '@/data/uslugi';
import { useApp } from '@/state/app';
import { Ekran, Grupa, Karta, Pill, Portret, Sekcja, T, Wiersz } from '@/ui/elementy';

export default function Czlonek() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { os, k } = useApp(); const m = os.rodzina.find(x => x.id === id);
  if (!m) return <Ekran><T>Nie znaleziono osoby.</T></Ekran>;
  return (
    <Ekran>
      <Stack.Screen options={{ title: m.imie }} />
      <View style={{ alignItems: 'center', marginTop: 4 }}>
        <Portret id={m.id} w={116} h={144} r={22} />
        <T v="h1" style={{ marginTop: 12 }}>{m.imie}</T>
        <T v="sub">{m.rel} · {m.wiek} {pl3(m.wiek, 'rok', 'lata', 'lat')}</T>
        <T v="sub" center style={{ marginTop: 6, paddingHorizontal: 20 }}>{m.info}</T>
      </View>
      {m.docs.length ? (
        <Sekcja tytul="Dokumenty i sprawy">
          <Grupa>{m.docs.map(d => <Wiersz key={d[0]} ik={d[2] === 'prog' ? 'route' : 'doc'} tytul={d[0]} opis={d[1]} prawa={d[2] ? <Pill t={d[2] === 'ok' ? 'ważny' : d[2] === 'prog' ? 'w toku' : 'uwaga'} ton={d[2] === 'ok' ? 'g' : d[2] === 'warn' ? 'r' : 'n'} /> : undefined} />)}</Grupa>
        </Sekcja>
      ) : <Karta style={{ padding: 20, marginTop: 20 }}><T v="bodyB" center>{m.imie} ma własne konto mObywatela</T><T v="sub" center style={{ marginTop: 4 }}>Możesz poprosić o upoważnienie do wybranych spraw.</T></Karta>}
      {m.akcje.length ? (
        <Sekcja tytul="Co możesz zrobić">
          <Grupa>{m.akcje.map(([t, q]) => { const tr = trasaDla(q); return <Wiersz key={t} ik="arrow" ikAkcent tytul={t} onPress={tr ? () => router.push(tr as never) : undefined} />; })}</Grupa>
        </Sekcja>
      ) : null}
      <T v="small" center style={{ marginTop: 20 }} c={k.ink3}>Dane z rejestru PESEL i rejestrów dokumentów.</T>
    </Ekran>
  );
}
