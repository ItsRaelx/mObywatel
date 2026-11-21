import type { Osoba, Pismo, Wiersz } from './typy';

/* Katalog usług. Każda usługa to: ekran aplikacji (ekran), informacja (info) albo prosty przepływ
   pola → podsumowanie → potwierdzenie Face ID → wynik. Treści dopasowane do osoby w pokazie. */

export type Pole = { k: string; l: string; opcje?: string[]; v?: string; ph?: string; wym?: boolean; podp?: string; num?: boolean };
export type Wynik = { tytul: string; opis?: string; wiersze: Wiersz[]; ikona?: string; dalej?: { t: string; trasa: string }[] };
export type Api = { zalatw: (k: string) => void; pesel: (v: boolean) => void; pismo: (p: Omit<Pismo, 'id' | 'kiedy'>) => void; zaplac: (tytul: string, kwota: string) => void };
export type Info = { tekst?: string; wiersze?: Wiersz[]; uwaga?: string; flaga?: string; dalej?: { t: string; trasa: string; ik?: string }[] };
export type Usluga = {
  id: string; t: string; opis: string; kat: string; ik: string; slowa?: string;
  ekran?: string; info?: (o: Osoba, st: Stan) => Info; pola?: (o: Osoba, st: Stan) => Pole[];
  wstep?: (o: Osoba, st: Stan) => Info;
  podsumowanie?: (v: Record<string, string>, o: Osoba) => Wiersz[]; przycisk?: string; bezFaceId?: boolean;
  wynik?: (v: Record<string, string>, o: Osoba, api: Api) => Wynik; dostepna?: (o: Osoba, st: Stan) => boolean;
};
export type Stan = { pesel: boolean; zaplacone: string[] };

export const KATEGORIE = [
  { id: 'dokumenty', t: 'Dokumenty i dane', ik: 'id' },
  { id: 'mieszkanie', t: 'Zameldowanie i akty', ik: 'house' },
  { id: 'pojazdy', t: 'Pojazdy i kierowcy', ik: 'car' },
  { id: 'oplaty', t: 'Pisma i opłaty', ik: 'receipt' },
  { id: 'rodzina', t: 'Rodzina', ik: 'family' },
  { id: 'zdrowie', t: 'Zdrowie i emerytura', ik: 'heart' },
  { id: 'bezp', t: 'Bezpieczeństwo', ik: 'shield' },
  { id: 'inne', t: 'Wybory i podróże', ik: 'vote' },
];

const K = (o: Osoba, k: string, m: string) => (o.plec === 'K' ? k : m);
const peselM = (o: Osoba) => o.moje.pesel.slice(0, 6) + '•••' + o.moje.pesel.slice(9);
const dzis = '18.10.2026';
const za = (n: number) => { const d = new Date(2026, 9, 18 + n); return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }); };

