import * as Clipboard from 'expo-clipboard';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Alert, Pressable, useWindowDimensions, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';

import { MDOWOD, POJAZDY } from '@/data/pojazdy';
import { autoSvg } from '@/lib/grafika';
import { useApp } from '@/state/app';
import { Ekran, Grupa, Ikona, Karta, Para, Przycisk, Sekcja, T, Wiersz } from '@/ui/elementy';
import { Wykres } from '@/ui/wynik';
import { KartaDokumentu, Tablica } from '@/ui/karta';

const AKCJE: Record<string, [string, string, string][]> = {
  dowod: [['qr', 'Pokaż kod', '/pokaz-kod?zakres=tozsamosc'], ['shield', 'Zastrzeż PESEL', '/usluga/zastrzez-pesel'], ['alert', 'Zgubiony dowód', '/usluga/zgubiony-dowod']],
  pj: [['qr', 'Pokaż kod', '/pokaz-kod?zakres=prawo_jazdy'], ['clock', 'Punkty karne', '/usluga/punkty'], ['id', 'Wymiana', '/usluga/prawo-jazdy']],
  auto: [['clock', 'OC i badanie', '/usluga/oc-badanie'], ['swap', 'Sprzedaż auta', '/usluga/zbycie'], ['car', 'mStłuczka', '/usluga/mstluczka']],
  kdr: [['qr', 'Pokaż kod', '/pokaz-kod?zakres=ulga'], ['coin', 'Zniżki', '/usluga/kdr']],
  leg: [['qr', 'Pokaż kod', '/pokaz-kod?zakres=ulga'], ['coin', 'Ulgi', '/usluga/ulgi-studenta']],
};
const DANE_DOK: Record<string, string[]> = { dowod: ['PESEL', 'Dowód osobisty', 'Imię i nazwisko', 'Pełnoletność', 'Zdjęcie'], pj: ['Prawo jazdy', 'Punkty karne'], auto: ['OC pojazdu', 'Dane pojazdu'], leg: ['Status studenta', 'Ważność legitymacji'], kdr: [] };

function Zegar() {
  const [t, setT] = useState(new Date()); const { k } = useApp();
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return <T v="small" center style={{ marginTop: 10, fontVariant: ['tabular-nums'] }} c={k.ink2}>Sprawdzono w rejestrze · {t.toLocaleTimeString('pl-PL')} {t.toLocaleDateString('pl-PL')}</T>;
}

/* wiersz z danymi i przyciskiem Kopiuj */
function DoSkopiowania({ k: klucz, w }: { k: string; w: string }) {
  const { k, toast } = useApp();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 }}>
      <View style={{ flex: 1 }}><T v="small">{klucz}</T><T v="bodyB" style={{ marginTop: 2 }}>{w}</T></View>
      <Pressable onPress={() => { Clipboard.setStringAsync(w).catch(() => {}); toast(`Skopiowano: ${klucz.toLowerCase()}`); }} hitSlop={8} accessibilityLabel={`Kopiuj ${klucz}`}>
        <T v="sub" c={k.accInk} style={{ fontWeight: '700' }}>Kopiuj</T>
      </Pressable>
    </View>
  );
}
/* rozwijana sekcja, jak zakładki w mObywatelu */
function Rozwijane({ ik, t, opis, children, otwarte = false }: { ik: string; t: string; opis?: string; children: ReactNode; otwarte?: boolean }) {
  const { k } = useApp(); const [o, setO] = useState(otwarte);
  return (
    <Karta style={{ marginTop: 10 }}>
      <Pressable onPress={() => setO(!o)} accessibilityRole="button" accessibilityState={{ expanded: o }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
        <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: k.surface2, alignItems: 'center', justifyContent: 'center' }}><Ikona n={ik} size={21} color={k.ink} /></View>
        <View style={{ flex: 1 }}><T v="bodyB">{t}</T>{opis ? <T v="sub">{opis}</T> : null}</View>
        <Ikona n={o ? 'up' : 'down'} size={18} color={k.ink3} />
      </Pressable>
      {o ? <Animated.View entering={FadeIn.duration(180)} style={{ borderTopWidth: 0.5, borderTopColor: k.hair }}>{children}</Animated.View> : null}
    </Karta>
  );
}
const tys = (n: number) => n.toLocaleString('pl-PL') + ' km';

