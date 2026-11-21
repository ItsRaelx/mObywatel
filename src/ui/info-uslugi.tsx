/* Usługi informacyjne z własnym, interaktywnym ekranem: punkty, recepty, szczepienia, emerytura, KDR, ulgi, OC i badanie, prawo jazdy. */
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import { dniDo, kiedy, pl3, type Osoba } from '@/data/typy';
import type { Usluga } from '@/data/uslugi';
import { autoSvg } from '@/lib/grafika';
import { useApp } from '@/state/app';
import { Avatar, Dni, Ekran, Grupa, Ikona, IkonaKafel, Karta, KodQR, Para, Pill, Przycisk, Sekcja, T, Wiersz } from '@/ui/elementy';
import { Pasek, Sprezyna, Wejscie } from '@/ui/ruch';

/* ---------- wspólne ---------- */
function Chipy({ opcje, v, set }: { opcje: string[]; v: string; set: (s: string) => void }) {
  const { k } = useApp();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
      {opcje.map(o => { const on = o === v; return (
        <Sprezyna key={o} onPress={() => set(o)} accessibilityRole="tab" accessibilityState={{ selected: on }}
          style={{ paddingHorizontal: 15, paddingVertical: 9, borderRadius: 999, backgroundColor: on ? k.ink : k.surface, borderWidth: 1, borderColor: on ? k.ink : k.hair }}>
          <T v="sub" c={on ? k.bg : k.ink} style={{ fontWeight: '700' }}>{o}</T>
        </Sprezyna>
      ); })}
    </ScrollView>
  );
}
function Segment({ opcje, v, set }: { opcje: string[]; v: string; set: (s: string) => void }) {
  const { k } = useApp();
  return (
    <View style={{ flexDirection: 'row', padding: 4, borderRadius: 15, backgroundColor: k.surface2 }}>
      {opcje.map(o => { const on = o === v; return (
        <Pressable key={o} onPress={() => set(o)} style={{ flex: 1 }} accessibilityRole="tab" accessibilityState={{ selected: on }}>
          <Animated.View layout={LinearTransition} style={{ paddingVertical: 10, borderRadius: 11, alignItems: 'center', backgroundColor: on ? k.surface : 'transparent' }}>
            <T v="sub" c={on ? k.ink : k.ink2} style={{ fontWeight: '700' }}>{o}</T>
          </Animated.View>
        </Pressable>
      ); })}
    </View>
  );
}
function Hero({ u, children }: { u: Usluga; children?: ReactNode }) {
  const { k } = useApp();
  return (
    <View style={{ marginBottom: 22, paddingTop: 4 }}>
      <IkonaKafel n={u.ik} akcent size={52} />
      <T v="h1" style={{ fontSize: 28, lineHeight: 33, marginTop: 18 }}>{u.t}</T>
      <T v="body" c={k.ink2} style={{ marginTop: 8 }}>{u.opis}</T>
      {children}
    </View>
  );
}
function Przypis({ children }: { children: ReactNode }) {
  return <T v="small" style={{ marginTop: 14, marginHorizontal: 4, lineHeight: 18 }}>{children}</T>;
}
const data = (s: string) => s.match(/\d{2}\.\d{2}\.\d{4}/)?.[0] ?? null;
const PIERWSZA = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- punkty karne ---------- */
function Punkty({ u, os }: { u: Usluga; os: Osoba }) {
  const { k } = useApp(); const p = os.sc.punkty;
  const probny = !!p.probny; const limit = probny ? 20 : 24;
  const f = p.n / limit; const kol = f > 0.6 ? k.acc : f > 0.3 ? k.warn : k.ok;
  const wyk = p.n && p.wyk && p.data && p.wyg ? [{ t: p.wyk, d: p.data, n: p.n, wyg: p.wyg, gdzie: p.gdzie ?? '' }] : [];
  return (
    <>
      <Hero u={u} />
      <Karta style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
          <T v="h1" style={{ fontSize: 48, lineHeight: 52 }}>{p.n}</T>
          <T v="body" c={k.ink2} style={{ marginBottom: 8 }}>{pl3(p.n, 'punkt', 'punkty', 'punktów')} z {limit}</T>
        </View>
        <View style={{ marginTop: 14 }}><Pasek f={Math.max(f, 0.01)} kolor={kol} tlo={k.surface2} h={8} /></View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}><T v="small">0</T><T v="small">Limit {limit}</T></View>
        <T v="body" style={{ marginTop: 14 }}>{p.n === 0 ? p.note : `Do limitu zostało ${limit - p.n} pkt. ${p.note}`}</T>
      </Karta>
      {probny ? (
        <Grupa style={{ marginTop: 12 }}>
          <Para k="Okres próbny" w={p.probny ?? ''} />
          <Para k="Limit 20 pkt" w={p.limit20 ?? ''} />
        </Grupa>
      ) : null}
      <Sekcja tytul="Wykroczenia" i={3} style={{ marginTop: 22 }}>
        {wyk.length ? <Grupa>{wyk.map(w => (
          <Wiersz key={w.d} tytul={w.t} opis={`${w.d}, ${w.gdzie}. Wygasną ${w.wyg} (${kiedy(dniDo(w.wyg))}).`} prawa={<T v="bodyB" c={k.accInk}>{w.n} pkt</T>} />
        ))}</Grupa> : <Grupa><Wiersz ik="check" tytul="Brak wykroczeń" opis="W ostatnich 2 latach" /></Grupa>}
      </Sekcja>
      <Grupa style={{ marginTop: 22 }}>
        <Wiersz ik="receipt" tytul="Mandaty" opis="Opłać i zobacz historię" onPress={() => router.push('/platnosci')} />
      </Grupa>
      <Przypis>Punkty wygasają po roku od zapłaty mandatu. Nie da się ich zmniejszyć kursem.</Przypis>
    </>
  );
}

