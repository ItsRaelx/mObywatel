/* Przepływ usługi: karta informacyjna → kroki z polami → podsumowanie i zgoda → PIN albo Face ID → wysyłka → wynik. */
import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import { lab, usluga, wiele, type Api, type Info, type Krok, type Pole, type Usluga, type V, type Wynik } from '@/data/uslugi';
import type { Osoba, Wiersz as Wrsz } from '@/data/typy';
import { useApp } from '@/state/app';
import { potwierdz } from '@/ui/potwierdzenie';
import { Ekran, Grupa, Ikona, IkonaKafel, Karta, Notka, Para, Pill, Przycisk, Sekcja, T } from '@/ui/elementy';
import { EkranInfo } from '@/ui/info-uslugi';
import { Animated, Pasek, Pop, Puls, Sprezyna, Wejscie } from '@/ui/ruch';
import { DokumentPapier, Kontrola, Os, Wykres } from '@/ui/wynik';

type Faza = 'karta' | 'krok' | 'sum' | 'wysylka' | 'done';
const widoczne = (k: Krok, v: V) => k.pola.filter(p => !p.gdy || p.gdy(v));
const pusta = (p: Pole, v: V) => !String(v[p.k] ?? '').trim();
const czekaj = (ms: number) => new Promise(r => setTimeout(r, ms));

function Wstep({ w }: { w: Info }) {
  const { k, toast } = useApp();
  return (
    <>
      {w.flaga ? <Wejscie><Karta style={{ padding: 14, flexDirection: 'row', gap: 10, backgroundColor: k.warnBg, marginBottom: 14 }}><Ikona n="alert" size={20} color={k.warn} /><T v="sub" c={k.ink} style={{ flex: 1, fontWeight: '600' }}>{w.flaga}</T></Karta></Wejscie> : null}
      {w.tekst ? <Wejscie i={1}><T v="body" c={k.ink2} style={{ marginBottom: 14 }}>{w.tekst}</T></Wejscie> : null}
      {w.wiersze?.length ? <Grupa style={{ marginBottom: 6 }}>{w.wiersze.map(([a, b]) => <Para key={a} k={a} w={b} />)}</Grupa> : null}
      {w.uwaga ? <Notka>{w.uwaga}</Notka> : null}
      {w.dalej?.length ? <View style={{ gap: 10, marginTop: 16 }}>{w.dalej.map((d, i) => (
        <Wejscie key={d.t} i={i + 2}><Przycisk tytul={d.t} ik={d.ik ?? 'arrow'} rodzaj="drugi" onPress={() => (d.trasa.startsWith('toast:') ? toast(d.trasa.slice(6)) : router.push(d.trasa as never))} /></Wejscie>
      ))}</View> : null}
    </>
  );
}

function Naglowek({ u }: { u: Usluga }) {
  return (
    <Wejscie style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <IkonaKafel n={u.ik} akcent size={52} />
      <View style={{ flex: 1 }}><T v="h2">{u.t}</T><T v="sub" style={{ marginTop: 2 }}>{u.opis}</T></View>
    </Wejscie>
  );
}

