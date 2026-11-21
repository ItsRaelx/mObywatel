/* Animowany ekran startowy: przejmuje statyczny splash (to samo tło i godło), godło „oddycha”,
   pojawia się napis, potem całość rozjaśnia się i odsłania aplikację. */
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { Godlo } from '@/ui/elementy';

export function SplashAnimowany() {
  const [jest, setJest] = useState(true);
  const napis = useSharedValue(0), wyjscie = useSharedValue(0);
  useEffect(() => {
    napis.set(withDelay(380, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) })));
    wyjscie.set(withDelay(1250, withTiming(1, { duration: 480, easing: Easing.in(Easing.cubic) })));
    const t = setTimeout(() => setJest(false), 1780);
    return () => clearTimeout(t);
  }, [napis, wyjscie]);
  const sCala = useAnimatedStyle(() => ({ opacity: 1 - wyjscie.value, transform: [] }));
  const sGodlo = useAnimatedStyle(() => ({ transform: [{ translateY: -napis.value * 18 }] }));
  const sNapis = useAnimatedStyle(() => ({ opacity: napis.value, transform: [{ translateY: (1 - napis.value) * 14 }] }));
  if (!jest) return null;
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#DC143C', alignItems: 'center', justifyContent: 'center', zIndex: 100 }, sCala]}>
      <Animated.View style={sGodlo}><Godlo size={120} /></Animated.View>
      <Animated.View style={[{ position: 'absolute', top: '58%' }, sNapis]}>
        <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: -0.5 }}>mObywatel</Text>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: 4, letterSpacing: 1 }}>PROTOTYP</Text>
      </Animated.View>
    </Animated.View>
  );
}
