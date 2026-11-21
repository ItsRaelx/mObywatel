import surowe from './osoby.json';

export type Wiersz = [string, string];
export type Dokument = {
  id: 'dowod' | 'pj' | 'auto' | 'kdr' | 'leg' | string; name: string; sub: string; alert?: string; photo?: number; holder: string;
  f: Wiersz[]; rows: Wiersz[]; plate?: string; model?: string; kolor?: string; who?: string;
  more?: { plate: string; model: string; kolor: string }[];
};
export type Zadanie = { i: string; h: string; d: string; k: string; u?: number; s?: string; q?: string };
export type Krok = [string, string, 0 | 1 | 2];
export type Sprawa = { id: string; t: string; s: string; k: string; eta: string; steps: Krok[]; note: string };
export type Termin = [string, string, string, string, string | null];
export type Czlonek = { id: string; imie: string; rel: string; wiek: number; info: string; docs: [string, string, string][]; akcje: [string, string][] };
export type Wpis = { id: string; kiedy: string; kto: string; typ: 'alert' | 'urzad' | 'firma' | 'ty'; co: string; dane: string[]; jak: string; zablok?: number; zgl?: number; potw?: number };
export type Pismo = { id: string; od: string; t: string; kiedy: string; nowe?: number; pilne?: string; k: string; skrot: string[]; q: string };
export type Platnosc = { m: string; title: string; source: string; rows: Wiersz[]; kwota: string };
export type Osoba = {
  id: string; plec: 'K' | 'M'; imie: string; nazwisko: string; wolacz: string; opis: string;
  docs: Dokument[]; tiles: Zadanie[]; ask: Record<string, string>;
  moje: Record<string, string>;
  dane: { urodz: string; obyw: string; stan: string; rodzice: string; zamel: string; zamelOd: string; tel: string; mail: string; pasz: string };
  platnosci: [string, string, string, string][];
  sc: {
    urzad: string; miasto: string; miejsce: string; partner: string; szpital: string; nazw: [string, string]; meldunek?: string;
    letter: { info: { title: string; source: string; body: string }; say?: string; draft?: string; to?: string; att?: string; after?: string };
    oc: { title: string; rows: Wiersz[]; note: string; remind: string };
    pay: Platnosc[];
    punkty: { rows: Wiersz[]; n: number; note: string };
  };
  status: string; toku: Sprawa[]; os: Termin[]; rodzina: Czlonek[];
  priv: { pesel: boolean; log: Wpis[]; zgody: [string, string, string][] };
  skrzynka: Pismo[]; rcb: [string, string, string, number][];
};

export const OSOBY = surowe as unknown as Record<string, Osoba>;
export const OSOBY_IDS = ['marta', 'jan', 'ewa', 'kacper'] as const;

/* dzień pokazu: wszystkie terminy w danych liczone są od 18.10.2026 */
export const DZIS = new Date(2026, 9, 18);
export const DZIS_TXT = 'Niedziela, 18 października';
export const dataZ = (s: string) => { const [d, m, y] = s.split('.').map(Number); return new Date(y, m - 1, d); };
export const dniDo = (s: string) => Math.round((dataZ(s).getTime() - DZIS.getTime()) / 864e5);
export const pl3 = (n: number, a: string, b: string, c: string) => n === 1 ? a : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? b : c;
export function kiedy(n: number) {
  if (n < 0) return n === -1 ? 'wczoraj' : `${-n} dni temu`;
  if (n === 0) return 'dziś'; if (n === 1) return 'jutro';
  if (n > 540) { const y = Math.round(n / 365); return `za ${y} ${pl3(y, 'rok', 'lata', 'lat')}`; }
  if (n > 60) return `za ${Math.round(n / 30)} mies.`;
  return `za ${n} dni`;
}
export function dniZadania(z: Zadanie) { const m = (z.d || '').match(/(\d{2})\.(\d{2})(?:\.(\d{4}))?/); return m ? dniDo(`${m[1]}.${m[2]}.${m[3] || 2026}`) : null; }
export const MIESIACE = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
export const DNI = ['niedz.', 'pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.'];
