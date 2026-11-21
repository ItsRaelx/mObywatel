/* Tryb strony internetowej: aplikacja osadzona w ramce telefonu na stronie pokazowej. */
import { Platform } from 'react-native';

const W = typeof window !== 'undefined' && Platform.OS === 'web';
const param = (k: string) => (W ? new URLSearchParams(window.location.search).get(k) : null);

/* aplikacja działa w ramce telefonu na stronie pokazowej */
export const OSADZONA = W && (param('ramka') === '1' || window.self !== window.top);
/* osoba wybrana w adresie strony, np. ?osoba=bozena */
export const OSOBA_Z_ADRESU = param('osoba');
/* wiadomość do strony pokazowej (np. kolor paska statusu) */
export const doRamki = (m: Record<string, unknown>) => { if (OSADZONA) try { window.parent.postMessage({ mobywatel: 1, ...m }, '*'); } catch { /* brak */ } };