/* ---------- recepty i skierowania ---------- */
type Recepta = { lek: string; dawka: string; do: string; kod: string; dla: string; stan: 'aktywna' | 'czesc' | 'wykupiona'; lekarz: string };
const RECEPTY: Record<string, Recepta[]> = {
  alicja: [
    { lek: 'Paracetamol 120 mg/5 ml, zawiesina', dawka: '5 ml do 4 razy dziennie przy gorączce', do: '15.11.2026', kod: '3092', dla: 'Ida', stan: 'aktywna', lekarz: 'lek. E. Grabowska, Przychodnia Rodzinna Łazarz' },
    { lek: 'Mometazon, aerozol do nosa', dawka: '1 dawka do każdego otworu raz dziennie', do: '02.03.2027', kod: '7715', dla: 'Lena', stan: 'czesc', lekarz: 'lek. T. Banaś, Poradnia laryngologiczna' },
    { lek: 'Kwas foliowy 0,4 mg', dawka: '1 tabletka dziennie', do: '30.09.2026', kod: '1408', dla: 'Alicja', stan: 'wykupiona', lekarz: 'lek. E. Grabowska' },
  ],
  rafal: [
    { lek: 'Diklofenak, żel 1%', dawka: 'na bolące miejsce 3 razy dziennie', do: '20.11.2026', kod: '6024', dla: 'Rafał', stan: 'aktywna', lekarz: 'lek. P. Woźniak, Przychodnia Górna' },
    { lek: 'Montelukast 10 mg', dawka: '1 tabletka wieczorem', do: '11.01.2027', kod: '6187', dla: 'Szymon', stan: 'czesc', lekarz: 'lek. A. Kurek, Poradnia alergologiczna' },
  ],
  bozena: [
    { lek: 'Enoksaparyna 40 mg, zastrzyki', dawka: '1 zastrzyk dziennie przez 4 tygodnie', do: '06.11.2026', kod: '9120', dla: 'Zbigniew', stan: 'aktywna', lekarz: 'lek. M. Stelmach, Klinika Ortopedii' },
    { lek: 'Metamizol 500 mg', dawka: 'doraźnie przy bólu, do 3 razy dziennie', do: '30.11.2026', kod: '9121', dla: 'Zbigniew', stan: 'aktywna', lekarz: 'lek. M. Stelmach' },
    { lek: 'Ramipryl 5 mg', dawka: '1 tabletka rano', do: '14.04.2027', kod: '2851', dla: 'Bożena', stan: 'czesc', lekarz: 'lek. R. Olszewska, Przychodnia Pogodno' },
  ],
  wiktor: [{ lek: 'Desloratadyna 5 mg', dawka: '1 tabletka dziennie w okresie pylenia', do: '31.08.2026', kod: '4430', dla: 'Wiktor', stan: 'wykupiona', lekarz: 'lek. J. Sowa, Studencka Przychodnia Zdrowia' }],
};
const SKIEROWANIA: Record<string, [string, string, string, string][]> = {
  alicja: [['Poradnia laryngologiczna', 'Lena', 'Termin: 12.11.2026, 15:20', 'Szpital Miejski im. F. Raszei, ul. Mickiewicza 2']],
  rafal: [['Rezonans kręgosłupa lędźwiowego', 'Rafał', 'Do umówienia', 'kod skierowania 4472']],
  bozena: [['Rehabilitacja stacjonarna', 'Zbigniew', 'Termin: 09.11.2026, 8:00', 'Centrum Rehabilitacji Pogodno'], ['Mammografia', 'Bożena', 'Do umówienia', 'kod skierowania 7301']],
  wiktor: [],
};
function KartaRecepty({ r }: { r: Recepta }) {
  const { k, os } = useApp(); const [kod, setKod] = useState(false);
  const aktywna = r.stan !== 'wykupiona';
  const stan = r.stan === 'aktywna' ? 'Do wykupienia' : r.stan === 'czesc' ? 'Wykupiona częściowo' : 'Wykupiona';
  const dla = r.dla === os.imie ? '' : `, dla: ${r.dla}`;
  return (
    <Grupa style={{ marginBottom: 12 }}>
      <Wiersz lewa={<IkonaKafel n="pill" />} tytul={r.lek} opis={`${stan}${aktywna ? `, ważna do ${r.do.slice(0, 5)}` : ''}${dla}`}
        onPress={aktywna ? () => setKod(!kod) : undefined} strzalka={false}
        prawa={aktywna ? <T v="sub" c={k.accInk} style={{ fontWeight: '700' }}>{kod ? 'Ukryj' : 'Kod'}</T> : null} />
      {kod ? (
        <Animated.View entering={FadeIn.duration(200)} style={{ alignItems: 'center', padding: 18 }}>
          <T v="h1" style={{ fontSize: 40, letterSpacing: 10 }}>{r.kod}</T>
          <View style={{ marginTop: 12, padding: 8, backgroundColor: '#fff', borderRadius: 12 }}><KodQR tekst={`erecepta:${r.kod}:${r.dla}`} size={140} logo={false} /></View>
          <T v="small" center style={{ marginTop: 10 }}>{r.dawka}. W aptece podaj kod i PESEL{r.dla === os.imie ? '' : ` osoby (${r.dla})`} albo pokaż kod QR.</T>
        </Animated.View>
      ) : null}
    </Grupa>
  );
}
function Recepty({ u, os }: { u: Usluga; os: Osoba }) {
  const { k } = useApp();
  const [tab, setTab] = useState('Recepty'); const [kto, setKto] = useState('Wszyscy');
  const rs = RECEPTY[os.id] ?? []; const sk = SKIEROWANIA[os.id] ?? [];
  const osoby = ['Wszyscy', ...Array.from(new Set(rs.map(r => r.dla)))];
  const lista = rs.filter(r => kto === 'Wszyscy' || r.dla === kto);
  return (
    <>
      <Hero u={u} />
      {os.id === 'bozena' ? <Przypis>Masz upoważnienie do konta pacjenta męża, Zbigniewa Kaczmarka. Jego recepty widzisz razem ze swoimi.</Przypis> : null}
      <View style={{ marginTop: 14, marginBottom: 14 }}><Segment opcje={['Recepty', 'Skierowania']} v={tab} set={setTab} /></View>
      {tab === 'Recepty' ? (
        <Animated.View key="r" entering={FadeIn}>
          {osoby.length > 2 ? <View style={{ marginBottom: 14 }}><Chipy opcje={osoby} v={kto} set={setKto} /></View> : null}
          {lista.map(r => <KartaRecepty key={r.kod} r={r} />)}
        </Animated.View>
      ) : (
        <Animated.View key="s" entering={FadeIn}>
          {sk.length ? <Grupa>{sk.map(([t, dla, kiedy_, gdzie]) => <Wiersz key={t} ik="doc" tytul={t} opis={`${dla} · ${kiedy_}\n${gdzie}`} prawa={<Pill t={kiedy_.startsWith('Termin') ? 'Umówione' : 'Umów'} ton={kiedy_.startsWith('Termin') ? 'g' : 'a'} />} />)}</Grupa>
            : <Karta style={{ padding: 20, alignItems: 'center' }}><Ikona n="doc" size={28} color={k.ink3} /><T v="bodyB" style={{ marginTop: 8 }}>Brak aktywnych skierowań</T></Karta>}
        </Animated.View>
      )}
    </>
  );
}

