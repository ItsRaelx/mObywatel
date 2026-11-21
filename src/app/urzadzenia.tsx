/* Urządzenia, na których działa mObywatel tej osoby. */
import { useState } from 'react';
import { Alert } from 'react-native';

import { useApp } from '@/state/app';
import { Ekran, Grupa, Pill, Przycisk, T, Wiersz } from '@/ui/elementy';

type Urz = { id: string; nazwa: string; opis: string; ik: string; ten?: boolean };
const START: Urz[] = [
  { id: 'a', nazwa: 'Ten telefon', opis: 'Aktywny teraz', ik: 'phone', ten: true },
  { id: 'b', nazwa: 'Tablet', opis: 'Ostatnio 12.10.2026, 21:14', ik: 'phone' },
  { id: 'c', nazwa: 'Poprzedni telefon', opis: 'Ostatnio 03.08.2026, 08:02', ik: 'phone' },
];

export default function Urzadzenia() {
  const { k, toast } = useApp(); const [lista, setLista] = useState(START);
  const inne = lista.filter(u => !u.ten);
  const wyloguj = (u?: Urz) => Alert.alert(u ? `Wylogować: ${u.nazwa}?` : 'Wylogować pozostałe urządzenia?', 'Żeby znów używać tam mObywatela, trzeba będzie zalogować się od nowa.', [
    { text: 'Anuluj', style: 'cancel' },
    { text: 'Wyloguj', style: 'destructive', onPress: () => { setLista(l => l.filter(x => x.ten || (u && x.id !== u.id))); toast(u ? `Wylogowano: ${u.nazwa}` : 'Wylogowano pozostałe urządzenia'); } },
  ]);
  return (
    <Ekran>
      <T v="body" c={k.ink2} style={{ marginBottom: 16 }}>Tu widzisz, gdzie jesteś zalogowany. Jeśli nie rozpoznajesz urządzenia, wyloguj je.</T>
      <Grupa>{lista.map(u => (
        <Wiersz key={u.id} ik={u.ik} tytul={u.nazwa} opis={u.opis} strzalka={false}
          prawa={u.ten ? <Pill t="To urządzenie" ton="g" /> : <T v="sub" c={k.accInk} style={{ fontWeight: '700' }} >Wyloguj</T>}
          onPress={u.ten ? undefined : () => wyloguj(u)} />
      ))}</Grupa>
      {inne.length ? <Przycisk tytul="Wyloguj pozostałe urządzenia" rodzaj="drugi" style={{ marginTop: 16 }} onPress={() => wyloguj()} /> : <T v="small" style={{ marginTop: 14, marginHorizontal: 4 }}>Jesteś zalogowany tylko na tym telefonie.</T>}
    </Ekran>
  );
}
