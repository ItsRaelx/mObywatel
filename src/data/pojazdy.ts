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
  'PO 7LM31': {
    marka: 'Kia', model: 'Ceed SW 1.5 T-GDI', rok: 2022, vin: 'U5YH5813AMN204417', rodzaj: 'samochód osobowy',
    oc: { tu: 'TU Lechia', nr: 'LC 5520 0187 3341', od: '28.10.2025', do: '27.10.2026', wariant: 'OC' },
    badanieDo: '03.05.2027',
    badania: [
      { data: '03.05.2026', stacja: 'SKP Dąbrowskiego, Poznań', licznik: 41250, wynik: 'pozytywny', uwagi: 'Pierwsze badanie okresowe' },
    ],
    dr: { nr: 'DR/BAP 4471906', pierwsza: '03.05.2022', wPolsce: '03.05.2022', organ: 'Prezydent Miasta Poznania' },
    szczegoly: [['Pojemność silnika', '1482 cm³'], ['Moc silnika', '118 kW (160 KM)'], ['Paliwo', 'benzyna'], ['Masa własna', '1360 kg'], ['Dopuszczalna masa całkowita', '1900 kg'], ['Liczba miejsc', '5'], ['Kolor', 'szary']],
    wlasciciele: [['Alicja Wróbel', 'współwłaścicielka'], ['Paweł Wróbel', 'współwłaściciel']],
  },
  'EL 3R905': {
    marka: 'Mazda', model: '6 kombi 2.0 Skyactiv-G', rok: 2019, vin: 'JMZGJ697631008452', rodzaj: 'samochód osobowy',
    oc: { tu: 'TU Kaszuby', nr: 'KS/2026/104 772', od: '12.04.2026', do: '11.04.2027', wariant: 'OC i AC' },
    badanieDo: '19.03.2027',
    badania: [
      { data: '19.03.2026', stacja: 'SKP Rzgowska, Łódź', licznik: 112930, wynik: 'pozytywny' },
      { data: '17.03.2025', stacja: 'SKP Rzgowska, Łódź', licznik: 89410, wynik: 'pozytywny' },
      { data: '22.03.2024', stacja: 'SKP Widzew, Łódź', licznik: 64170, wynik: 'pozytywny' },
      { data: '20.03.2023', stacja: 'SKP Widzew, Łódź', licznik: 38820, wynik: 'negatywny', uwagi: 'Niesprawne światło stop, ponowne badanie 21.03.2023 pozytywne' },
    ],
    dr: { nr: 'DR/BAL 0381552', pierwsza: '14.03.2019', wPolsce: '14.03.2019', organ: 'Prezydent Miasta Łodzi' },
    szczegoly: [['Pojemność silnika', '1998 cm³'], ['Moc silnika', '121 kW (165 KM)'], ['Paliwo', 'benzyna'], ['Masa własna', '1430 kg'], ['Dopuszczalna masa całkowita', '2010 kg'], ['Liczba miejsc', '5'], ['Kolor', 'granatowy']],
    wlasciciele: [['Rafał Sikora', 'właściciel']],
  },
  'EL 9W114': {
    marka: 'Ford', model: 'Transit Custom 2.0 EcoBlue', rok: 2024, vin: 'WF0YXXTTGYPK51208', rodzaj: 'samochód ciężarowy do 3,5 t',
    oc: { tu: 'TU Kaszuby', nr: 'KS/LS/2025/88 140', od: '03.11.2025', do: '02.11.2026', wariant: 'OC, AC, NNW (leasing)', leasing: true },
    badanieDo: '14.09.2027',
    badania: [],
    dr: { nr: 'DR/BAL 2207719', pierwsza: '14.09.2024', wPolsce: '14.09.2024', organ: 'Prezydent Miasta Łodzi' },
    szczegoly: [['Pojemność silnika', '1995 cm³'], ['Moc silnika', '100 kW (136 KM)'], ['Paliwo', 'olej napędowy'], ['Masa własna', '2090 kg'], ['Dopuszczalna masa całkowita', '3200 kg'], ['Dopuszczalna ładowność', '1110 kg'], ['Liczba miejsc', '3'], ['Kolor', 'biały']],
    wlasciciele: [['Leasing Centrum S.A.', 'właściciel (leasingodawca)'], ['Rafał Sikora', 'użytkownik']],
  },
  'ZS 4417C': {
    marka: 'Hyundai', model: 'i20 1.2', rok: 2017, vin: 'NLHBB51CBJZ288103', rodzaj: 'samochód osobowy',
    oc: { tu: 'TU Pomorze', nr: 'PM 77 0412 9930', od: '09.08.2026', do: '08.08.2027', wariant: 'OC' },
    badanieDo: '30.10.2026',
    badania: [
      { data: '28.10.2025', stacja: 'SKP Pogodno, Szczecin', licznik: 59810, wynik: 'pozytywny' },
      { data: '30.10.2024', stacja: 'SKP Pogodno, Szczecin', licznik: 54240, wynik: 'pozytywny' },
      { data: '25.10.2023', stacja: 'SKP Gumieńce, Szczecin', licznik: 48770, wynik: 'pozytywny' },
    ],
    dr: { nr: 'DR/BAS 6610284', pierwsza: '19.10.2017', wPolsce: '19.10.2017', organ: 'Prezydent Miasta Szczecin' },
    szczegoly: [['Pojemność silnika', '1248 cm³'], ['Moc silnika', '62 kW (84 KM)'], ['Paliwo', 'benzyna'], ['Masa własna', '1055 kg'], ['Dopuszczalna masa całkowita', '1580 kg'], ['Liczba miejsc', '5'], ['Kolor', 'biały']],
    wlasciciele: [['Bożena Kaczmarek', 'właścicielka']],
  },
  'OP 2K551': {
    marka: 'Toyota', model: 'Yaris 1.0', rok: 2009, vin: 'VNKKC96360A217734', rodzaj: 'samochód osobowy',
    oc: { tu: 'TU Odra', nr: 'OD/26/553 019', od: '06.03.2026', do: '05.03.2027', wariant: 'OC' },
    badanieDo: '11.02.2027',
    badania: [
      { data: '11.02.2026', stacja: 'SKP Grudzice, Opole', licznik: 191200, wynik: 'pozytywny' },
      { data: '07.02.2025', stacja: 'SKP Grudzice, Opole', licznik: 182640, wynik: 'pozytywny' },
      { data: '09.02.2024', stacja: 'SKP Zaodrze, Opole', licznik: 173880, wynik: 'pozytywny' },
    ],
    dr: { nr: 'DR/BAO 1945530', pierwsza: '22.06.2009', wPolsce: '22.06.2009', organ: 'Prezydent Miasta Opola' },
    szczegoly: [['Pojemność silnika', '998 cm³'], ['Moc silnika', '51 kW (69 KM)'], ['Paliwo', 'benzyna'], ['Masa własna', '890 kg'], ['Dopuszczalna masa całkowita', '1360 kg'], ['Liczba miejsc', '5'], ['Kolor', 'czerwony']],
    wlasciciele: [['Wiktor Szulc', 'właściciel'], ['Marek Szulc', 'poprzedni właściciel (do 03.2026)']],
  },
};