function SzczegolyPojazdu({ plate, w }: { plate: string; w: number }) {
  const { k, toast, os } = useApp(); const [akt, setAkt] = useState('18.10.2026, 07:12');
  const p = POJAZDY[plate]; const doc = os.docs.find(d => d.id === 'auto')!;
  const kolor = plate === doc.plate ? doc.kolor : doc.more?.find(m => m.plate === plate)?.kolor;
  if (!p) return null;
  const ost = p.badania[0];
  const odczyty = [...p.badania].reverse();
  return (
    <View>
      <Karta style={{ padding: 14, marginTop: 4 }}>
        <SvgXml xml={autoSvg(p.marka + ' ' + p.model, kolor)} width="100%" height={(w - 28) * 0.4} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <Tablica nr={plate} s={0.95} />
          <View style={{ flex: 1 }}><T v="bodyB">{p.marka} {p.model}</T><T v="sub">{p.rodzaj}, {p.rok}</T></View>
        </View>
      </Karta>
      <Grupa style={{ marginTop: 10 }}>
        <DoSkopiowania k="Numer rejestracyjny" w={plate} />
        <DoSkopiowania k="Numer VIN" w={p.vin} />
        <Para k="Badanie techniczne ważne do" w={p.badanieDo} />
        <Para k="Stan licznika" w={`${tys(ost.licznik)}, ${ost.data}`} />
        <Para k="Ubezpieczenie OC" w={`${p.oc.tu}, do ${p.oc.do}`} />
      </Grupa>
      <Rozwijane ik="check" t="Badanie techniczne" opis={`${p.badania.length} ${p.badania.length === 1 ? 'badanie' : p.badania.length < 5 ? 'badania' : 'badań'} w historii`}>
        {p.badania.map((b, i) => (
          <View key={b.data} style={{ flexDirection: 'row', gap: 12, padding: 14, borderTopWidth: i ? 0.5 : 0, borderTopColor: k.hair }}>
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: b.wynik === 'pozytywny' ? k.okBg : k.accBg, alignItems: 'center', justifyContent: 'center' }}><Ikona n={b.wynik === 'pozytywny' ? 'ok' : 'x'} size={14} color={b.wynik === 'pozytywny' ? k.ok : k.accInk} sw={2.6} /></View>
            <View style={{ flex: 1 }}>
              <T v="bodyB">{b.data}, wynik {b.wynik}</T>
              <T v="sub">{b.stacja}. Licznik {tys(b.licznik)}.</T>
              {b.uwagi ? <T v="sub" c={k.ink} style={{ marginTop: 2 }}>{b.uwagi}</T> : null}
            </View>
          </View>
        ))}
      </Rozwijane>
      <Rozwijane ik="shield" t="Ubezpieczenie" opis={`${p.oc.tu}, ${p.oc.wariant}`}>
        <Para k="Ubezpieczyciel" w={p.oc.tu} />
        <DoSkopiowania k="Seria i numer polisy" w={p.oc.nr} />
        <Para k="Okres ubezpieczenia" w={`od ${p.oc.od} do ${p.oc.do}`} />
        <Para k="Wariant" w={p.oc.wariant} />
        {p.oc.leasing ? <T v="small" style={{ padding: 14, paddingTop: 0 }}>Auto jest w leasingu, polisę zwykle odnawia leasingodawca.</T> : null}
      </Rozwijane>
      <Rozwijane ik="history" t="Stan licznika" opis="Odczyty ze stacji kontroli pojazdów">
        <View style={{ padding: 10 }}><Wykres w={{ t: '', jedn: 'tys. km', dane: odczyty.map(b => [b.data.slice(6), Math.round(b.licznik / 1000)] as [string, number]) }} /></View>
      </Rozwijane>
      <Rozwijane ik="doc" t="Dowód rejestracyjny" opis={p.dr.nr.replace('DR/', '')}>
        <DoSkopiowania k="Seria i numer" w={p.dr.nr.replace('DR/', '')} />
        <Para k="Pierwsza rejestracja" w={p.dr.pierwsza} />
        <Para k="Rejestracja w Polsce" w={p.dr.wPolsce} />
        <Para k="Organ wydający" w={p.dr.organ} />
      </Rozwijane>
      <Rozwijane ik="sliders" t="Szczegóły pojazdu" opis={p.szczegoly.slice(0, 2).map(x => x[1]).join(', ')}>
        {p.szczegoly.map(([a, b]) => <Para key={a} k={a} w={b} />)}
      </Rozwijane>
      <Rozwijane ik="family" t="Właściciele" opis={p.wlasciciele.map(x => x[0]).join(', ')}>
        {p.wlasciciele.map(([a, b]) => <Para key={a} k={b.charAt(0).toUpperCase() + b.slice(1)} w={a} />)}
      </Rozwijane>
      <Grupa style={{ marginTop: 16 }}>
        <Wiersz ik="search" tytul="Historia pojazdu" opis="Zdarzenia, szkody, zmiany właścicieli" onPress={() => router.push('/usluga/historia-pojazdu')} />
        <Wiersz ik="mail" tytul="Dane się nie zgadzają?" opis="Zgłoś błąd w danych pojazdu" onPress={() => router.push('/usluga/blad-danych')} />
      </Grupa>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, paddingHorizontal: 4 }}>
        <T v="small" style={{ flex: 1 }}>Ostatnia aktualizacja: {akt}. Dane z CEPiK i UFG.</T>
        <Pressable onPress={() => { const t = new Date(); setAkt(`18.10.2026, ${t.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`); toast('Dane pojazdu zaktualizowane'); }} hitSlop={8}>
          <T v="sub" c={k.accInk} style={{ fontWeight: '700' }}>Aktualizuj</T>
        </Pressable>
      </View>
    </View>
  );
}

