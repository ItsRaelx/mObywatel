import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useApp } from '@/state/app';
import { Ekran, Grupa, Ikona, Para, Portret, Przycisk, Sekcja, T, Wiersz } from '@/ui/elementy';

export default function MojeDane() {
  const { os, k, toast } = useApp(); const D = os.dane; const [pok, setPok] = useState(false);
  return (
    <Ekran>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        <Portret id={os.id} w={72} h={90} r={14} />
        <View style={{ flex: 1 }}><T v="h2">{os.moje.imie_nazwisko}</T><T v="sub">Dane z rejestru PESEL. Jeśli coś się nie zgadza, zgłoś błąd.</T></View>
      </View>
      <Sekcja tytul="Dane osobowe">
        <Grupa>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16 }}>
            <T v="sub" style={{ flex: 1 }}>PESEL</T>
            <T v="sub" c={k.ink} style={{ fontWeight: '600', fontVariant: ['tabular-nums'] }}>{pok ? os.moje.pesel : os.moje.pesel.slice(0, 4) + '•••••' + os.moje.pesel.slice(9)}</T>
            <Pressable onPress={() => setPok(!pok)} accessibilityLabel={pok ? 'Ukryj PESEL' : 'Pokaż PESEL'} style={{ marginLeft: 10, width: 34, height: 34, borderRadius: 11, backgroundColor: k.surface2, alignItems: 'center', justifyContent: 'center' }}><Ikona n="eye" size={18} color={k.ink2} /></Pressable>
          </View>
          <Para k="Urodzenie" w={D.urodz} /><Para k="Obywatelstwo" w={D.obyw} /><Para k="Stan cywilny" w={D.stan} /><Para k="Imiona rodziców" w={D.rodzice} />
        </Grupa>
      </Sekcja>
      <Sekcja tytul="Adres zameldowania">
        <Grupa>
          <Para k="Pobyt stały" w={D.zamel} /><Para k="Od" w={D.zamelOd} />
          <Wiersz ik="house" tytul="Zmień zameldowanie" opis="Online, bez wizyty w urzędzie" onPress={() => router.push('/usluga/zameldowanie')} />
          <Wiersz ik="cert" tytul="Zaświadczenie o zameldowaniu" opis="PDF od ręki, bezpłatnie" onPress={() => router.push('/usluga/zaswiadczenie-zameldowanie')} />
        </Grupa>
      </Sekcja>
      <Sekcja tytul="Dokumenty tożsamości"><Grupa><Para k="Dowód osobisty" w={os.moje.dowod} /><Para k="Paszport" w={D.pasz} /></Grupa></Sekcja>
      <Sekcja tytul="Kontakt do powiadomień"><Grupa><Para k="Telefon" w={D.tel} /><Para k="E-mail" w={D.mail} /></Grupa></Sekcja>
      <Przycisk tytul="Zgłoś błąd w danych" ik="alert" rodzaj="drugi" style={{ marginTop: 22 }} onPress={() => toast('Zgłoszenie wysłane do urzędu gminy (pokaz)')} />
    </Ekran>
  );
}
