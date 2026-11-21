/* Usługi informacyjne z własnym, interaktywnym ekranem: punkty, recepty, szczepienia, emerytura, KDR, ulgi, OC i badanie, prawo jazdy. */
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import Svg, { Circle, SvgXml } from 'react-native-svg';

import { dniDo, kiedy, pl3, type Osoba } from '@/data/typy';
import type { Usluga } from '@/data/uslugi';
import { autoSvg } from '@/lib/grafika';
import { useApp } from '@/state/app';
import { Avatar, Dni, Ekran, Grupa, Ikona, IkonaKafel, Karta, KodQR, Notka, Para, Pill, Przycisk, Sekcja, T, Wiersz } from '@/ui/elementy';
import { Luk, Pasek, Sprezyna, Wejscie } from '@/ui/ruch';

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
  return (
    <Wejscie style={{ marginBottom: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IkonaKafel n={u.ik} akcent size={52} />
        <View style={{ flex: 1 }}><T v="h2">{u.t}</T><T v="sub" style={{ marginTop: 2 }}>{u.opis}</T></View>
      </View>
      {children}
    </Wejscie>
  );
}
const data = (s: string) => s.match(/\d{2}\.\d{2}\.\d{4}/)?.[0] ?? null;
const PIERWSZA = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- punkty karne ---------- */
function Punkty({ u, os }: { u: Usluga; os: Osoba }) {
  const { k } = useApp(); const p = os.sc.punkty;
  const probny = os.id === 'kacper'; const limit = probny ? 20 : 24;
  const f = p.n / limit; const kol = f > 0.6 ? k.acc : f > 0.3 ? k.warn : k.ok;
  const wyk = p.n ? [{ t: os.id === 'kacper' ? 'Przekroczenie prędkości o 18 km/h' : 'Przekroczenie prędkości o 21–25 km/h', d: os.id === 'kacper' ? '14.10.2026' : '12.05.2026', n: p.n, wyg: os.id === 'kacper' ? '14.10.2027' : '12.05.2027', gdzie: os.id === 'kacper' ? 'Gdańsk, al. Grunwaldzka' : 'Warszawa, ul. Puławska' }] : [];
  return (
    <>
      <Hero u={u} />
      <Wejscie i={1}>
        <Karta style={{ padding: 20, alignItems: 'center' }}>
          <View style={{ width: 180, height: 180, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={180} height={180} viewBox="0 0 180 180" style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
              <Circle cx={90} cy={90} r={78} stroke={k.surface2} strokeWidth={14} fill="none" />
              {p.n ? <Luk cx={90} cy={90} r={78} f={f} kolor={kol} grub={14} opoznienie={350} /> : null}
            </Svg>
            <Animated.View style={{ alignItems: 'center' }}>
              <T v="h1" style={{ fontSize: 52, lineHeight: 56 }}>{p.n}</T>
              <T v="sub">z {limit} pkt</T>
            </Animated.View>
          </View>
          <Pill t={p.n === 0 ? 'Czyste konto' : `Zostało ${limit - p.n} pkt do limitu`} ton={p.n === 0 ? 'g' : f > 0.6 ? 'r' : 'a'} ik={p.n === 0 ? 'ok' : 'info'} />
          <T v="sub" center style={{ marginTop: 10 }}>{p.note}</T>
        </Karta>
      </Wejscie>
      {probny ? (
        <Sekcja tytul="Okres próbny" i={2} style={{ marginTop: 22 }}>
          <Karta style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}><T v="sub">14.01.2026</T><T v="sub">14.01.2028</T></View>
            <Pasek f={0.38} kolor={k.ink} tlo={k.surface2} h={8} />
            <T v="sub" c={k.ink} style={{ marginTop: 10 }}>Do 14.01.2027 limit to 20 pkt. Dwa wykroczenia w okresie próbnym oznaczają kurs reedukacyjny.</T>
          </Karta>
        </Sekcja>
      ) : null}
      <Sekcja tytul="Wykroczenia" i={3} style={{ marginTop: 22 }}>
        {wyk.length ? <Grupa>{wyk.map(w => (
          <View key={w.d} style={{ padding: 14, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><T v="bodyB" style={{ flex: 1 }}>{w.t}</T><Pill t={`${w.n} pkt`} ton="r" /></View>
            <T v="sub">{w.d} · {w.gdzie}</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Ikona n="clock" size={15} color={k.ok} /><T v="sub" c={k.ok} style={{ fontWeight: '600' }}>Wygasną {w.wyg} ({kiedy(dniDo(w.wyg))})</T></View>
          </View>
        ))}</Grupa> : <Karta style={{ padding: 18, alignItems: 'center' }}><Ikona n="star" size={28} color={k.ok} /><T v="bodyB" style={{ marginTop: 8 }}>Brak wykroczeń w ostatnich 2 latach</T></Karta>}
      </Sekcja>
      <Sekcja tytul="Dobrze wiedzieć" i={4} style={{ marginTop: 22 }}>
        <Grupa>
          <Wiersz ik="clock" tytul="Punkty wygasają po roku" opis="Liczone od dnia zapłaty mandatu, a nie od wykroczenia." />
          <Wiersz ik="cap" tytul="Kurs redukujący punkty" opis="Nie da się już zmniejszyć punktów kursem. Pomaga tylko czas." />
          <Wiersz ik="receipt" tytul="Mandaty" opis="Opłać i zobacz historię mandatów" onPress={() => router.push('/platnosci')} />
        </Grupa>
      </Sekcja>
    </>
  );
}

/* ---------- recepty i skierowania ---------- */
type Recepta = { lek: string; dawka: string; do: string; kod: string; dla: string; stan: 'aktywna' | 'czesc' | 'wykupiona'; lekarz: string };
const RECEPTY: Record<string, Recepta[]> = {
  marta: [
    { lek: 'Amoksycylina 250 mg/5 ml', dawka: '5 ml 2 razy dziennie, 7 dni', do: '25.10.2026', kod: '8314', dla: 'Zosia', stan: 'aktywna', lekarz: 'lek. A. Wiśniewska, Przychodnia Mokotów' },
    { lek: 'Witamina D3 1000 j.m.', dawka: '1 kapsułka dziennie', do: '14.04.2027', kod: '2209', dla: 'Marta', stan: 'czesc', lekarz: 'lek. P. Zając' },
    { lek: 'Ibuprofen 100 mg/5 ml', dawka: 'doraźnie przy gorączce', do: '02.10.2026', kod: '7731', dla: 'Staś', stan: 'wykupiona', lekarz: 'lek. A. Wiśniewska' },
  ],
  jan: [
    { lek: 'Salbutamol 100 µg, inhalator', dawka: '1–2 wdechy doraźnie', do: '18.11.2026', kod: '5420', dla: 'Igor', stan: 'aktywna', lekarz: 'lek. M. Kowal, Poradnia alergologiczna' },
    { lek: 'Budezonid 200 µg', dawka: '1 wdech 2 razy dziennie', do: '18.01.2027', kod: '5421', dla: 'Igor', stan: 'czesc', lekarz: 'lek. M. Kowal' },
  ],
  ewa: [
    { lek: 'Bisoprolol 5 mg', dawka: '1 tabletka rano', do: '12.11.2026', kod: '4471', dla: 'Halina', stan: 'aktywna', lekarz: 'lek. J. Lis, Przychodnia Czechów' },
    { lek: 'Atorwastatyna 20 mg', dawka: '1 tabletka wieczorem', do: '02.12.2026', kod: '4472', dla: 'Halina', stan: 'aktywna', lekarz: 'lek. J. Lis' },
    { lek: 'Lewotyroksyna 50 µg', dawka: '1 tabletka na czczo', do: '20.03.2027', kod: '6610', dla: 'Ewa', stan: 'czesc', lekarz: 'lek. K. Pawlak' },
  ],
  kacper: [{ lek: 'Cetyryzyna 10 mg', dawka: '1 tabletka dziennie w sezonie', do: '30.09.2026', kod: '1185', dla: 'Kacper', stan: 'wykupiona', lekarz: 'lek. R. Nowicki' }],
};
const SKIEROWANIA: Record<string, [string, string, string, string][]> = {
  marta: [['Poradnia ortopedyczna', 'Staś', 'Termin: 06.11.2026, 10:30', 'Szpital Dziecięcy, ul. Niekłańska 4']],
  jan: [['Spirometria', 'Igor', 'Do umówienia', 'kod skierowania 3390']],
  ewa: [['Poradnia kardiologiczna', 'Halina', 'Termin: 14.11.2026, 9:00', 'SPSK4, ul. Jaczewskiego 8'], ['USG tarczycy', 'Ewa', 'Do umówienia', 'kod skierowania 8820']],
  kacper: [],
};
function KartaRecepty({ r, i }: { r: Recepta; i: number }) {
  const { k, os } = useApp(); const [kod, setKod] = useState(false);
  const stan = r.stan === 'aktywna' ? ['Do wykupienia', 'g'] : r.stan === 'czesc' ? ['Wykupiona częściowo', 'a'] : ['Wykupiona', 'n'];
  return (
    <Wejscie i={i + 2} style={{ marginBottom: 12 }}>
      <Karta>
        <Animated.View layout={LinearTransition.duration(200)} style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: r.stan === 'wykupiona' ? k.surface2 : k.accBg, alignItems: 'center', justifyContent: 'center' }}><Ikona n="pill" size={22} color={r.stan === 'wykupiona' ? k.ink3 : k.accInk} /></View>
            <View style={{ flex: 1 }}>
              <T v="bodyB">{r.lek}</T>
              <T v="sub" style={{ marginTop: 2 }}>{r.dawka}</T>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            <Pill t={stan[0]} ton={stan[1] as 'g'} />
            <Pill t={r.dla === os.imie ? 'Dla Ciebie' : `Dla: ${r.dla}`} ik="user" />
            {r.stan !== 'wykupiona' ? <Pill t={`Ważna do ${r.do.slice(0, 5)}`} ik="clock" ton={dniDo(r.do) < 10 ? 'a' : 'n'} /> : null}
          </View>
          {kod ? (
            <Animated.View entering={FadeIn.duration(200)} style={{ marginTop: 16, alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: k.surface2 }}>
              <T v="cap">Kod recepty</T>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {r.kod.split('').map((c, j) => <Animated.View key={j} style={{ width: 48, height: 60, borderRadius: 12, backgroundColor: k.surface, alignItems: 'center', justifyContent: 'center' }}><T v="h1" style={{ fontSize: 34 }}>{c}</T></Animated.View>)}
              </View>
              <View style={{ marginTop: 14, padding: 8, backgroundColor: '#fff', borderRadius: 12 }}><KodQR tekst={`erecepta:${r.kod}:${r.dla}`} size={140} logo={false} /></View>
              <T v="small" center style={{ marginTop: 10 }}>W aptece podaj kod i PESEL {r.dla === os.imie ? '' : `osoby (${r.dla}) `}albo pokaż kod QR.</T>
            </Animated.View>
          ) : null}
          <T v="small" style={{ marginTop: 12 }}>{r.lekarz}</T>
          {r.stan !== 'wykupiona' ? <Przycisk tytul={kod ? 'Ukryj kod' : 'Pokaż kod do apteki'} ik={kod ? 'eye' : 'qr'} rodzaj={kod ? 'drugi' : 'glowny'} maly style={{ marginTop: 12 }} onPress={() => setKod(!kod)} /> : null}
        </Animated.View>
      </Karta>
    </Wejscie>
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
      {os.id === 'ewa' ? <Notka ik="key">Masz upoważnienie do konta pacjenta mamy, Haliny Nowak. Jej recepty widzisz razem ze swoimi.</Notka> : null}
      <View style={{ marginTop: 14, marginBottom: 14 }}><Segment opcje={['Recepty', 'Skierowania']} v={tab} set={setTab} /></View>
      {tab === 'Recepty' ? (
        <Animated.View key="r" entering={FadeIn}>
          {osoby.length > 2 ? <View style={{ marginBottom: 14 }}><Chipy opcje={osoby} v={kto} set={setKto} /></View> : null}
          {lista.map((r, i) => <KartaRecepty key={r.kod} r={r} i={i} />)}
        </Animated.View>
      ) : (
        <Animated.View key="s" entering={FadeIn}>
          {sk.length ? <Grupa>{sk.map(([t, dla, kiedy_, gdzie]) => <Wiersz key={t} ik="doc" tytul={t} opis={`${dla} · ${kiedy_}\n${gdzie}`} prawa={<Pill t={kiedy_.startsWith('Termin') ? 'Umówione' : 'Umów'} ton={kiedy_.startsWith('Termin') ? 'g' : 'a'} />} />)}</Grupa>
            : <Karta style={{ padding: 20, alignItems: 'center' }}><Ikona n="doc" size={28} color={k.ink3} /><T v="bodyB" style={{ marginTop: 8 }}>Brak aktywnych skierowań</T></Karta>}
        </Animated.View>
      )}
      <Notka>Nowe e-recepty i skierowania pojawią się tu od razu po wystawieniu. Dostaniesz też powiadomienie z kodem.</Notka>
    </>
  );
}

/* ---------- szczepienia ---------- */
function plan(wiek: number): [string, string, 0 | 1 | 2][] {
  const ob: [number, string, string][] = [[0, 'Gruźlica, WZW B', 'po urodzeniu'], [0, 'DTP, Hib, IPV, WZW B', '2 miesiąc'], [1, 'Odra, świnka, różyczka (MMR)', '13–15 miesiąc'], [1, 'Pneumokoki', '13–15 miesiąc'], [6, 'DTaP, IPV (przypominająca)', '6 lat'], [6, 'MMR (druga dawka)', '6 lat'], [9, 'HPV (zalecane)', '9–14 lat'], [14, 'Tdap (przypominająca)', '14 lat'], [19, 'Td (przypominająca)', '19 lat']];
  const r = ob.map(([w, t, kiedy_]): [string, string, 0 | 1 | 2] => [t, kiedy_, wiek > w ? 2 : wiek === w ? 1 : 0]);
  return wiek >= 19 ? [...r.filter(x => x[2] === 2).slice(-3), ['Grypa (zalecane co sezon)', 'październik–marzec', 1], ['Td co 10 lat', 'następna: 2031', 0]] : r;
}
function Szczepienia({ u, os }: { u: Usluga; os: Osoba }) {
  const { k, toast } = useApp();
  const osoby: { id: string; imie: string; wiek: number }[] = [{ id: os.id, imie: os.imie, wiek: 2026 - +os.moje.data_urodzenia.slice(6) }, ...os.rodzina.filter(m => m.wiek < 18 || m.wiek > 80)];
  const [kto, setKto] = useState(osoby.find(o => o.wiek < 18)?.imie ?? os.imie);
  const o = osoby.find(x => x.imie === kto)!; const pl = o.wiek > 80 ? [['Grypa', 'październik–marzec', 1], ['Pneumokoki (zalecane po 65. r.ż.)', 'jednorazowo', 2], ['Półpasiec (zalecane)', 'do umówienia', 0], ['COVID-19 (sezonowe)', 'jesień 2026', 0]] as [string, string, 0 | 1 | 2][] : plan(o.wiek);
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
      <Notka ik="bell">Przypomnimy Ci miesiąc przed każdym szczepieniem z kalendarza.</Notka>
    </>
  );
}

/* ---------- emerytura ---------- */
function Emerytura({ u, os }: { u: Usluga; os: Osoba }) {
  const { k } = useApp();
  const rok = +os.moje.data_urodzenia.slice(6); const ustaw = os.plec === 'K' ? 60 : 65;
  const opcje = os.plec === 'K' ? [60, 62, 65, 67] : [65, 67, 70];
  const [w, setW] = useState(ustaw);
  const baza = { marta: 3150, jan: 3980, ewa: 3400, kacper: 4100 }[os.id] ?? 3500;
  const kwota = Math.round(baza * (1 + (w - ustaw) * 0.085) / 10) * 10;
  const skladki = { marta: '228 140 zł', jan: '402 910 zł', ewa: '612 480 zł', kacper: '6 120 zł' }[os.id] ?? '—';
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
          <Para k="Kapitał początkowy" w={rok < 1969 || os.id === 'ewa' ? '84 210 zł' : 'nie dotyczy'} />
          <Para k="Staż ubezpieczeniowy" w={`${Math.max(0, 2026 - rok - 22)} lat`} />
        </Grupa>
      </Sekcja>
      <Notka>Prognoza zakłada obecne zarobki do końca pracy. Wniosek o emeryturę złożysz najwcześniej miesiąc przed osiągnięciem wieku emerytalnego.</Notka>
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
      <Karta style={{ padding: 18 }}><T v="body">Karta przysługuje rodzinom z co najmniej trojgiem dzieci, niezależnie od dochodu. Rodzice dostają ją dożywotnio.</T></Karta>
      <Grupa style={{ marginTop: 14 }}>
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
      <Wejscie i={2} style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        {[['37%', 'pociągi'], ['0 zł', 'parki narodowe'], ['ok. 30 tys.', 'partnerów']].map(([a, b]) => (
          <Karta key={b} style={{ flex: 1, padding: 12, alignItems: 'center' }}><T v="h3">{a}</T><T v="small" center>{b}</T></Karta>
        ))}
      </Wejscie>
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
      <Notka>U partnera pokaż kartę w aplikacji. Kasjer może zeskanować jej kod QR.</Notka>
    </>
  );
}

