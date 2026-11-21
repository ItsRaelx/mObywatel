/* Podstrona usługi, wzorowana na prostych kreatorach z aplikacji bankowych:
   start (co to jest, ile trwa i kosztuje), jedno pytanie na ekran, podsumowanie, podpis PIN-em lub Face ID, wynik.
   Główny przycisk zawsze na dole ekranu, cofanie strzałką w nagłówku. */
import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, useWindowDimensions, View } from 'react-native';
import { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { lab, okresTxt, usluga, wiele, type Api, type Info, type Krok, type Pole, type Usluga, type V, type Wynik } from '@/data/uslugi';
import { DZIS, MIESIACE, dataZ, type Osoba, type Wiersz as Wrsz } from '@/data/typy';
import { useApp } from '@/state/app';
import { Grupa, Ikona, IkonaKafel, Karta, KodQR, Para, Przycisk, Sekcja, T, Wiersz } from '@/ui/elementy';
import { EkranInfo } from '@/ui/info-uslugi';
import { potwierdz } from '@/ui/potwierdzenie';
import { Animated, Pasek, Sprezyna } from '@/ui/ruch';
import { DokumentPapier, Kontrola, Os, Wykres } from '@/ui/wynik';

type Faza = 'karta' | 'krok' | 'sum' | 'qr' | 'wysylka' | 'done';
const widoczne = (k: Krok, v: V) => k.pola.filter(p => !p.gdy || p.gdy(v));
const pusta = (p: Pole, v: V) => (p.typ === 'okres' ? !String(v[p.k] ?? '').includes('|') : !String(v[p.k] ?? '').trim());
const czekaj = (ms: number) => new Promise(r => setTimeout(r, ms));
const wybieralne = (p: Pole) => p.typ === 'wybor' || p.typ === 'wiele' || p.typ === 'lista' || (!p.typ && !!p.opcje);
/* jedno pole wyboru na kroku: pytanie staje się tytułem ekranu, jeśli jest pytaniem; inaczej tytułem jest nazwa kroku */
const pytanie = (kr: Krok, pola: Pole[]) => (pola.length === 1 && wybieralne(pola[0]) && /\?$/.test(pola[0].l) ? pola[0].l : kr.t);
const etykieta = (p: Pole, kr: Krok, ile: number) => (ile === 1 && wybieralne(p) && !/\?$/.test(p.l) ? kr.t : p.l.replace(/\s*\(opcjonalnie\)/, '').replace(/\?$/, ''));

/* ---------- układ: przewijana treść i przycisk przypięty na dole ---------- */
function Uklad({ children, stopka, gora }: { children: ReactNode; stopka?: ReactNode; gora?: ReactNode }) {
  const { k } = useApp(); const ins = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90} style={{ flex: 1, backgroundColor: k.bg }}>
      {gora}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeIn.duration(220)}>{children}</Animated.View>
      </ScrollView>
      {stopka ? <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: ins.bottom + 12, backgroundColor: k.bg, gap: 4 }}>{stopka}</View> : null}
    </KeyboardAvoidingView>
  );
}
function Tytul({ t, opis }: { t: string; opis?: string }) {
  const { k } = useApp();
  return (
    <View style={{ marginBottom: 20 }}>
      <T v="h1" style={{ fontSize: 28, lineHeight: 33 }}>{t}</T>
      {opis ? <T v="body" c={k.ink2} style={{ marginTop: 8 }}>{opis}</T> : null}
    </View>
  );
}
function Wstecz({ onPress }: { onPress: () => void }) {
  const { k } = useApp();
  return <Pressable onPress={onPress} hitSlop={12} accessibilityRole="button" accessibilityLabel="Wstecz" style={{ paddingRight: 8 }}><Ikona n="back" size={24} color={k.accInk} sw={2} /></Pressable>;
}
function Ostrzezenie({ t, ton = 'a' }: { t: string; ton?: 'a' | 'r' }) {
  const { k } = useApp();
  return (
    <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16, backgroundColor: ton === 'r' ? k.accBg : k.warnBg, marginBottom: 16 }}>
      <Ikona n="alert" size={20} color={ton === 'r' ? k.accInk : k.warn} />
      <T v="sub" c={k.ink} style={{ flex: 1, fontWeight: '600' }}>{t}</T>
    </View>
  );
}

