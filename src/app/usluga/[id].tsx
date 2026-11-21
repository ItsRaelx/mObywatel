import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';

import { usluga, type Api, type Info, type Wynik } from '@/data/uslugi';
import { potwierdz, useApp } from '@/state/app';
import { Ekran, Grupa, Ikona, IkonaKafel, Karta, Notka, Para, Przycisk, Sekcja, T } from '@/ui/elementy';

function Wstep({ w }: { w: Info }) {
  const { k, toast } = useApp();
  return (
    <>
      {w.flaga ? <Karta style={{ padding: 14, flexDirection: 'row', gap: 10, backgroundColor: k.warnBg, marginBottom: 12 }}><Ikona n="alert" size={20} color={k.warn} /><T v="sub" c={k.ink} style={{ flex: 1, fontWeight: '600' }}>{w.flaga}</T></Karta> : null}
      {w.tekst ? <T v="body" c={k.ink2} style={{ marginBottom: 14 }}>{w.tekst}</T> : null}
      {w.wiersze?.length ? <Grupa style={{ marginBottom: 6 }}>{w.wiersze.map(([a, b]) => <Para key={a} k={a} w={b} />)}</Grupa> : null}
      {w.uwaga ? <Notka>{w.uwaga}</Notka> : null}
      {w.dalej?.length ? <View style={{ gap: 10, marginTop: 16 }}>{w.dalej.map(d => (
        <Przycisk key={d.t} tytul={d.t} ik={d.ik ?? 'arrow'} rodzaj="drugi" onPress={() => (d.trasa.startsWith('toast:') ? toast(d.trasa.slice(6)) : router.push(d.trasa as never))} />
      ))}</View> : null}
    </>
  );
}

