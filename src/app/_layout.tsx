import { DarkTheme, DefaultTheme, router, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AppProvider, useApp } from '@/state/app';
import { Blokada, Wprowadzenie } from '@/ui/brama';
import { ToastHost } from '@/ui/elementy';
import { SplashAnimowany } from '@/ui/splash';

SplashScreen.preventAutoHideAsync();
/* w trybie deweloperskim w przeglądarce: dostęp do nawigacji dla testów automatycznych */
if (__DEV__ && typeof window !== 'undefined') (window as unknown as { __router: typeof router }).__router = router;

function Wnetrze() {
  const { gotowe, wprowadzenie, odblokowana, k } = useApp();
  useEffect(() => { if (gotowe) SplashScreen.hideAsync(); }, [gotowe]);
  if (!gotowe) return null;
  const nav = k.dark ? DarkTheme : DefaultTheme;
  const brama = !wprowadzenie ? <Wprowadzenie /> : !odblokowana ? <Blokada /> : null;
  return (
    <ThemeProvider value={{ ...nav, colors: { ...nav.colors, background: k.bg, card: k.bg, text: k.ink, primary: k.accInk, border: k.hair } }}>
      <StatusBar style={brama ? 'light' : k.dark ? 'light' : 'dark'} />
      <Stack screenOptions={{
        headerTintColor: k.accInk, headerStyle: { backgroundColor: k.bg }, headerShadowVisible: false,
        headerTitleStyle: { color: k.ink, fontWeight: '700' }, headerBackTitle: 'Wróć', contentStyle: { backgroundColor: k.bg }, animation: 'ios_from_right',
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Start' }} />
        <Stack.Screen name="kod-qr" options={{ presentation: 'formSheet', sheetAllowedDetents: 'fitToContents', sheetGrabberVisible: true, headerShown: false, contentStyle: { backgroundColor: k.bg } }} />
        <Stack.Screen name="pokaz-kod" options={{ presentation: 'modal', title: 'Pokaż kod', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="skanuj" options={{ presentation: 'fullScreenModal', headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="potwierdz" options={{ presentation: 'modal', title: 'Przekazanie danych', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="sprawdz" options={{ presentation: 'modal', title: 'Sprawdź dokument', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="szukaj" options={{ presentation: 'modal', headerShown: false, animation: 'fade_from_bottom' }} />
        <Stack.Screen name="dokument/[id]" options={{ title: '' }} />
        <Stack.Screen name="usluga/[id]" options={{ title: '' }} />
        <Stack.Screen name="sprawa/[id]" options={{ title: 'Sprawa w toku' }} />
        <Stack.Screen name="skrzynka/index" options={{ title: 'Skrzynka' }} />
        <Stack.Screen name="skrzynka/[id]" options={{ title: 'Pismo' }} />
        <Stack.Screen name="rodzina/index" options={{ title: 'Rodzina' }} />
        <Stack.Screen name="rodzina/[id]" options={{ title: '' }} />
        <Stack.Screen name="terminy" options={{ title: 'Terminy i sprawy' }} />
        <Stack.Screen name="prywatnosc" options={{ title: 'Centrum prywatności' }} />
        <Stack.Screen name="platnosci" options={{ title: 'Płatności' }} />
        <Stack.Screen name="moje-dane" options={{ title: 'Moje dane' }} />
        <Stack.Screen name="alerty" options={{ title: 'Alerty RCB' }} />
        <Stack.Screen name="ustawienia" options={{ title: 'Ustawienia' }} />
        <Stack.Screen name="dodaj-dokument" options={{ title: 'Dodaj dokument' }} />
      </Stack>
      <ToastHost />
      {brama ? <Animated.View key={wprowadzenie ? 'blokada' : 'wprowadzenie'} entering={FadeIn.duration(250)} exiting={FadeOut.duration(380)} style={StyleSheet.absoluteFill}>{brama}</Animated.View> : null}
      <SplashAnimowany />
    </ThemeProvider>
  );
}

export default function Root() {
  return <AppProvider><Wnetrze /></AppProvider>;
}
