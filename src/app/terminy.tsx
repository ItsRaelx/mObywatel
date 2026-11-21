import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { dataZ, DNI, DZIS, DZIS_TXT, kiedy, MIESIACE } from '@/data/typy';
import { trasaDla } from '@/data/uslugi';
import { useApp } from '@/state/app';
import { Ekran, Grupa, Karta, Pill, Przycisk, Sekcja, T } from '@/ui/elementy';
import { SprawaWiersz } from '@/ui/wspolne';

export default function Terminy() {
  const { os, k, toast } = useApp();
  const items = os.os.map(r => ({ d: dataZ(r[0]), t: r[1], s: r[2], q: r[4] })).sort((a, b) => +a.d - +b.d);
  return (
    <Ekran>
      <Sekcja tytul="Sprawy w toku" style={{ marginTop: 0 }}>
        <Grupa>{os.toku.map(s => <SprawaWiersz key={s.id} s={s} />)}</Grupa>
      </Sekcja>
      <Sekcja tytul="Najbliższe terminy">
        <T v="sub" style={{ marginBottom: 10, marginLeft: 4 }}>Dziś: {DZIS_TXT.toLowerCase()}</T>
        {items.map((x, i) => {
          const n = Math.round((+x.d - +DZIS) / 864e5), poprz = items[i - 1], nowy = !poprz || poprz.d.getMonth() !== x.d.getMonth() || poprz.d.getFullYear() !== x.d.getFullYear();
          const tr = trasaDla(x.q);
          return (
            <View key={i}>
              {nowy ? <T v="cap" style={{ marginTop: i ? 16 : 0, marginBottom: 8, marginLeft: 4 }}>{MIESIACE[x.d.getMonth()]} {x.d.getFullYear()}</T> : null}
              <Pressable onPress={() => (tr ? router.push(tr as never) : toast('Przypomnimy Ci tydzień przed terminem'))} style={({ pressed }) => [{ flexDirection: 'row', gap: 12, marginBottom: 10 }, pressed && { opacity: 0.7 }]}>
                <View style={{ width: 48, alignItems: 'center', paddingTop: 10 }}><T v="h2" style={{ fontSize: 22 }}>{x.d.getDate()}</T><T v="small">{DNI[x.d.getDay()]}</T></View>
                <Karta style={{ flex: 1, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <View style={{ flex: 1 }}><T v="bodyB">{x.t}</T><T v="sub">{x.s}</T></View>
                  <Pill t={kiedy(n)} ton={n <= 14 ? 'r' : 'n'} />
                </Karta>
              </Pressable>
            </View>
          );
        })}
      </Sekcja>
      <Przycisk tytul="Dodaj terminy do kalendarza" ik="cal" rodzaj="drugi" style={{ marginTop: 10 }} onPress={() => toast(`Dodano ${items.length} terminów do kalendarza`)} />
      <T v="small" center style={{ marginTop: 12 }} c={k.ink3}>Przypomnimy Ci o każdym terminie tydzień wcześniej.</T>
    </Ekran>
  );
}