/* ---------- szczepienia ---------- */
function plan(wiek: number): [string, string, 0 | 1 | 2][] {
  const ob: [number, string, string][] = [[0, 'Gruźlica, WZW B', 'po urodzeniu'], [0, 'DTP, Hib, IPV, WZW B', '2 miesiąc'], [1, 'Odra, świnka, różyczka (MMR)', '13-15 miesiąc'], [1, 'Pneumokoki', '13-15 miesiąc'], [6, 'DTaP, IPV (przypominająca)', '6 lat'], [6, 'MMR (druga dawka)', '6 lat'], [9, 'HPV (zalecane)', '9-14 lat'], [14, 'Tdap (przypominająca)', '14 lat'], [19, 'Td (przypominająca)', '19 lat']];
  const r = ob.map(([w, t, kiedy_]): [string, string, 0 | 1 | 2] => [t, kiedy_, wiek > w ? 2 : wiek === w ? 1 : 0]);
  return wiek >= 19 ? [...r.filter(x => x[2] === 2).slice(-3), ['Grypa (zalecane co sezon)', 'od października do marca', 1], ['Td co 10 lat', 'następna: 2031', 0]] : r;
}
function Szczepienia({ u, os }: { u: Usluga; os: Osoba }) {
  const { k, toast } = useApp();
  const osoby: { id: string; imie: string; wiek: number }[] = [{ id: os.id, imie: os.imie, wiek: 2026 - +os.moje.data_urodzenia.slice(6) }, ...os.rodzina.filter(m => m.wiek < 18 || m.wiek > 80)];
  const [kto, setKto] = useState(osoby.find(o => o.wiek < 18)?.imie ?? os.imie);
  const o = osoby.find(x => x.imie === kto)!; const pl = o.wiek > 80 ? [['Grypa', 'od października do marca', 1], ['Pneumokoki (zalecane po 65. r.ż.)', 'jednorazowo', 2], ['Półpasiec (zalecane)', 'do umówienia', 0], ['COVID-19 (sezonowe)', 'jesień 2026', 0]] as [string, string, 0 | 1 | 2][] : plan(o.wiek);
  const nast = pl.find(p => p[2] === 1) ?? pl.find(p => p[2] === 0);
  return (
    <>
      <Hero u={u} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ gap: 14, paddingHorizontal: 16, paddingBottom: 6 }}>
        {osoby.map(x => { const on = x.imie === kto; return (
          <Sprezyna key={x.imie} onPress={() => setKto(x.imie)} style={{ alignItems: 'center', width: 66, opacity: on ? 1 : 0.6 }}>
            <Avatar id={x.id} size={56} ramka={on ? k.acc : undefined} />
            <T v="small" c={on ? k.ink : k.ink2} style={{ marginTop: 6, fontWeight: '700' }}>{x.imie}</T>
          </Sprezyna>
        ); })}
      </ScrollView>
      <Animated.View key={kto} entering={FadeIn.duration(300)}>
        {nast ? (
          <Karta style={{ padding: 16, marginTop: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <IkonaKafel n="cal" akcent />
            <View style={{ flex: 1 }}><T v="cap">Następne</T><T v="bodyB" style={{ marginTop: 2 }}>{nast[0]}</T><T v="sub">{nast[1]}</T></View>
          </Karta>
        ) : null}
        <Sekcja tytul={`Kalendarz: ${kto}, ${o.wiek} ${pl3(o.wiek, 'rok', 'lata', 'lat')}`} style={{ marginTop: 22 }}>
          <Karta style={{ padding: 16 }}>
            {pl.map(([t, kiedy_, s], i) => (
              <Animated.View key={t} entering={FadeIn.delay(i * 30).duration(220)} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ alignItems: 'center', width: 24 }}>
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: s === 2 ? k.ok : s === 1 ? k.warnBg : k.surface2, borderWidth: s === 1 ? 2 : 0, borderColor: k.warn, alignItems: 'center', justifyContent: 'center' }}>{s === 2 ? <Ikona n="ok" size={13} color="#fff" sw={2.8} /> : null}</View>
                  {i < pl.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 12, backgroundColor: s === 2 ? k.ok : k.hair, marginVertical: 3 }} /> : null}
                </View>
                <View style={{ flex: 1, paddingBottom: 14 }}>
                  <T v="body" c={s === 2 ? k.ink2 : k.ink} style={{ fontWeight: s === 1 ? '700' : '500' }}>{t}</T>
                  <T v="small">{s === 2 ? `wykonane · ${kiedy_}` : kiedy_}</T>
                </View>
              </Animated.View>
            ))}
          </Karta>
        </Sekcja>
      </Animated.View>
      <Przycisk tytul="Pobierz zaświadczenie o szczepieniach" ik="download" rodzaj="drugi" style={{ marginTop: 18 }} onPress={() => toast('Zaświadczenie trafiło do skrzynki')} />
    </>
  );
}

