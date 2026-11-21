import { router } from 'expo-router';
import { View } from 'react-native';

import { pl3 } from '@/data/typy';
import { useApp } from '@/state/app';
import { Ekran, Ikona, Karta, Notka, Pill, Portret, Przycisk, T } from '@/ui/elementy';

export default function Rodzina() {
  const { os, k } = useApp();
  return (
    <Ekran>
      <T v="body" c={k.ink2} style={{ marginBottom: 16 }}>Dokumenty i sprawy dzieci oraz osób pod Twoją opieką w jednym miejscu.</T>
      {os.rodzina.length ? (
        <View style={{ gap: 12 }}>
          {os.rodzina.map(m => {
            const uwaga = m.docs.filter(d => d[2] === 'warn' || d[2] === 'prog');
            return (
              <Karta key={m.id} onPress={() => router.push(`/rodzina/${m.id}`)} style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                  <Portret id={m.id} w={64} h={80} r={14} />
                  <View style={{ flex: 1 }}>
                    <T v="h2">{m.imie}</T>
                    <T v="sub">{m.rel} · {m.wiek} {pl3(m.wiek, 'rok', 'lata', 'lat')}</T>
                    <T v="small" style={{ marginTop: 4 }} n={2}>{m.info}</T>
                  </View>
                  <Ikona n="chev" size={18} color={k.ink3} />
                </View>
                {m.docs.length ? (
                  <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: k.hair, gap: 8 }}>
                    {m.docs.map(d => (
                      <View key={d[0]} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ikona n={d[2] === 'prog' ? 'route' : 'doc'} size={18} color={k.ink2} />
                        <View style={{ flex: 1 }}><T v="sub" c={k.ink} style={{ fontWeight: '600' }}>{d[0]}</T><T v="small">{d[1]}</T></View>
                        {d[2] ? <Pill t={d[2] === 'ok' ? 'ważny' : d[2] === 'prog' ? 'w toku' : 'uwaga'} ton={d[2] === 'ok' ? 'g' : d[2] === 'warn' ? 'r' : 'n'} /> : null}
                      </View>
                    ))}
                  </View>
                ) : null}
                {uwaga.length ? null : null}
              </Karta>
            );
          })}
        </View>
      ) : (
        <Karta style={{ padding: 24, alignItems: 'center' }}>
          <Ikona n="family" size={44} color={k.ink2} sw={1.4} />
          <T v="h3" center style={{ marginTop: 12 }}>Nie masz jeszcze nikogo pod opieką</T>
          <T v="sub" center style={{ marginTop: 6 }}>Dzieci zobaczysz tu automatycznie. Rodzice i inni dorośli mogą dać Ci upoważnienie w swoim mObywatelu.</T>
        </Karta>
      )}
      <Przycisk tytul="Dodaj osobę" ik="plus" rodzaj="drugi" style={{ marginTop: 16 }} onPress={() => router.push('/usluga/dodaj-osobe')} />
      <Notka ik="lock">Dzieci do 18 lat widzisz automatycznie na podstawie rejestru PESEL. Dorosłych dodasz tylko wtedy, gdy sami dadzą Ci upoważnienie i w każdej chwili mogą je cofnąć.</Notka>
    </Ekran>
  );
}