export default function UslugaEkran() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { os, k, pesel, zaplacone, zmien } = useApp();
  const u = usluga(id); const st = { pesel, zaplacone };
  const pola = useMemo(() => u?.pola?.(os, st) ?? [], [u, os]); // eslint-disable-line react-hooks/exhaustive-deps
  const [v, setV] = useState<Record<string, string>>(() => Object.fromEntries(pola.map(p => [p.k, p.v ?? p.opcje?.[0] ?? ''])));
  const [krok, setKrok] = useState<'form' | 'sum' | 'done'>('form'); const [wynik, setWynik] = useState<Wynik | null>(null); const [blad, setBlad] = useState(false);
  useEffect(() => { if (u?.ekran) router.replace(u.ekran as never); }, [u]);
  if (!u) return <Ekran tytul="Nie znaleziono"><T>Tej usługi nie ma w prototypie.</T></Ekran>;
  if (u.ekran) return null;

  const api: Api = {
    zalatw: z => zmien(s => ({ zalatwione: [...s.zalatwione, z] })),
    pesel: b => zmien({ pesel: b }),
    pismo: p => zmien(s => ({ pisma: [{ ...p, id: 'n' + Date.now(), kiedy: '18.10' }, ...s.pisma] })),
    zaplac: (t, kw) => zmien(s => ({ historia: [['18.10', t, kw, 'EP/2026/7 3' + String(Date.now()).slice(-5)], ...s.historia] })),
  };
  const wykonaj = async () => {
    if (!u.bezFaceId && !(await potwierdz(u.przycisk ?? 'Potwierdź'))) return;
    setWynik(u.wynik!(v, os, api)); setKrok('done');
  };
  const dalej = () => {
    if (pola.some(p => p.wym && !String(v[p.k] ?? '').trim())) { setBlad(true); return; }
    setBlad(false);
    if (u.podsumowanie) setKrok('sum'); else wykonaj();
  };
  const naglowek = <Stack.Screen options={{ title: krok === 'done' ? '' : u.t }} />;

  if (u.info) {
    return (
      <Ekran>{naglowek}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}><IkonaKafel n={u.ik} akcent size={48} /><View style={{ flex: 1 }}><T v="h2">{u.t}</T><T v="sub">{u.opis}</T></View></View>
        <Wstep w={u.info(os, st)} />
      </Ekran>
    );
  }

  if (krok === 'done' && wynik) {
    const zly = wynik.ikona === 'alert';
    return (
      <Ekran>{naglowek}
        <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 22 }}>
          <View style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: zly ? k.warnBg : k.okBg, alignItems: 'center', justifyContent: 'center' }}>
            <Ikona n={zly ? 'alert' : 'ok'} size={46} color={zly ? k.warn : k.ok} sw={2.3} />
          </View>
          <T v="h1" center style={{ marginTop: 16, fontSize: 27 }}>{wynik.tytul}</T>
          {wynik.opis ? <T v="body" c={k.ink2} center style={{ marginTop: 8 }}>{wynik.opis}</T> : null}
        </View>
        {wynik.wiersze.length ? <Grupa>{wynik.wiersze.map(([a, b]) => <Para key={a} k={a} w={b} />)}</Grupa> : null}
        {wynik.dalej?.map(d => <Przycisk key={d.t} tytul={d.t} rodzaj="drugi" ik="arrow" style={{ marginTop: 12 }} onPress={() => router.replace(d.trasa as never)} />)}
        <Przycisk tytul="Gotowe" style={{ marginTop: 14 }} onPress={() => router.back()} />
      </Ekran>
    );
  }

  const wst = u.wstep?.(os, st);
  const stop = u.id === 'zastrzez-pesel' && pesel;
  const doSum = krok === 'sum' || (!pola.length && u.podsumowanie);
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <Ekran>{naglowek}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}><IkonaKafel n={u.ik} akcent size={48} /><View style={{ flex: 1 }}><T v="h2">{u.t}</T><T v="sub">{u.opis}</T></View></View>
        {krok === 'form' && wst ? <Wstep w={wst} /> : null}
        {stop ? null : doSum ? (
          <>
            <Sekcja tytul="Sprawdź i potwierdź" style={{ marginTop: krok === 'sum' ? 0 : 18 }}>
              <Grupa>{u.podsumowanie!(v, os).map(([a, b]) => <Para key={a} k={a} w={b} />)}</Grupa>
            </Sekcja>
            <Przycisk tytul={u.przycisk ?? 'Podpisz i wyślij'} ik={u.bezFaceId ? undefined : 'faceid'} style={{ marginTop: 20 }} onPress={wykonaj} />
            {krok === 'sum' ? <Przycisk tytul="Popraw dane" rodzaj="link" onPress={() => setKrok('form')} /> : null}
            {!u.bezFaceId ? <T v="small" center style={{ marginTop: 8 }}>Potwierdzisz Face ID. To podpis elektroniczny, jak podpis zaufany.</T> : null}
          </>
        ) : (
          <>
            {pola.map(p => (
              <View key={p.k} style={{ marginTop: 16 }}>
                <T v="sub" c={k.ink} style={{ fontWeight: '700', marginBottom: 8, marginLeft: 4 }}>{p.l}</T>
                {p.opcje ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {p.opcje.map(o => { const on = v[p.k] === o; return (
                      <Pressable key={o} onPress={() => setV({ ...v, [p.k]: o })} accessibilityState={{ selected: on }}
                        style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: on ? k.ink : k.surface, borderWidth: 1, borderColor: on ? k.ink : k.hair, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {on ? <Ikona n="ok" size={15} color={k.bg} sw={2.6} /> : null}
                        <T v="sub" c={on ? k.bg : k.ink} style={{ fontWeight: '600' }}>{o}</T>
                      </Pressable>
                    ); })}
                  </View>
                ) : (
                  <TextInput value={v[p.k]} onChangeText={t => setV({ ...v, [p.k]: t })} placeholder={p.ph} placeholderTextColor={k.ink3} keyboardType={p.num ? 'number-pad' : 'default'}
                    style={{ height: 52, borderRadius: 15, paddingHorizontal: 15, fontSize: 16.5, color: k.ink, backgroundColor: k.surface, borderWidth: 1.5, borderColor: blad && p.wym && !String(v[p.k] ?? '').trim() ? k.acc : k.hair }} />
                )}
                {p.podp ? <T v="small" style={{ marginTop: 6, marginLeft: 4 }}>{p.podp}</T> : null}
              </View>
            ))}
            {blad ? <T v="sub" c={k.accInk} style={{ marginTop: 12, fontWeight: '600' }}>Uzupełnij zaznaczone pola.</T> : null}
            <Przycisk tytul={u.podsumowanie ? 'Dalej' : u.przycisk ?? 'Dalej'} style={{ marginTop: 24 }} onPress={dalej} />
          </>
        )}
      </Ekran>
    </KeyboardAvoidingView>
  );
}
