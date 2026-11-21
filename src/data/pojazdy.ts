/* Szczegóły pojazdów i dowodów osobistych (fikcyjne dane pokazowe).
   Układ jak w mObywatelu: Moje pojazdy (badanie, ubezpieczenie, dowód rejestracyjny, szczegóły pojazdu)
   oraz mDowód z osobną sekcją „Dane dowodu osobistego”. */
import type { Wiersz } from './typy';

export type Badanie = { data: string; stacja: string; licznik: number; wynik: 'pozytywny' | 'negatywny'; uwagi?: string };
export type Pojazd = {
  marka: string; model: string; rok: number; vin: string; rodzaj: string;
  oc: { tu: string; nr: string; od: string; do: string; wariant: string; leasing?: boolean };
  badanieDo: string; badania: Badanie[];
  dr: { nr: string; pierwsza: string; wPolsce: string; organ: string };
  szczegoly: Wiersz[];
  wlasciciele: [string, string][];
};

export const POJAZDY: Record<string, Pojazd> = {
  'WX 4521K': {
    marka: 'Toyota', model: 'Corolla 1.8 Hybrid', rok: 2021, vin: 'SB1Z93BE30E148220', rodzaj: 'samochód osobowy',
    oc: { tu: 'TU Orzeł', nr: 'OR/908 123 456 789', od: '30.10.2025', do: '29.10.2026', wariant: 'OC' },
    badanieDo: '12.04.2027',
    badania: [
      { data: '12.04.2026', stacja: 'SKP Okęcie, Warszawa', licznik: 58210, wynik: 'pozytywny' },
      { data: '10.04.2025', stacja: 'SKP Okęcie, Warszawa', licznik: 41960, wynik: 'pozytywny' },
      { data: '14.04.2024', stacja: 'SKP Mokotów, Warszawa', licznik: 24310, wynik: 'pozytywny', uwagi: 'Pierwsze badanie okresowe' },
    ],
    dr: { nr: 'DR/BAT 2841937', pierwsza: '14.04.2021', wPolsce: '14.04.2021', organ: 'Prezydent m.st. Warszawy' },
    szczegoly: [['Pojemność silnika', '1798 cm³'], ['Moc silnika', '90 kW (122 KM)'], ['Paliwo', 'benzyna, hybryda'], ['Masa własna', '1385 kg'], ['Dopuszczalna masa całkowita', '1855 kg'], ['Liczba miejsc', '5'], ['Kolor', 'srebrny']],
    wlasciciele: [['Marta Kowalska', 'właścicielka'], ['Tomasz Kowalski', 'współwłaściciel']],
  },
  'KR 7G210': {
    marka: 'Skoda', model: 'Octavia Combi 2.0 TDI', rok: 2020, vin: 'TMBJR7NX4LY062118', rodzaj: 'samochód osobowy',
    oc: { tu: 'TU Bałtyk', nr: 'BA/2026/552 018 334', od: '03.03.2026', do: '02.03.2027', wariant: 'OC i AC' },
    badanieDo: '15.01.2027',
    badania: [
      { data: '15.01.2026', stacja: 'SKP Czyżyny, Kraków', licznik: 143820, wynik: 'pozytywny' },
      { data: '12.01.2025', stacja: 'SKP Czyżyny, Kraków', licznik: 112400, wynik: 'pozytywny' },
      { data: '09.01.2024', stacja: 'SKP Podgórze, Kraków', licznik: 81730, wynik: 'negatywny', uwagi: 'Luz w zawieszeniu, ponowne badanie 16.01.2024 pozytywne' },
      { data: '05.01.2023', stacja: 'SKP Podgórze, Kraków', licznik: 52110, wynik: 'pozytywny', uwagi: 'Pierwsze badanie okresowe' },
    ],
    dr: { nr: 'DR/BAU 1170452', pierwsza: '07.01.2020', wPolsce: '07.01.2020', organ: 'Prezydent Miasta Krakowa' },
    szczegoly: [['Pojemność silnika', '1968 cm³'], ['Moc silnika', '110 kW (150 KM)'], ['Paliwo', 'olej napędowy'], ['Masa własna', '1460 kg'], ['Dopuszczalna masa całkowita', '2040 kg'], ['Liczba miejsc', '5'], ['Kolor', 'granatowy']],
    wlasciciele: [['Jan Wiśniewski', 'właściciel']],
  },
  'KR 2M884': {
    marka: 'Volkswagen', model: 'Transporter T6.1 2.0 TDI', rok: 2023, vin: 'WV1ZZZ7HZPH031776', rodzaj: 'samochód ciężarowy do 3,5 t',
    oc: { tu: 'TU Tatry', nr: 'TT/LS/3381 0042', od: '04.11.2025', do: '03.11.2026', wariant: 'OC, AC, NNW (leasing)', leasing: true },
    badanieDo: '21.06.2027',
    badania: [{ data: '21.06.2026', stacja: 'SKP Nowa Huta, Kraków', licznik: 61200, wynik: 'pozytywny', uwagi: 'Pierwsze badanie okresowe' }],
    dr: { nr: 'DR/BAW 0094412', pierwsza: '21.06.2023', wPolsce: '21.06.2023', organ: 'Prezydent Miasta Krakowa' },
    szczegoly: [['Pojemność silnika', '1968 cm³'], ['Moc silnika', '110 kW (150 KM)'], ['Paliwo', 'olej napędowy'], ['Masa własna', '2015 kg'], ['Dopuszczalna masa całkowita', '3200 kg'], ['Dopuszczalna ładowność', '1185 kg'], ['Liczba miejsc', '3'], ['Kolor', 'biały']],
    wlasciciele: [['AutoLeasing Polska', 'właściciel (leasingodawca)'], ['Jan Wiśniewski', 'użytkownik']],
  },
  'LU 5521P': {
    marka: 'Fiat', model: 'Panda 1.2', rok: 2016, vin: 'ZFA31200003C41857', rodzaj: 'samochód osobowy',
    oc: { tu: 'TU Mazury', nr: 'MZ/OC/77 120 451', od: '15.06.2026', do: '14.06.2027', wariant: 'OC' },
    badanieDo: '08.11.2026',
    badania: [
      { data: '08.11.2025', stacja: 'SKP Mełgiewska, Lublin', licznik: 88140, wynik: 'pozytywny' },
      { data: '06.11.2024', stacja: 'SKP Mełgiewska, Lublin', licznik: 81290, wynik: 'pozytywny' },
      { data: '03.11.2023', stacja: 'SKP Kunickiego, Lublin', licznik: 74850, wynik: 'pozytywny' },
      { data: '29.10.2022', stacja: 'SKP Kunickiego, Lublin', licznik: 67920, wynik: 'pozytywny' },
    ],
    dr: { nr: 'DR/BAR 5521730', pierwsza: '02.03.2016', wPolsce: '02.03.2016', organ: 'Prezydent Miasta Lublin' },
    szczegoly: [['Pojemność silnika', '1242 cm³'], ['Moc silnika', '51 kW (69 KM)'], ['Paliwo', 'benzyna'], ['Masa własna', '940 kg'], ['Dopuszczalna masa całkowita', '1420 kg'], ['Liczba miejsc', '4'], ['Kolor', 'czerwony']],
    wlasciciele: [['Ewa Nowak', 'właścicielka']],
  },
  'GD 8K113': {
    marka: 'Volkswagen', model: 'Golf IV 1.4', rok: 2003, vin: 'WVWZZZ1JZ3W611042', rodzaj: 'samochód osobowy',
    oc: { tu: 'TU Wisła', nr: 'WI/2026/018 445 902', od: '02.02.2026', do: '01.02.2027', wariant: 'OC' },
    badanieDo: '20.01.2027',
    badania: [
      { data: '20.01.2026', stacja: 'SKP Przymorze, Gdańsk', licznik: 251300, wynik: 'pozytywny' },
      { data: '18.01.2025', stacja: 'SKP Elbląg Północ', licznik: 238720, wynik: 'pozytywny' },
      { data: '15.01.2024', stacja: 'SKP Elbląg Północ', licznik: 226150, wynik: 'negatywny', uwagi: 'Zużyte klocki hamulcowe, ponowne badanie 22.01.2024 pozytywne' },
    ],
    dr: { nr: 'DR/BAK 3302118', pierwsza: '11.05.2003', wPolsce: '19.08.2011', organ: 'Prezydent Miasta Gdańska' },
    szczegoly: [['Pojemność silnika', '1390 cm³'], ['Moc silnika', '55 kW (75 KM)'], ['Paliwo', 'benzyna'], ['Masa własna', '1120 kg'], ['Dopuszczalna masa całkowita', '1640 kg'], ['Liczba miejsc', '5'], ['Kolor', 'czarny']],
    wlasciciele: [['Kacper Zieliński', 'właściciel']],
  },
};