/* ---------- emerytura ---------- */
function Emerytura({ u, os }: { u: Usluga; os: Osoba }) {
  const { k } = useApp();
  const rok = +os.moje.data_urodzenia.slice(6); const ustaw = os.plec === 'K' ? 60 : 65;
  const opcje = os.plec === 'K' ? [60, 62, 65, 67] : [65, 67, 70];
  const [w, setW] = useState(ustaw);
  const baza = ({ alicja: 3280, rafal: 3610, bozena: 3720, wiktor: 4350 } as Record<string, number>)[os.id] ?? 3500;
  const kwota = Math.round(baza * (1 + (w - ustaw) * 0.085) / 10) * 10;
  const skladki = ({ alicja: '254 610 zł', rafal: '371 880 zł', bozena: '598 330 zł', wiktor: '9 840 zł' } as Record<string, string>)[os.id] ?? 'brak';
  const lat = rok + w - 2026;
  return (
    <>
      <Hero u={u} />
      <Wejscie i={1}>
        <Karta style={{ padding: 20 }}>
          <T v="cap">Prognoza emerytury (brutto)</T>
          <Animated.View key={w} entering={FadeIn.duration(200)}><T v="h1" style={{ fontSize: 44, lineHeight: 50, marginTop: 6 }}>{kwota.toLocaleString('pl-PL')} zł</T></Animated.View>
          <T v="sub">miesięcznie, jeśli przejdziesz na emeryturę w wieku {w} lat ({rok + w})</T>
          <View style={{ marginTop: 18 }}><Pasek f={Math.min(1, (2026 - rok - 18) / (w - 18))} kolor={k.acc} tlo={k.surface2} h={10} /></View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}><T v="small">Start pracy</T><T v="small">{lat > 0 ? `Jeszcze ${lat} ${pl3(lat, 'rok', 'lata', 'lat')}` : 'Możesz złożyć wniosek'}</T></View>
        </Karta>
      </Wejscie>
      <Sekcja tytul="Kiedy chcesz przejść na emeryturę?" i={2} style={{ marginTop: 22 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {opcje.map(o => { const on = o === w; return (
            <Sprezyna key={o} onPress={() => setW(o)} zewn={{ flex: 1 }} style={{ paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: on ? k.ink : k.surface, borderWidth: 1, borderColor: on ? k.ink : k.hair }}>
              <T v="h3" c={on ? k.bg : k.ink}>{o}</T>
              <T v="small" c={on ? k.bg : k.ink2}>{o === ustaw ? 'ustawowy' : `+${Math.round((o - ustaw) * 8.5)}%`}</T>
            </Sprezyna>
          ); })}
        </View>
        <T v="small" style={{ marginTop: 8 }}>Każdy rok dłuższej pracy to wyższa emerytura, bo składki dzielone są przez krótszy okres.</T>
      </Sekcja>
      <Sekcja tytul="Twoje konto w ZUS" i={3} style={{ marginTop: 22 }}>
        <Grupa>
          <Para k="Wiek emerytalny" w={`${os.moje.data_urodzenia.slice(0, 6)}${rok + ustaw}`} />
          <Para k="Zwaloryzowane składki" w={skladki} />
          <Para k="Kapitał początkowy" w={rok < 1969 ? '91 470 zł' : 'nie dotyczy'} />
          <Para k="Staż ubezpieczeniowy" w={`${Math.max(0, 2026 - rok - 22)} lat`} />
        </Grupa>
      </Sekcja>
      <Przypis>Prognoza zakłada obecne zarobki do końca pracy. Wniosek o emeryturę złożysz najwcześniej miesiąc przed osiągnięciem wieku emerytalnego.</Przypis>
    </>
  );
}

/* ---------- Karta Dużej Rodziny ---------- */
const PARTNERZY: [string, string, string, string, string][] = [
  ['Koleje regionalne', 'Transport', '37% na bilety jednorazowe, 49% na miesięczne', 'cała Polska', 'bus'],
  ['Parki narodowe', 'Kultura', 'bezpłatny wstęp', 'cała Polska', 'globe'],
  ['Stacje Paliwo Plus', 'Paliwo', '15 gr mniej na litrze', '1,2 km', 'car'],
  ['Kino Gwiazda', 'Kultura', 'bilet rodzinny -30%', '2,4 km', 'star'],
  ['Muzeum Miejskie', 'Kultura', 'bilety ulgowe dla całej rodziny', '3,1 km', 'gov'],
  ['Sklep Pod Kasztanem', 'Zakupy', '5% na zakupy powyżej 100 zł', '0,6 km', 'receipt'],
  ['Księgarnia Strona', 'Zakupy', '10% na podręczniki', '1,8 km', 'cap'],
  ['Apteka Pod Lipami', 'Zdrowie', '7% na leki bez recepty', '0,9 km', 'pill'],
  ['Basen Fala', 'Sport', 'wejście dzieci za 1 zł', '2,7 km', 'heart'],
  ['Operator komórkowy Zasięg', 'Usługi', 'abonament rodzinny -20%', 'online', 'phone'],
];
function Kdr({ u, os }: { u: Usluga; os: Osoba }) {
  const { k } = useApp(); const ma = os.docs.some(d => d.id === 'kdr');
  const [kat, setKat] = useState('Wszystkie'); const [q, setQ] = useState('');
  const lista = PARTNERZY.filter(p => (kat === 'Wszystkie' || p[1] === kat) && (`${p[0]} ${p[2]}`).toLowerCase().includes(q.toLowerCase()));
  if (!ma) return (
    <>
      <Hero u={u} />
      <T v="body" style={{ marginBottom: 16 }}>Karta przysługuje rodzinom z co najmniej trojgiem dzieci, niezależnie od dochodu. Rodzice dostają ją dożywotnio.</T>
      <Grupa>
        <Para k="Kto może dostać" w="rodzina z min. 3 dzieci" />
        <Para k="Dzieci" w="do 18 lat, uczące się do 25" />
        <Para k="Gdzie złożyć" w="urząd gminy albo online" />
        <Para k="Opłata" w="bezpłatnie" />
      </Grupa>
    </>
  );
  const czl = os.rodzina.length + 1;
  return (
    <>
      <Hero u={u} />
      <Wejscie i={1}>
        <Karta onPress={() => router.push('/dokument/kdr')} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flexDirection: 'row' }}>
            {[os.id, ...os.rodzina.map(m => m.id)].slice(0, 4).map((id, i) => <View key={id} style={{ marginLeft: i ? -12 : 0 }}><Avatar id={id} size={38} ramka={k.surface} /></View>)}
          </View>
          <View style={{ flex: 1 }}><T v="bodyB">Karta całej rodziny</T><T v="sub">{czl} {pl3(czl, 'osoba', 'osoby', 'osób')}, każdy ma ją w swoim telefonie</T></View>
          <Ikona n="chev" size={18} color={k.ink3} />
        </Karta>
      </Wejscie>
      <Sekcja tytul="Twoje korzyści" style={{ marginTop: 22 }}>
        <Grupa>
          <Wiersz ik="bus" tytul="Pociągi" opis="37% taniej, bilet miesięczny 49% taniej" />
          <Wiersz ik="globe" tytul="Parki narodowe" opis="Wstęp bezpłatny" />
          <Wiersz ik="star" tytul="Ponad 30 tysięcy partnerów" opis="Sklepy, kina, stacje paliw, muzea" />
        </Grupa>
      </Sekcja>
      <Sekcja tytul="Zniżki w okolicy" i={3} style={{ marginTop: 22 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, borderRadius: 14, paddingHorizontal: 14, backgroundColor: k.surface, borderWidth: 1, borderColor: k.hair, marginBottom: 12 }}>
          <Ikona n="search" size={18} color={k.ink3} />
          <TextInput value={q} onChangeText={setQ} placeholder="Szukaj partnera" placeholderTextColor={k.ink3} style={{ flex: 1, fontSize: 16, color: k.ink }} />
        </View>
        <Chipy opcje={['Wszystkie', 'Transport', 'Kultura', 'Paliwo', 'Zakupy', 'Zdrowie', 'Sport']} v={kat} set={setKat} />
        <Animated.View key={kat + q} entering={FadeIn.duration(250)} style={{ marginTop: 12 }}>
          {lista.length ? <Grupa>{lista.map(p => <Wiersz key={p[0]} ik={p[4]} tytul={p[0]} opis={p[2]} prawa={<T v="small">{p[3]}</T>} />)}</Grupa>
            : <Karta style={{ padding: 18, alignItems: 'center' }}><T v="sub">Nic nie znaleźliśmy. Spróbuj innej nazwy.</T></Karta>}
        </Animated.View>
      </Sekcja>
    </>
  );
}

