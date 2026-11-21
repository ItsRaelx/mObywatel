import { router } from 'expo-router';
import { Pressable, TextInput, View } from 'react-native';

import { dniZadania, pl3, type Osoba, type Sprawa, type Zadanie } from '@/data/typy';
import { trasaDla } from '@/data/uslugi';
import { rodz, useApp, useK } from '@/state/app';
import { potwierdz } from '@/ui/potwierdzenie';
import { Dni, Ikona, IkonaKafel, Karta, Portret, T, Wiersz } from '@/ui/elementy';

/* dokąd prowadzi przypomnienie z listy „Do załatwienia” */
export function trasaZadania(o: Osoba, z: Zadanie): string {
  const m: Record<string, string> = { oc: '/usluga/oc-badanie', pay: '/platnosci', renew: '/usluga/wniosek-dowod', punkty: '/usluga/punkty', glos: '/usluga/rejestr-wyborcow' };
  if (z.k === 'letter') { const p = o.skrzynka.find(x => x.pilne) ?? o.skrzynka.find(x => x.nowe) ?? o.skrzynka[0]; return p ? `/skrzynka/${p.id}` : '/skrzynka'; }
  return m[z.k] ?? trasaDla(z.q) ?? '/terminy';
}
const CZASOWNIK: Record<string, string> = { letter: 'Odpowiedz', pay: 'Zapłać', renew: 'Złóż wniosek', oc: 'Sprawdź', punkty: 'Sprawdź', glos: 'Załatw' };

export function ZadanieWiersz({ z }: { z: Zadanie }) {
  const { os } = useApp(); const k = useK(); const n = dniZadania(z);
  return (
    <Pressable onPress={() => router.push(trasaZadania(os, z) as never)} style={({ pressed }) => pressed && { backgroundColor: k.surface2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
        <IkonaKafel n={z.i} akcent={!!z.u} size={44} />
        <View style={{ flex: 1 }}>
          <T v="bodyB">{z.h}</T>
          <T v="sub" c={z.u ? k.accInk : k.ink2} style={{ fontWeight: '600', marginTop: 1 }}>{z.d}</T>
          <T v="small" c={k.accInk} style={{ fontWeight: '700', marginTop: 4 }}>{CZASOWNIK[z.k] ?? 'Sprawdź'}</T>
        </View>
        {n != null ? <Dni n={n} /> : <Ikona n="chev" size={18} color={k.ink3} />}
      </View>
    </Pressable>
  );
}

export function PasekPostepu({ s }: { s: Sprawa }) {
  const k = useK();
  return (
    <View style={{ flexDirection: 'row', gap: 4, marginTop: 10 }}>
      {s.steps.map((x, i) => <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: x[2] === 2 ? k.acc : k.surface2, overflow: 'hidden' }}>{x[2] === 1 ? <View style={{ width: '50%', height: 6, backgroundColor: k.acc }} /> : null}</View>)}
    </View>
  );
}
export function SprawaWiersz({ s }: { s: Sprawa }) {
  const k = useK(); const cur = s.steps.findIndex(x => x[2] < 2);
  return (
    <Pressable onPress={() => router.push(`/sprawa/${s.id}`)} style={({ pressed }) => pressed && { backgroundColor: k.surface2 }}>
      <View style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1 }}><T v="bodyB">{s.t}</T><T v="sub">{cur < 0 ? 'Zakończone' : `Teraz: ${s.steps[cur][0].charAt(0).toLowerCase() + s.steps[cur][0].slice(1)}`}</T></View>
          <T v="small" c={cur < 0 ? k.ok : k.ink} style={{ fontWeight: '700' }}>{s.eta}</T>
        </View>
        <PasekPostepu s={s} />
      </View>
    </Pressable>
  );
}