/* ---------- ekran, gdy usługa nie dotyczy albo już załatwiona ---------- */
function Blokada({ u, w }: { u: Usluga; w: Info }) {
  const { toast } = useApp();
  return (
    <Uklad stopka={w.dalej?.length ? w.dalej.map((d, i) => (
      <Przycisk key={d.t} tytul={d.t} rodzaj={i ? 'link' : 'glowny'} onPress={() => (d.trasa.startsWith('toast:') ? toast(d.trasa.slice(6)) : router.push(d.trasa as never))} />
    )) : <Przycisk tytul="Wróć" onPress={() => router.back()} />}>
      <IkonaKafel n={u.ik} akcent size={52} />
      <View style={{ height: 18 }} />
      <Tytul t={u.t} opis={w.tekst} />
      {w.wiersze?.length ? <Grupa>{w.wiersze.map(([a, b]) => <Para key={a} k={a} w={b} />)}</Grupa> : null}
    </Uklad>
  );
}

/* ---------- start usługi (wzór: Kit, Wise) ---------- */
function Start({ u, os, st, dalej }: { u: Usluga; os: Osoba; st: { pesel: boolean; zaplacone: string[] }; dalej: () => void }) {
  const { k } = useApp(); const c = u.karta!(os, st); const wst = u.wstep?.(os, st);
  const potrzebne = c.potrzebne.filter(p => !/^Nic więcej/.test(p));
  const czas = c.czas.replace(/^ok\. /, 'Około ').replace(/^kilka/, 'Kilka');
  return (
    <Uklad stopka={<Przycisk tytul="Rozpocznij" onPress={dalej} />}>
      <IkonaKafel n={u.ik} akcent size={52} />
      <View style={{ height: 18 }} />
      <Tytul t={u.t} opis={wst?.tekst ?? u.opis} />
      {wst?.flaga ? <Ostrzezenie t={wst.flaga} /> : null}
      <View style={{ gap: 8, marginBottom: 26 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Ikona n="clock" size={18} color={k.ink2} /><T v="sub" c={k.ink}>{czas}</T></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Ikona n="coin" size={18} color={k.ink2} /><T v="sub" c={k.ink}>{c.oplata.charAt(0).toUpperCase() + c.oplata.slice(1)}</T></View>
      </View>
      {potrzebne.length ? (
        <View style={{ marginBottom: 26 }}>
          <T v="bodyB" style={{ marginBottom: 10 }}>Przygotuj</T>
          {potrzebne.map(p => (
            <View key={p} style={{ flexDirection: 'row', gap: 12, marginBottom: 10 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: k.ink, marginTop: 9 }} />
              <T v="body" style={{ flex: 1 }}>{p}</T>
            </View>
          ))}
        </View>
      ) : null}
      <T v="bodyB" style={{ marginBottom: 10 }}>Jak to działa</T>
      {c.jak.map((j, i) => (
        <View key={j} style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: k.surface2, alignItems: 'center', justifyContent: 'center' }}><T v="small" c={k.ink} style={{ fontWeight: '800' }}>{i + 1}</T></View>
          <T v="body" style={{ flex: 1, paddingTop: 1 }}>{j}</T>
        </View>
      ))}
    </Uklad>
  );
}

/* ---------- pola ---------- */
function Radio({ on }: { on: boolean }) {
  const { k } = useApp();
  return (
    <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: on ? 7 : 2, borderColor: on ? k.acc : k.ink3, backgroundColor: k.surface }} />
  );
}
function Checkbox({ on }: { on: boolean }) {
  const { k } = useApp();
  return (
    <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: on ? k.acc : k.ink3, backgroundColor: on ? k.acc : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
      {on ? <Ikona n="ok" size={15} color="#fff" sw={2.8} /> : null}
    </View>
  );
}
function Wiersz2({ onPress, children, rola, on }: { onPress: () => void; children: ReactNode; rola: 'radio' | 'checkbox' | 'switch'; on: boolean }) {
  const { k } = useApp();
  return (
    <Pressable onPress={() => { Haptics.selectionAsync().catch(() => {}); onPress(); }} accessibilityRole={rola} accessibilityState={{ checked: on }}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 15, paddingHorizontal: 16, minHeight: 58 }, pressed && { backgroundColor: k.surface2 }]}>
      {children}
    </Pressable>
  );
}
function Przelacznik({ on }: { on: boolean }) {
  const { k } = useApp();
  return (
    <Animated.View layout={LinearTransition.duration(160)} style={{ width: 50, height: 30, borderRadius: 15, padding: 3, backgroundColor: on ? k.ok : k.surface2, alignItems: on ? 'flex-end' : 'flex-start' }}>
      <Animated.View layout={LinearTransition.duration(160)} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 2 }} />
    </Animated.View>
  );
}
function Zalacznik({ nazwa, wart, ustaw, zly }: { nazwa: string; wart: string; ustaw: (w: string) => void; zly: boolean }) {
  const { k } = useApp(); const [laduje, setLaduje] = useState(false);
  const foto = /jpg|png|zdj/.test(nazwa);
  const dodaj = async () => { setLaduje(true); await czekaj(800); setLaduje(false); ustaw(nazwa); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); };
  if (wart) return (
    <Karta style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
      <IkonaKafel n={foto ? 'camera' : 'doc'} size={40} />
      <View style={{ flex: 1 }}><T v="bodyB" n={1}>{wart}</T><T v="small">Dodano</T></View>
      <Pressable onPress={() => ustaw('')} hitSlop={10} accessibilityLabel="Usuń plik"><T v="sub" c={k.accInk} style={{ fontWeight: '700' }}>Usuń</T></Pressable>
    </Karta>
  );
  return (
    <Sprezyna onPress={dodaj} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 58, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: zly ? k.acc : k.hair, backgroundColor: k.surface }}>
      {laduje ? <ActivityIndicator color={k.ink2} /> : <Ikona n={foto ? 'camera' : 'plus'} size={20} color={k.ink} />}
      <T v="bodyB">{laduje ? 'Dodaję' : foto ? 'Zrób zdjęcie' : 'Dodaj plik'}</T>
    </Sprezyna>
  );
}