/* mDowód ma własną serię i numer, wydawany jest na 5 lat; dowód plastikowy ma własne dane */
export const MDOWOD: Record<string, { nr: string; wydany: string; wazny: string; organ: string; wydanyFiz: string; ojciec: string; matka: string }> = {
  alicja: { nr: 'ZZF 230784', wydany: '18.02.2025', wazny: '18.02.2030', organ: 'Prezydent Miasta Poznania', wydanyFiz: '09.09.2022', ojciec: 'Leszek', matka: 'Grażyna' },
  rafal: { nr: 'ZZG 615092', wydany: '07.11.2024', wazny: '07.11.2029', organ: 'Prezydent Miasta Łodzi', wydanyFiz: '28.02.2021', ojciec: 'Ryszard', matka: 'Danuta' },
  bozena: { nr: 'ZZH 448170', wydany: '23.06.2025', wazny: '22.11.2026', organ: 'Prezydent Miasta Szczecin', wydanyFiz: '22.11.2016', ojciec: 'Henryk', matka: 'Wanda' },
  wiktor: { nr: 'ZZJ 097356', wydany: '30.07.2023', wazny: '30.07.2028', organ: 'Prezydent Miasta Opola', wydanyFiz: '30.07.2023', ojciec: 'Marek', matka: 'Iwona' },
};
