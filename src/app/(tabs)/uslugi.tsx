import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { KATEGORIE, szukaj, trasaUslugi, USLUGI } from '@/data/uslugi';
import { useApp } from '@/state/app';
import { Ekran, Grupa, Przycisk, Sekcja, T, Wiersz } from '@/ui/elementy';
import { PoleSzukania } from '@/ui/wspolne';

export default function Uslugi() {
  const { os, pesel, zaplacone } = useApp(); const [q, setQ] = useState('');
  const st = { pesel, zaplacone };
  const wyniki = q.trim() ? szukaj(q, os, st) : [];
  const dost = USLUGI.filter(u => !u.dostepna || u.dostepna(os, st));
  return (
    <Ekran tab tytul="Usługi" podtytul="Sprawy urzędowe bez wychodzenia z domu">
      <PoleSzukania q={q} setQ={setQ} />
      {q.trim() ? (
        <Sekcja tytul={wyniki.length ? 'Wyniki' : undefined}>
          {wyniki.length ? <Grupa>{wyniki.map(u => <Wiersz key={u.id} ik={u.ik} tytul={u.t} opis={u.opis} onPress={() => router.push(trasaUslugi(u) as never)} />)}</Grupa>
            : <View style={{ alignItems: 'center', paddingVertical: 30, gap: 8 }}><T v="h3">Nic nie znaleźliśmy</T><T v="sub" center>Spróbuj innego słowa, np. „dowód”, „auto”, „podatek”.</T></View>}
        </Sekcja>
      ) : KATEGORIE.map(kat => {
        const l = dost.filter(u => u.kat === kat.id); if (!l.length) return null;
        return <Sekcja key={kat.id} tytul={kat.t}><Grupa>{l.map(u => <Wiersz key={u.id} ik={u.ik} tytul={u.t} opis={u.opis} onPress={() => router.push(trasaUslugi(u) as never)} />)}</Grupa></Sekcja>;
      })}
      {!q.trim() ? <Przycisk tytul="Nie widzisz swojej sprawy? Szukaj" ik="search" rodzaj="drugi" style={{ marginTop: 24 }} onPress={() => router.push('/szukaj')} /> : null}
    </Ekran>
  );
}