/* ---------- ulgi studenta ---------- */
function Ulgi({ u }: { u: Usluga }) {
  const { k } = useApp();
  const trasy: [string, number][] = [['Gdańsk – Warszawa', 169], ['Gdańsk – Kraków', 219], ['Gdańsk – Poznań', 129], ['Gdańsk – Słupsk', 49]];
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
      <Notka>Konduktor sprawdzi legitymację na ekranie albo zeskanuje kod QR. Nie musisz mieć plastikowej karty.</Notka>
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
  const STACJE = [[`SKP Okręgowa, ${os.sc.miasto}`, '1,4 km', 'dziś do 18:00'], [`Stacja Kontroli Pojazdów Auto-Test`, '2,9 km', 'jutro od 7:00'], [`SKP przy ul. Przemysłowej`, '4,2 km', 'sob. 8:00–14:00']];
  const wiersz = (t: string, ik: string, d: string | null, opis: string) => {
    const n = d ? dniDo(d) : null; const id = `${x.plate}${t}`;
    return (
      <View style={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IkonaKafel n={ik} />
          <View style={{ flex: 1 }}><T v="bodyB">{t}</T><T v="sub">{opis}</T></View>
          <Dni n={n} />
        </View>
        {n != null && n < 60 ? (
          <Sprezyna onPress={() => { setPrzyp(p => p.includes(id) ? p.filter(y => y !== id) : [...p, id]); if (!przyp.includes(id)) toast(`Przypomnimy 7 dni przed terminem (${d})`); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: przyp.includes(id) ? k.okBg : k.surface2 }}>
            <Ikona n={przyp.includes(id) ? 'ok' : 'bell'} size={16} color={przyp.includes(id) ? k.ok : k.ink} />
            <T v="sub" c={przyp.includes(id) ? k.ok : k.ink} style={{ fontWeight: '700' }}>{przyp.includes(id) ? 'Przypomnienie ustawione' : 'Przypomnij mi'}</T>
          </Sprezyna>
        ) : null}
      </View>
    );
  };
  return (
    <>
      <Hero u={u} />
      {auta.length > 1 ? <View style={{ marginBottom: 14 }}><Segment opcje={auta.map(z => z.plate)} v={x.plate} set={p => setWyb(auta.findIndex(z => z.plate === p))} /></View> : null}
      <Animated.View key={x.plate} entering={FadeIn.duration(300)}>
        <Karta style={{ padding: 16, alignItems: 'center' }}>
          <Animated.View style={{ width: '100%' }}><SvgXml xml={autoSvg(x.model, x.kolor)} width="100%" height={130} /></Animated.View>
          <T v="bodyB" center style={{ marginTop: 6 }}>{x.model}</T>
          <T v="sub" center>{x.plate}</T>
        </Karta>
        <Grupa style={{ marginTop: 12 }}>
          {wiersz('Ubezpieczenie OC', 'shield', ocD, ocD ? `${x.oc.replace(/, do .*/, '')}, do ${ocD}` : x.oc)}
          {wiersz('Badanie techniczne', 'check', btD, btD ? `ważne do ${btD}` : x.bt)}
        </Grupa>
        <Notka>{wyb === 0 ? os.sc.oc.note : 'Auto jest w leasingu, więc OC zwykle odnawia leasingodawca.'}</Notka>
      </Animated.View>
      {btD && dniDo(btD) < 90 ? (
        <Sekcja tytul="Stacje kontroli w pobliżu" style={{ marginTop: 22 }}>
          <Grupa>{STACJE.map(([n, d, g]) => <Wiersz key={n} ik="pin" tytul={n} opis={`${d} · ${g}`} prawa={<T v="small">ok. 149 zł</T>} onPress={() => toast('Otworzymy nawigację do stacji')} />)}</Grupa>
        </Sekcja>
      ) : null}
      <Sekcja tytul="Inne sprawy pojazdu" style={{ marginTop: 22 }}>
        <Grupa>
          <Wiersz ik="car" tytul="Dokument pojazdu" opis="Dane z CEPiK i odczyty licznika" onPress={() => router.push('/dokument/auto')} />
          <Wiersz ik="swap" tytul="Zgłoś sprzedaż pojazdu" onPress={() => router.push('/usluga/zbycie')} />
          <Wiersz ik="car" tytul="mStłuczka" opis="Oświadczenie o kolizji" onPress={() => router.push('/usluga/mstluczka')} />
        </Grupa>
      </Sekcja>
    </>
  );
}

/* ---------- prawo jazdy ---------- */
function PrawoJazdy({ u, os }: { u: Usluga; os: Osoba }) {
  const { k } = useApp(); const d = os.docs.find(x => x.id === 'pj')!;
  const kat = (d.f.find(x => x[0] === 'Kategorie')?.[1] ?? 'B').split(/,\s*/);
  const [wyb, setWyb] = useState(kat[kat.length - 1]);
  const KAT: [string, string, string][] = [['AM', 'motorower', 'bus'], ['A1', 'motocykl do 125 cm³', 'bus'], ['A2', 'motocykl do 35 kW', 'bus'], ['A', 'każdy motocykl', 'bus'], ['B', 'samochód do 3,5 t', 'car'], ['BE', 'B z przyczepą', 'car'], ['C1', 'do 7,5 t', 'bus'], ['C', 'ciężarówka', 'bus'], ['CE', 'C z przyczepą', 'bus'], ['D', 'autobus', 'bus'], ['T', 'ciągnik', 'car']];
  const opis = KAT.find(x => x[0] === wyb);
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
      <Sekcja tytul="Twoje kategorie" i={2} style={{ marginTop: 22 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {KAT.map(([kk], i) => { const ma = kat.includes(kk), on = wyb === kk; return (
            <Animated.View key={kk}>
              <Sprezyna onPress={() => setWyb(kk)} style={{ width: 58, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: ma ? (on ? k.acc : k.accBg) : on ? k.ink : k.surface, borderWidth: 1, borderColor: ma ? 'transparent' : k.hair }}>
                <T v="bodyB" c={ma ? (on ? '#fff' : k.accInk) : on ? k.bg : k.ink3}>{kk}</T>
              </Sprezyna>
            </Animated.View>
          ); })}
        </View>
        {opis ? (
          <Animated.View key={wyb} entering={FadeInDown.duration(250)}>
            <Karta style={{ padding: 14, marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IkonaKafel n={opis[2]} />
              <View style={{ flex: 1 }}><T v="bodyB">Kategoria {opis[0]}</T><T v="sub">{PIERWSZA(opis[1])}</T></View>
              <Pill t={kat.includes(wyb) ? 'Masz' : 'Nie masz'} ton={kat.includes(wyb) ? 'g' : 'n'} />
            </Karta>
          </Animated.View>
        ) : null}
      </Sekcja>
      <Sekcja tytul="Szczegóły" i={3} style={{ marginTop: 22 }}>
        <Grupa>{d.rows.map(([a, b]) => <Para key={a} k={a} w={b} />)}</Grupa>
      </Sekcja>
      <Notka>{/bezterminow/.test(d.sub) ? 'Prawa jazdy wydane bezterminowo przed 19.01.2013 trzeba wymienić najpóźniej do 19.01.2033. Przypomnimy Ci o tym rok wcześniej.' : 'Przypomnimy Ci o wymianie 3 miesiące przed końcem ważności.'}</Notka>
      <View style={{ gap: 10, marginTop: 16 }}>
        <Przycisk tytul="Punkty karne" ik="clock" rodzaj="drugi" onPress={() => router.push('/usluga/punkty')} />
        <Przycisk tytul="Zgubione prawo jazdy" ik="alert" rodzaj="drugi" onPress={() => router.push('/usluga/zgubiony-dowod')} />
      </View>
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
