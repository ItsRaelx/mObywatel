import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/state/app';
import { Grupa, T, Wiersz } from '@/ui/elementy';

export default function KodQrArkusz() {
  const { k } = useApp(); const ins = useSafeAreaInsets();
  const idz = (t: string) => { router.back(); setTimeout(() => router.push(t as never), 260); };
  return (
    <View style={{ padding: 20, paddingTop: 26, paddingBottom: ins.bottom + 20, backgroundColor: k.bg }}>
      <T v="h1" style={{ fontSize: 28 }}>Kod QR</T>
      <T v="sub" style={{ marginTop: 4, marginBottom: 18 }}>Wybierz, co chcesz zrobić.</T>
      <Grupa>
        <Wiersz ik="scan" ikAkcent tytul="Zeskanuj kod" opis="Sklep, urząd albo strona internetowa prosi o Twoje dane" onPress={() => idz('/skanuj')} />
        <Wiersz ik="qr" ikAkcent tytul="Pokaż swój kod" opis="Ktoś chce sprawdzić Twój dowód, wiek albo prawo jazdy" onPress={() => idz('/pokaz-kod')} />
        <Wiersz ik="user" ikAkcent tytul="Sprawdź kogoś" opis="Chcesz zobaczyć ważny dokument innej osoby" onPress={() => idz('/sprawdz')} />
      </Grupa>
    </View>
  );
}
