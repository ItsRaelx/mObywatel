import { router } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';

import { OSOBY, OSOBY_IDS, pl3 } from '@/data/typy';
import { useApp } from '@/state/app';
import { Ekran, Grupa, Karta, Pill, Portret, Sekcja, T, Wiersz } from '@/ui/elementy';

const NAZWY_MOTYWU = { system: 'Jak w telefonie', jasny: 'Jasny', ciemny: 'Ciemny' };

export default function Wiecej() {
  const { os, k, skrzynka, przeczytane, log, zaplacone, motyw, osobaId, ustaw, zablokuj } = useApp();
  const nowe = skrzynka.filter(m => m.nowe && !przeczytane.includes(m.id)).length;
  const alert = log.some(x => x.typ === 'alert' && !x.zgl && !x.zablok && !x.potw);
  const doZap = os.sc.pay.filter(p => !zaplacone.includes(p.title)).length;
  const zmienOsobe = (id: string) => {
    if (id === osobaId) return;
    Alert.alert('Zmienić osobę w pokazie?', `Zobaczysz dokumenty i sprawy: ${OSOBY[id].imie} ${OSOBY[id].nazwisko}.`, [{ text: 'Anuluj', style: 'cancel' }, { text: 'Zmień', onPress: () => { ustaw({ osobaId: id }); router.navigate('/'); } }]);
  };
  return (
    <Ekran tab tytul="Więcej">
      <Karta onPress={() => router.push('/moje-dane')} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Portret id={os.id} w={64} h={80} r={14} />
        <View style={{ flex: 1 }}>
          <T v="h2">{os.imie} {os.nazwisko}</T>
          <T v="sub" style={{ marginTop: 2 }}>PESEL •••••••{os.moje.pesel.slice(7)}</T>
          <View style={{ flexDirection: 'row', marginTop: 8 }}><Pill t="Profil zaufany aktywny" ton="g" ik="ok" /></View>
        </View>
      </Karta>

      <Sekcja tytul="Twoje sprawy">
        <Grupa>
          <Wiersz ik="inbox" tytul="Skrzynka" opis="Pisma z urzędów" prawa={nowe ? <Pill t={`${nowe} ${pl3(nowe, 'nowe', 'nowe', 'nowych')}`} ton="r" /> : undefined} onPress={() => router.push('/skrzynka')} />
          <Wiersz ik="receipt" tytul="Płatności" opis={doZap ? `${doZap} do zapłaty` : 'Wszystko opłacone'} onPress={() => router.push('/platnosci')} />
          <Wiersz ik="cal" tytul="Terminy i sprawy" opis="Kalendarz i statusy wniosków" onPress={() => router.push('/terminy')} />
          <Wiersz ik="family" tytul="Rodzina" opis={os.rodzina.length ? os.rodzina.map(m => m.imie).join(', ') : 'Nikogo jeszcze nie dodano'} onPress={() => router.push('/rodzina')} />
          <Wiersz ik="user" tytul="Moje dane" opis="Rejestr PESEL, adres, kontakt" onPress={() => router.push('/moje-dane')} />
        </Grupa>
      </Sekcja>

      <Sekcja tytul="Bezpieczeństwo">
        <Grupa>
          <Wiersz ik="eye" tytul="Centrum prywatności" opis="Kto i kiedy sprawdzał Twoje dane" prawa={alert ? <Pill t="Alert" ton="r" /> : undefined} onPress={() => router.push('/prywatnosc')} />
          <Wiersz ik="megaphone" tytul="Alerty RCB" opis={`Ostrzeżenia: ${os.sc.miasto}`} onPress={() => router.push('/alerty')} />
        </Grupa>
      </Sekcja>

      <Sekcja tytul="Ustawienia">
        <Grupa>
          <Wiersz ik={motyw === 'ciemny' ? 'moon' : motyw === 'jasny' ? 'sun' : 'auto'} tytul="Wygląd" opis={NAZWY_MOTYWU[motyw]} onPress={() => router.push('/ustawienia')} />
          <Wiersz ik="lock" tytul="PIN i Face ID" opis="Logowanie do aplikacji" onPress={() => router.push('/ustawienia')} />
          <Wiersz ik="bell" tytul="Powiadomienia" opis="Terminy, pisma, alerty" onPress={() => router.push('/ustawienia')} />
        </Grupa>
      </Sekcja>

      <Sekcja tytul="Osoba w pokazie">
        <Karta style={{ flexDirection: 'row', padding: 8 }}>
          {OSOBY_IDS.map(id => (
            <Pressable key={id} onPress={() => zmienOsobe(id)} accessibilityState={{ selected: id === osobaId }} accessibilityLabel={`${OSOBY[id].imie}, ${OSOBY[id].opis}`}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 16, backgroundColor: id === osobaId ? k.accBg : 'transparent' }}>
              <Portret id={id} w={48} h={48} r={24} ramka={id === osobaId ? k.acc : undefined} />
              <T v="sub" c={k.ink} style={{ fontWeight: '700', marginTop: 6 }}>{OSOBY[id].imie}</T>
              <T v="small" n={1}>{OSOBY[id].opis.split(',')[0]}</T>
            </Pressable>
          ))}
        </Karta>
      </Sekcja>

      <Sekcja>
        <Grupa>
          <Wiersz ik="help" tytul="Pokaż wprowadzenie jeszcze raz" onPress={() => ustaw({ wprowadzenie: false, pin: null })} />
          <Wiersz ik="out" tytul="Zablokuj aplikację" strzalka={false} onPress={zablokuj} />
        </Grupa>
      </Sekcja>
      <T v="small" center style={{ marginTop: 22 }}>Prototyp mObywatela · dane fikcyjne · wersja 1.0</T>
    </Ekran>
  );
}