/* ---------- karta usługi przed startem ---------- */
function KartaStart({ u, os, st, start }: { u: Usluga; os: Osoba; st: { pesel: boolean; zaplacone: string[] }; start: () => void }) {
  const { k } = useApp(); const c = u.karta!(os, st); const wst = u.wstep?.(os, st);
  const kroki = u.kroki?.(os, st) ?? [];
  return (
    <>
      <Naglowek u={u} />
      {wst ? <Wstep w={wst} /> : null}
      <Wejscie i={1} style={{ flexDirection: 'row', gap: 10 }}>
        {[['clock', 'Czas', c.czas], ['coin', 'Opłata', c.oplata]].map(([ik, t, w]) => (
          <Karta key={t} style={{ flex: 1, padding: 14 }}>
            <Ikona n={ik} size={20} color={k.ink2} />
            <T v="cap" style={{ marginTop: 10 }}>{t}</T>
            <T v="bodyB" style={{ marginTop: 3 }}>{w}</T>
          </Karta>
        ))}
      </Wejscie>
      <Sekcja tytul="Co przygotować" i={2} style={{ marginTop: 22 }}>
        <Grupa>{c.potrzebne.map(p => (
          <View key={p} style={{ flexDirection: 'row', gap: 12, padding: 14, alignItems: 'center' }}>
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: k.okBg, alignItems: 'center', justifyContent: 'center' }}><Ikona n="ok" size={15} color={k.ok} sw={2.6} /></View>
            <T v="body" style={{ flex: 1 }}>{p}</T>
          </View>
        ))}</Grupa>
      </Sekcja>
      <Sekcja tytul="Jak to działa" i={3} style={{ marginTop: 22 }}>
        <Karta style={{ padding: 16 }}>
          {c.jak.map((j, i) => (
            <Animated.View key={j} entering={FadeIn.delay(120 + i * 50).duration(260)} style={{ flexDirection: 'row', gap: 14 }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: i === 0 ? k.acc : k.surface2, alignItems: 'center', justifyContent: 'center' }}><T v="sub" c={i === 0 ? '#fff' : k.ink} style={{ fontWeight: '800' }}>{i + 1}</T></View>
                {i < c.jak.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 14, backgroundColor: k.hair, marginVertical: 4 }} /> : null}
              </View>
              <T v="body" style={{ flex: 1, paddingTop: 3, paddingBottom: i < c.jak.length - 1 ? 14 : 0 }}>{j}</T>
            </Animated.View>
          ))}
        </Karta>
      </Sekcja>
      <Wejscie i={5}>
        <Przycisk tytul="Rozpocznij" ik="arrow" style={{ marginTop: 24 }} onPress={start} />
        <T v="small" center style={{ marginTop: 10 }}>{kroki.length ? `${kroki.length + 1} ${kroki.length + 1 < 5 ? 'krótkie kroki' : 'krótkich kroków'}. Możesz wrócić w każdej chwili.` : 'Jeden krok.'}</T>
      </Wejscie>
    </>
  );
}