export const USLUGI: Usluga[] = [
  /* ---------- dokumenty i dane ---------- */
  { id: 'moje-dane', t: 'Moje dane', opis: 'Dane z rejestru PESEL, adres, kontakt', kat: 'dokumenty', ik: 'user', ekran: '/moje-dane', slowa: 'pesel adres dane osobowe rejestr' },
  {
    id: 'zastrzez-pesel', t: 'Zastrzeż PESEL', opis: 'Nikt nie weźmie kredytu na Twoje dane', kat: 'dokumenty', ik: 'shield', slowa: 'zastrzezenie kredyt pozyczka oszustwo',
    wstep: (o, st) => st.pesel
      ? { tekst: 'Twój PESEL jest już zastrzeżony. Banki i firmy pożyczkowe dostaną odmowę, jeśli ktoś spróbuje wziąć kredyt na Twoje dane.', dalej: [{ t: 'Cofnij zastrzeżenie na chwilę', trasa: '/usluga/cofnij-zastrzezenie', ik: 'clock' }] }
      : { tekst: 'Po zastrzeżeniu bank czy firma pożyczkowa muszą sprawdzić rejestr przed udzieleniem kredytu. Do lekarza, apteki czy urzędu pójdziesz jak dotąd.' },
    dostepna: () => true,
    podsumowanie: (_, o) => [['PESEL', peselM(o)], ['Od', 'teraz'], ['Do', 'do odwołania'], ['Opłata', 'bezpłatnie']], przycisk: 'Zastrzeż PESEL',
    wynik: (_, __, api) => { api.pesel(true); return { tytul: 'PESEL zastrzeżony', opis: 'Kto i kiedy sprawdzał Twój PESEL, zobaczysz w Centrum prywatności.', wiersze: [['Status', 'zastrzeżony'], ['Cofnięcie', 'w każdej chwili, w kilka sekund']], dalej: [{ t: 'Centrum prywatności', trasa: '/prywatnosc' }] }; },
  },
  {
    id: 'cofnij-zastrzezenie', t: 'Cofnij zastrzeżenie PESEL', opis: 'Na czas wniosku o kredyt', kat: 'dokumenty', ik: 'clock', slowa: 'odblokuj pesel kredyt',
    wstep: () => ({ tekst: 'Bierzesz kredyt? Cofnij zastrzeżenie na kilka dni. Potem włączy się samo.' }),
    pola: () => [{ k: 'na', l: 'Na jak długo?', opcje: ['1 dzień', '7 dni', '30 dni', 'Na stałe'] }],
    podsumowanie: (v, o) => [['PESEL', peselM(o)], ['Cofnięcie', v.na], ['Zastrzeżenie wróci', v.na === 'Na stałe' ? 'nie wróci samo' : za(v.na === '1 dzień' ? 1 : v.na === '7 dni' ? 7 : 30)]], przycisk: 'Cofnij zastrzeżenie',
    wynik: (v, _, api) => { api.pesel(false); return { tytul: 'Zastrzeżenie cofnięte', opis: v.na === 'Na stałe' ? 'Możesz je włączyć ponownie w każdej chwili.' : `Zastrzeżenie wróci samo za ${v.na}.`, wiersze: [['Status', 'niezastrzeżony']] }; },
  },
  {
    id: 'zgubiony-dowod', t: 'Zgubiony lub skradziony dowód', opis: 'Zastrzeż dokumenty i karty', kat: 'dokumenty', ik: 'alert', slowa: 'portfel zgubilem zgubilam ukradli kradziez zastrzez dowod',
    wstep: () => ({ tekst: 'Najpierw zadbajmy, żeby nikt nie użył Twoich dokumentów. Zablokujemy dowód na 14 dni i zastrzeżemy go w bankach. Jeśli się znajdzie, odblokujesz go tutaj.' }),
    pola: () => [{ k: 'co', l: 'Co było w portfelu?', opcje: ['Tylko dowód', 'Dowód i prawo jazdy', 'Dowód i karty płatnicze', 'Cały portfel'] }],
    podsumowanie: (v, o) => [['Dowód osobisty', o.moje.nr_dowodu], ['Zastrzeżenie', 'w bankach (system Dokumenty Zastrzeżone)'], ['Blokada', 'do ' + za(14)], ['Zgubione', v.co]], przycisk: 'Zastrzeż i zablokuj',
    wynik: v => ({
      tytul: 'Dowód zastrzeżony', opis: 'Banki i operatorzy już widzą zastrzeżenie. Jeśli dowód się znajdzie, cofniesz blokadę w aplikacji.',
      wiersze: [['Blokada', 'do ' + za(14)], ...(/karty|portfel/i.test(v.co) ? [['Karty płatnicze', 'zadzwoń: +48 828 828 828 (Zastrzegam.pl)'] as Wiersz] : []), ...(/prawo|portfel/i.test(v.co) ? [['Prawo jazdy', 'w telefonie działa dalej; wtórnik w wydziale komunikacji'] as Wiersz] : [])],
      dalej: [{ t: 'Złóż wniosek o nowy dowód', trasa: '/usluga/wniosek-dowod' }],
    }),
  },
  {
    id: 'wniosek-dowod', t: 'Wniosek o dowód osobisty', opis: 'Wniosek tutaj, odciski palców w urzędzie', kat: 'dokumenty', ik: 'id', slowa: 'nowy dowod traci waznosc wymiana dowodu',
    wstep: o => ({ tekst: `Twój obecny dowód: ${o.moje.dowod}. Wniosek wyślesz stąd, a w ciągu 30 dni pójdziesz do urzędu na odciski palców.` }),
    pola: () => [{ k: 'pow', l: 'Powód', opcje: ['Kończy się ważność', 'Utrata dowodu', 'Zmiana danych'] }],
    podsumowanie: (v, o) => [[K(o, 'Wnioskodawczyni', 'Wnioskodawca'), o.moje.imie_nazwisko], ['Powód', v.pow], ['Zdjęcie', 'z aparatu'], ['Urząd', o.sc.urzad], ['Wizyta', 'do ' + za(30)], ['Opłata', 'bezpłatnie']], przycisk: 'Podpisz i wyślij',
    wynik: (_, o, api) => { api.zalatw('renew'); api.pismo({ od: o.sc.urzad, t: 'Wniosek o dowód osobisty przyjęty', k: 'dokumenty', nowe: 1, skrot: ['Wniosek wpłynął do urzędu.', 'Przyjdź na odciski palców w ciągu 30 dni.'], q: '' }); return { tytul: 'Wniosek złożony', opis: 'Teraz umów wizytę w urzędzie na odciski palców.', wiersze: [['Numer wniosku', 'DO/2026/104 552'], ['Wizyta w urzędzie', 'do ' + za(30)], ['Gotowy', 'do 30 dni od wizyty']] }; },
  },
  {
    id: 'niekaralnosc', t: 'Zaświadczenie o niekaralności', opis: 'Z Krajowego Rejestru Karnego', kat: 'dokumenty', ik: 'cert', slowa: 'krk karalnosc zaswiadczenie praca',
    pola: () => [{ k: 'cel', l: 'Do czego go potrzebujesz?', opcje: ['Dla pracodawcy', 'Do urzędu', 'Za granicę', 'Inny cel'] }],
    podsumowanie: (v, o) => [['Osoba', o.moje.imie_nazwisko], ['PESEL', peselM(o)], ['Cel', v.cel], ['Opłata', '20 zł']], przycisk: 'Zapłać 20 zł i wyślij',
    wynik: (_, o, api) => { api.zaplac('Zaświadczenie z KRK', '20,00 zł'); api.pismo({ od: 'Krajowy Rejestr Karny', t: 'Zaświadczenie o niekaralności', k: 'dokumenty', nowe: 1, skrot: [`${o.imie} ${o.nazwisko} nie figuruje w Krajowym Rejestrze Karnym.`, 'Plik PDF z pieczęcią, gotowy do wysłania.'], q: '' }); return { tytul: 'Zaświadczenie gotowe', opis: 'PDF jest w Twojej skrzynce.', wiersze: [['Treść', 'nie figuruje w rejestrze'], ['Plik', 'PDF z pieczęcią elektroniczną']], dalej: [{ t: 'Otwórz skrzynkę', trasa: '/skrzynka' }] }; },
  },
  { id: 'sprawdz', t: 'Sprawdź dokument innej osoby', opis: 'Bez kserowania dowodu', kat: 'dokumenty', ik: 'scan', ekran: '/sprawdz', slowa: 'weryfikacja tozsamosc najemca' },
  { id: 'dodaj-dokument', t: 'Dodaj dokument', opis: 'Legitymacja, KDR, Diia.pl i inne', kat: 'dokumenty', ik: 'plus', ekran: '/dodaj-dokument', slowa: 'legitymacja karta' },

  /* ---------- zameldowanie i akty ---------- */
  {
    id: 'zameldowanie', t: 'Zameldowanie', opis: 'Online, bez wizyty w urzędzie', kat: 'mieszkanie', ik: 'house', slowa: 'meldunek przeprowadzka adres',
    pola: o => [{ k: 'rodz', l: 'Rodzaj pobytu', opcje: ['Pobyt stały', 'Pobyt czasowy'] }, { k: 'adres', l: 'Nowy adres', ph: 'ulica, numer domu i mieszkania', wym: true }, { k: 'miasto', l: 'Miejscowość', v: o.sc.miasto, wym: true }, { k: 'od', l: 'Od kiedy', v: dzis, wym: true }, { k: 'wl', l: 'Tytuł do lokalu', opcje: [K(o, 'Jestem właścicielką', 'Jestem właścicielem'), 'Właściciel potwierdzi online', 'Najem'] }],
    wstep: () => ({ tekst: 'Zameldowanie na pobyt stały w nowym miejscu wymeldowuje Cię automatycznie z poprzedniego.' }),
    podsumowanie: v => [['Rodzaj', v.rodz], ['Adres', `${v.adres}, ${v.miasto}`], ['Od', v.od], ['Tytuł do lokalu', v.wl], ['Opłata', 'bezpłatnie']],
    wynik: (v, _, api) => { api.pismo({ od: `Urząd, ${v.miasto}`, t: 'Wniosek o zameldowanie przyjęty', k: 'mieszkanie', nowe: 1, skrot: [`Wniosek o zameldowanie (${v.rodz.toLowerCase()}) wpłynął do urzędu.`, 'Potwierdzenie przyjdzie do tej skrzynki.'], q: '' }); return { tytul: 'Wniosek wysłany', opis: 'Potwierdzenie zameldowania przyjdzie do skrzynki.', wiersze: [['Adres', `${v.adres}, ${v.miasto}`], ['Decyzja', 'zwykle w 1–3 dni']] }; },
  },
  {
    id: 'zaswiadczenie-zameldowanie', t: 'Zaświadczenie o zameldowaniu', opis: 'PDF od ręki, bezpłatnie', kat: 'mieszkanie', ik: 'cert', slowa: 'meldunek zaswiadczenie adres',
    pola: () => [{ k: 'cel', l: 'Do czego go potrzebujesz?', opcje: ['Dla pracodawcy', 'Dla banku', 'Do urzędu', 'Inny cel'] }],
    podsumowanie: (v, o) => [['Osoba', o.moje.imie_nazwisko], ['Adres', o.dane.zamel], ['Cel', v.cel], ['Opłata', 'bezpłatnie']], przycisk: 'Pobierz zaświadczenie',
    wynik: (_, o, api) => { api.pismo({ od: 'Rejestr PESEL', t: 'Zaświadczenie o zameldowaniu', k: 'mieszkanie', nowe: 1, skrot: [`Potwierdza zameldowanie pod adresem ${o.dane.zamel}.`, 'Plik PDF z pieczęcią, gotowy do wysłania.'], q: '' }); return { tytul: 'Zaświadczenie gotowe', opis: 'PDF jest w Twojej skrzynce.', wiersze: [['Adres', o.dane.zamel], ['Od', o.dane.zamelOd]], dalej: [{ t: 'Otwórz skrzynkę', trasa: '/skrzynka' }] }; },
  },
  {
    id: 'odpis', t: 'Odpis aktu stanu cywilnego', opis: 'Urodzenia, małżeństwa, zgonu', kat: 'mieszkanie', ik: 'doc', slowa: 'akt urodzenia malzenstwa zgonu usc',
    pola: o => [{ k: 'akt', l: 'Rodzaj aktu', opcje: ['Urodzenia', 'Małżeństwa', 'Zgonu'] }, { k: 'typ', l: 'Rodzaj odpisu', opcje: ['Skrócony', 'Zupełny', 'Wielojęzyczny'] }, { k: 'kogo', l: 'Kogo dotyczy', v: o.moje.imie_nazwisko, wym: true }],
    podsumowanie: v => [['Akt', v.akt], ['Odpis', v.typ], ['Osoba', v.kogo], ['Opłata', v.typ === 'Zupełny' ? '33 zł' : '22 zł']], przycisk: 'Zapłać i wyślij',
    wynik: v => ({ tytul: 'Wniosek złożony', opis: 'Odpis trafi do Twojej skrzynki zwykle w ciągu kilku dni.', wiersze: [['Odpis', `akt ${v.akt.toLowerCase()}, ${v.typ.toLowerCase()}`], ['Opłata', v.typ === 'Zupełny' ? '33 zł, zapłacono' : '22 zł, zapłacono']] }),
  },

  /* ---------- pojazdy i kierowcy ---------- */
  {
    id: 'oc-badanie', t: 'OC i badanie techniczne', opis: 'Terminy dla Twoich aut', kat: 'pojazdy', ik: 'car', slowa: 'ubezpieczenie polisa przeglad badanie',
    dostepna: o => o.docs.some(d => d.id === 'auto'),
    info: o => ({ tekst: o.sc.oc.title, wiersze: o.sc.oc.rows, uwaga: o.sc.oc.note, dalej: [{ t: `Przypomnij mi ${o.sc.oc.remind.slice(0, 5)}`, trasa: 'toast:Przypomnienie ustawione na ' + o.sc.oc.remind, ik: 'bell' }, { t: 'Zobacz pojazd', trasa: '/dokument/auto', ik: 'car' }] }),
  },
  { id: 'punkty', t: 'Punkty karne', opis: 'Stan konta i wygasanie punktów', kat: 'pojazdy', ik: 'clock', slowa: 'mandat punkty karne', info: o => ({ tekst: `Masz ${o.sc.punkty.n} ${o.sc.punkty.n === 1 ? 'punkt' : o.sc.punkty.n > 1 && o.sc.punkty.n < 5 ? 'punkty' : 'punktów'} karnych.`, wiersze: o.sc.punkty.rows, uwaga: o.sc.punkty.note }) },
  {
    id: 'mstluczka', t: 'mStłuczka', opis: 'Oświadczenie o kolizji bez druku', kat: 'pojazdy', ik: 'car', slowa: 'kolizja stluczka wypadek oswiadczenie szkoda',
    wstep: () => ({ flaga: 'Jeśli ktoś jest ranny, nie spisuj oświadczenia. Zadzwoń pod 112.', tekst: 'mStłuczka zadziała, gdy oboje macie mObywatela, auta mają polską rejestrację i zgadzacie się, kto zawinił.' }),
    pola: o => [{ k: 'nr', l: 'Numer rejestracyjny drugiego auta', v: 'WPI 22R31', wym: true, podp: 'Dane kierowcy i polisy pobierzemy z CEPiK.' }, { k: 'kto', l: 'Kto spowodował zdarzenie?', opcje: ['Drugi kierowca', K(o, 'Ja', 'Ja')] }, { k: 'co', l: 'Co się stało?', opcje: ['Cofanie z miejsca parkingowego', 'Brak odstępu', 'Wymuszenie pierwszeństwa', 'Inne'] }, { k: 'gdzie', l: 'Miejsce', v: o.sc.miejsce, wym: true }],
    podsumowanie: (v, o) => [['Twoje auto', o.moje.pojazd], ['Drugie auto', v.nr + ', OC TU Bałtyk'], ['Sprawca', v.kto === 'Ja' ? o.moje.imie_nazwisko : 'kierowca auta ' + v.nr], ['Okoliczności', v.co], ['Miejsce', v.gdzie], ['Data', dzis]], przycisk: 'Podpisz oświadczenie',
    wynik: v => ({ tytul: 'Oświadczenie podpisane', opis: v.kto === 'Ja' ? 'Szkodę zgłosi drugi kierowca. Oświadczenie już ma.' : 'Przekazaliśmy zgłoszenie szkody do ubezpieczyciela sprawcy.', wiersze: [['Numer', 'mS/2026/88 410'], ['PDF', 'u obu kierowców'], ...(v.kto === 'Ja' ? [] : [['Numer szkody', '2026/11/553 017'] as Wiersz])] }),
  },
  {
    id: 'historia-pojazdu', t: 'Historia pojazdu', opis: 'Sprawdź auto przed zakupem', kat: 'pojazdy', ik: 'search', slowa: 'kupuje auto uzywane vin przebieg licznik', bezFaceId: true,
    pola: () => [{ k: 'nr', l: 'Numer rejestracyjny', v: 'WE 4K221', wym: true }, { k: 'vin', l: 'VIN', v: 'WVWZZZAUZKW118204', wym: true }, { k: 'data', l: 'Data pierwszej rejestracji', v: '14.03.2019', wym: true, podp: 'Wszystkie trzy dane są w dowodzie rejestracyjnym.' }],
    przycisk: 'Sprawdź',
    wynik: v => ({ tytul: 'Volkswagen Golf 1.5 TSI, 2019', ikona: 'alert', opis: 'Uwaga: przebieg się nie zgadza. W 2024 r. 112 300 km, w 2025 r. 87 400 km. Zapytaj sprzedającego o różnicę.', wiersze: [['Numer', v.nr.toUpperCase()], ['Właściciele', '3, ostatnia zmiana 08.2026'], ['OC', 'ważne do 02.2027'], ['Badanie techniczne', 'ważne do 05.2027'], ['Szkody istotne', '1 (2022)'], ['Kradzież', 'brak zgłoszeń']] }),
  },
  {
    id: 'zbycie', t: 'Zgłoś sprzedaż pojazdu', opis: 'Masz na to 30 dni', kat: 'pojazdy', ik: 'swap', slowa: 'zbycie sprzedaz auta sprzedalem', dostepna: o => o.docs.some(d => d.plate),
    pola: o => [{ k: 'auto', l: 'Pojazd', opcje: o.docs.filter(d => d.plate).flatMap(d => [`${d.plate} · ${d.model}`, ...(d.more ?? []).map(m => `${m.plate} · ${m.model}`)]) }, { k: 'data', l: 'Data sprzedaży', v: dzis, wym: true }, { k: 'kto', l: 'Nabywca', ph: 'imię i nazwisko albo firma', wym: true }],
    wstep: () => ({ tekst: 'Za zgłoszenie po terminie starosta może nałożyć karę. Ubezpieczyciela OC powiadomimy za Ciebie.' }),
    podsumowanie: v => [['Pojazd', v.auto], ['Data', v.data], ['Nabywca', v.kto], ['Opłata', 'bezpłatnie']],
    wynik: v => ({ tytul: 'Sprzedaż zgłoszona', opis: 'Wydział komunikacji i ubezpieczyciel dostali zgłoszenie.', wiersze: [['Pojazd', v.auto], ['Nabywca', v.kto]] }),
  },
  {
    id: 'autobus', t: 'Bezpieczny autobus', opis: 'Sprawdź autokar przed wycieczką', kat: 'pojazdy', ik: 'bus', slowa: 'wycieczka autokar szkola', bezFaceId: true,
    pola: () => [{ k: 'nr', l: 'Numer rejestracyjny autokaru', v: 'GD 4021B', wym: true, podp: 'Znajdziesz go na tablicy z przodu i z tyłu pojazdu.' }], przycisk: 'Sprawdź',
    wynik: v => ({ tytul: 'Autokar może jechać', ikona: 'check', opis: 'Badanie i OC są ważne. Przed wyjazdem pojazd może jeszcze skontrolować policja lub ITD.', wiersze: [['Numer', v.nr.toUpperCase()], ['Badanie techniczne', 'ważne do 14.03.2027'], ['OC', 'ważne do 30.06.2027'], ['Zgłoszenie kradzieży', 'brak']] }),
  },
  {
    id: 'prawo-jazdy', t: 'Wymiana prawa jazdy', opis: 'Kiedy i jak wymienić', kat: 'pojazdy', ik: 'id', slowa: 'prawko waznosc wymiana', dostepna: o => o.docs.some(d => d.id === 'pj'),
    info: o => { const d = o.docs.find(x => x.id === 'pj')!; const bez = /bezterminow/.test(d.sub); return { wiersze: d.rows.slice(0, 4), uwaga: bez ? 'Prawa jazdy wydane bezterminowo przed 19.01.2013 trzeba wymienić najpóźniej do 19.01.2033. Wniosek złożysz w wydziale komunikacji.' : 'Przypomnimy Ci o wymianie 3 miesiące przed końcem ważności.' }; },
  },

  /* ---------- pisma i opłaty ---------- */
  { id: 'platnosci', t: 'Płatności', opis: 'Podatki, mandaty i opłaty', kat: 'oplaty', ik: 'receipt', ekran: '/platnosci', slowa: 'zaplac podatek mandat zus skladki oplata' },
  { id: 'skrzynka', t: 'Skrzynka e-Doręczeń', opis: 'Pisma z urzędów', kat: 'oplaty', ik: 'inbox', ekran: '/skrzynka', slowa: 'pismo list urzad doreczenia wezwanie' },
  {
    id: 'odpowiedz', t: 'Odpowiedz na pismo', opis: 'Z załącznikami, przez e-Doręczenia', kat: 'oplaty', ik: 'mail', slowa: 'odpowiedz urzad skarbowy wezwanie wyjasnienia', dostepna: o => !!o.sc.letter.draft,
    wstep: o => ({ tekst: (o.sc.letter.say?.replace(/ Przygotować.*$/, '') ?? '') + ' Przygotowaliśmy odpowiedź: ' + (o.sc.letter.draft ?? '').replace(/<br>/g, ' ').replace(/<[^>]+>/g, '') }),
    podsumowanie: (_, o) => [['Do', o.sc.letter.to ?? ''], ['Załączniki', o.sc.letter.att ?? ''], ['Podpis', 'podpis zaufany']], przycisk: 'Podpisz i wyślij',
    wynik: (_, o, api) => { api.zalatw('letter'); return { tytul: 'Pismo doręczone', opis: 'Dowód otrzymania jest w skrzynce.', wiersze: [['Do', o.sc.letter.to ?? ''], ['Załączniki', o.sc.letter.att ?? ''], ['Dowód otrzymania', 'zapisany']] }; },
  },

  /* ---------- rodzina ---------- */
  { id: 'rodzina', t: 'Dokumenty rodziny', opis: 'Dzieci i osoby pod opieką', kat: 'rodzina', ik: 'family', ekran: '/rodzina', slowa: 'dzieci paszport dziecka legitymacja szkolna' },
  {
    id: 'narodziny', t: 'Zgłoś narodziny dziecka', opis: 'Akt urodzenia, PESEL, 800 plus', kat: 'rodzina', ik: 'baby', slowa: 'urodzilo dziecko noworodek usc akt urodzenia',
    wstep: () => ({ tekst: 'Masz 21 dni od wystawienia karty urodzenia. Szpital przekazał już kartę do urzędu stanu cywilnego.' }),
    pola: o => [{ k: 'imie', l: 'Imię dziecka', ph: 'np. Helena', wym: true, podp: 'Najwyżej dwa imiona, w pełnej formie.' }, { k: 'plec', l: 'Płeć', opcje: ['Dziewczynka', 'Chłopiec'] }, { k: 'drugi', l: 'Drugi rodzic', v: o.sc.partner || '', ph: 'imię i nazwisko' }, { k: 'swiad', l: 'Od razu złożyć też', opcje: ['Wniosek o 800 plus', 'Nic więcej'] }],
    podsumowanie: (v, o) => [['Dziecko', `${v.imie} ${o.sc.nazw[v.plec === 'Dziewczynka' ? 0 : 1]}`], ['Urodzone', '16.10.2026, ' + o.sc.szpital], ['Drugi rodzic', v.drugi || 'do uzupełnienia'], ['Zameldowanie', o.moje.adres], ['800 plus', v.swiad === 'Nic więcej' ? 'nie' : 'tak'], ['Opłata', 'bezpłatnie']], przycisk: 'Podpisz i wyślij',
    wynik: v => ({ tytul: 'Zgłoszenie wysłane', opis: 'PESEL i akt urodzenia zwykle następnego dnia roboczego.', wiersze: [['Odpis skrócony aktu', 'bezpłatnie, do skrzynki'], ['800 plus', v.swiad === 'Nic więcej' ? 'nie złożono' : 'wniosek wysłany do ZUS'], ['Ubezpieczenie dziecka', 'zgłosi pracodawca, przekaż mu PESEL w 7 dni']] }),
  },
  {
    id: 'kdr', t: 'Karta Dużej Rodziny', opis: 'Zniżki i partnerzy', kat: 'rodzina', ik: 'family', slowa: 'kdr znizki',
    info: o => o.docs.some(d => d.id === 'kdr')
      ? { tekst: 'Z Kartą Dużej Rodziny masz zniżki na przejazdy, wstęp do parków narodowych i rabaty u tysięcy partnerów.', wiersze: [['Pociągi PKP', '37% (49% na bilet miesięczny)'], ['Parki narodowe', 'bezpłatny wstęp'], ['Stacje paliw partnerów', 'rabat na litrze paliwa']], dalej: [{ t: 'Pokaż kartę', trasa: '/dokument/kdr', ik: 'id' }] }
      : { tekst: 'Karta przysługuje rodzinom z co najmniej trojgiem dzieci. Wniosek złożysz w gminie albo przez internet.' },
  },

  /* ---------- zdrowie i emerytura ---------- */
  {
    id: 'recepty', t: 'Recepty i skierowania', opis: 'Z Internetowego Konta Pacjenta', kat: 'zdrowie', ik: 'pill', slowa: 'recepta leki apteka mama ikp',
    info: o => o.id === 'ewa'
      ? { tekst: 'Recepty mamy, Haliny Nowak (masz upoważnienie do jej konta pacjenta):', wiersze: [['Bisoprolol 5 mg', 'do wykupienia, do 12.11'], ['Atorwastatyna 20 mg', 'do wykupienia, do 02.12']], uwaga: 'W aptece podaj 4-cyfrowy kod recepty i PESEL mamy.', dalej: [{ t: 'Pokaż kod do apteki', trasa: 'toast:Kod recepty: 4471', ik: 'qr' }] }
      : { tekst: 'Nie masz teraz aktywnych recept ani skierowań. Nowe e-recepty pojawią się tu od razu po wystawieniu.' },
  },
  { id: 'szczepienia', t: 'Szczepienia', opis: 'Kalendarz szczepień', kat: 'zdrowie', ik: 'heart', slowa: 'szczepionka', info: o => o.id === 'marta' ? { tekst: 'Najbliższe szczepienia w rodzinie:', wiersze: [['Staś, 6 lat', 'dawka przypominająca, 2027'], ['Wszyscy', 'grypa, co sezon (zalecane)']], uwaga: 'Przypomnimy Ci miesiąc przed terminem.' } : { tekst: 'Nie masz zaplanowanych szczepień.' } },
  {
    id: 'ekuz', t: 'Karta EKUZ', opis: 'Leczenie w krajach UE', kat: 'zdrowie', ik: 'plane', slowa: 'ubezpieczenie zagranica nfz',
    pola: o => [{ k: 'kto', l: 'Dla kogo', opcje: [o.imie, ...o.rodzina.filter(m => m.wiek < 18).map(m => m.imie)] }, { k: 'adres', l: 'Adres do wysyłki', v: o.dane.zamel, wym: true }],
    podsumowanie: v => [['Osoba', v.kto], ['Adres', v.adres], ['Opłata', 'bezpłatnie']],
    wynik: v => ({ tytul: 'Wniosek wysłany do NFZ', opis: 'Karta przyjdzie pocztą w około 7 dni.', wiersze: [['Dla', v.kto], ['Wysyłka', v.adres]] }),
  },
  {
    id: 'emerytura', t: 'Moja emerytura', opis: 'Wiek emerytalny i prognoza', kat: 'zdrowie', ik: 'brief', slowa: 'zus emerytura prognoza',
    info: o => { const [d, m, y] = o.moje.data_urodzenia.split('.'); const w = `${d}.${m}.${+y + (o.plec === 'K' ? 60 : 65)}`; return { wiersze: [['Wiek emerytalny', w], ...(o.id === 'ewa' ? [['Zgromadzone składki', '612 480 zł'], ['Prognoza', 'ok. 3 400 zł brutto']] as Wiersz[] : [['Prognoza', 'w PUE ZUS']] as Wiersz[])], uwaga: 'Wniosek o emeryturę złożysz najwcześniej miesiąc przed osiągnięciem wieku emerytalnego.' }; },
  },

  /* ---------- bezpieczeństwo ---------- */
  { id: 'prywatnosc', t: 'Centrum prywatności', opis: 'Kto sprawdzał Twoje dane', kat: 'bezp', ik: 'eye', ekran: '/prywatnosc', slowa: 'dane dostep kto sprawdzal zgody' },
  {
    id: 'sms', t: 'Dziwny SMS lub strona', opis: 'Sprawdzimy i zgłosimy do CERT', kat: 'bezp', ik: 'alert', slowa: 'oszustwo phishing link sms dziwny', bezFaceId: true,
    pola: () => [{ k: 'tresc', l: 'Wklej treść albo adres strony', v: 'Poczta: paczka zatrzymana z powodu braku opłaty 1,20 zł. Opłać: poczta-dostawa24.top/pl', wym: true }], przycisk: 'Sprawdź',
    wynik: () => ({ tytul: 'To oszustwo', ikona: 'alert', opis: 'Nie otwieraj linku i nie podawaj danych karty. Prześlij tego SMS-a na bezpłatny numer 8080.', wiersze: [['Domena', 'poczta-dostawa24.top'], ['Zarejestrowana', '3 dni temu'], ['Lista Ostrzeżeń CERT', 'tak, od wczoraj'], ['Zgłoszenie do CERT', 'wysłane']] }),
  },
  { id: 'alerty', t: 'Alerty RCB', opis: 'Ostrzeżenia dla Twojej okolicy', kat: 'bezp', ik: 'megaphone', ekran: '/alerty', slowa: 'ostrzezenia pogoda rcb' },

  /* ---------- wybory i podróże ---------- */
  {
    id: 'rejestr-wyborcow', t: 'Rejestr wyborców', opis: 'Głosuj tam, gdzie mieszkasz', kat: 'inne', ik: 'vote', slowa: 'wybory glosowanie obwod',
    wstep: o => ({ tekst: `Możesz na stałe dopisać się do rejestru wyborców tam, gdzie mieszkasz${o.sc.meldunek ? `, choć meldunek masz w ${o.sc.meldunek === 'Elbląg' ? 'Elblągu' : o.sc.meldunek}` : ''}.` }),
    podsumowanie: (_, o) => [['Gmina', o.sc.miasto], ['Adres zamieszkania', o.moje.adres], ['Decyzja', 'w ciągu 3 dni']], przycisk: 'Podpisz i wyślij',
    wynik: (_, o, api) => { api.zalatw('glos'); return { tytul: 'Wniosek wysłany', opis: 'Decyzja przyjdzie do skrzynki.', wiersze: [['Gmina', o.sc.miasto], ['Decyzja', 'do ' + za(3)]] }; },
  },
  {
    id: 'podroz', t: 'Bezpieczna podróż', opis: 'Zarejestruj wyjazd w Odyseuszu', kat: 'inne', ik: 'plane', slowa: 'wakacje wyjazd egipt zagranica odyseusz paszport',
    wstep: o => o.id === 'jan' ? { flaga: 'Paszport Olka traci ważność 02.01.2027. Egipt wymaga paszportu ważnego co najmniej 6 miesięcy, więc trzeba go wymienić przed wyjazdem.', tekst: 'Zarejestruj podróż, a w razie zagrożenia konsul wyśle Ci SMS.' } : { tekst: 'Zarejestruj podróż, a w razie zagrożenia konsul wyśle Ci SMS.' },
    pola: o => [{ k: 'kraj', l: 'Dokąd jedziesz?', v: o.id === 'jan' ? 'Egipt' : '', ph: 'kraj', wym: true }, { k: 'kiedy', l: 'Kiedy', v: o.id === 'jan' ? '20.12–03.01' : '', ph: 'np. 01.07–14.07', wym: true }, { k: 'ile', l: 'Ile osób', opcje: ['1', '2', '3', '4', '5'] }],
    podsumowanie: v => [['Kraj', v.kraj], ['Termin', v.kiedy], ['Osoby', v.ile]],
    wynik: v => ({ tytul: 'Podróż zarejestrowana', opis: 'Dostaniesz SMS, jeśli w kraju podróży będzie niebezpiecznie.', wiersze: [['Kraj', v.kraj], ['Termin', v.kiedy]] }),
  },
  {
    id: 'ulgi-studenta', t: 'Ulgi studenta', opis: 'Co daje mLegitymacja', kat: 'inne', ik: 'cap', slowa: 'legitymacja znizka pociag student', dostepna: o => o.docs.some(d => d.id === 'leg'),
    info: () => ({ wiersze: [['Pociągi PKP', '51% do 26. roku życia'], ['Komunikacja miejska', 'bilety ulgowe'], ['Muzea państwowe', 'bilety ulgowe']], uwaga: 'W pociągu pokaż mLegitymację na ekranie.', dalej: [{ t: 'Pokaż legitymację', trasa: '/dokument/leg', ik: 'id' }] }),
  },
];
export const usluga = (id: string) => USLUGI.find(u => u.id === id);
export const trasaUslugi = (u: Usluga) => u.ekran ?? `/usluga/${u.id}`;

