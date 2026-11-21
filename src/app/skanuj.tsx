import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ikona, Przycisk } from '@/ui/elementy';

export default function Skanuj() {
  const ins = useSafeAreaInsets(); const [perm, prosba] = useCameraPermissions();
  const [kod, setKod] = useState(''); const [msg, setMsg] = useState<string | null>(null); const zajety = useRef(false);
  const dalej = (k: string) => { if (zajety.current) return; zajety.current = true; Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); router.replace({ pathname: '/potwierdz', params: { kod: k } }); };
  const skan = ({ data }: { data: string }) => {
    if (zajety.current) return;
    const m = data.match(/^MOBYWATEL:[A-Z]:(\d{5})/);
    if (m) dalej(m[1]); else setMsg('To nie jest kod mObywatela. Zeskanuj kod pokazany przez sklep, urząd albo stronę.');
  };
  const ok = perm?.granted;
  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: '#0B0C0F' }}>
      <View style={{ flex: 1 }}>
        {ok ? <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={skan} /> : null}
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]} pointerEvents="none">
          <View style={{ width: 250, height: 250 }}>
            {[0, 1, 2, 3].map(i => <View key={i} style={[st.rog, i === 0 && { left: 0, top: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 26 }, i === 1 && { right: 0, top: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 26 }, i === 2 && { left: 0, bottom: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 26 }, i === 3 && { right: 0, bottom: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 26 }]} />)}
          </View>
        </View>
        <View style={{ position: 'absolute', top: ins.top + 10, left: 16, right: 16, flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} accessibilityLabel="Zamknij" style={st.btn}><Ikona n="x" size={22} color="#fff" /></Pressable>
          <Text style={{ flex: 1, textAlign: 'center', color: '#fff', fontSize: 17, fontWeight: '700', marginRight: 42 }}>Zeskanuj kod QR</Text>
        </View>
        {!ok ? (
          <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
            <Ikona n="camera" size={44} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 14, textAlign: 'center' }}>Potrzebujemy dostępu do aparatu</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, marginTop: 6, textAlign: 'center' }}>Aparat służy tylko do odczytu kodów QR.</Text>
            <Przycisk tytul="Zezwól na aparat" style={{ marginTop: 18, alignSelf: 'stretch' }} onPress={prosba} />
          </View>
        ) : msg ? <View style={{ position: 'absolute', bottom: 20, left: 24, right: 24, padding: 12, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.6)' }}><Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>{msg}</Text></View> : null}
      </View>
      <View style={{ padding: 20, paddingBottom: ins.bottom + 16, gap: 12 }}>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 21, textAlign: 'center' }}>Nakieruj aparat na kod QR. Zobaczysz, kto prosi o dane i jakie. Nic nie wyślemy bez Twojej zgody.</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput value={kod} onChangeText={t => setKod(t.replace(/\D/g, '').slice(0, 5))} keyboardType="number-pad" placeholder="albo wpisz kod spod QR" placeholderTextColor="rgba(255,255,255,0.5)"
            style={{ flex: 1, height: 52, borderRadius: 15, paddingHorizontal: 14, color: '#fff', fontSize: 17, backgroundColor: 'rgba(255,255,255,0.1)', letterSpacing: 2 }} />
          <Przycisk tytul="Dalej" style={{ height: 52 }} onPress={() => (kod.length === 5 ? dalej(kod) : setMsg('Kod ma 5 cyfr.'))} />
        </View>
        <Pressable onPress={() => dalej(String(10000 + Math.floor(Math.random() * 89999)))} style={{ alignItems: 'center', padding: 6 }}>
          <Text style={{ color: '#fff', fontWeight: '600', opacity: 0.9 }}>Pokaz: użyj przykładowego kodu</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
const st = StyleSheet.create({
  rog: { position: 'absolute', width: 54, height: 54, borderColor: '#fff', borderWidth: 4 },
  btn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
});