/* ---------- pola formularza ---------- */
function PoleWidok({ p, v, setV, blad, i }: { p: Pole; v: V; setV: (k: string, w: string) => void; blad: boolean; i: number }) {
  const { k } = useApp();
  const wart = v[p.k] ?? ''; const zly = blad && !!p.wym && !wart.trim();
  const typ = p.typ ?? (p.opcje ? 'wybor' : 'tekst');
  let tresc;
  if (typ === 'wybor' && p.opcje) {
    const opisowe = p.opcje.some(o => typeof o !== 'string' && o.o) || p.opcje.some(o => lab(o).length > 22);
    tresc = opisowe ? (
      <View style={{ gap: 8 }}>
        {p.opcje.map(o => { const t = lab(o), on = wart === t, op = typeof o === 'string' ? undefined : o.o; return (
          <Sprezyna key={t} skala={0.98} onPress={() => setV(p.k, t)} accessibilityRole="radio" accessibilityState={{ checked: on }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 17, backgroundColor: k.surface, borderWidth: 1.5, borderColor: on ? k.acc : k.hair }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? k.acc : k.ink3, alignItems: 'center', justifyContent: 'center' }}>
              {on ? <Animated.View entering={FadeIn.duration(120)} style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: k.acc }} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <T v="bodyB">{t}</T>
              {op ? <T v="sub" style={{ marginTop: 2 }}>{op}</T> : null}
            </View>
          </Sprezyna>
        ); })}
      </View>
    ) : (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {p.opcje.map(o => { const t = lab(o), on = wart === t; return (
          <Sprezyna key={t} onPress={() => setV(p.k, t)} accessibilityRole="radio" accessibilityState={{ checked: on }}
            style={{ paddingHorizontal: 15, paddingVertical: 11, borderRadius: 14, backgroundColor: on ? k.ink : k.surface, borderWidth: 1, borderColor: on ? k.ink : k.hair, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {on ? <Ikona n="ok" size={15} color={k.bg} sw={2.6} /> : null}
            <T v="sub" c={on ? k.bg : k.ink} style={{ fontWeight: '600' }}>{t}</T>
          </Sprezyna>
        ); })}
      </View>
    );
  } else if (typ === 'wiele' && p.opcje) {
    const zazn = wiele(wart);
    const prz = (t: string) => setV(p.k, (zazn.includes(t) ? zazn.filter(x => x !== t) : [...zazn, t]).join('|'));
    tresc = (
      <Grupa>{p.opcje.map(o => { const t = lab(o), on = zazn.includes(t), ik = typeof o === 'string' ? undefined : o.ik; return (
        <Pressable key={t} onPress={() => { Haptics.selectionAsync().catch(() => {}); prz(t); }} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
          style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }, pressed && { backgroundColor: k.surface2 }]}>
          {ik ? <IkonaKafel n={ik} size={36} /> : null}
          <T v="body" style={{ flex: 1 }}>{t}</T>
          <View style={{ width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: on ? k.acc : k.ink3, backgroundColor: on ? k.acc : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            {on ? <Animated.View entering={FadeIn.duration(120)}><Ikona n="ok" size={16} color="#fff" sw={2.8} /></Animated.View> : null}
          </View>
        </Pressable>
      ); })}</Grupa>
    );
  } else if (typ === 'tak') {
    return (
      <Wejscie i={i} style={{ marginTop: 12 }}>
        <Pressable onPress={() => { Haptics.selectionAsync().catch(() => {}); setV(p.k, wart === 'tak' ? 'nie' : 'tak'); }} accessibilityRole="switch" accessibilityState={{ checked: wart === 'tak' }}>
          <Karta style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15 }}>
            <View style={{ flex: 1 }}>
              <T v="bodyB">{p.l}</T>
              {p.podp ? <T v="sub" style={{ marginTop: 3 }}>{p.podp}</T> : null}
            </View>
            <Przelacznik on={wart === 'tak'} />
          </Karta>
        </Pressable>
      </Wejscie>
    );
  } else if (typ === 'plik') {
    tresc = <Zalacznik nazwa={p.plik ?? 'plik.pdf'} wart={wart} ustaw={w => setV(p.k, w)} zly={zly} />;
  } else {
    const dl = typ === 'dlugi';
    tresc = (
      <TextInput value={wart} onChangeText={t => setV(p.k, t)} placeholder={p.ph} placeholderTextColor={k.ink3} keyboardType={p.num ? 'number-pad' : 'default'} multiline={dl}
        accessibilityLabel={p.l}
        style={{ minHeight: dl ? 140 : 54, borderRadius: 16, paddingHorizontal: 15, paddingTop: dl ? 14 : 0, paddingBottom: dl ? 14 : 0, fontSize: 16.5, lineHeight: dl ? 23 : undefined, color: k.ink, backgroundColor: k.surface, borderWidth: 1.5, borderColor: zly ? k.acc : k.hair, textAlignVertical: dl ? 'top' : 'center' }} />
    );
  }
  return (
    <Wejscie i={i} style={{ marginTop: 18 }}>
      <T v="sub" c={k.ink} style={{ fontWeight: '700', marginBottom: 8, marginLeft: 4 }}>{p.l}</T>
      {tresc}
      {zly ? <Animated.View entering={FadeIn}><T v="small" c={k.accInk} style={{ marginTop: 6, marginLeft: 4, fontWeight: '600' }}>{typ === 'plik' ? 'Dodaj plik, żeby przejść dalej.' : 'To pole jest potrzebne.'}</T></Animated.View>
        : p.podp ? <T v="small" style={{ marginTop: 6, marginLeft: 4 }}>{p.podp}</T> : null}
    </Wejscie>
  );
}

function Przelacznik({ on }: { on: boolean }) {
  const { k } = useApp();
  return (
    <Animated.View layout={LinearTransition.duration(180)} style={{ width: 52, height: 32, borderRadius: 16, padding: 3, backgroundColor: on ? k.ok : k.surface2, alignItems: on ? 'flex-end' : 'flex-start', borderWidth: on ? 0 : 1, borderColor: k.hair }}>
      <Animated.View layout={LinearTransition.duration(180)} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 }} />
    </Animated.View>
  );
}