/* ---------- ulgi studenta ---------- */
function Ulgi({ u }: { u: Usluga }) {
  const { k } = useApp();
  const trasy: [string, number][] = [['Wrocław-Opole', 39], ['Wrocław-Poznań', 79], ['Wrocław-Kraków', 99], ['Wrocław-Warszawa', 149]];
  const [t, setT] = useState(trasy[0][0]); const cena = trasy.find(x => x[0] === t)![1];
  return (
    <>
      <Hero u={u} />
      <Wejscie i={1}>
        <Karta style={{ padding: 18 }}>
          <T v="cap">Kalkulator biletu (pociąg, 2 klasa)</T>
          <View style={{ marginTop: 12 }}><Chipy opcje={trasy.map(x => x[0])} v={t} set={setT} /></View>
          <Animated.View key={t} entering={FadeIn.duration(200)} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 16 }}>
            <View><T v="small">Normalny</T><T v="h3" c={k.ink3} style={{ textDecorationLine: 'line-through' }}>{cena} zł</T></View>
            <Ikona n="arrow" size={20} color={k.ink3} />
            <View><T v="small">Z mLegitymacją</T><T v="h1" style={{ fontSize: 38, lineHeight: 42 }}>{(cena * 0.49).toFixed(2).replace('.', ',')} zł</T></View>
          </Animated.View>
          <View style={{ flexDirection: 'row', marginTop: 12 }}><Pill t={`Oszczędzasz ${(cena * 0.51).toFixed(0)} zł`} ton="g" ik="coin" /></View>
        </Karta>
      </Wejscie>
      <Sekcja tytul="Co Ci przysługuje" i={2} style={{ marginTop: 22 }}>
        <Grupa>
          <Wiersz ik="bus" tytul="Pociągi PKP i regionalne" opis="51% zniżki do 26. roku życia" prawa={<T v="h3" c={k.accInk}>51%</T>} />
          <Wiersz ik="bus" tytul="Komunikacja miejska" opis="Bilety ulgowe; zasady ustala miasto" prawa={<T v="h3" c={k.accInk}>50%</T>} />
          <Wiersz ik="gov" tytul="Muzea i instytucje państwowe" opis="Bilety ulgowe" />
          <Wiersz ik="pill" tytul="Leki dla studentów" opis="Do 26. r.ż. część leków bezpłatnie" />
        </Grupa>
      </Sekcja>
      <Przycisk tytul="Pokaż mLegitymację" ik="id" style={{ marginTop: 20 }} onPress={() => router.push('/dokument/leg')} />
      <Przypis>Konduktor sprawdzi legitymację na ekranie albo zeskanuje kod QR. Nie musisz mieć plastikowej karty.</Przypis>
    </>
  );
}