function DaneDowodu({ ukryte, setUkryte }: { ukryte: boolean; setUkryte: (b: boolean) => void }) {
  const { os, k } = useApp(); const m = MDOWOD[os.id]; const [fiz, setFiz] = useState(false);
  const kropki = (s: string) => (ukryte ? '••••••' : s);
  const [, wazny] = os.moje.dowod.split(', ważny do ');
  return (
    <>
      <Sekcja tytul="Dane mDowodu" akcja={ukryte ? 'Pokaż dane' : 'Ukryj'} onAkcja={() => setUkryte(!ukryte)}>
        <Grupa>
          <Para k="Imię" w={os.imie} />
          <Para k="Nazwisko" w={kropki(os.nazwisko)} />
          <Para k="PESEL" w={kropki(os.moje.pesel)} />
          <Para k="Data urodzenia" w={kropki(os.moje.data_urodzenia)} />
          <Para k="Obywatelstwo" w={kropki('polskie')} />
          <Para k="Imię ojca" w={kropki(m.ojciec)} />
          <Para k="Imię matki" w={kropki(m.matka)} />
          {ukryte ? <Para k="Seria i numer mDowodu" w="••••••" /> : <DoSkopiowania k="Seria i numer mDowodu" w={m.nr} />}
          <Para k="Data wydania" w={m.wydany} />
          <Para k="Termin ważności" w={m.wazny} />
        </Grupa>
        {ukryte ? <Przycisk tytul="Pokaż dane" ik="eye" rodzaj="drugi" maly style={{ marginTop: 10 }} onPress={() => setUkryte(false)} /> : null}
      </Sekcja>
      <Rozwijane ik="id" t="Dane dowodu osobistego" opis="Plastikowy dowód z chipem">
        {fiz ? (
          <>
            <DoSkopiowania k="Seria i numer" w={os.moje.nr_dowodu} />
            <Para k="Organ wydający" w={m.organ} />
            <Para k="Data wydania" w={m.wydanyFiz} />
            <Para k="Termin ważności" w={wazny} />
          </>
        ) : <View style={{ padding: 14 }}><Przycisk tytul="Pokaż dane" ik="eye" rodzaj="drugi" maly onPress={() => setFiz(true)} /></View>}
      </Rozwijane>
      <Grupa style={{ marginTop: 16 }}>
        <Wiersz ik="key" tytul="Zmień PIN do podpisu osobistego" opis="Potrzebny dowód z chipem i numer CAN" onPress={() => Alert.alert('Zmiana PIN do podpisu', 'Przyłożysz dowód osobisty do tyłu telefonu (NFC) i wpiszesz 6-cyfrowy numer CAN z przodu dowodu. W prototypie ten krok jest pominięty.')} />
      </Grupa>
      <T v="small" style={{ marginTop: 10, marginHorizontal: 4, color: k.ink2 }}>mDowód to osobny dokument z własnym numerem. Jest ważny w Polsce tak samo jak dowód plastikowy.</T>
    </>
  );
}

