/* Kolory: jeden akcent (czerwień), neutralne tła i ikony; zieleń i bursztyn tylko dla statusów. */
export type Kolory = { bg: string; surface: string; surface2: string; ink: string; ink2: string; ink3: string; hair: string; acc: string; accInk: string; accBg: string; ok: string; okBg: string; warn: string; warnBg: string; hero: readonly [string, string, string]; tab: string; scrim: string; dark: boolean };
export const PALETA: { light: Kolory; dark: Kolory } = {
  light: {
    bg: '#F5F3F1', surface: '#FFFFFF', surface2: '#F0ECE9', ink: '#17181C', ink2: '#5F6270', ink3: '#9A9CA6', hair: '#E7E2DE',
    acc: '#D8143A', accInk: '#B00F30', accBg: '#FBE8EC', ok: '#14784F', okBg: '#E1F3EA', warn: '#9A5B00', warnBg: '#FDF0DA',
    hero: ['#E8193F', '#D8143A', '#AE0E2F'], tab: 'rgba(255,255,255,0.96)', scrim: 'rgba(20,8,12,0.45)', dark: false,
  },
  dark: {
    bg: '#0E0F12', surface: '#18191D', surface2: '#232429', ink: '#F2F2F4', ink2: '#A7AAB4', ink3: '#70737E', hair: '#2A2C32',
    acc: '#F2304F', accInk: '#FF6E86', accBg: 'rgba(242,48,79,0.16)', ok: '#4CD39A', okBg: 'rgba(76,211,154,0.14)', warn: '#F5B451', warnBg: 'rgba(245,180,81,0.15)',
    hero: ['#86102A', '#5E0B1E', '#3A0713'], tab: 'rgba(22,23,27,0.96)', scrim: 'rgba(0,0,0,0.6)', dark: true,
  },
};

export const R = { s: 12, m: 18, l: 22, xl: 28 };
export const CIEN = {
  shadowColor: '#3A0A14', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2,
};
