import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { trasaDla } from '@/data/uslugi';
import { useApp } from '@/state/app';
import { Ekran, Ikona, Karta, Przycisk, T, Wiersz } from '@/ui/elementy';

export default function PismoEkran() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { os, k, skrzynka, zmien, toast, zalatwione } = useApp();
  const m = skrzynka.find(x => x.id === id);
  useEffect(() => { if (m) zmien(s => (s.przeczytane.includes(m.id) ? {} : { przeczytane: [...s.przeczytane, m.id] })); }, [m?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!m) return <Ekran><T>Nie znaleziono pisma.</T></Ekran>;
  const odpowiedz = m.id === os.skrzynka[0]?.id && !!os.sc.letter.draft && !!m.pilne && !zalatwione.includes('letter');
  const trasa = odpowiedz ? '/usluga/odpowiedz' : trasaDla(m.q);
  return (
    <Ekran>
      <T v="sub">{m.od} · {m.kiedy}{/\d{4}/.test(m.kiedy) ? '' : '.2026'}</T>
      <T v="h1" style={{ fontSize: 26, lineHeight: 31, marginTop: 4 }}>{m.t}</T>
      {m.pilne && m.id === os.skrzynka[0]?.id && zalatwione.includes('letter') ? <Karta style={{ marginTop: 16, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: k.okBg }}><Ikona n="check" size={22} color={k.ok} /><T v="bodyB" c={k.ok}>Odpowiedź wysłana</T></Karta> : m.pilne ? <Karta style={{ marginTop: 16, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: k.acc }}><Ikona n="clock" size={22} color="#fff" /><T v="bodyB" c="#fff">{m.pilne}</T></Karta> : null}
      <Karta style={{ marginTop: 14, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}><Ikona n="spark" size={20} color={k.accInk} /><T v="h3">W skrócie</T><T v="small" style={{ marginLeft: 'auto' }}>prostym językiem</T></View>
        {m.skrot.map(s => <View key={s} style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: k.acc, marginTop: 8 }} /><T v="body" style={{ flex: 1 }}>{s}</T></View>)}
      </Karta>
      <Karta style={{ marginTop: 12 }}><Wiersz ik="doc" tytul="Pismo oryginalne (PDF)" opis="Z kwalifikowaną pieczęcią urzędu" prawa={<Ikona n="download" size={20} color={k.ink2} />} strzalka={false} onPress={() => toast('Pismo zapisane w Plikach (pokaz)')} /></Karta>
      {trasa ? <Przycisk tytul={odpowiedz ? 'Odpowiedz na pismo' : 'Załatw tę sprawę'} style={{ marginTop: 20 }} onPress={() => router.push(trasa as never)} /> : null}
    </Ekran>
  );
}