function PoleWidok({ p, v, setV, blad, jedyne, tytul }: { p: Pole; v: V; setV: (k: string, w: string) => void; blad: boolean; jedyne: boolean; tytul?: string }) {
  const { k } = useApp();
  const wart = v[p.k] ?? ''; const zly = blad && !!p.wym && !wart.trim();
  const typ = p.typ ?? (p.opcje ? 'wybor' : 'tekst');
  const naglowek = p.l === tytul || (jedyne && (typ === 'wybor' || typ === 'wiele' || typ === 'lista' || typ === 'okres')) ? null : <T v="sub" c={k.ink} style={{ fontWeight: '700', marginBottom: 8 }}>{p.l}</T>;
  let tresc: ReactNode;
  if (typ === 'wybor' && p.opcje) {
    tresc = <Grupa>{p.opcje.map(o => { const t = lab(o), on = wart === t, op = typeof o === 'string' ? undefined : o.o; return (
      <Wiersz2 key={t} rola="radio" on={on} onPress={() => setV(p.k, t)}>
        <View style={{ flex: 1 }}><T v="bodyB">{t}</T>{op ? <T v="sub" style={{ marginTop: 2 }}>{op}</T> : null}</View>
        <Radio on={on} />
      </Wiersz2>
    ); })}</Grupa>;
  } else if (typ === 'wiele' && p.opcje) {
    const zazn = wiele(wart);
    tresc = <Grupa>{p.opcje.map(o => { const t = lab(o), on = zazn.includes(t); return (
      <Wiersz2 key={t} rola="checkbox" on={on} onPress={() => setV(p.k, (on ? zazn.filter(x => x !== t) : [...zazn, t]).join('|'))}>
        <T v="body" style={{ flex: 1 }}>{t}</T>
        <Checkbox on={on} />
      </Wiersz2>
    ); })}</Grupa>;
  } else if (typ === 'tak') {
    return (
      <Grupa style={{ marginBottom: 12 }}>
        <Wiersz2 rola="switch" on={wart === 'tak'} onPress={() => setV(p.k, wart === 'tak' ? 'nie' : 'tak')}>
          <View style={{ flex: 1 }}><T v="bodyB">{p.l}</T>{p.podp ? <T v="sub" style={{ marginTop: 2 }}>{p.podp}</T> : null}</View>
          <Przelacznik on={wart === 'tak'} />
        </Wiersz2>
      </Grupa>
    );
  } else if (typ === 'lista' && p.opcje) {
    tresc = <Lista opcje={p.opcje.map(lab)} wart={wart} ustaw={w => setV(p.k, w)} ph={p.ph} zly={zly} />;
  } else if (typ === 'okres') {
    tresc = <Kalendarz wart={wart} ustaw={w => setV(p.k, w)} />;
  } else if (typ === 'plik') {
    tresc = <Zalacznik nazwa={p.plik ?? 'plik.pdf'} wart={wart} ustaw={w => setV(p.k, w)} zly={zly} />;
  } else {
    const dl = typ === 'dlugi';
    tresc = (
      <TextInput value={wart} onChangeText={t => setV(p.k, t)} placeholder={p.ph} placeholderTextColor={k.ink3} keyboardType={p.num ? 'number-pad' : 'default'} multiline={dl} accessibilityLabel={p.l}
        style={{ minHeight: dl ? 150 : 54, borderRadius: 16, paddingHorizontal: 16, paddingVertical: dl ? 14 : 0, fontSize: 17, lineHeight: dl ? 24 : undefined, color: k.ink, backgroundColor: k.surface, borderWidth: 1.5, borderColor: zly ? k.acc : k.hair, textAlignVertical: dl ? 'top' : 'center' }} />
    );
  }
  return (
    <View style={{ marginBottom: 20 }}>
      {naglowek}
      {tresc}
      {zly ? <T v="small" c={k.accInk} style={{ marginTop: 6, fontWeight: '600' }}>{typ === 'plik' ? 'Dodaj plik, żeby przejść dalej.' : 'Uzupełnij to pole.'}</T>
        : p.podp ? <T v="small" style={{ marginTop: 6 }}>{p.podp}</T> : null}
    </View>
  );
}