/* alert: ktoś sprawdzał PESEL */
export function AlertPrywatnosci() {
  const { log, os, pesel, zmien, toast } = useApp(); const k = useK();
  const a = log.find(x => x.typ === 'alert' && !x.zgl && !x.zablok && !x.potw);
  if (!a) return null;
  const nieJa = async () => { if (!(await potwierdz('Zastrzeżenie PESEL', 'pin'))) return; zmien(s => ({ pesel: true, log: s.log.map(x => (x.id === a.id ? { ...x, zgl: 1 } : x)) })); toast('PESEL zastrzeżony. Zgłoszenie trafiło do CERT Polska.'); };
  return (
    <Karta style={{ padding: 16, borderWidth: 2, borderColor: k.acc }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: k.acc, alignItems: 'center', justifyContent: 'center' }}><Ikona n="alert" size={22} color="#fff" /></View>
        <View style={{ flex: 1 }}><T v="h3" c={k.accInk}>Ktoś sprawdzał Twój PESEL</T><T v="sub">{a.kiedy}</T></View>
      </View>
      <T v="sub" style={{ marginTop: 10 }}>{a.kto}: {a.co.charAt(0).toLowerCase() + a.co.slice(1)}. {pesel ? '' : 'Twój PESEL nie jest zastrzeżony, więc ktoś mógł wziąć pożyczkę na Twoje dane.'}</T>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        <Pressable onPress={() => { zmien(s => ({ log: s.log.map(x => (x.id === a.id ? { ...x, potw: 1 } : x)) })); toast('Dziękujemy. Wpis oznaczony jako Twój.'); }}
          style={{ flex: 1, height: 46, borderRadius: 14, backgroundColor: k.surface2, alignItems: 'center', justifyContent: 'center' }}><T v="bodyB">To {rodz(os, 'byłam', 'byłem')} ja</T></Pressable>
        <Pressable onPress={nieJa} style={{ flex: 1.4, height: 46, borderRadius: 14, backgroundColor: k.acc, alignItems: 'center', justifyContent: 'center' }}><T v="bodyB" c="#fff">To nie ja, zablokuj</T></Pressable>
      </View>
    </Karta>
  );
}

export function KafelSkrot({ ik, t, o, onPress }: { ik: string; t: string; o: string; onPress: () => void }) {
  return (
    <Karta onPress={onPress} style={{ flex: 1, padding: 14, minHeight: 120 }}>
      <IkonaKafel n={ik} akcent size={42} />
      <View style={{ marginTop: 'auto', paddingTop: 12 }}><T v="bodyB">{t}</T><T v="small">{o}</T></View>
    </Karta>
  );
}
export { Wiersz };

export function KartaCzlonka({ id, szer = 250 }: { id: string; szer?: number }) {
  const { os, k } = useApp(); const m = os.rodzina.find(x => x.id === id)!;
  const ton = (s: string) => (s === 'ok' ? k.ok : s === 'prog' ? k.ink3 : s === 'warn' ? k.acc : k.ink3);
  return (
    <Karta onPress={() => router.push(`/rodzina/${m.id}`)} style={{ width: szer, padding: 14 }}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Portret id={m.id} w={52} h={64} r={12} />
        <View style={{ flex: 1 }}>
          <T v="h3">{m.imie}</T>
          <T v="sub">{m.rel.split(',')[0]} · {m.wiek} {pl3(m.wiek, 'rok', 'lata', 'lat')}</T>
        </View>
      </View>
      <View style={{ marginTop: 12, gap: 8 }}>
        {m.docs.length ? m.docs.slice(0, 3).map(d => (
          <View key={d[0]} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ton(d[2]) }} />
            <T v="sub" c={k.ink} n={1} style={{ flex: 1 }}>{d[0]}</T>
            <T v="small" c={d[2] === 'warn' ? k.accInk : k.ink2} style={{ fontWeight: '600' }}>{d[2] === 'ok' ? 'ważny' : d[2] === 'prog' ? 'w toku' : d[2] === 'warn' ? 'uwaga' : ''}</T>
          </View>
        )) : <T v="sub">Własne konto mObywatela</T>}
      </View>
    </Karta>
  );
}


export function PoleSzukania({ q, setQ, autoFocus }: { q: string; setQ: (s: string) => void; autoFocus?: boolean }) {
  const { k } = useApp();
  return (
    <View style={{ height: 52, borderRadius: 16, backgroundColor: k.surface, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: k.hair }}>
      <Ikona n="search" size={21} color={k.ink2} />
      <TextInput value={q} onChangeText={setQ} autoFocus={autoFocus} placeholder="Szukaj, np. meldunek, mandat, PESEL" placeholderTextColor={k.ink3}
        style={{ flex: 1, fontSize: 16.5, color: k.ink }} returnKeyType="search" clearButtonMode="while-editing" autoCorrect={false} />
    </View>
  );
}