function Zalacznik({ nazwa, wart, ustaw, zly }: { nazwa: string; wart: string; ustaw: (w: string) => void; zly: boolean }) {
  const { k } = useApp(); const [laduje, setLaduje] = useState(false);
  const dodaj = async () => { setLaduje(true); await czekaj(900); setLaduje(false); ustaw(nazwa); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); };
  if (wart) return (
    <Animated.View entering={FadeIn.duration(200)}>
      <Karta style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: k.okBg, alignItems: 'center', justifyContent: 'center' }}><Ikona n={/jpg|png|zdj/.test(wart) ? 'camera' : 'doc'} size={22} color={k.ok} /></View>
        <View style={{ flex: 1 }}><T v="bodyB" n={1}>{wart}</T><T v="small">Dodano · {/zdj/.test(wart) ? '4 × 2,1 MB' : '184 kB'}</T></View>
        <Pressable onPress={() => ustaw('')} hitSlop={10} accessibilityLabel="Usuń plik"><Ikona n="x" size={20} color={k.ink3} /></Pressable>
      </Karta>
    </Animated.View>
  );
  return (
    <Sprezyna onPress={dodaj} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 64, borderRadius: 17, borderWidth: 1.5, borderStyle: 'dashed', borderColor: zly ? k.acc : k.ink3, backgroundColor: k.surface }}>
      {laduje ? <Puls><Ikona n="download" size={22} color={k.ink2} /></Puls> : <Ikona n={/jpg|zdj/.test(nazwa) ? 'camera' : 'plus'} size={22} color={k.ink} />}
      <T v="bodyB">{laduje ? 'Dodaję…' : /jpg|zdj/.test(nazwa) ? 'Zrób zdjęcie albo wybierz' : 'Dodaj plik'}</T>
    </Sprezyna>
  );
}

/* ---------- wysyłka: animowana lista etapów ---------- */
function Wysylka({ etapy, n }: { etapy: string[]; n: number }) {
  const { k } = useApp();
  return (
    <View style={{ alignItems: 'center', paddingTop: 60 }}>
      <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: k.accBg, alignItems: 'center', justifyContent: 'center' }}><Ikona n="spark" size={42} color={k.acc} sw={2} /></View>
      <T v="h2" center style={{ marginTop: 22 }}>Chwileczkę…</T>
      <View style={{ marginTop: 26, gap: 14, alignSelf: 'stretch', paddingHorizontal: 20 }}>
        {etapy.map((e, i) => i > n ? null : (
          <Animated.View key={e} entering={FadeInDown.duration(300)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {i < n ? <Animated.View entering={FadeIn.duration(150)} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: k.ok, alignItems: 'center', justifyContent: 'center' }}><Ikona n="ok" size={14} color="#fff" sw={2.8} /></Animated.View>
              : <Puls style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2.5, borderColor: k.acc }}><View /></Puls>}
            <T v="body" c={i < n ? k.ink2 : k.ink} style={{ fontWeight: i < n ? '500' : '700' }}>{i < n ? e.replace('…', '') : e}</T>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