/* ---------- lista z wyszukiwarką (np. kraje) ---------- */
function Lista({ opcje, wart, ustaw, ph, zly }: { opcje: string[]; wart: string; ustaw: (w: string) => void; ph?: string; zly: boolean }) {
  const { k } = useApp(); const [q, setQ] = useState('');
  const n = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');
  const lista = opcje.filter(o => n(o).includes(n(q)));
  return (
    <View>
      {wart ? (
        <Grupa style={{ marginBottom: 12 }}>
          <Wiersz2 rola="radio" on onPress={() => ustaw('')}>
            <T v="bodyB" style={{ flex: 1 }}>{wart}</T>
            <T v="sub" c={k.accInk} style={{ fontWeight: '700' }}>Zmień</T>
          </Wiersz2>
        </Grupa>
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, borderRadius: 16, paddingHorizontal: 14, backgroundColor: k.surface, borderWidth: 1.5, borderColor: zly ? k.acc : k.hair, marginBottom: 12 }}>
            <Ikona n="search" size={18} color={k.ink3} />
            <TextInput value={q} onChangeText={setQ} placeholder={ph ?? 'Szukaj'} placeholderTextColor={k.ink3} style={{ flex: 1, fontSize: 17, color: k.ink }} accessibilityLabel={ph} />
          </View>
          <Grupa>{lista.slice(0, 60).map(o => (
            <Wiersz2 key={o} rola="radio" on={false} onPress={() => { ustaw(o); setQ(''); }}>
              <T v="body" style={{ flex: 1 }}>{o}</T>
            </Wiersz2>
          ))}</Grupa>
          {!lista.length ? <T v="sub" style={{ marginTop: 8 }}>Nie ma takiego kraju na liście.</T> : null}
        </>
      )}
    </View>
  );
}