/* ---------- OC i badanie techniczne ---------- */
function OcBadanie({ u, os }: { u: Usluga; os: Osoba }) {
  const { k, toast } = useApp(); const a = os.docs.find(d => d.id === 'auto')!;
  const r = (key: string) => a.rows.find(x => x[0] === key)?.[1] ?? '';
  const auta = [{ plate: a.plate!, model: r('Pojazd') || a.model!, kolor: a.kolor, oc: r('OC'), bt: r('Badanie techniczne') },
    ...(a.more ?? []).map(m => ({ plate: m.plate, model: m.model, kolor: m.kolor, oc: a.rows.find(x => /^OC /.test(x[0]))?.[1] ?? '', bt: os.sc.oc.rows.find(x => /Badanie/.test(x[0]))?.[1] ?? '' }))];
  const [wyb, setWyb] = useState(0); const [przyp, setPrzyp] = useState<string[]>([]);
  const x = auta[wyb]; const ocD = data(x.oc), btD = data(x.bt);
  const STACJE = [[`SKP Okręgowa, ${os.sc.miasto}`, '1,4 km', 'dziś do 18:00'], [`Stacja Kontroli Pojazdów Auto-Test`, '2,9 km', 'jutro od 7:00'], [`SKP przy ul. Przemysłowej`, '4,2 km', 'sob. 8:00-14:00']];
  const nOc = ocD ? dniDo(ocD) : 999, nBt = btD ? dniDo(btD) : 999;
  const pilne = Math.min(nOc, nBt) < 30;
  const status = !pilne ? 'Wszystko w porządku' : nOc <= nBt ? `OC kończy się za ${nOc} ${pl3(nOc, 'dzień', 'dni', 'dni')}` : `Badanie traci ważność za ${nBt} ${pl3(nBt, 'dzień', 'dni', 'dni')}`;
  const id = x.plate; const ma = przyp.includes(id);
  const termin = (t: string, ik: string, d: string | null, opis: string) => {
    const n = d ? dniDo(d) : null;
    return <Wiersz ik={ik} tytul={t} opis={opis} prawa={n != null ? <T v="sub" c={n < 30 ? k.accInk : k.ink2} style={{ fontWeight: '700' }}>{kiedy(n)}</T> : null} />;
  };
  return (
    <>
      <Hero u={u} />
      {auta.length > 1 ? <View style={{ marginBottom: 14 }}><Segment opcje={auta.map(z => z.plate)} v={x.plate} set={p => setWyb(auta.findIndex(z => z.plate === p))} /></View> : null}
      <Animated.View key={x.plate} entering={FadeIn.duration(250)}>
        <SvgXml xml={autoSvg(x.model, x.kolor)} width="100%" height={120} />
        <T v="sub" center style={{ marginTop: 4 }}>{x.model}, {x.plate}</T>
        <T v="h2" style={{ marginTop: 22, marginBottom: 12 }} c={pilne ? k.accInk : k.ink}>{status}</T>
        <Grupa>
          {termin('Ubezpieczenie OC', 'shield', ocD, ocD ? `${x.oc.replace(/, do .*/, '')}, do ${ocD}` : x.oc)}
          {termin('Badanie techniczne', 'check', btD, btD ? `Ważne do ${btD}` : x.bt)}
          <Pressable onPress={() => { setPrzyp(p => ma ? p.filter(y => y !== id) : [...p, id]); if (!ma) toast('Przypomnimy 7 dni przed terminem'); }} accessibilityRole="switch" accessibilityState={{ checked: ma }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 14, minHeight: 62 }}>
            <IkonaKafel n="bell" />
            <T v="bodyB" style={{ flex: 1 }}>Przypomnij przed terminem</T>
            <View style={{ width: 50, height: 30, borderRadius: 15, padding: 3, backgroundColor: ma ? k.ok : k.surface2, alignItems: ma ? 'flex-end' : 'flex-start' }}><View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' }} /></View>
          </Pressable>
        </Grupa>
        <Przypis>{wyb === 0 ? os.sc.oc.note : 'Auto jest w leasingu, więc OC zwykle odnawia leasingodawca.'}</Przypis>
      </Animated.View>
      {btD && dniDo(btD) < 90 ? (
        <Sekcja tytul="Stacje kontroli w pobliżu" style={{ marginTop: 22 }}>
          <Grupa>{STACJE.map(([n, d, g]) => <Wiersz key={n} ik="pin" tytul={n} opis={`${d}, ${g}`} prawa={<T v="small">ok. 149 zł</T>} onPress={() => toast('Otworzymy nawigację do stacji')} />)}</Grupa>
        </Sekcja>
      ) : null}
      <Grupa style={{ marginTop: 22 }}>
        <Wiersz ik="car" tytul="Dokument pojazdu" onPress={() => router.push('/dokument/auto')} />
        <Wiersz ik="swap" tytul="Zgłoś sprzedaż pojazdu" onPress={() => router.push('/usluga/zbycie')} />
      </Grupa>
    </>
  );
}