/* mDowód ma własną serię i numer, wydawany jest na 5 lat; dowód plastikowy ma własne dane */
export const MDOWOD: Record<string, { nr: string; wydany: string; wazny: string; organ: string; wydanyFiz: string; ojciec: string; matka: string }> = {
  marta: { nr: 'ZZC 108201', wydany: '12.03.2025', wazny: '12.03.2030', organ: 'Prezydent m.st. Warszawy', wydanyFiz: '20.05.2021', ojciec: 'Krzysztof', matka: 'Anna' },
  jan: { nr: 'ZZB 774512', wydany: '03.09.2024', wazny: '03.09.2029', organ: 'Prezydent Miasta Krakowa', wydanyFiz: '20.05.2020', ojciec: 'Stanisław', matka: 'Barbara' },
  ewa: { nr: 'ZZD 551027', wydany: '15.01.2026', wazny: '05.12.2026', organ: 'Prezydent Miasta Lublin', wydanyFiz: '05.12.2016', ojciec: 'Józef', matka: 'Halina' },
  kacper: { nr: 'ZZE 902366', wydany: '02.04.2024', wazny: '02.04.2029', organ: 'Prezydent Miasta Elbląg', wydanyFiz: '02.04.2024', ojciec: 'Tomasz', matka: 'Beata' },
};