/* ---------- kalendarz z wyborem okresu od do ---------- */
const DNI_TYG = ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd'];
const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
function Kalendarz({ wart, ustaw }: { wart: string; ustaw: (w: string) => void }) {
  const { k } = useApp();
  const [a, b] = (wart || '').split('|'); const od = a ? dataZ(a) : null, doo = b ? dataZ(b) : null;
  const [mies, setMies] = useState(() => { const d = od ?? DZIS; return new Date(d.getFullYear(), d.getMonth(), 1); });
  const pierwszy = (mies.getDay() + 6) % 7, ile = new Date(mies.getFullYear(), mies.getMonth() + 1, 0).getDate();
  const komorki: (Date | null)[] = [...Array(pierwszy).fill(null), ...Array.from({ length: ile }, (_, i) => new Date(mies.getFullYear(), mies.getMonth(), i + 1))];
  const wybierz = (d: Date) => {
    Haptics.selectionAsync().catch(() => {});
    if (!od || doo || d < od) ustaw(fmt(d)); else ustaw(`${fmt(od)}|${fmt(d)}`);
  };
  const dni = od && doo ? Math.round((doo.getTime() - od.getTime()) / 864e5) + 1 : 0;
  const moznaWstecz = mies > new Date(DZIS.getFullYear(), DZIS.getMonth(), 1);
  return (
    <Karta style={{ padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Pressable disabled={!moznaWstecz} onPress={() => setMies(new Date(mies.getFullYear(), mies.getMonth() - 1, 1))} hitSlop={10} accessibilityLabel="Poprzedni miesiąc" style={{ padding: 6, opacity: moznaWstecz ? 1 : 0.25 }}><Ikona n="back" size={20} color={k.ink} /></Pressable>
        <T v="bodyB" center style={{ flex: 1 }}>{MIESIACE[mies.getMonth()]} {mies.getFullYear()}</T>
        <Pressable onPress={() => setMies(new Date(mies.getFullYear(), mies.getMonth() + 1, 1))} hitSlop={10} accessibilityLabel="Następny miesiąc" style={{ padding: 6 }}><Ikona n="chev" size={20} color={k.ink} /></Pressable>
      </View>
      <View style={{ flexDirection: 'row' }}>{DNI_TYG.map(d => <T key={d} v="small" center style={{ width: '14.285%', fontWeight: '700' }}>{d}</T>)}</View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
        {komorki.map((d, i) => {
          if (!d) return <View key={'p' + i} style={{ width: '14.285%', height: 44 }} />;
          const prz = d < DZIS, poczatek = !!od && d.getTime() === od.getTime(), koniec = !!doo && d.getTime() === doo.getTime();
          const wsr = !!od && !!doo && d > od && d < doo, kraniec = poczatek || koniec;
          return (
            <View key={i} style={{ width: '14.285%', height: 44, justifyContent: 'center', backgroundColor: wsr || (kraniec && doo && od && doo > od) ? k.accBg : 'transparent',
              borderTopLeftRadius: poczatek ? 22 : 0, borderBottomLeftRadius: poczatek ? 22 : 0, borderTopRightRadius: koniec ? 22 : 0, borderBottomRightRadius: koniec ? 22 : 0 }}>
              <Pressable disabled={prz} onPress={() => wybierz(d)} accessibilityLabel={fmt(d)} accessibilityState={{ selected: kraniec, disabled: prz }}
                style={{ alignSelf: 'center', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: kraniec ? k.acc : 'transparent' }}>
                <T v="body" c={kraniec ? '#fff' : prz ? k.ink3 : k.ink} style={{ fontWeight: kraniec ? '800' : '500', opacity: prz ? 0.5 : 1 }}>{d.getDate()}</T>
              </Pressable>
            </View>
          );
        })}
      </View>
      <View style={{ marginTop: 10, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: k.hair }}>
        <T v="bodyB" center>{od && doo ? `${okresTxt(wart)}, ${dni} ${dni === 1 ? 'dzień' : 'dni'}` : od ? `Wyjazd ${a}. Teraz wybierz dzień powrotu.` : 'Wybierz dzień wyjazdu.'}</T>
      </View>
    </Karta>
  );
}

/* ---------- potwierdzenie przez drugą osobę: kod QR do zeskanowania ---------- */
function PolaczenieQR({ d, dalej }: { d: NonNullable<ReturnType<NonNullable<Usluga['qr']>>>; dalej: () => void }) {
  const { k } = useApp(); const { width } = useWindowDimensions();
  const [etap, setEtap] = useState<'czeka' | 'sprawdza' | 'ok'>('czeka'); const [sek, setSek] = useState(180);
  const [kod] = useState(() => String(100000 + Math.floor(Math.random() * 899999)));
  useEffect(() => { const i = setInterval(() => setSek(x => Math.max(0, x - 1)), 1000); return () => clearInterval(i); }, []);
  useEffect(() => {
    if (etap === 'czeka') { const t = setTimeout(() => { setEtap('sprawdza'); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); }, 5000); return () => clearTimeout(t); }
    if (etap === 'sprawdza') { const t = setTimeout(() => { setEtap('ok'); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); }, 3500); return () => clearTimeout(t); }
  }, [etap]);
  return (
    <Uklad stopka={etap === 'ok' ? <Przycisk tytul="Dalej" onPress={dalej} /> : etap === 'czeka' ? <Przycisk tytul="Pokaz: drugi kierowca skanuje" rodzaj="link" onPress={() => setEtap('sprawdza')} /> : undefined}>
      {etap === 'czeka' ? (
        <>
          <Tytul t={d.tytul} opis={d.opis} />
          <Karta style={{ padding: 18, alignItems: 'center' }}>
            <View style={{ padding: 10, backgroundColor: '#fff', borderRadius: 16 }}><KodQR tekst={`MSTLUCZKA:${kod}`} size={Math.min(width - 120, 240)} /></View>
            <T v="small" style={{ marginTop: 14 }}>Albo kod do wpisania</T>
            <T v="h1" style={{ fontSize: 34, letterSpacing: 6, marginTop: 2 }}>{kod.slice(0, 3)} {kod.slice(3)}</T>
            <T v="sub" style={{ marginTop: 6 }}>Kod ważny jeszcze {Math.floor(sek / 60)}:{String(sek % 60).padStart(2, '0')}</T>
          </Karta>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, justifyContent: 'center' }}>
            <ActivityIndicator color={k.acc} /><T v="bodyB">Czekam na drugiego kierowcę</T>
          </View>
        </>
      ) : (
        <>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: etap === 'ok' ? k.okBg : k.surface2, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
            {etap === 'ok' ? <Ikona n="ok" size={32} color={k.ok} sw={2.4} /> : <ActivityIndicator color={k.acc} />}
          </View>
          <View style={{ height: 18 }} />
          <Tytul t={etap === 'ok' ? `${d.kto} potwierdził` : `Połączono z: ${d.kto}`} opis={etap === 'ok' ? 'Oboje potwierdziliście szczegóły zdarzenia. Oświadczenia nie można już zmienić.' : 'Drugi kierowca sprawdza szczegóły zdarzenia w swoim telefonie.'} />
          <Sekcja tytul="Dane drugiego kierowcy">
            <Grupa>{d.druga.map(([a, b]) => <Para key={a} k={a} w={b} />)}</Grupa>
          </Sekcja>
          <T v="small" style={{ marginTop: 12, marginHorizontal: 4 }}>Dane pobraliśmy z CEPiK, rejestru PESEL i bazy UFG.</T>
        </>
      )}
    </Uklad>
  );
}

