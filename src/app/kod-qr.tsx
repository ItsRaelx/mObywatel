/* Menu przycisku Kod QR: własny panel od dołu (natywny formSheet nie działa na Androidzie). */
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/state/app';
import { Grupa, T, Wiersz } from '@/ui/elementy';

export default function KodQrArkusz() {
  const { k } = useApp(); const ins = useSafeAreaInsets();
  const zamknij = () => { if (router.canGoBack()) router.back(); else router.replace('/'); };
  const idz = (t: string) => { zamknij(); setTimeout(() => router.push(t as never), 220); };
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View entering={FadeIn.duration(200)} style={[StyleSheet.absoluteFill, { backgroundColor: k.scrim }]}>
        <Pressable style={{ flex: 1 }} onPress={zamknij} accessibilityRole="button" accessibilityLabel="Zamknij" />
      </Animated.View>
      <Animated.View entering={SlideInDown.duration(260).easing(Easing.out(Easing.cubic))}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: k.bg, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20, paddingTop: 10, paddingBottom: ins.bottom + 20 }}>
        <View style={{ alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: k.hair, marginBottom: 16 }} />
        <T v="h1" style={{ fontSize: 28 }}>Kod QR</T>
        <T v="sub" style={{ marginTop: 4, marginBottom: 18 }}>Wybierz, co chcesz zrobić.</T>
        <Grupa>
          <Wiersz ik="scan" ikAkcent tytul="Zeskanuj kod" opis="Sklep, urząd albo strona internetowa prosi o Twoje dane" onPress={() => idz('/skanuj')} />
          <Wiersz ik="qr" ikAkcent tytul="Pokaż swój kod" opis="Ktoś chce sprawdzić Twój dowód, wiek albo prawo jazdy" onPress={() => idz('/pokaz-kod')} />
          <Wiersz ik="user" ikAkcent tytul="Sprawdź kogoś" opis="Chcesz zobaczyć ważny dokument innej osoby" onPress={() => idz('/sprawdz')} />
        </Grupa>
      </Animated.View>
    </View>
  );
}
