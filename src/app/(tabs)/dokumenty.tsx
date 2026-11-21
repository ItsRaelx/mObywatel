import { router } from 'expo-router';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

import { pl3 } from '@/data/typy';
import { useApp } from '@/state/app';
import { Ekran, Ikona, Pill, Przycisk, Sekcja, T } from '@/ui/elementy';
import { KartaDokumentu } from '@/ui/karta';
import { KartaCzlonka } from '@/ui/wspolne';
import { Sprezyna, Wejscie } from '@/ui/ruch';

export default function Dokumenty() {
  const { os, k } = useApp(); const { width } = useWindowDimensions(); const w = Math.min(width - 32, 420);
  const bad = os.docs.filter(d => d.alert).length;
  return (
    <Ekran tab tytul="Dokumenty" podtytul={`${os.docs.length} ${pl3(os.docs.length, 'dokument', 'dokumenty', 'dokumentów')} · ${bad ? `${bad} ${pl3(bad, 'wymaga', 'wymagają', 'wymaga')} uwagi` : 'wszystkie ważne'}`}
      prawa={<Pressable onPress={() => router.push('/dodaj-dokument')} accessibilityLabel="Dodaj dokument" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: k.surface, alignItems: 'center', justifyContent: 'center' }}><Ikona n="plus" size={22} color={k.ink} /></Pressable>}>
      <View style={{ gap: 18 }}>
        {os.docs.map((d, i) => (
          <Wejscie key={d.id} i={i}>
            <Sprezyna onPress={() => router.push(`/dokument/${d.id}`)} accessibilityLabel={`Otwórz: ${d.name}`} skala={0.97}>
              <KartaDokumentu d={d} os={os} w={w} ukryte={d.id === 'dowod'} onQR={() => router.push('/pokaz-kod')} onPokaz={() => router.push('/dokument/dowod')} />
            </Sprezyna>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 }}>
              <T v="sub" n={1} style={{ flex: 1 }}>{d.sub}</T>
              {d.alert ? <Pill t={d.alert} ton="r" ik="alert" /> : <Pill t="Ważny" ton="g" ik="ok" />}
            </View>
          </Wejscie>
        ))}
      </View>

      {os.rodzina.length ? (
        <Sekcja tytul="Dokumenty rodziny" akcja="Wszyscy" onAkcja={() => router.push('/rodzina')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 6 }}>
            {os.rodzina.map(m => <KartaCzlonka key={m.id} id={m.id} />)}
          </ScrollView>
        </Sekcja>
      ) : null}

      <Przycisk tytul="Dodaj dokument" ik="plus" rodzaj="drugi" style={{ marginTop: 26 }} onPress={() => router.push('/dodaj-dokument')} />
    </Ekran>
  );
}