/* ---------- wysyłka ---------- */
function Wysylka({ t }: { t: string }) {
  const { k } = useApp();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: k.bg, paddingBottom: 80 }}>
      <ActivityIndicator size="large" color={k.acc} />
      <Animated.View key={t} entering={FadeIn.duration(200)}><T v="bodyB" center style={{ marginTop: 18 }}>{t.replace(/…$/, '')}</T></Animated.View>
    </View>
  );
}

/* ---------- wynik ---------- */
function EkranWyniku({ w }: { w: Wynik }) {
  const { k } = useApp(); const [dok, setDok] = useState(false);
  const zly = w.ikona === 'alert';
  return (
    <Uklad stopka={<>
      {w.dalej?.map(d => <Przycisk key={d.t} tytul={d.t} rodzaj="drugi" style={{ marginBottom: 6 }} onPress={() => router.replace(d.trasa as never)} />)}
      <Przycisk tytul="Gotowe" onPress={() => router.back()} />
    </>}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: zly ? k.warnBg : k.okBg, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
        <Ikona n={zly ? 'alert' : 'ok'} size={32} color={zly ? k.warn : k.ok} sw={2.4} />
      </View>
      <View style={{ height: 18 }} />
      <Tytul t={w.tytul} opis={w.opis} />
      {w.kontrola ? <View style={{ marginBottom: 16 }}><Kontrola dane={w.kontrola} /></View> : null}
      {w.wiersze.length ? <Grupa style={{ marginBottom: 16 }}>{w.wiersze.map(([a, b]) => <Para key={a} k={a} w={b} />)}</Grupa> : null}
      {w.dok ? (
        <View style={{ marginBottom: 16 }}>
          <Grupa><Wiersz ik="doc" tytul={w.dok.tytul} opis={dok ? 'Ukryj podgląd' : 'Pokaż dokument'} onPress={() => setDok(!dok)} /></Grupa>
          {dok ? <Animated.View entering={FadeIn.duration(200)} style={{ marginTop: 12 }}><DokumentPapier d={w.dok} /></Animated.View> : null}
        </View>
      ) : null}
      {w.sprawa ? (
        <Grupa style={{ marginBottom: 16 }}>
          <Wiersz ik="route" tytul="Śledź sprawę" opis={`${w.sprawa.eta}. Znajdziesz ją w Więcej, Terminy i sprawy.`} onPress={() => router.push(`/sprawa/${w.sprawa!.id}` as never)} />
        </Grupa>
      ) : null}
      {w.wykres ? <Sekcja tytul={w.wykres.t} style={{ marginTop: 8, marginBottom: 16 }}><Wykres w={w.wykres} /></Sekcja> : null}
      {w.os ? <Sekcja tytul="Historia" style={{ marginBottom: 16 }}><Os dane={w.os} /></Sekcja> : null}
      {w.coDalej?.length ? (
        <Sekcja tytul="Co dalej" style={{ marginTop: 8 }}>
          <Grupa>{w.coDalej.map(c => (
            <View key={c} style={{ flexDirection: 'row', gap: 12, padding: 15 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: k.ink3, marginTop: 9 }} />
              <T v="body" style={{ flex: 1 }}>{c}</T>
            </View>
          ))}</Grupa>
        </Sekcja>
      ) : null}
    </Uklad>
  );
}

