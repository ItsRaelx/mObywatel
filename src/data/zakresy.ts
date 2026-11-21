import type { Osoba } from './typy';

/* Zakresy danych, które można pokazać kodem QR (udostępnianie minimalne). */
export type Zakres = { id: string; t: string; pola: (o: Osoba) => [string, string][] };
export const ZAKRESY: Zakres[] = [
  { id: 'pelnoletnosc', t: 'Tylko wiek', pola: () => [['Zdjęcie', ''], ['Pełnoletność', 'ma ukończone 18 lat']] },
  { id: 'tozsamosc', t: 'Tożsamość', pola: o => [['Zdjęcie', ''], ['Imię i nazwisko', o.moje.imie_nazwisko], ['Data urodzenia', o.moje.data_urodzenia], ['Numer dowodu', o.moje.nr_dowodu]] },
  { id: 'prawo_jazdy', t: 'Prawo jazdy', pola: o => [['Zdjęcie', ''], ['Imię i nazwisko', o.moje.imie_nazwisko], ['Prawo jazdy', o.moje.prawo_jazdy]] },
  { id: 'ulga', t: 'Ulga', pola: o => [['Zdjęcie', ''], ['Prawo do ulgi', o.docs.some(d => d.id === 'leg') ? 'student, ulga PKP 51%' : 'Karta Dużej Rodziny']] },
];