/* ---------- wynik ---------- */
function EkranWyniku({ w }: { w: Wynik }) {
  const { k } = useApp();
  const zly = w.ikona === 'alert';
  return (
    <>
      <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 22 }}>
        <Pop kolor={zly ? k.warnBg : k.okBg}>
          <View style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: zly ? k.warnBg : k.okBg, alignItems: 'center', justifyContent: 'center' }}>
            <Ikona n={zly ? 'alert' : 'ok'} size={46} color={zly ? k.warn : k.ok} sw={2.3} />
          </View>
        </Pop>
        <Wejscie i={2}><T v="h1" center style={{ marginTop: 16, fontSize: 27, lineHeight: 32 }}>{w.tytul}</T></Wejscie>
        {w.opis ? <Wejscie i={3}><T v="body" c={k.ink2} center style={{ marginTop: 8, paddingHorizontal: 8 }}>{w.opis}</T></Wejscie> : null}
      </View>
      {w.kontrola ? <Sekcja tytul="Wynik sprawdzenia" i={3}><Kontrola dane={w.kontrola} /></Sekcja> : null}
      {w.dok ? <Wejscie i={4} style={{ marginBottom: 18 }}><DokumentPapier d={w.dok} /></Wejscie> : null}
      {w.wiersze.length ? <Wejscie i={4}><Grupa>{w.wiersze.map(([a, b]) => <Para key={a} k={a} w={b} />)}</Grupa></Wejscie> : null}
      {w.wykres ? <Sekcja tytul={w.wykres.t} i={5} style={{ marginTop: 22 }}><Wykres w={w.wykres} /></Sekcja> : null}
      {w.os ? <Sekcja tytul="Historia" i={6} style={{ marginTop: 22 }}><Os dane={w.os} /></Sekcja> : null}
      {w.sprawa ? (
        <Wejscie i={6} style={{ marginTop: 18 }}>
          <Karta onPress={() => router.push(`/sprawa/${w.sprawa!.id}` as never)} style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ikona n="route" size={20} color={k.accInk} />
              <T v="bodyB" style={{ flex: 1 }}>Dodaliśmy do Spraw w toku</T>
              <Ikona n="chev" size={18} color={k.ink3} />
            </View>
            <View style={{ flexDirection: 'row', marginTop: 8 }}><Pill t={w.sprawa.eta} ton="a" ik="clock" /></View>
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 14 }}>
              {w.sprawa.steps.map(([t, , s], i) => <View key={t + i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: s === 2 ? k.ok : s === 1 ? k.warn : k.surface2 }} />)}
            </View>
            <T v="sub" style={{ marginTop: 10 }}>Teraz: {w.sprawa.steps.find(s => s[2] === 1)?.[0].replace(/^./, c => c.toLowerCase()) ?? 'zakończone'}. Postęp sprawdzisz w Więcej → Terminy i sprawy.</T>
          </Karta>
        </Wejscie>
      ) : null}
      {w.coDalej?.length ? (
        <Sekcja tytul="Co dalej" i={7} style={{ marginTop: 22 }}>
          <Karta style={{ padding: 16, gap: 14 }}>
            {w.coDalej.map((c, i) => (
              <View key={c} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: k.surface2, alignItems: 'center', justifyContent: 'center' }}><T v="small" c={k.ink} style={{ fontWeight: '800' }}>{i + 1}</T></View>
                <T v="body" style={{ flex: 1 }}>{c}</T>
              </View>
            ))}
          </Karta>
        </Sekcja>
      ) : null}
      <Wejscie i={8}>
        {w.dalej?.map(d => <Przycisk key={d.t} tytul={d.t} rodzaj="drugi" ik="arrow" style={{ marginTop: 12 }} onPress={() => router.replace(d.trasa as never)} />)}
        <Przycisk tytul="Gotowe" style={{ marginTop: 14 }} onPress={() => router.back()} />
      </Wejscie>
    </>
  );
}