/* ---------- prawo jazdy ---------- */
function PrawoJazdy({ u, os }: { u: Usluga; os: Osoba }) {
  const { k } = useApp(); const d = os.docs.find(x => x.id === 'pj')!;
  const kat = (d.f.find(x => x[0] === 'Kategorie')?.[1] ?? 'B').split(/,\s*/);
  const KAT: [string, string, string][] = [['AM', 'motorower', 'bus'], ['A1', 'motocykl do 125 cm³', 'bus'], ['A2', 'motocykl do 35 kW', 'bus'], ['A', 'każdy motocykl', 'bus'], ['B', 'samochód do 3,5 t', 'car'], ['BE', 'B z przyczepą', 'car'], ['C1', 'do 7,5 t', 'bus'], ['C', 'ciężarówka', 'bus'], ['CE', 'C z przyczepą', 'bus'], ['D', 'autobus', 'bus'], ['T', 'ciągnik', 'car']];
  const wazne = d.rows.find(x => /Ważne/.test(x[0]))?.[1] ?? '';
  const wd = data(wazne);
  return (
    <>
      <Hero u={u} />
      <Wejscie i={1}>
        <Karta onPress={() => router.push('/dokument/pj')} style={{ padding: 16, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <IkonaKafel n="id" akcent />
          <View style={{ flex: 1 }}><T v="bodyB">mPrawo jazdy</T><T v="sub">{PIERWSZA(wazne || d.sub)}</T></View>
          {wd ? <Dni n={dniDo(wd) > 999 ? null : dniDo(wd)} /> : null}
          <Ikona n="chev" size={18} color={k.ink3} />
        </Karta>
      </Wejscie>
      <Sekcja tytul="Twoje kategorie" style={{ marginTop: 22 }}>
        <Grupa>{kat.map(kk => { const o = KAT.find(x => x[0] === kk); return <Wiersz key={kk} lewa={<View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: k.accBg, alignItems: 'center', justifyContent: 'center' }}><T v="bodyB" c={k.accInk}>{kk}</T></View>} tytul={`Kategoria ${kk}`} opis={o ? PIERWSZA(o[1]) : undefined} />; })}</Grupa>
      </Sekcja>
      <Sekcja tytul="Szczegóły" i={3} style={{ marginTop: 22 }}>
        <Grupa>{d.rows.map(([a, b]) => <Para key={a} k={a} w={b} />)}</Grupa>
      </Sekcja>
      <Przypis>{/bezterminow/.test(d.sub) ? 'Prawa jazdy wydane bezterminowo przed 19.01.2013 trzeba wymienić najpóźniej do 19.01.2033. Przypomnimy Ci o tym rok wcześniej.' : 'Przypomnimy Ci o wymianie 3 miesiące przed końcem ważności.'}</Przypis>
      <Grupa style={{ marginTop: 16 }}>
        <Wiersz ik="clock" tytul="Punkty karne" onPress={() => router.push('/usluga/punkty')} />
        <Wiersz ik="alert" tytul="Zgubione prawo jazdy" onPress={() => router.push('/usluga/zgubiony-dowod')} />
      </Grupa>
    </>
  );
}

export function EkranInfo({ id, u }: { id: string; u: Usluga }) {
  const { os } = useApp();
  const E: Record<string, ReactNode> = {
    punkty: <Punkty u={u} os={os} />, recepty: <Recepty u={u} os={os} />, szczepienia: <Szczepienia u={u} os={os} />,
    emerytura: <Emerytura u={u} os={os} />, kdr: <Kdr u={u} os={os} />, ulgi: <Ulgi u={u} />, 'oc-badanie': <OcBadanie u={u} os={os} />, 'prawo-jazdy': <PrawoJazdy u={u} os={os} />,
  };
  return <Ekran>{E[id] ?? <T>Brak ekranu.</T>}</Ekran>;
}
