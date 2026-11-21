import { Pressable } from 'react-native';

import { useApp } from '@/state/app';
import { Ekran, Grupa, Notka, Pill, T, Wiersz } from '@/ui/elementy';

const KATALOG: [string, string, string][] = [
  ['mDowód', 'id', 'dowod'], ['mPrawo jazdy', 'car', 'pj'], ['Pojazdy', 'car', 'auto'], ['mLegitymacja szkolna', 'cap', ''], ['mLegitymacja studencka', 'cap', 'leg'],
  ['mLegitymacja doktoranta', 'cap', ''], ['Karta Dużej Rodziny', 'family', 'kdr'], ['Legitymacja emeryta-rencisty', 'brief', ''], ['Legitymacja osoby niepełnosprawnej', 'heart', ''], ['Diia.pl', 'id', ''],
];

export default function DodajDokument() {
  const { os, k, toast } = useApp();
  return (
    <Ekran>
      <T v="body" c={k.ink2} style={{ marginBottom: 16 }}>Dokumenty pobieramy prosto z rejestrów państwowych. Nie musisz niczego skanować ani przepisywać.</T>
      <Grupa>
        {KATALOG.map(([t, ik, id]) => {
          const ma = !!id && os.docs.some(d => d.id === id);
          return <Wiersz key={t} ik={ik} tytul={t} opis={ma ? 'W Twoim portfelu' : undefined} strzalka={false}
            prawa={ma ? <Pill t="dodany" ton="g" ik="ok" /> : <Pressable onPress={() => toast(`${t}: nie znaleźliśmy tego dokumentu w rejestrze`)} style={{ paddingHorizontal: 14, height: 36, borderRadius: 12, borderWidth: 1.5, borderColor: k.acc, justifyContent: 'center' }}><T v="sub" c={k.accInk} style={{ fontWeight: '700' }}>Dodaj</T></Pressable>} />;
        })}
      </Grupa>
      <Notka>Legitymacje szkolne i studenckie wydaje szkoła albo uczelnia. Jeśli dokumentu nie ma w rejestrze, zapytaj w sekretariacie lub dziekanacie.</Notka>
    </Ekran>
  );
}