export default function UslugaEkran() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { os, k, pesel, zaplacone, zmien } = useApp();
  const u = usluga(id); const st = { pesel, zaplacone };
  const kroki = useMemo(() => u?.kroki?.(os, st) ?? [], [u, os]); // eslint-disable-line react-hooks/exhaustive-deps
  const [v, setVals] = useState<V>(() => Object.fromEntries(kroki.flatMap(kr => kr.pola).map(p => [p.k, p.v ?? (p.typ !== 'wiele' && p.typ !== 'plik' && p.opcje?.length ? lab(p.opcje[0]) : '')])));
  const [faza, setFaza] = useState<Faza>(u?.karta ? 'karta' : 'krok');
  const [nr, setNr] = useState(0); const [blad, setBlad] = useState(false); const [zgoda, setZgoda] = useState(false); const [bladZgody, setBladZgody] = useState(false);
  const [etap, setEtap] = useState(0); const [wynik, setWynik] = useState<Wynik | null>(null);
  const [blok] = useState(() => u?.blokada?.(os, st) ?? (u?.dostepna && !u.dostepna(os, st) ? { tekst: 'Ta usługa Cię teraz nie dotyczy. Wszystkie sprawy, które możesz załatwić, znajdziesz w zakładce Usługi.', dalej: [{ t: 'Wszystkie usługi', trasa: '/uslugi', ik: 'grid' }] } : null));
  useEffect(() => { if (u?.ekran) router.replace(u.ekran as never); }, [u]);
  if (!u) return <Ekran tytul="Nie znaleziono"><T>Tej usługi nie ma w prototypie.</T></Ekran>;
  if (u.ekran) return null;
  if (u.ekranInfo && !blok) return <><Stack.Screen options={{ title: '' }} /><EkranInfo id={u.ekranInfo} u={u} /></>;

  const setV = (kl: string, w: string) => { setVals(s => ({ ...s, [kl]: w })); };
  const etapy = u.wysylka ?? (u.bezFaceId ? ['Sprawdzam dane…'] : ['Podpisuję elektronicznie…', 'Wysyłam do urzędu…']);
  const krok = kroki[nr]; const pola = krok ? widoczne(krok, v) : [];
  const stop = krok?.stop?.(v); const ostrz = krok?.ostrzezenie?.(v);
  const razem = kroki.length + 1;
  const postep = faza === 'sum' ? 1 : (nr + 1) / razem;

  const api: Api = {
    zalatw: z => zmien(s => ({ zalatwione: [...s.zalatwione, z] })),
    pesel: b => zmien({ pesel: b }),
    pismo: p => zmien(s => ({ pisma: [{ ...p, id: 'n' + Date.now() + Math.random().toString(36).slice(2, 6), kiedy: '18.10' }, ...s.pisma] })),
    zaplac: (t, kw) => zmien(s => ({ historia: [['18.10', t, kw, 'EP/2026/7 3' + String(Date.now()).slice(-5)], ...s.historia] })),
  };
  const podsum: Wrsz[] = u.podsumowanie ? u.podsumowanie(v, os) : kroki.flatMap(kr => widoczne(kr, v)).filter(p => v[p.k]).map(p => {
    const w = v[p.k]; const t = p.typ === 'tak' ? (w === 'tak' ? 'tak' : 'nie') : p.typ === 'wiele' ? wiele(w).join(', ') : p.typ === 'dlugi' && w.length > 60 ? w.slice(0, 60) + '…' : w;
    return [p.typ === 'tak' ? p.l : p.l.replace(/\?$/, ''), t] as Wrsz;
  });

  const wykonaj = async () => {
    if (u.zgoda && !zgoda) { setBladZgody(true); return; }
    if (!u.bezFaceId && !(await potwierdz(u.platnosc ? (u.przycisk ?? 'Zapłać') : u.t, u.platnosc ? 'faceid' : 'pin'))) return;
    setFaza('wysylka'); setEtap(0);
    for (let i = 0; i < etapy.length; i++) { setEtap(i); await czekaj(850); }
    setEtap(etapy.length); await czekaj(300);
    const w = u.wynik!(v, os, api);
    if (w.sprawa) { const s = w.sprawa; zmien(x => ({ noweSprawy: [s, ...x.noweSprawy] })); }
    Haptics.notificationAsync(w.ikona === 'alert' ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success).catch(() => {});
    setWynik(w); setFaza('done');
  };
  const dalej = () => {
    if (stop) return;
    if (pola.some(p => p.wym && pusta(p, v))) { setBlad(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}); return; }
    setBlad(false);
    if (nr < kroki.length - 1) setNr(nr + 1); else setFaza('sum');
  };
  const wstecz = () => { setBlad(false); if (faza === 'sum') setFaza('krok'); else if (nr > 0) setNr(nr - 1); else if (u.karta) setFaza('karta'); else router.back(); };

  const tytulNag = faza === 'done' || faza === 'wysylka' || faza === 'karta' || blok || (faza === 'krok' && nr === 0 && !u.karta) ? '' : u.t;
  const nag = <Stack.Screen options={{ title: tytulNag, headerBackVisible: faza !== 'wysylka', gestureEnabled: faza !== 'wysylka' }} />;

  if (blok) return <Ekran>{nag}<Naglowek u={u} /><Wstep w={blok} /></Ekran>;
  if (faza === 'karta') return <Ekran key="karta">{nag}<KartaStart u={u} os={os} st={st} start={() => setFaza('krok')} /></Ekran>;
  if (faza === 'wysylka') return <Ekran key="wys">{nag}<Wysylka etapy={etapy} n={etap} /></Ekran>;
  if (faza === 'done' && wynik) return <Ekran key="done">{nag}<EkranWyniku w={wynik} /></Ekran>;

  const pasek = (
    <View style={{ marginBottom: 18 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <T v="cap" c={k.accInk}>Krok {faza === 'sum' ? razem : nr + 1} z {razem}</T>
        <T v="cap">{faza === 'sum' ? 'Podsumowanie' : krok?.t}</T>
      </View>
      <Pasek f={postep} kolor={k.acc} tlo={k.surface2} />
    </View>
  );

  if (faza === 'sum') return (
    <Ekran key="sum">{nag}{pasek}
      <Wejscie><T v="h2">Sprawdź i potwierdź</T><T v="sub" style={{ marginTop: 4, marginBottom: 14 }}>Coś się nie zgadza? Wróć i popraw.</T></Wejscie>
      <Wejscie i={1}><Grupa>{podsum.map(([a, b]) => <Para key={a} k={a} w={b} />)}</Grupa></Wejscie>
      {u.zgoda ? (
        <Wejscie i={2}>
          <Pressable onPress={() => { setZgoda(!zgoda); setBladZgody(false); Haptics.selectionAsync().catch(() => {}); }} accessibilityRole="checkbox" accessibilityState={{ checked: zgoda }}
            style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 16, padding: 14, borderRadius: 16, borderWidth: 1.5, borderColor: bladZgody ? k.acc : 'transparent', backgroundColor: bladZgody ? k.accBg : 'transparent' }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: zgoda ? k.acc : k.ink3, backgroundColor: zgoda ? k.acc : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {zgoda ? <Ikona n="ok" size={16} color="#fff" sw={2.8} /> : null}
            </View>
            <T v="sub" c={k.ink} style={{ flex: 1 }}>{u.zgoda}</T>
          </Pressable>
        </Wejscie>
      ) : null}
      <Wejscie i={3}>
        <Przycisk tytul={u.przycisk ?? 'Podpisz i wyślij'} ik={u.bezFaceId ? undefined : u.platnosc ? 'faceid' : 'key'} style={{ marginTop: 18 }} onPress={wykonaj} />
        <Przycisk tytul="Wróć i popraw" rodzaj="link" onPress={wstecz} />
        {!u.bezFaceId ? <T v="small" center style={{ marginTop: 4 }}>{u.platnosc ? 'Płatność potwierdzisz Face ID, a wniosek podpiszemy Twoim profilem.' : 'Podpiszesz PIN-em mObywatela. To podpis zaufany.'}</T> : null}
      </Wejscie>
    </Ekran>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <Ekran key={'k' + nr}>{nag}
        {pasek}
        {nr === 0 && !u.karta ? <Naglowek u={u} /> : null}
        {nr === 0 && !u.karta && u.wstep ? <Wstep w={u.wstep(os, st)} /> : null}
        <Wejscie><T v="h2">{krok?.t}</T>{krok?.opis ? <T v="sub" style={{ marginTop: 4 }}>{krok.opis}</T> : null}</Wejscie>
        {pola.map((p, i) => <PoleWidok key={p.k} p={p} v={v} setV={setV} blad={blad} i={i + 1} />)}
        {stop ? (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut}>
            <Karta style={{ padding: 16, marginTop: 18, backgroundColor: k.accBg, gap: 12 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}><Ikona n="alert" size={22} color={k.accInk} /><T v="body" c={k.ink} style={{ flex: 1, fontWeight: '600' }}>{stop}</T></View>
              <Przycisk tytul="Zadzwoń 112" ik="phone" onPress={() => router.back()} />
            </Karta>
          </Animated.View>
        ) : ostrz ? <Animated.View entering={FadeIn}><Karta style={{ padding: 14, marginTop: 18, backgroundColor: k.warnBg, flexDirection: 'row', gap: 10 }}><Ikona n="alert" size={20} color={k.warn} /><T v="sub" c={k.ink} style={{ flex: 1 }}>{ostrz}</T></Karta></Animated.View> : null}
        {blad ? <Animated.View entering={FadeIn}><T v="sub" c={k.accInk} style={{ marginTop: 14, fontWeight: '600' }}>Uzupełnij zaznaczone pola.</T></Animated.View> : null}
        {!stop ? <Wejscie i={pola.length + 1}><Przycisk tytul={nr < kroki.length - 1 ? 'Dalej' : 'Przejdź do podsumowania'} ik="arrow" style={{ marginTop: 26 }} onPress={dalej} /></Wejscie> : null}
        <Przycisk tytul={nr === 0 && !u.karta ? 'Anuluj' : 'Wstecz'} rodzaj="link" onPress={wstecz} />
      </Ekran>
    </KeyboardAvoidingView>
  );
}