export default function UslugaEkran() {
  const { id, ...param } = useLocalSearchParams<{ id: string; dok?: string; wpis?: string }>();
  const { os, k, pesel, zaplacone, zmien } = useApp();
  const u = usluga(id); const st = { pesel, zaplacone };
  const kroki = useMemo(() => u?.kroki?.(os, st, param as V) ?? [], [u, os]); // eslint-disable-line react-hooks/exhaustive-deps
  const [v, setVals] = useState<V>(() => Object.fromEntries(kroki.flatMap(kr => kr.pola).map(p => [p.k, p.v ?? (p.typ !== 'wiele' && p.typ !== 'plik' && p.opcje?.length ? lab(p.opcje[0]) : '')])));
  const [faza, setFaza] = useState<Faza>(u?.karta ? 'karta' : 'krok');
  const [nr, setNr] = useState(0); const [blad, setBlad] = useState(false); const [zgoda, setZgoda] = useState(false); const [bladZgody, setBladZgody] = useState(false);
  const [etap, setEtap] = useState(''); const [wynik, setWynik] = useState<Wynik | null>(null);
  const [blok] = useState(() => u?.blokada?.(os, st) ?? (u?.dostepna && !u.dostepna(os, st) ? { tekst: 'Ta usługa Cię teraz nie dotyczy. Wszystkie sprawy, które możesz załatwić, znajdziesz w zakładce Usługi.', dalej: [{ t: 'Wszystkie usługi', trasa: '/uslugi' }] } : null));
  useEffect(() => { if (u?.ekran) router.replace(u.ekran as never); }, [u]);
  if (!u) return <Uklad><Tytul t="Nie znaleziono" opis="Tej usługi nie ma w prototypie." /></Uklad>;
  if (u.ekran) return null;
  if (u.ekranInfo && !blok) return <><Stack.Screen options={{ title: '' }} /><EkranInfo id={u.ekranInfo} u={u} /></>;

  const setV = (kl: string, w: string) => { setVals(s => ({ ...s, [kl]: w })); };
  const etapy = u.wysylka ?? (u.bezFaceId ? ['Sprawdzam dane'] : ['Podpisuję wniosek', 'Wysyłam do urzędu']);
  const krok = kroki[nr]; const pola = krok ? widoczne(krok, v) : [];
  const stop = krok?.stop?.(v); const ostrz = krok?.ostrzezenie?.(v);
  const razem = kroki.length + 1;

  const api: Api = {
    zalatw: z => zmien(s => ({ zalatwione: [...s.zalatwione, z] })),
    pesel: b => zmien({ pesel: b }),
    wpis: (wid, pole) => zmien(x => ({ log: x.log.map(w => (w.id === wid ? { ...w, [pole]: 1 } : w)) })),
    pismo: p => zmien(s => ({ pisma: [{ ...p, id: 'n' + Date.now() + Math.random().toString(36).slice(2, 6), kiedy: '18.10' }, ...s.pisma] })),
    zaplac: (t, kw) => zmien(s => ({ historia: [['18.10', t, kw, 'EP/2026/7 3' + String(Date.now()).slice(-5)], ...s.historia] })),
  };
  const auto = !u.podsumowanie;
  const podsum: (Wrsz & { krok?: number })[] = u.podsumowanie ? u.podsumowanie(v, os) : kroki.flatMap((kr, ki) => widoczne(kr, v).map(p => ({ p, kr, ki, ile: widoczne(kr, v).length }))).filter(({ p }) => v[p.k]).map(({ p, kr, ki, ile }) => {
    const w = v[p.k]; const t = p.typ === 'tak' ? (w === 'tak' ? 'tak' : 'nie') : p.typ === 'wiele' ? wiele(w).join(', ') : p.typ === 'okres' ? okresTxt(w) : p.typ === 'dlugi' && w.length > 60 ? w.slice(0, 60) + '...' : w;
    return Object.assign([p.typ === 'tak' ? p.l : etykieta(p, kr, ile), t] as Wrsz, { krok: ki });
  });

  const wykonaj = async () => {
    if (u.zgoda && !zgoda) { setBladZgody(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}); return; }
    if (!u.bezFaceId && !(await potwierdz(u.platnosc ? (u.przycisk ?? 'Zapłać') : u.t, u.platnosc ? 'faceid' : 'pin'))) return;
    if (u.qr) { setFaza('qr'); return; }
    await wyslij();
  };
  const wyslij = async () => {
    setFaza('wysylka');
    for (const e of etapy) { setEtap(e); await czekaj(900); }
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
  const wstecz = () => { setBlad(false); if (faza === 'sum') setFaza('krok'); else if (faza === 'krok' && nr > 0) setNr(nr - 1); else if (faza === 'krok' && u.karta) setFaza('karta'); else router.back(); };

  const wKreatorze = faza === 'krok' || faza === 'sum';
  const nag = <Stack.Screen options={{
    title: wKreatorze ? u.t : '', headerBackVisible: faza === 'karta' || !!blok,
    headerLeft: wKreatorze ? () => <Wstecz onPress={wstecz} /> : undefined, gestureEnabled: faza === 'karta' || !!blok,
  }} />;
  const pasek = <View style={{ paddingHorizontal: 20, paddingTop: 4 }}><Pasek f={faza === 'sum' ? 1 : (nr + 1) / razem} kolor={k.acc} tlo={k.surface2} h={4} /></View>;

  if (blok) return <>{nag}<Blokada u={u} w={blok} /></>;
  if (faza === 'karta') return <>{nag}<Start u={u} os={os} st={st} dalej={() => setFaza('krok')} /></>;
  if (faza === 'qr' && u.qr) return <>{nag}<PolaczenieQR d={u.qr(v, os)} dalej={wyslij} /></>;
  if (faza === 'wysylka') return <>{nag}<Wysylka t={etap} /></>;
  if (faza === 'done' && wynik) return <>{nag}<EkranWyniku w={wynik} /></>;

  if (faza === 'sum') return (
    <>{nag}
      <Uklad key="sum" gora={pasek} stopka={<>
        <Przycisk tytul={u.przycisk ?? 'Podpisz i wyślij'} onPress={wykonaj} />
        {!u.bezFaceId ? <T v="small" center style={{ marginTop: 6 }}>{u.platnosc ? 'Płatność potwierdzisz Face ID.' : 'Podpiszesz PIN-em mObywatela.'}</T> : null}
      </>}>
        <Tytul t="Czy wszystko się zgadza?" opis={auto ? 'Dotknij wiersza, żeby go poprawić.' : 'Jeśli coś się nie zgadza, cofnij się i popraw.'} />
        <Grupa>{podsum.map(r => (
          <Pressable key={r[0]} disabled={!auto} onPress={() => { setNr(r.krok ?? 0); setFaza('krok'); }}
            style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 }, pressed && { backgroundColor: k.surface2 }]}>
            <T v="sub" c={k.ink2} style={{ flexShrink: 0, maxWidth: '45%' }}>{r[0]}</T>
            <T v="sub" c={k.ink} n={2} style={{ flex: 1, textAlign: 'right', fontWeight: '600' }}>{r[1]}</T>
            {auto ? <Ikona n="chev" size={16} color={k.ink3} /> : null}
          </Pressable>
        ))}</Grupa>
        {u.zgoda ? (
          <Grupa style={{ marginTop: 16, borderWidth: bladZgody ? 1.5 : 0, borderColor: k.acc }}>
            <Wiersz2 rola="checkbox" on={zgoda} onPress={() => { setZgoda(!zgoda); setBladZgody(false); }}>
              <T v="body" style={{ flex: 1 }}>{u.zgoda}</T>
              <Checkbox on={zgoda} />
            </Wiersz2>
          </Grupa>
        ) : null}
        {bladZgody ? <T v="small" c={k.accInk} style={{ marginTop: 6, fontWeight: '600' }}>Zaznacz oświadczenie, żeby wysłać.</T> : null}
      </Uklad>
    </>
  );

  const jedno = pola.length === 1;
  return (
    <>{nag}
      <Uklad key={'k' + nr} gora={pasek} stopka={stop ? <Przycisk tytul="Zadzwoń pod 112" onPress={() => router.back()} /> : <Przycisk tytul="Dalej" onPress={dalej} />}>
        <Tytul t={krok ? pytanie(krok, pola) : ''} opis={krok?.opis} />
        {nr === 0 && !u.karta && u.wstep?.(os, st).flaga ? <Ostrzezenie t={u.wstep(os, st).flaga!} /> : null}
        {stop ? <Ostrzezenie t={stop} ton="r" /> : ostrz ? <Ostrzezenie t={ostrz} /> : null}
        {pola.map(p => <PoleWidok key={p.k} p={p} v={v} setV={setV} blad={blad} jedyne={jedno} tytul={krok ? pytanie(krok, pola) : undefined} />)}
        {blad ? <T v="sub" c={k.accInk} style={{ fontWeight: '600' }}>Uzupełnij zaznaczone pola.</T> : null}
      </Uklad>
    </>
  );
}