export default function Dok() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { os, k, log } = useApp(); const { width } = useWindowDimensions();
  const d = os.docs.find(x => x.id === id); const [ukryte, setUkryte] = useState(id === 'dowod');
  const [wybAuto, setWybAuto] = useState(d?.plate ?? '');
  if (!d) return <Ekran tytul="Nie znaleziono dokumentu"><T>Ten dokument nie jest w Twoim portfelu.</T></Ekran>;
  const w = Math.min(width - 32, 440);
  const widzieli = log.filter(x => x.dane.some(z => (DANE_DOK[d.id] ?? []).includes(z))).slice(0, 3);
  const auta = d.plate ? [{ plate: d.plate, model: d.model!, kolor: d.kolor! }, ...(d.more ?? [])] : [];

  return (
    <Ekran>
      <Stack.Screen options={{ title: d.name }} />
      <Animated.View entering={FadeIn.duration(300)}><KartaDokumentu d={d} os={os} w={w} ukryte={ukryte} hologram onQR={() => router.push('/pokaz-kod?zakres=tozsamosc')} onPokaz={() => setUkryte(false)} /></Animated.View>
      <Zegar />

      <Karta style={{ marginTop: 14, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: d.alert ? k.accBg : k.okBg }}>
        <Ikona n={d.alert ? 'alert' : 'check'} size={28} color={d.alert ? k.accInk : k.ok} />
        <View style={{ flex: 1 }}>
          <T v="bodyB" c={d.alert ? k.accInk : k.ok}>{d.alert ?? 'Dokument ważny'}</T>
          <T v="sub">{d.sub}</T>
        </View>
      </Karta>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
        {(AKCJE[d.id] ?? []).map(([ik, t, tr], i) => (
          <Pressable key={t} onPress={() => router.push(tr as never)} accessibilityRole="button" style={{ flex: 1, alignItems: 'center', gap: 7 }}>
            <View style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: i === 0 ? k.acc : k.surface, alignItems: 'center', justifyContent: 'center', borderWidth: k.dark && i ? 1 : 0, borderColor: k.hair }}>
              <Ikona n={ik} size={25} color={i === 0 ? '#fff' : k.ink} />
            </View>
            <T v="small" c={k.ink} center style={{ fontWeight: '600' }}>{t}</T>
          </Pressable>
        ))}
      </View>

      {auta.length ? (
        <Sekcja tytul={auta.length > 1 ? 'Twoje pojazdy' : 'Pojazd'}>
          {auta.length > 1 ? (
            <View style={{ flexDirection: 'row', padding: 4, borderRadius: 15, backgroundColor: k.surface2, marginBottom: 10 }}>
              {auta.map(a => { const on = a.plate === wybAuto; return (
                <Pressable key={a.plate} onPress={() => setWybAuto(a.plate)} style={{ flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center', backgroundColor: on ? k.surface : 'transparent' }} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                  <T v="sub" c={on ? k.ink : k.ink2} style={{ fontWeight: '700' }}>{a.plate}</T>
                </Pressable>
              ); })}
            </View>
          ) : null}
          <Animated.View key={wybAuto} entering={FadeIn.duration(200)}><SzczegolyPojazdu plate={wybAuto} w={w} /></Animated.View>
        </Sekcja>
      ) : d.id === 'dowod' ? <DaneDowodu ukryte={ukryte} setUkryte={setUkryte} /> : (
        <Sekcja tytul="Dane dokumentu">
          <Grupa>{d.rows.map(([a, b]) => <Para key={a} k={a} w={b} />)}</Grupa>
        </Sekcja>
      )}

      {widzieli.length ? (
        <Sekcja tytul="Kto ostatnio sprawdzał" akcja="Wszystko" onAkcja={() => router.push('/prywatnosc')}>
          <Grupa>{widzieli.map(x => <Wiersz key={x.id} ik={x.typ === 'alert' ? 'alert' : x.typ === 'urzad' ? 'gov' : x.typ === 'ty' ? 'user' : 'brief'} ikAkcent={x.typ === 'alert'} tytul={x.kto} opis={`${x.co} · ${x.kiedy}`} onPress={() => router.push('/prywatnosc')} />)}</Grupa>
        </Sekcja>
      ) : null}
    </Ekran>
  );
}