/* Zdania z danych (przypomnienia, terminy, pisma) → ekran aplikacji. */
const norm = (t: string) => t.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '');
export function trasaDla(q: string | null | undefined, o?: Osoba): string | null {
  if (!q) return null;
  if (q.startsWith('@toku:')) return `/sprawa/${q.slice(6)}`;
  const n = norm(q);
  const r: [RegExp, string][] = [
    [/odblok\w* pesel|cofn\w* zastrz/, '/usluga/cofnij-zastrzezenie'], [/zastrz.*pesel/, '/usluga/zastrzez-pesel'],
    [/dowod.*(waz|traci)/, '/usluga/wniosek-dowod'], [/portfel|zgubil|ukradl/, '/usluga/zgubiony-dowod'],
    [/stluczk|kolizj/, '/usluga/mstluczka'], [/kupuj|uzywan|historia pojazdu/, '/usluga/historia-pojazdu'],
    [/urodzil|urodzi/, '/usluga/narodziny'], [/sms|oszust|dziwn/, '/usluga/sms'], [/punkt/, '/usluga/punkty'],
    [/egipt|wyjazd|wakacj/, '/usluga/podroz'], [/recept/, '/usluga/recepty'], [/emerytur/, '/usluga/emerytura'],
    [/glosow|obwod|wybor/, '/usluga/rejestr-wyborcow'], [/niekaraln/, '/usluga/niekaralnosc'], [/szczepi/, '/usluga/szczepienia'],
    [/legitymac|znizk.*pociag/, '/usluga/ulgi-studenta'], [/prawo jazdy|prawk/, '/usluga/prawo-jazdy'],
    [/pism|urzad\w* skarbow|decyzj|politechni|stypendi/, '/skrzynka'],
    [/\boc\b|badani|przeglad|ubezpiecz/, '/usluga/oc-badanie'], [/podatek|zaplac|mandat|zus|sklad/, '/platnosci'],
    [/duzej rodziny|\bkdr\b/, '/usluga/kdr'],
  ];
  for (const [re, t] of r) if (re.test(n)) return t;
  return o ? null : null;
}
export function szukaj(q: string, o: Osoba, st: Stan) {
  const n = norm(q.trim()); if (!n) return [];
  const slowa = n.split(/\s+/);
  return USLUGI.filter(u => (!u.dostepna || u.dostepna(o, st)) && slowa.every(s => norm(`${u.t} ${u.opis} ${u.slowa ?? ''}`).includes(s)));
}
