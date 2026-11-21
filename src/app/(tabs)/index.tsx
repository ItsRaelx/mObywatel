import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DZIS_TXT } from '@/data/typy';
import { rodz, useApp, useZadania } from '@/state/app';
import { Avatar, Grupa, Ikona, Karta, LogoBiale, Sekcja, T } from '@/ui/elementy';
import { KartaDokumentu } from '@/ui/karta';
import { AlertPrywatnosci, KafelSkrot, SprawaWiersz, ZadanieWiersz } from '@/ui/wspolne';

export default function Start() {
  const { os, k, skrzynka, przeczytane } = useApp(); const ins = useSafeAreaInsets(); const { width } = useWindowDimensions();
  const zadania = useZadania();
  const nowe = skrzynka.filter(m => m.nowe && !przeczytane.includes(m.id)).length;
  const dowod = os.docs.find(d => d.id === 'dowod');
  const rcb = os.rcb.find(r => r[3]);
  const w = Math.min(width - 32, 420);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: k.bg }} contentContainerStyle={{ paddingBottom: ins.bottom + 110 }}>
      <LinearGradient colors={k.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: ins.top + 8, paddingHorizontal: 20, paddingBottom: 46 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LogoBiale w={136} />
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => router.push('/skrzynka')} accessibilityLabel={`Skrzynka${nowe ? `, ${nowe} nowe pisma` : ''}`} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
            <Ikona n="bell" size={22} color="#fff" />
            {nowe ? <View style={{ position: 'absolute', top: 7, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff', borderWidth: 2, borderColor: '#C9123A' }} /> : null}
          </Pressable>
          <Pressable onPress={() => router.navigate('/wiecej')} accessibilityLabel="Twój profil"><Avatar id={os.id} size={42} ramka="rgba(255,255,255,0.9)" /></Pressable>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 20 }}>{DZIS_TXT}</Text>
        <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800', letterSpacing: -0.6, marginTop: 4 }}>Dzień dobry, {os.wolacz}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 16, lineHeight: 22, marginTop: 6 }}>{os.status}</Text>
        <Pressable onPress={() => router.push('/szukaj')} accessibilityRole="search"
          style={{ marginTop: 18, height: 54, borderRadius: 18, backgroundColor: k.surface, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 }}>
          <Ikona n="search" size={22} color={k.ink2} />
          <Text style={{ color: k.ink3, fontSize: 16.5 }}>Czego szukasz? Np. zastrzeż PESEL</Text>
        </Pressable>
      </LinearGradient>

      <View style={{ marginTop: -24, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: k.bg, paddingHorizontal: 16, paddingTop: 20 }}>
        <AlertPrywatnosci />

        {dowod ? (
          <Sekcja tytul="Twój dowód" akcja="Wszystkie dokumenty" onAkcja={() => router.navigate('/dokumenty')} style={{ marginTop: 22 }}>
            <Pressable onPress={() => router.push('/dokument/dowod')} accessibilityLabel="Otwórz mDowód" style={({ pressed }) => pressed && { transform: [{ scale: 0.985 }] }}>
              <KartaDokumentu d={dowod} os={os} w={w} ukryte onQR={() => router.push('/pokaz-kod')} onPokaz={() => router.push('/dokument/dowod')} />
            </Pressable>
            <T v="small" center style={{ marginTop: 8 }}>Dotknij karty, aby otworzyć dokument</T>
          </Sekcja>
        ) : null}

        <Sekcja tytul="Do załatwienia" akcja="Kalendarz" onAkcja={() => router.push('/terminy')}>
          {zadania.length ? <Grupa>{zadania.map(z => <ZadanieWiersz key={z.h} z={z} />)}</Grupa>
            : <Karta style={{ padding: 20, alignItems: 'center' }}><Ikona n="check" size={32} color={k.ok} /><T v="bodyB" style={{ marginTop: 8 }}>Wszystko załatwione</T><T v="sub" center>Nowe sprawy pojawią się tutaj.</T></Karta>}
        </Sekcja>

        <Sekcja tytul="Sprawy w toku" akcja="Wszystkie" onAkcja={() => router.push('/terminy')}>
          <Grupa>{os.toku.map(s => <SprawaWiersz key={s.id} s={s} />)}</Grupa>
        </Sekcja>

        {rcb ? (
          <Karta onPress={() => router.push('/alerty')} style={{ marginTop: 22, padding: 14, flexDirection: 'row', gap: 12, backgroundColor: k.warnBg }}>
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: k.warn, alignItems: 'center', justifyContent: 'center' }}><Ikona n="megaphone" size={21} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <T v="cap" c={k.warn}>Alert RCB · {rcb[0]}</T>
              <T v="bodyB" style={{ marginTop: 2 }}>{rcb[1]}</T>
              <T v="sub" n={2}>{rcb[2]}</T>
            </View>
          </Karta>
        ) : null}

        <Sekcja tytul="Na skróty">
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <KafelSkrot ik="shield" t="Zastrzeż PESEL" o="Blokada kredytów" onPress={() => router.push('/usluga/zastrzez-pesel')} />
            <KafelSkrot ik="receipt" t="Płatności" o="Podatki i mandaty" onPress={() => router.push('/platnosci')} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <KafelSkrot ik="car" t="mStłuczka" o="Kolizja bez druku" onPress={() => router.push('/usluga/mstluczka')} />
            <KafelSkrot ik="alert" t={rodz(os, 'Zgubiłam dowód', 'Zgubiłem dowód')} o="Zastrzeż dokumenty" onPress={() => router.push('/usluga/zgubiony-dowod')} />
          </View>
        </Sekcja>

        <T v="small" center style={{ marginTop: 28, paddingHorizontal: 20 }}>Prototyp na fikcyjnych danych. To nie jest aplikacja mObywatel ani usługa administracji publicznej.</T>
      </View>
    </ScrollView>
  );
}
