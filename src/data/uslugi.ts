import type { Osoba, Pismo, Sprawa, Wiersz } from './typy';

/* Katalog usług prototypu.
   Usługa to: ekran aplikacji (ekran), bogaty ekran informacyjny (ekranInfo, src/ui/info-uslugi.tsx)
   albo przepływ: karta informacyjna to kroki z polami to podsumowanie i zgoda to PIN mObywatela (płatność: Face ID) to wysyłka to wynik
   (z podglądem wydanego dokumentu, listą „co dalej” i nową sprawą w toku). Treści dopasowane do osoby. */

export type V = Record<string, string>;
export type Opcja = string | { t: string; o?: string; ik?: string };
export type Pole = {
  k: string; l: string; typ?: 'tekst' | 'dlugi' | 'wybor' | 'wiele' | 'tak' | 'plik' | 'lista' | 'okres'; opcje?: Opcja[]; v?: string;
  ph?: string; wym?: boolean; podp?: string; num?: boolean; gdy?: (v: V) => boolean; plik?: string;
};
export type Krok = { t: string; opis?: string; pola: Pole[]; ostrzezenie?: (v: V) => string | null; stop?: (v: V) => string | null };
export type KartaInfo = { czas: string; oplata: string; potrzebne: string[]; jak: string[] };
export type Dok = { naglowek: string; tytul: string; nr: string; tresc: Wiersz[]; stopka: string };
export type Wynik = {
  tytul: string; opis?: string; wiersze: Wiersz[]; ikona?: 'ok' | 'alert'; dalej?: { t: string; trasa: string }[];
  dok?: Dok; coDalej?: string[]; sprawa?: Sprawa; os?: [string, string, boolean?][];
  wykres?: { t: string; jedn: string; dane: [string, number, boolean?][] }; kontrola?: [string, string, boolean][];
};
export type Api = { zalatw: (k: string) => void; pesel: (v: boolean) => void; wpis: (id: string, pole: 'zgl' | 'potw') => void; pismo: (p: Omit<Pismo, 'id' | 'kiedy'>) => void; zaplac: (tytul: string, kwota: string) => void };
export type Info = { tekst?: string; wiersze?: Wiersz[]; uwaga?: string; flaga?: string; dalej?: { t: string; trasa: string; ik?: string }[] };
export type Stan = { pesel: boolean; zaplacone: string[] };
export type Usluga = {
  id: string; t: string; opis: string; kat: string; ik: string; slowa?: string;
  ekran?: string; ekranInfo?: string; dostepna?: (o: Osoba, st: Stan) => boolean;
  karta?: (o: Osoba, st: Stan) => KartaInfo; wstep?: (o: Osoba, st: Stan) => Info;
  kroki?: (o: Osoba, st: Stan, p: V) => Krok[]; ukryta?: boolean; podsumowanie?: (v: V, o: Osoba) => Wiersz[];
  zgoda?: string; przycisk?: string; bezFaceId?: boolean; platnosc?: boolean; wysylka?: string[];
  wynik?: (v: V, o: Osoba, api: Api) => Wynik;
  qr?: (v: V, o: Osoba) => { tytul: string; opis: string; kto: string; druga: Wiersz[] };
  blokada?: (o: Osoba, st: Stan) => Info | null;
};

export const KATEGORIE = [
  { id: 'dokumenty', t: 'Dokumenty i dane', ik: 'id' },
  { id: 'mieszkanie', t: 'Zameldowanie i akty', ik: 'house' },
  { id: 'pojazdy', t: 'Pojazdy i kierowcy', ik: 'car' },
  { id: 'oplaty', t: 'Pisma i opłaty', ik: 'receipt' },
  { id: 'rodzina', t: 'Rodzina', ik: 'family' },
  { id: 'zdrowie', t: 'Zdrowie i emerytura', ik: 'heart' },
  { id: 'bezp', t: 'Bezpieczeństwo', ik: 'shield' },
  { id: 'inne', t: 'Wybory, nauka i podróże', ik: 'vote' },
];

/* ---------- pomocnicze ---------- */
const K = (o: Osoba, k: string, m: string) => (o.plec === 'K' ? k : m);
const peselM = (o: Osoba) => o.moje.pesel.slice(0, 6) + '•••' + o.moje.pesel.slice(9);
const dzis = '18.10.2026';
const za = (n: number) => new Date(2026, 9, 18 + n).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
const nr = (p: string) => `${p}/2026/${String(100000 + Math.floor(Math.random() * 899999))}`;
export const lab = (x: Opcja) => (typeof x === 'string' ? x : x.t);
export const wiele = (s: string) => (s ? s.split('|') : []);
/* okres zapisany jako "dd.mm.rrrr|dd.mm.rrrr" */
export const okresTxt = (s: string) => { const [a, b] = (s || '').split('|'); return a && b ? `od ${a} do ${b}` : a ? `od ${a}` : ''; };
export const KRAJE = ['Albania', 'Austria', 'Belgia', 'Bułgaria', 'Chorwacja', 'Cypr', 'Czarnogóra', 'Czechy', 'Dania', 'Egipt', 'Estonia', 'Finlandia', 'Francja', 'Grecja', 'Gruzja', 'Hiszpania', 'Holandia', 'Indonezja', 'Irlandia', 'Islandia', 'Izrael', 'Japonia', 'Jordania', 'Kanada', 'Kenia', 'Litwa', 'Łotwa', 'Malta', 'Maroko', 'Meksyk', 'Niemcy', 'Norwegia', 'Portugalia', 'Rumunia', 'Słowacja', 'Słowenia', 'Stany Zjednoczone', 'Szwajcaria', 'Szwecja', 'Tajlandia', 'Tunezja', 'Turcja', 'Ukraina', 'Węgry', 'Wielka Brytania', 'Wietnam', 'Włochy', 'Zjednoczone Emiraty Arabskie'];
const tak = (s?: string) => s === 'tak';
let licz = 0;
const sprawa = (t: string, s: string, k: string, eta: string, steps: [string, string, 0 | 1 | 2][], note: string): Sprawa => ({ id: `n${Date.now()}${++licz}`, t, s, k, eta, steps, note });
const auta = (o: Osoba) => o.docs.filter(d => d.plate).flatMap(d => [`${d.plate} · ${d.model}`, ...(d.more ?? []).map(m => `${m.plate} · ${m.model}`)]);
const dzieci = (o: Osoba) => o.rodzina.filter(m => m.wiek < 18);

export const USLUGI: Usluga[] = [
  /* =================== DOKUMENTY I DANE =================== */
  { id: 'moje-dane', t: 'Moje dane', opis: 'Dane z rejestru PESEL, adres, kontakt', kat: 'dokumenty', ik: 'user', ekran: '/moje-dane', slowa: 'pesel adres dane osobowe rejestr' },
  {
    id: 'zastrzez-pesel', t: 'Zastrzeż PESEL', opis: 'Nikt nie weźmie kredytu na Twoje dane', kat: 'dokumenty', ik: 'shield', slowa: 'zastrzezenie kredyt pozyczka oszustwo',
    blokada: (_, st) => st.pesel ? { tekst: 'Twój PESEL jest już zastrzeżony. Banki i firmy pożyczkowe dostaną odmowę, jeśli ktoś spróbuje wziąć kredyt na Twoje dane.', dalej: [{ t: 'Cofnij zastrzeżenie na chwilę', trasa: '/usluga/cofnij-zastrzezenie', ik: 'clock' }, { t: 'Zobacz, kto sprawdzał Twój PESEL', trasa: '/prywatnosc', ik: 'eye' }] } : null,
    karta: () => ({ czas: 'ok. 1 minuty', oplata: 'bezpłatnie', potrzebne: ['Nic więcej, dane mamy w rejestrze'], jak: ['Wybierasz, od kiedy zastrzeżenie ma działać', 'Podpisujesz PIN-em mObywatela', 'Zastrzeżenie działa od razu, w całej Polsce'] }),
    kroki: () => [{
      t: 'Co chcesz zastrzec', pola: [
        { k: 'pow', l: 'Dlaczego zastrzegasz?', typ: 'wybor', opcje: [{ t: 'Profilaktycznie', o: 'Najczęstszy wybór. Po prostu dla bezpieczeństwa.' }, { t: 'Dokumenty zginęły albo zostały skradzione', o: 'Zastrzeż też dowód w usłudze „Zgubiony dowód”.' }, { t: 'Ktoś użył moich danych', o: 'Po zastrzeżeniu zgłoś sprawę na policji.' }] },
        { k: 'sms', l: 'Powiadamiaj mnie o każdej próbie sprawdzenia', typ: 'tak', v: 'tak', podp: 'Dostaniesz powiadomienie, gdy bank zapyta o Twój PESEL.' },
      ],
    }],
    podsumowanie: (v, o) => [['PESEL', peselM(o)], ['Od', 'teraz'], ['Do', 'do odwołania'], ['Powód', v.pow], ['Powiadomienia', tak(v.sms) ? 'tak' : 'nie'], ['Opłata', 'bezpłatnie']],
    przycisk: 'Zastrzeż PESEL', wysylka: ['Podpisuję zastrzeżenie…', 'Wpisuję do rejestru zastrzeżeń…'],
    wynik: (_, __, api) => {
      api.pesel(true);
      return { tytul: 'PESEL zastrzeżony', opis: 'Od tej chwili nikt nie weźmie kredytu ani pożyczki na Twoje dane.', wiersze: [['Status', 'zastrzeżony'], ['Od', `${dzis}, ${new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`]],
        coDalej: ['Jeśli będziesz brać kredyt, cofniesz zastrzeżenie na kilka dni w kilka sekund.', 'U lekarza, w aptece i w urzędzie nic się nie zmienia.', 'Kto sprawdzał Twój PESEL, zobaczysz w Centrum prywatności.'], dalej: [{ t: 'Centrum prywatności', trasa: '/prywatnosc' }] };
    },
  },
  {
    id: 'cofnij-zastrzezenie', t: 'Cofnij zastrzeżenie PESEL', opis: 'Na czas wniosku o kredyt', kat: 'dokumenty', ik: 'clock', slowa: 'odblokuj pesel kredyt', dostepna: (_, st) => st.pesel,
    karta: () => ({ czas: 'ok. 1 minuty', oplata: 'bezpłatnie', potrzebne: ['Nic więcej'], jak: ['Wybierasz, na jak długo', 'Podpisujesz PIN-em mObywatela', 'Po tym czasie zastrzeżenie włączy się samo'] }),
    kroki: () => [{
      t: 'Na jak długo', pola: [
        { k: 'na', l: 'Cofnij zastrzeżenie na', typ: 'wybor', opcje: [{ t: '1 dzień', o: 'Wystarczy na podpisanie umowy w oddziale' }, { t: '7 dni', o: 'Typowy czas rozpatrywania wniosku kredytowego' }, { t: '30 dni', o: 'Np. kredyt hipoteczny' }, { t: 'Na stałe', o: 'Zastrzeżenie nie wróci samo' }], v: '7 dni' },
        { k: 'cel', l: 'Po co? (opcjonalnie)', typ: 'wybor', opcje: ['Kredyt w banku', 'Zakup na raty', 'Umowa z operatorem', 'Inny powód'] },
      ],
    }],
    podsumowanie: (v, o) => [['PESEL', peselM(o)], ['Cofnięcie', v.na], ['Zastrzeżenie wróci', v.na === 'Na stałe' ? 'nie wróci samo' : za(v.na === '1 dzień' ? 1 : v.na === '7 dni' ? 7 : 30)], ['Cel', v.cel]],
    przycisk: 'Cofnij zastrzeżenie',
    wynik: (v, _, api) => { api.pesel(false); return { tytul: 'Zastrzeżenie cofnięte', opis: v.na === 'Na stałe' ? 'Możesz je włączyć ponownie w każdej chwili.' : `Zastrzeżenie wróci samo ${za(v.na === '1 dzień' ? 1 : v.na === '7 dni' ? 7 : 30)}.`, wiersze: [['Status', 'niezastrzeżony'], ['Cel', v.cel]], coDalej: ['Bank może teraz sprawdzić Twój PESEL.', 'Każde sprawdzenie zobaczysz w Centrum prywatności.'] }; },
  },
  {
    id: 'zgubiony-dowod', t: 'Zgubiony lub skradziony dowód', opis: 'Zastrzeż dokumenty i karty', kat: 'dokumenty', ik: 'alert', slowa: 'portfel zgubilem zgubilam ukradli kradziez zastrzez dowod',
    karta: () => ({ czas: 'ok. 2 minut', oplata: 'bezpłatnie', potrzebne: ['Wiesz, co było w portfelu'], jak: ['Zastrzegamy dowód w bankach (system Dokumenty Zastrzeżone)', 'Blokujemy dowód na 14 dni; jeśli się znajdzie, odblokujesz go tutaj', 'Podpowiemy, jak zastrzec karty i prawo jazdy'] }),
    wstep: () => ({ tekst: 'Spokojnie. Najpierw zadbajmy, żeby nikt nie użył Twoich dokumentów. Zajmie to 2 minuty.' }),
    kroki: () => [
      { t: 'Co się stało', pola: [{ k: 'co', l: 'Dokumenty zostały', typ: 'wybor', opcje: [{ t: 'Zgubione', o: 'Nie wiesz, gdzie są' }, { t: 'Skradzione', o: 'Zgłoś też kradzież na policji (112 albo komisariat)' }] }, { k: 'gdzie', l: 'Gdzie i kiedy? (opcjonalnie)', ph: 'np. tramwaj 17, dziś rano', typ: 'tekst' }] },
      { t: 'Co było w portfelu', opis: 'Zaznacz wszystko, co zginęło.', pola: [{ k: 'dok', l: 'Zaznacz', typ: 'wiele', opcje: [{ t: 'Dowód osobisty', ik: 'id' }, { t: 'Prawo jazdy', ik: 'car' }, { t: 'Karty płatnicze', ik: 'wallet' }, { t: 'Karta Dużej Rodziny', ik: 'family' }, { t: 'Legitymacja', ik: 'cap' }], v: 'Dowód osobisty' }] },
      { t: 'Co zrobić', pola: [{ k: 'zastrz', l: 'Zastrzeż dowód w bankach', typ: 'tak', v: 'tak' }, { k: 'blok', l: 'Zablokuj dowód na 14 dni', typ: 'tak', v: 'tak', podp: 'Jeśli się nie znajdzie, unieważnimy go i złożysz wniosek o nowy.' }, { k: 'pesel', l: 'Zastrzeż też PESEL', typ: 'tak', v: 'tak' }] },
    ],
    przycisk: 'Zastrzeż i zablokuj', wysylka: ['Zastrzegam dowód w bankach…', 'Blokuję dowód w rejestrze…'],
    wynik: (v, o, api) => {
      const d = wiele(v.dok); if (tak(v.pesel)) api.pesel(true);
      const cd = ['Jeśli dokument się znajdzie, odblokujesz go w aplikacji.'];
      if (d.includes('Karty płatnicze')) cd.unshift('Zadzwoń pod +48 828 828 828 (Zastrzegam.pl) albo zastrzeż karty w aplikacji banku.');
      if (d.includes('Prawo jazdy')) cd.push('mPrawo jazdy w telefonie działa dalej. Wtórnik zamówisz w wydziale komunikacji.');
      if (v.co === 'Skradzione') cd.unshift('Zgłoś kradzież na policji. Zaświadczenie przyda się w banku.');
      return {
        tytul: 'Dokumenty zabezpieczone', opis: 'Banki i operatorzy już widzą zastrzeżenie.', wiersze: [['Dowód osobisty', o.moje.nr_dowodu], ['Zastrzeżenie w bankach', tak(v.zastrz) ? 'tak' : 'nie'], ['Blokada', tak(v.blok) ? 'do ' + za(14) : 'nie'], ['PESEL', tak(v.pesel) ? 'zastrzeżony' : 'bez zmian']],
        coDalej: cd, sprawa: sprawa('Utrata dowodu osobistego', 'Rejestr Dowodów Osobistych', 'dokument', 'Blokada do ' + za(14).slice(0, 5), [['Zgłoszenie utraty', dzis.slice(0, 5), 2], ['Zastrzeżenie i blokada', 'teraz', 2], ['Decyzja: odblokuj albo unieważnij', 'do ' + za(14).slice(0, 5), 1], ['Wniosek o nowy dowód', '', 0]], 'Dowód się znalazł? Odblokujesz go jednym dotknięciem. Jeśli nie, unieważnimy go po 14 dniach.'),
        dalej: [{ t: 'Złóż wniosek o nowy dowód', trasa: '/usluga/wniosek-dowod' }],
      };
    },
  },
  {
    id: 'wniosek-dowod', t: 'Wniosek o dowód osobisty', opis: 'Wniosek tutaj, odciski palców w urzędzie', kat: 'dokumenty', ik: 'id', slowa: 'nowy dowod traci waznosc wymiana dowodu',
    karta: o => ({ czas: 'ok. 5 minut', oplata: 'bezpłatnie', potrzebne: ['Aktualne zdjęcie (zrobisz je telefonem)', 'Wizyta w urzędzie na odciski palców w ciągu 30 dni'], jak: ['Wybierasz powód i urząd odbioru', 'Robisz zdjęcie według wskazówek', `Idziesz do urzędu (${o.sc.urzad.split(',')[0]}) na odciski palców`, 'Dowód gotowy do 30 dni, dostaniesz powiadomienie'] }),
    kroki: o => [
      { t: 'Powód', opis: `Twój obecny dowód: ${o.moje.dowod}.`, pola: [{ k: 'pow', l: 'Dlaczego składasz wniosek?', typ: 'wybor', opcje: [{ t: 'Kończy się ważność', o: 'Najczęstszy powód' }, { t: 'Utrata dowodu', o: 'Zgubiony, skradziony albo zniszczony' }, { t: 'Zmiana danych', o: 'Np. nazwisko po ślubie' }, { t: 'Zmiana wizerunku', o: 'Nie da się Cię rozpoznać na zdjęciu' }] }] },
      { t: 'Zdjęcie', opis: 'Jasne tło, patrzysz prosto, bez okularów przeciwsłonecznych i nakrycia głowy.', pola: [{ k: 'foto', l: 'Zdjęcie do dowodu', typ: 'plik', plik: 'zdjecie-do-dowodu.jpg', wym: true, podp: 'Urząd może poprosić o nowe zdjęcie, jeśli to nie spełni wymagań.' }] },
      { t: 'Odbiór', pola: [{ k: 'urzad', l: 'Gdzie odbierzesz dowód?', typ: 'wybor', opcje: [{ t: o.sc.urzad, o: 'Najbliżej adresu zameldowania' }, { t: `Urząd w centrum, ${o.sc.miasto}`, o: 'Kolejka zwykle krótsza rano' }, { t: 'Dowolny urząd w Polsce', o: 'Wybierzesz przy wizycie' }] }, { k: 'sms', l: 'Powiadom SMS-em, gdy dowód będzie gotowy', typ: 'tak', v: 'tak' }] },
    ],
    zgoda: 'Oświadczam, że dane we wniosku są zgodne z prawdą.',
    podsumowanie: (v, o) => [[K(o, 'Wnioskodawczyni', 'Wnioskodawca'), o.moje.imie_nazwisko], ['PESEL', peselM(o)], ['Powód', v.pow], ['Zdjęcie', v.foto ? 'dodane' : 'brak'], ['Odbiór', v.urzad], ['Wizyta w urzędzie', 'do ' + za(30)], ['Opłata', 'bezpłatnie']],
    przycisk: 'Podpisz i wyślij', wysylka: ['Podpisuję wniosek…', 'Wysyłam do urzędu…'],
    wynik: (v, o, api) => {
      api.zalatw('renew');
      api.pismo({ od: v.urzad, t: 'Wniosek o dowód osobisty przyjęty', k: 'dokumenty', nowe: 1, skrot: ['Wniosek wpłynął do urzędu.', 'Przyjdź na odciski palców w ciągu 30 dni.'], q: '' });
      return { tytul: 'Wniosek złożony', opis: 'Teraz umów się do urzędu na odciski palców.', wiersze: [['Numer wniosku', nr('DO')], ['Wizyta w urzędzie', 'do ' + za(30)], ['Gotowy', 'do 30 dni od wizyty']],
        coDalej: ['Weź ze sobą obecny dowód (jeśli go masz).', 'W urzędzie złożysz odciski palców i podpis na tablecie.', 'Gdy dowód będzie gotowy, dostaniesz SMS i powiadomienie.'],
        sprawa: sprawa('Nowy dowód osobisty', v.urzad, 'dokument', 'Wizyta do ' + za(30).slice(0, 5), [['Wniosek złożony', dzis.slice(0, 5), 2], ['Odciski palców w urzędzie', 'do ' + za(30).slice(0, 5), 1], ['Produkcja dowodu', 'do 30 dni', 0], ['Gotowy do odbioru', '', 0]], 'Na wizytę weź obecny dowód. Odbierzesz nowy osobiście.') };
    },
  },
  {
    id: 'niekaralnosc', t: 'Zaświadczenie o niekaralności', opis: 'Z Krajowego Rejestru Karnego', kat: 'dokumenty', ik: 'cert', slowa: 'krk karalnosc zaswiadczenie praca',
    karta: () => ({ czas: 'ok. 3 minut, zaświadczenie zwykle w kilka minut', oplata: '20 zł (online)', potrzebne: ['Imiona rodziców i nazwisko rodowe (uzupełnimy z rejestru PESEL)'], jak: ['Wybierasz cel', 'Płacisz 20 zł', 'Dostajesz PDF z podpisem elektronicznym do skrzynki'] }),
    kroki: o => [
      { t: 'Cel', pola: [{ k: 'cel', l: 'Do czego potrzebujesz zaświadczenia?', typ: 'wybor', opcje: [{ t: 'Praca', o: 'Np. szkoła, ochrona, administracja' }, { t: 'Praca z dziećmi', o: 'Pracodawca sprawdzi też rejestr sprawców przestępstw seksualnych' }, { t: 'Urząd albo sąd', o: 'Np. licencja, pozwolenie' }, { t: 'Za granicę', o: 'Możesz wybrać tłumaczenie' }] }] },
      { t: 'Twoje dane', opis: 'Uzupełniliśmy je z rejestru PESEL.', pola: [{ k: 'rodzice', l: 'Imiona rodziców', v: o.dane.rodzice, wym: true }, { k: 'rodowe', l: 'Nazwisko rodowe', v: o.nazwisko, wym: true }, { k: 'jezyk', l: 'Język zaświadczenia', typ: 'wybor', opcje: ['Polski', 'Polski i angielski'], gdy: v => v.cel === 'Za granicę' }] },
    ],
    podsumowanie: (v, o) => [['Osoba', o.moje.imie_nazwisko], ['PESEL', peselM(o)], ['Imiona rodziców', v.rodzice], ['Cel', v.cel], ...(v.cel === 'Za granicę' ? [['Język', v.jezyk] as Wiersz] : []), ['Opłata', '20 zł']],
    przycisk: 'Zapłać 20 zł i wyślij', platnosc: true, wysylka: ['Płatność BLIK…', 'Sprawdzam Krajowy Rejestr Karny…', 'Podpisuję zaświadczenie…'],
    wynik: (v, o, api) => {
      api.zaplac('Zaświadczenie z KRK', '20,00 zł');
      api.pismo({ od: 'Krajowy Rejestr Karny', t: 'Zaświadczenie o niekaralności', k: 'dokumenty', nowe: 1, skrot: [`${o.imie} ${o.nazwisko} nie figuruje w Krajowym Rejestrze Karnym.`, 'Plik PDF z podpisem, gotowy do wysłania pracodawcy.'], q: '' });
      return { tytul: 'Zaświadczenie gotowe', opis: 'PDF jest w Twojej skrzynce. Pracodawca sprawdzi jego autentyczność online.', wiersze: [['Cel', v.cel], ['Opłata', '20 zł, zapłacono']],
        dok: { naglowek: 'Krajowy Rejestr Karny', tytul: 'Zaświadczenie o niekaralności', nr: nr('KRK'), tresc: [['Osoba', o.moje.imie_nazwisko], ['PESEL', o.moje.pesel], ['Imiona rodziców', v.rodzice], ['Treść', 'nie figuruje w kartotece']], stopka: 'Dokument elektroniczny z kwalifikowaną pieczęcią' },
        coDalej: ['Wyślij PDF pracodawcy prosto ze skrzynki.', 'Zaświadczenie jest ważne, dopóki pracodawca je przyjmuje (zwykle do 3 miesięcy).'], dalej: [{ t: 'Otwórz skrzynkę', trasa: '/skrzynka' }] };
    },
  },
  {
    id: 'blad-danych', t: 'Zgłoś błąd w danych', opis: 'Popraw dane w rejestrze PESEL', kat: 'dokumenty', ik: 'edit', slowa: 'blad pomylka zle dane korekta popraw',
    karta: () => ({ czas: 'ok. 2 minut, poprawka zwykle do 7 dni', oplata: 'bezpłatnie', potrzebne: ['Dokument z poprawnymi danymi, np. akt małżeństwa (jeśli go masz)'], jak: ['Wskazujesz, które dane są błędne', 'Podajesz poprawne dane i dodajesz dokument', 'Urząd poprawia rejestr PESEL i daje Ci znać'] }),
    kroki: o => [
      { t: 'Co jest błędne?', pola: [{ k: 'co', l: 'Które dane są błędne?', typ: 'wybor', opcje: [{ t: 'Imię lub nazwisko', o: o.moje.imie_nazwisko }, { t: 'Adres zameldowania', o: o.dane.zamel }, { t: 'Stan cywilny', o: o.dane.stan }, { t: 'Imiona rodziców', o: o.dane.rodzice }, { t: 'Data lub miejsce urodzenia', o: o.dane.urodz }, { t: 'Coś innego' }] }] },
      { t: 'Jak powinno być?', pola: [{ k: 'popr', l: 'Poprawne dane', ph: 'Wpisz, jak powinno być', wym: true }, { k: 'opis', l: 'Wyjaśnienie (opcjonalnie)', typ: 'dlugi', ph: 'Np. zmiana nazwiska po ślubie w 2024 r.' }, { k: 'dok', l: 'Dokument potwierdzający (opcjonalnie)', typ: 'plik', plik: 'dokument-potwierdzajacy.pdf' }] },
    ],
    zgoda: 'Oświadczam, że podane dane są zgodne z prawdą.',
    podsumowanie: (v, o) => {
      const teraz: V = { 'Imię lub nazwisko': o.moje.imie_nazwisko, 'Adres zameldowania': o.dane.zamel, 'Stan cywilny': o.dane.stan, 'Imiona rodziców': o.dane.rodzice, 'Data lub miejsce urodzenia': o.dane.urodz };
      return [['Błędne dane', v.co], ...(teraz[v.co] ? [['Teraz w rejestrze', teraz[v.co]] as Wiersz] : []), ['Powinno być', v.popr], ['Dokument', v.dok ? 'dodany' : 'brak'], ['Opłata', 'bezpłatnie']];
    },
    wysylka: ['Podpisuję zgłoszenie…', 'Wysyłam do urzędu…'],
    wynik: (v, o, api) => {
      api.pismo({ od: `Urząd, ${o.sc.miasto}`, t: 'Zgłoszenie błędu w danych przyjęte', k: 'dokumenty', nowe: 1, skrot: [`Zgłoszenie dotyczy: ${v.co.toLowerCase()}.`, 'Urząd sprawdzi dane i da Ci znać o poprawce.'], q: '' });
      return { tytul: 'Zgłoszenie wysłane', opis: 'Urząd sprawdzi dane i poprawi rejestr PESEL.', wiersze: [['Dotyczy', v.co], ['Numer sprawy', nr('KD')]],
        coDalej: ['Urząd może poprosić o oryginał dokumentu.', 'Po poprawce zaktualizujemy dane w aplikacji. Dowodu nie musisz wymieniać, chyba że zmieniło się imię lub nazwisko.'],
        sprawa: sprawa('Poprawka danych w rejestrze PESEL', `Urząd, ${o.sc.miasto}`, 'dokument', 'Do 7 dni', [['Zgłoszenie', dzis.slice(0, 5), 2], ['Weryfikacja w urzędzie', 'w toku', 1], ['Poprawka w rejestrze', '', 0]], 'Dostaniesz powiadomienie, gdy dane zostaną poprawione.') };
    },
  },
  {
    id: 'brak-dokumentu', t: 'Brak dokumentu w rejestrze', opis: 'Poprosimy wystawcę o dodanie', kat: 'dokumenty', ik: 'doc', ukryta: true,
    karta: () => ({ czas: 'ok. 2 minut, odpowiedź zwykle do 7 dni', oplata: 'bezpłatnie', potrzebne: ['Wiesz, kto wydał dokument'], jak: ['Nie znaleźliśmy tego dokumentu w rejestrach', 'Wysyłamy zapytanie do wystawcy, np. szkoły albo uczelni', 'Gdy wystawca go doda, pojawi się w Twoim portfelu'] }),
    kroki: (_, __, p) => [
      { t: 'Którego dokumentu brakuje?', pola: [{ k: 'dok', l: 'Którego dokumentu brakuje?', typ: 'wybor', v: p.dok, opcje: ['mLegitymacja szkolna', 'mLegitymacja studencka', 'mLegitymacja doktoranta', 'Karta Dużej Rodziny', 'Legitymacja emeryta-rencisty', 'Legitymacja osoby niepełnosprawnej', 'Diia.pl'] }] },
      { t: 'Kto go wydał?', pola: [{ k: 'kto', l: 'Wystawca', ph: 'Np. Szkoła Podstawowa nr 41, Uniwersytet', wym: true }, { k: 'nr', l: 'Numer dokumentu (opcjonalnie)' }, { k: 'foto', l: 'Zdjęcie dokumentu (opcjonalnie)', typ: 'plik', plik: 'zdjecie-dokumentu.jpg' }] },
    ],
    przycisk: 'Wyślij zapytanie', bezFaceId: true, wysylka: ['Wysyłam zapytanie do wystawcy…'],
    wynik: v => ({ tytul: 'Zapytanie wysłane', opis: `${v.kto} dostał prośbę o dodanie dokumentu do rejestru.`, wiersze: [['Dokument', v.dok], ['Wystawca', v.kto]],
      sprawa: sprawa(`Brakujący dokument: ${v.dok}`, v.kto, 'dokument', 'Odpowiedź do 7 dni', [['Zapytanie', dzis.slice(0, 5), 2], ['Odpowiedź wystawcy', 'w toku', 1], ['Dokument w portfelu', '', 0]], 'Gdy dokument pojawi się w rejestrze, dodamy go do portfela.') }),
  },
  { id: 'sprawdz', t: 'Sprawdź dokument innej osoby', opis: 'Bez kserowania dowodu', kat: 'dokumenty', ik: 'scan', ekran: '/sprawdz', slowa: 'weryfikacja tozsamosc najemca' },
  { id: 'dodaj-dokument', t: 'Dodaj dokument', opis: 'Legitymacja, KDR, Diia.pl i inne', kat: 'dokumenty', ik: 'plus', ekran: '/dodaj-dokument', slowa: 'legitymacja karta' },
  {
    id: 'profil-zaufany', t: 'Profil Zaufany', opis: 'Przedłuż ważność albo zmień dane', kat: 'dokumenty', ik: 'key', slowa: 'profil zaufany epuap podpis login.gov',
    karta: () => ({ czas: 'ok. 1 minuty', oplata: 'bezpłatnie', potrzebne: ['Nic więcej'], jak: ['Twój Profil Zaufany jest ważny 3 lata', 'Przedłużysz go tutaj o kolejne 3 lata', 'Dzięki niemu podpisujesz wnioski i logujesz się do urzędów'] }),
    kroki: o => [{ t: 'Profil Zaufany', opis: 'Ważny do 14.03.2027.', pola: [{ k: 'co', l: 'Co chcesz zrobić?', typ: 'wybor', opcje: [{ t: 'Przedłuż o 3 lata', o: 'Do 14.03.2030' }, { t: 'Zmień e-mail i telefon', o: `Teraz: ${o.dane.mail}` }] }] }],
    przycisk: 'Potwierdź',
    wynik: v => ({ tytul: v.co.startsWith('Przedłuż') ? 'Profil przedłużony' : 'Dane zmienione', wiersze: [['Profil Zaufany', v.co.startsWith('Przedłuż') ? 'ważny do 14.03.2030' : 'dane kontaktowe zaktualizowane']] }),
  },

  /* =================== ZAMELDOWANIE I AKTY =================== */
  {
    id: 'zameldowanie', t: 'Zameldowanie', opis: 'Online, bez wizyty w urzędzie', kat: 'mieszkanie', ik: 'house', slowa: 'meldunek przeprowadzka adres',
    karta: () => ({ czas: 'ok. 4 minut, decyzja zwykle 1-3 dni', oplata: 'bezpłatnie', potrzebne: ['Nowy adres', 'Zgoda właściciela (potwierdzi w swoim mObywatelu) albo umowa najmu'], jak: ['Podajesz adres i rodzaj pobytu', 'Właściciel potwierdza online albo dodajesz umowę', 'Urząd melduje Cię i przysyła potwierdzenie'] }),
    kroki: o => [
      { t: 'Rodzaj pobytu', pola: [{ k: 'rodz', l: 'Jak długo tu mieszkasz?', typ: 'wybor', opcje: [{ t: 'Pobyt stały', o: 'To Twoje główne miejsce zamieszkania. Wymeldujemy Cię automatycznie z poprzedniego.' }, { t: 'Pobyt czasowy', o: 'Np. studia, praca w innym mieście. Do 3 lat.' }] }, { k: 'do', l: 'Do kiedy', ph: 'np. 30.06.2027', wym: true, gdy: v => v.rodz === 'Pobyt czasowy' }] },
      { t: 'Adres', pola: [{ k: 'ulica', l: 'Ulica i numer', ph: 'np. ul. Słoneczna 4 m. 2', wym: true }, { k: 'kod', l: 'Kod pocztowy', ph: '00-000', wym: true, num: true }, { k: 'miasto', l: 'Miejscowość', v: o.sc.miasto, wym: true }, { k: 'od', l: 'Mieszkasz tu od', v: dzis, wym: true }] },
      { t: 'Prawo do lokalu', pola: [{ k: 'wl', l: 'Kto jest właścicielem?', typ: 'wybor', opcje: [{ t: K(o, 'Jestem właścicielką', 'Jestem właścicielem'), o: 'Sprawdzimy to w księdze wieczystej' }, { t: 'Właściciel potwierdzi online', o: 'Wyślemy mu prośbę do mObywatela' }, { t: 'Wynajmuję', o: 'Dodaj umowę najmu' }] }, { k: 'umowa', l: 'Umowa najmu', typ: 'plik', plik: 'umowa-najmu.pdf', wym: true, gdy: v => v.wl === 'Wynajmuję' }, { k: 'tel', l: 'Telefon właściciela', ph: '+48', gdy: v => v.wl === 'Właściciel potwierdzi online', num: true }] },
    ],
    zgoda: 'Oświadczam, że mieszkam pod podanym adresem.',
    podsumowanie: (v, o) => [['Osoba', o.moje.imie_nazwisko], ['Rodzaj', v.rodz + (v.do ? ` do ${v.do}` : '')], ['Adres', `${v.ulica}, ${v.kod} ${v.miasto}`], ['Od', v.od], ['Prawo do lokalu', v.wl], ['Opłata', 'bezpłatnie']],
    wysylka: ['Podpisuję wniosek…', 'Wysyłam do urzędu gminy…'],
    wynik: (v, o, api) => {
      api.pismo({ od: `Urząd, ${v.miasto}`, t: 'Wniosek o zameldowanie przyjęty', k: 'mieszkanie', nowe: 1, skrot: [`Wniosek o zameldowanie (${v.rodz.toLowerCase()}) wpłynął do urzędu.`, 'Potwierdzenie przyjdzie do tej skrzynki.'], q: '' });
      return { tytul: 'Wniosek wysłany', opis: 'Urząd sprawdzi wniosek i przyśle potwierdzenie zameldowania.', wiersze: [['Adres', `${v.ulica}, ${v.miasto}`], ['Numer sprawy', nr('ZM')]],
        coDalej: [...(v.wl === 'Właściciel potwierdzi online' ? ['Właściciel dostał prośbę w swoim mObywatelu. Ma 7 dni na potwierdzenie.'] : []), 'Dane w dowodzie się nie zmienią, nie musisz go wymieniać.', 'Zaktualizuj adres w banku i u pracodawcy.'],
        sprawa: sprawa('Zameldowanie', `Urząd, ${v.miasto}`, 'mieszkanie', 'Decyzja w 1-3 dni', [['Wniosek złożony', dzis.slice(0, 5), 2], [v.wl === 'Właściciel potwierdzi online' ? 'Potwierdzenie właściciela' : 'Weryfikacja w urzędzie', 'w toku', 1], ['Zameldowanie', '', 0]], 'Potwierdzenie przyjdzie do skrzynki e-Doręczeń.') };
    },
  },
  {
    id: 'wymeldowanie', t: 'Wymeldowanie', opis: 'Z pobytu stałego lub czasowego', kat: 'mieszkanie', ik: 'out', slowa: 'wymeldowac meldunek wyprowadzka',
    karta: () => ({ czas: 'ok. 1 minuty', oplata: 'bezpłatnie', potrzebne: ['Nic więcej'], jak: ['Wybierasz, z którego pobytu', 'Podpisujesz PIN-em mObywatela', 'Wymeldowanie działa od wybranego dnia'] }),
    kroki: o => [{ t: 'Wymeldowanie', pola: [{ k: 'z', l: 'Z którego adresu?', typ: 'wybor', opcje: [{ t: o.dane.zamel, o: `Pobyt stały od ${o.dane.zamelOd}` }] }, { k: 'od', l: 'Od kiedy', v: dzis, wym: true }] }],
    wynik: v => ({ tytul: 'Wymeldowano', opis: 'Pamiętaj o zameldowaniu pod nowym adresem.', wiersze: [['Adres', v.z], ['Od', v.od]], dalej: [{ t: 'Zamelduj się pod nowym adresem', trasa: '/usluga/zameldowanie' }] }),
  },
  {
    id: 'zaswiadczenie-zameldowanie', t: 'Zaświadczenie o zameldowaniu', opis: 'PDF od ręki, bezpłatnie', kat: 'mieszkanie', ik: 'cert', slowa: 'meldunek zaswiadczenie adres',
    karta: () => ({ czas: 'kilka sekund', oplata: 'bezpłatnie w aplikacji', potrzebne: ['Nic więcej'], jak: ['Wybierasz rodzaj pobytu i cel', 'Zaświadczenie od razu trafia do skrzynki jako PDF'] }),
    kroki: () => [{ t: 'Zaświadczenie', pola: [{ k: 'rodz', l: 'Rodzaj pobytu', typ: 'wybor', opcje: ['Pobyt stały', 'Pobyt czasowy'] }, { k: 'cel', l: 'Do czego?', typ: 'wybor', opcje: ['Pracodawca', 'Bank', 'Urząd', 'Szkoła albo przedszkole', 'Inny cel'] }] }],
    przycisk: 'Pobierz zaświadczenie', bezFaceId: true, wysylka: ['Pobieram dane z rejestru PESEL…'],
    wynik: (v, o, api) => {
      api.pismo({ od: 'Rejestr PESEL', t: 'Zaświadczenie o zameldowaniu', k: 'mieszkanie', nowe: 1, skrot: [`Potwierdza zameldowanie pod adresem ${o.dane.zamel}.`, 'Plik PDF z pieczęcią, gotowy do wysłania.'], q: '' });
      return { tytul: 'Zaświadczenie gotowe', opis: 'PDF jest w Twojej skrzynce.', wiersze: [],
        dok: { naglowek: 'Rejestr PESEL · Minister Cyfryzacji', tytul: 'Zaświadczenie o zameldowaniu', nr: nr('ZZ'), tresc: [['Osoba', o.moje.imie_nazwisko], ['PESEL', o.moje.pesel], ['Adres', o.dane.zamel], ['Rodzaj pobytu', v.rodz.toLowerCase()], ['Od', o.dane.zamelOd], ['Cel', v.cel]], stopka: 'Dokument z kwalifikowaną pieczęcią elektroniczną' },
        dalej: [{ t: 'Otwórz skrzynkę', trasa: '/skrzynka' }] };
    },
  },
  {
    id: 'odpis', t: 'Odpis aktu stanu cywilnego', opis: 'Urodzenia, małżeństwa, zgonu', kat: 'mieszkanie', ik: 'doc', slowa: 'akt urodzenia malzenstwa zgonu usc',
    karta: () => ({ czas: 'ok. 3 minut, odpis w 1-7 dni', oplata: '22 zł (skrócony), 33 zł (zupełny)', potrzebne: ['Wiesz, kogo dotyczy akt'], jak: ['Wybierasz akt i rodzaj odpisu', 'Płacisz online', 'Odpis przychodzi do skrzynki albo pocztą'] }),
    kroki: o => [
      { t: 'Jaki akt', pola: [{ k: 'akt', l: 'Rodzaj aktu', typ: 'wybor', opcje: ['Urodzenia', 'Małżeństwa', 'Zgonu'] }, { k: 'kogo', l: 'Kogo dotyczy?', typ: 'wybor', opcje: [o.moje.imie_nazwisko, ...dzieci(o).map(m => `${m.imie} (dziecko)`), 'Inna osoba'] }, { k: 'inna', l: 'Imię i nazwisko', wym: true, gdy: v => v.kogo === 'Inna osoba' }] },
      { t: 'Rodzaj odpisu', pola: [{ k: 'typ', l: 'Jaki odpis?', typ: 'wybor', opcje: [{ t: 'Skrócony', o: 'Wystarczy w większości urzędów. 22 zł' }, { t: 'Zupełny', o: 'Pełna historia aktu, np. do spraw spadkowych. 33 zł' }, { t: 'Wielojęzyczny', o: 'Do użytku w krajach UE. 22 zł' }] }, { k: 'dost', l: 'Doręczenie', typ: 'wybor', opcje: [{ t: 'Do skrzynki e-Doręczeń', o: 'Najszybciej' }, { t: 'Pocztą', o: `Na adres ${o.dane.zamel}` }] }] },
    ],
    podsumowanie: v => [['Akt', v.akt], ['Osoba', v.kogo === 'Inna osoba' ? v.inna : v.kogo], ['Odpis', v.typ], ['Doręczenie', v.dost], ['Opłata', v.typ === 'Zupełny' ? '33 zł' : '22 zł']],
    przycisk: 'Zapłać i wyślij', platnosc: true, wysylka: ['Płatność BLIK…', 'Wysyłam do urzędu stanu cywilnego…'],
    wynik: v => ({ tytul: 'Wniosek złożony', opis: 'Odpis zwykle w ciągu kilku dni.', wiersze: [['Odpis', `akt ${v.akt.toLowerCase()}, ${v.typ.toLowerCase()}`], ['Opłata', (v.typ === 'Zupełny' ? '33' : '22') + ' zł, zapłacono']],
      sprawa: sprawa(`Odpis aktu ${v.akt.toLowerCase()}`, 'Urząd Stanu Cywilnego', 'mieszkanie', 'Do 7 dni', [['Wniosek i opłata', dzis.slice(0, 5), 2], ['Wydanie odpisu w USC', 'w toku', 1], [v.dost === 'Pocztą' ? 'Wysyłka pocztą' : 'Doręczenie do skrzynki', '', 0]], 'Dostaniesz powiadomienie, gdy odpis będzie gotowy.') }),
  },

  /* =================== POJAZDY =================== */
  { id: 'oc-badanie', t: 'OC i badanie techniczne', opis: 'Terminy dla Twoich aut', kat: 'pojazdy', ik: 'car', slowa: 'ubezpieczenie polisa przeglad badanie', ekranInfo: 'oc-badanie', dostepna: o => o.docs.some(d => d.id === 'auto') },
  { id: 'punkty', t: 'Punkty karne', opis: 'Stan konta i wygasanie punktów', kat: 'pojazdy', ik: 'clock', slowa: 'mandat punkty karne limit', ekranInfo: 'punkty', dostepna: o => o.docs.some(d => d.id === 'pj') },
  { id: 'mandaty', t: 'Mandaty', opis: 'Opłać i sprawdź historię', kat: 'pojazdy', ik: 'receipt', slowa: 'mandat kara grzywna policja', ekran: '/platnosci' },
  {
    id: 'mstluczka', t: 'mStłuczka', opis: 'Oświadczenie o kolizji bez druku', kat: 'pojazdy', ik: 'car', slowa: 'kolizja stluczka wypadek oswiadczenie szkoda', dostepna: o => o.docs.some(d => d.id === 'auto'),
    karta: () => ({ czas: 'ok. 5 minut', oplata: 'bezpłatnie', potrzebne: ['Drugi kierowca z mObywatelem w telefonie', 'Oba auta zarejestrowane w Polsce', 'Zgoda co do tego, kto spowodował zdarzenie'], jak: ['Wybierasz swoją rolę i opisujesz zdarzenie', 'Pokazujesz kod QR drugiemu kierowcy', 'Drugi kierowca skanuje go w swoim mObywatelu i potwierdza szczegóły', 'Oświadczenie trafia do Was obu i do ubezpieczyciela'] }),
    kroki: o => [
      { t: 'Bezpieczeństwo', pola: [{ k: 'ranni', l: 'Czy ktoś jest ranny?', typ: 'wybor', opcje: [{ t: 'Nie, nikt', o: 'Możemy spisać oświadczenie' }, { t: 'Tak albo nie wiem', o: 'Zadzwoń pod 112' }] }, { k: 'znaki', l: 'Włączone światła awaryjne i trójkąt', typ: 'tak', v: 'tak' }], stop: v => (v.ranni.startsWith('Tak') ? 'Przy rannych nie spisujemy oświadczenia. Zadzwoń pod 112 i udziel pomocy. Policja spisze zdarzenie.' : null) },
      { t: 'Kim jesteś w tym zdarzeniu?', pola: [{ k: 'rola', l: 'Kim jesteś w tym zdarzeniu?', typ: 'wybor', opcje: [{ t: K(o, 'Poszkodowana', 'Poszkodowany'), o: 'Zdarzenie spowodował drugi kierowca. Szkodę pokryje jego OC.' }, { t: K(o, 'Sprawczyni', 'Sprawca'), o: 'Zdarzenie spowodowało Twoje auto. Szkodę drugiego kierowcy pokryje Twoje OC.' }] }] },
      { t: 'Które auto brało udział?', pola: [{ k: 'tw', l: 'Które auto brało udział?', typ: 'wybor', opcje: auta(o) }] },
      { t: 'Co się stało?', opis: 'Zaznacz wszystko, co pasuje.', pola: [{ k: 'co', l: 'Okoliczności', typ: 'wiele', opcje: ['Cofanie', 'Wyjazd z parkingu', 'Brak odstępu', 'Zmiana pasa', 'Wymuszenie pierwszeństwa', 'Skręt w lewo', 'Otwarcie drzwi'] }, { k: 'opis', l: 'Opis (opcjonalnie)', typ: 'dlugi', ph: 'Krótko, własnymi słowami' }] },
      { t: 'Miejsce i zdjęcia', pola: [{ k: 'gdzie', l: 'Miejsce', v: o.sc.miejsce, wym: true, podp: 'Ustaliliśmy je z lokalizacji telefonu.' }, { k: 'foto', l: 'Zdjęcia uszkodzeń', typ: 'plik', plik: '4 zdjęcia', wym: true }] },
    ],
    zgoda: 'Potwierdzam, że opis zdarzenia jest zgodny z prawdą.',
    podsumowanie: (v, o) => [['Twoja rola', v.rola], ['Twoje auto', v.tw], ['Kierowca', o.moje.imie_nazwisko], ['Okoliczności', wiele(v.co).join(', ') || 'brak'], ['Miejsce', v.gdzie], ['Zdjęcia', v.foto], ['Data', `${dzis}, ${new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`], ['Drugi kierowca', 'dane pobierzemy z jego kodu']],
    przycisk: 'Podpisz i pokaż kod',
    qr: v => ({ tytul: 'Pokaż kod drugiemu kierowcy', opis: 'Drugi kierowca otwiera mStłuczkę w swoim mObywatelu, wybiera „Dołącz” i skanuje ten kod.', kto: 'Piotr Lis',
      druga: [['Kierowca', 'Piotr Lis'], ['Pojazd', 'WPI 22R31, Volkswagen Passat'], ['OC', 'TU Bałtyk, polisa BA/2026/118 204'], ['Rola', v.rola.startsWith('Poszkodowan') ? 'sprawca' : 'poszkodowany']] }),
    wysylka: ['Pieczętuję oświadczenie…', 'Wysyłam do ubezpieczyciela…'],
    wynik: (v, o) => {
      const sprawca = !v.rola.startsWith('Poszkodowan');
      return {
        tytul: 'Oświadczenie gotowe', opis: sprawca ? 'Drugi kierowca zgłosi szkodę z Twojego OC. Oświadczenie już ma.' : 'Zgłosiliśmy szkodę do ubezpieczyciela sprawcy.',
        wiersze: [['Numer oświadczenia', nr('mS')], ['Drugi kierowca', 'Piotr Lis, WPI 22R31'], ...(sprawca ? [] : [['Numer szkody', nr('SZ')] as Wiersz])],
        dok: { naglowek: 'mStłuczka', tytul: 'Wspólne oświadczenie o zdarzeniu drogowym', nr: nr('mS'), tresc: [['Kierowca A', o.moje.imie_nazwisko], ['Pojazd A', v.tw], ['Kierowca B', 'Piotr Lis'], ['Pojazd B', 'WPI 22R31, Volkswagen Passat'], ['Sprawca', sprawca ? 'kierowca A' : 'kierowca B'], ['Miejsce', v.gdzie]], stopka: 'Potwierdzone przez obu kierowców, opatrzone pieczęcią elektroniczną' },
        coDalej: sprawca ? ['Nie musisz nic więcej robić.', 'Oświadczenie jest w mStłuczce przez 3 lata.'] : ['Ubezpieczyciel skontaktuje się w ciągu 7 dni.', 'Zrób wycenę albo naprawę w warsztacie partnerskim.', 'Wypłata zwykle do 30 dni.'],
        sprawa: sprawca ? undefined : sprawa('Szkoda z OC sprawcy', 'TU Bałtyk', 'pojazd', 'Odpowiedź do 7 dni', [['Zgłoszenie szkody', dzis.slice(0, 5), 2], ['Oględziny pojazdu', 'w toku', 1], ['Decyzja ubezpieczyciela', '', 0], ['Wypłata', 'do 30 dni', 0]], 'Ubezpieczyciel zadzwoni, żeby umówić oględziny.'),
      };
    },
  },
  {
    id: 'historia-pojazdu', t: 'Historia pojazdu', opis: 'Sprawdź auto przed zakupem', kat: 'pojazdy', ik: 'search', slowa: 'kupuje auto uzywane vin przebieg licznik', bezFaceId: true,
    karta: () => ({ czas: 'kilka sekund', oplata: 'bezpłatnie', potrzebne: ['Numer rejestracyjny, VIN i data pierwszej rejestracji (z dowodu rejestracyjnego)'], jak: ['Wpisujesz dane z dowodu rejestracyjnego', 'Pokazujemy przebieg z badań, właścicieli, szkody i polisy'] }),
    kroki: () => [{ t: 'Dane pojazdu', opis: 'Numer rejestracyjny, VIN i datę pierwszej rejestracji znajdziesz w dowodzie rejestracyjnym auta.', pola: [{ k: 'nr', l: 'Numer rejestracyjny', v: 'WE 4K221', wym: true }, { k: 'vin', l: 'VIN', v: 'WVWZZZAUZKW118204', wym: true }, { k: 'data', l: 'Data pierwszej rejestracji', v: '14.03.2019', wym: true }] }],
    przycisk: 'Sprawdź historię', wysylka: ['Szukam w CEPiK…', 'Sprawdzam bazę UFG…'],
    wynik: v => ({
      tytul: 'Volkswagen Golf 1.5 TSI, 2019', ikona: 'alert', opis: 'Uwaga: przebieg się cofnął. Zapytaj sprzedającego o różnicę albo sprawdź auto u mechanika.',
      wiersze: [['Numer', v.nr.toUpperCase()], ['Właściciele', '3'], ['OC', 'ważne do 02.2027'], ['Badanie techniczne', 'ważne do 05.2027']],
      wykres: { t: 'Przebieg z badań technicznych', jedn: 'tys. km', dane: [['2020', 18], ['2021', 41], ['2022', 66], ['2023', 89], ['2024', 112], ['2025', 87, true]] },
      os: [['03.2019', 'Pierwsza rejestracja w Polsce'], ['06.2021', 'Zmiana właściciela'], ['11.2022', 'Szkoda istotna zgłoszona przez ubezpieczyciela', true], ['05.2025', 'Badanie: 87 400 km, mniej niż rok wcześniej', true], ['08.2026', 'Zmiana właściciela']],
      kontrola: [['Kradzież', 'brak zgłoszeń', true], ['Wyrejestrowanie', 'nie', true], ['Szkody istotne', '1 (2022)', false], ['Przebieg', 'niezgodny', false]],
      dalej: [{ t: 'Zarejestruj kupione auto', trasa: '/usluga/rejestracja-pojazdu' }],
    }),
  },
  {
    id: 'rejestracja-pojazdu', t: 'Rejestracja pojazdu', opis: 'Po zakupie używanego auta', kat: 'pojazdy', ik: 'car', slowa: 'rejestracja auta kupilem tablice dowod rejestracyjny',
    karta: () => ({ czas: 'ok. 5 minut, odbiór w urzędzie', oplata: '180,50 zł (z nowymi tablicami)', potrzebne: ['Umowa kupna albo faktura', 'Dowód rejestracyjny auta', 'Polisa OC na Ciebie'], jak: ['Dodajesz umowę i dane auta', 'Płacisz online', 'Odbierasz dowód rejestracyjny w wydziale komunikacji'] }),
    kroki: () => [
      { t: 'Pojazd', pola: [{ k: 'vin', l: 'VIN', v: 'WVWZZZAUZKW118204', wym: true }, { k: 'nr', l: 'Obecny numer rejestracyjny', v: 'WE 4K221', wym: true }, { k: 'tab', l: 'Tablice', typ: 'wybor', opcje: [{ t: 'Zachowuję obecne', o: 'Taniej, jeśli auto jest z Twojego województwa' }, { t: 'Nowe tablice', o: '180,50 zł razem z dowodem' }] }] },
      { t: 'Dokumenty', pola: [{ k: 'umowa', l: 'Umowa kupna-sprzedaży', typ: 'plik', plik: 'umowa-kupna.pdf', wym: true }, { k: 'oc', l: 'Polisa OC', typ: 'wybor', opcje: ['Mam OC na siebie', 'Przejmuję OC poprzedniego właściciela'] }, { k: 'pcc', l: 'Złóż od razu PCC-3 (2% wartości auta)', typ: 'tak', v: 'tak', podp: 'Masz na to 14 dni od zakupu.' }] },
    ],
    przycisk: 'Zapłać i wyślij', platnosc: true, wysylka: ['Płatność…', 'Wysyłam do wydziału komunikacji…'],
    wynik: v => ({ tytul: 'Wniosek złożony', opis: 'Dostaniesz SMS, gdy dowód rejestracyjny będzie do odbioru.', wiersze: [['Pojazd', v.nr], ['Tablice', v.tab], ['PCC-3', tak(v.pcc) ? 'złożone, do zapłaty 1 240 zł' : 'nie']],
      sprawa: sprawa('Rejestracja pojazdu', 'Wydział komunikacji', 'pojazd', 'Odbiór ok. ' + za(5).slice(0, 5), [['Wniosek i opłata', dzis.slice(0, 5), 2], ['Pozwolenie czasowe', 'w toku', 1], ['Dowód rejestracyjny do odbioru', '', 0]], 'Do czasu odbioru możesz jeździć na pozwoleniu czasowym.') }),
  },
  {
    id: 'zbycie', t: 'Zgłoś sprzedaż pojazdu', opis: 'Masz na to 30 dni', kat: 'pojazdy', ik: 'swap', slowa: 'zbycie sprzedaz auta sprzedalem', dostepna: o => o.docs.some(d => d.plate),
    karta: () => ({ czas: 'ok. 2 minut', oplata: 'bezpłatnie', potrzebne: ['Dane nabywcy', 'Data sprzedaży'], jak: ['Wybierasz auto i podajesz nabywcę', 'Zgłoszenie trafia do wydziału komunikacji', 'Powiadamiamy też Twojego ubezpieczyciela OC'] }),
    kroki: o => [{ t: 'Sprzedaż', pola: [{ k: 'auto', l: 'Pojazd', typ: 'wybor', opcje: auta(o) }, { k: 'data', l: 'Data sprzedaży', v: dzis, wym: true }, { k: 'kto', l: 'Nabywca', ph: 'imię i nazwisko albo firma', wym: true }, { k: 'jak', l: 'Rodzaj umowy', typ: 'wybor', opcje: ['Umowa kupna-sprzedaży', 'Darowizna', 'Faktura'] }, { k: 'umowa', l: 'Umowa (opcjonalnie)', typ: 'plik', plik: 'umowa-sprzedazy.pdf' }] }],
    wynik: v => ({ tytul: 'Sprzedaż zgłoszona', opis: 'Wydział komunikacji i ubezpieczyciel dostali zgłoszenie.', wiersze: [['Pojazd', v.auto], ['Nabywca', v.kto], ['Data', v.data]], coDalej: ['Ubezpieczyciel zwróci niewykorzystaną część składki OC, jeśli nabywca nie przejmie polisy.', 'Auto zniknie z Twoich dokumentów, gdy nabywca je zarejestruje.'] }),
  },
  {
    id: 'autobus', t: 'Bezpieczny autobus', opis: 'Sprawdź autokar przed wycieczką', kat: 'pojazdy', ik: 'bus', slowa: 'wycieczka autokar szkola', bezFaceId: true,
    karta: () => ({ czas: 'kilka sekund', oplata: 'bezpłatnie', potrzebne: ['Numer rejestracyjny autokaru'], jak: ['Wpisujesz numer z tablicy', 'Sprawdzamy badanie techniczne, OC i zgłoszenia kradzieży'] }),
    kroki: () => [{ t: 'Autokar', pola: [{ k: 'nr', l: 'Numer rejestracyjny', v: 'GD 4021B', wym: true, podp: 'Znajdziesz go na tablicy z przodu i z tyłu pojazdu.' }] }],
    przycisk: 'Sprawdź', wysylka: ['Sprawdzam CEPiK i UFG…'],
    wynik: v => ({ tytul: 'Autokar może jechać', opis: 'Przed wyjazdem pojazd może jeszcze skontrolować policja lub ITD.', wiersze: [['Numer', v.nr.toUpperCase()], ['Pojazd', 'autokar turystyczny, 2019, 51 miejsc']],
      kontrola: [['Badanie techniczne', 'ważne do 14.03.2027', true], ['OC', 'ważne do 30.06.2027', true], ['Zgłoszenie kradzieży', 'brak', true], ['Ograniczenie prędkości', 'brak', true]] }),
  },
  { id: 'prawo-jazdy', t: 'Prawo jazdy', opis: 'Kategorie, ważność, wymiana', kat: 'pojazdy', ik: 'id', slowa: 'prawko waznosc wymiana kategorie', ekranInfo: 'prawo-jazdy', dostepna: o => o.docs.some(d => d.id === 'pj') },

  /* =================== PISMA I OPŁATY =================== */
  { id: 'platnosci', t: 'Płatności', opis: 'Podatki, mandaty i opłaty', kat: 'oplaty', ik: 'receipt', ekran: '/platnosci', slowa: 'zaplac podatek mandat zus skladki oplata' },
  { id: 'skrzynka', t: 'Skrzynka e-Doręczeń', opis: 'Pisma z urzędów', kat: 'oplaty', ik: 'inbox', ekran: '/skrzynka', slowa: 'pismo list urzad doreczenia wezwanie' },
  {
    id: 'odpowiedz', t: 'Odpowiedz na pismo', opis: 'Z załącznikami, przez e-Doręczenia', kat: 'oplaty', ik: 'mail', slowa: 'odpowiedz urzad skarbowy wezwanie wyjasnienia', dostepna: o => !!o.sc.letter.draft,
    karta: o => ({ czas: 'ok. 3 minut', oplata: 'bezpłatnie', potrzebne: ['Dokumenty, o które prosi urząd'], jak: [`Odpowiadasz na: ${o.sc.letter.info.title}`, 'Dołączasz pliki (część znaleźliśmy już w Twoich dokumentach)', 'Podpisujesz PIN-em mObywatela; dostajesz dowód doręczenia'] }),
    kroki: o => [
      { t: 'Załączniki', opis: o.sc.letter.say?.replace(/ Przygotować.*$/, ''), pola: [{ k: 'zal', l: 'Dołącz', typ: 'wiele', opcje: (o.sc.letter.att?.startsWith('5') ? ['FV Tech-Bud 08/2026/14', 'FV Tech-Bud 08/2026/31', 'FV Elmar 2026/08/112', 'FV Elmar 2026/08/140', 'Korekta FV/08/2026/77'] : ['FV 2025/03/118', 'FV 2025/04/022', 'FV 2025/05/301']), v: (o.sc.letter.att?.startsWith('5') ? 'FV Tech-Bud 08/2026/14|FV Tech-Bud 08/2026/31|FV Elmar 2026/08/112|FV Elmar 2026/08/140|Korekta FV/08/2026/77' : 'FV 2025/03/118|FV 2025/04/022|FV 2025/05/301') }, { k: 'dod', l: 'Inny plik (opcjonalnie)', typ: 'plik', plik: 'dokument.pdf' }] },
      { t: 'Treść', opis: 'Przygotowaliśmy odpowiedź. Możesz ją poprawić.', pola: [{ k: 'tresc', l: 'Treść pisma', typ: 'dlugi', v: (o.sc.letter.draft ?? '').replace(/<br>/g, '\n').replace(/<[^>]+>/g, ''), wym: true }] },
    ],
    podsumowanie: (v, o) => [['Do', o.sc.letter.to ?? ''], ['Załączniki', `${wiele(v.zal).length + (v.dod ? 1 : 0)} pliki`], ['Podpis', 'podpis zaufany (PIN mObywatela)']],
    przycisk: 'Podpisz i wyślij', wysylka: ['Podpisuję pismo…', 'Wysyłam przez e-Doręczenia…', 'Odbieram dowód doręczenia…'],
    wynik: (v, o, api) => { api.zalatw('letter'); return { tytul: 'Pismo doręczone', opis: 'Dowód doręczenia ma moc potwierdzenia odbioru listu poleconego.', wiersze: [['Do', o.sc.letter.to ?? ''], ['Załączniki', `${wiele(v.zal).length + (v.dod ? 1 : 0)} pliki`], ['Doręczono', `${dzis}, ${new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`]],
      sprawa: sprawa(o.sc.letter.info.title, o.sc.letter.to ?? 'Urząd skarbowy', 'podatki', 'Odpowiedź urzędu do 30 dni', [['Wezwanie', 'odebrane', 2], ['Twoja odpowiedź', dzis.slice(0, 5), 2], ['Weryfikacja w urzędzie', 'w toku', 1], ['Zakończenie sprawy', '', 0]], 'Urząd ma zwykle do 30 dni na odpowiedź.') }; },
  },

  /* =================== RODZINA =================== */
  { id: 'rodzina', t: 'Dokumenty rodziny', opis: 'Dzieci i osoby pod opieką', kat: 'rodzina', ik: 'family', ekran: '/rodzina', slowa: 'dzieci paszport dziecka legitymacja szkolna' },
  {
    id: 'narodziny', t: 'Zgłoś narodziny dziecka', opis: 'Akt urodzenia, PESEL, 800 plus', kat: 'rodzina', ik: 'baby', slowa: 'urodzilo dziecko noworodek usc akt urodzenia',
    karta: () => ({ czas: 'ok. 5 minut', oplata: 'bezpłatnie', potrzebne: ['Imię dziecka', 'Dane drugiego rodzica'], jak: ['Szpital przekazał już kartę urodzenia do USC', 'Podajesz imię, nazwisko i meldunek dziecka', 'Od razu możesz złożyć 800 plus i dopisać dziecko do KDR'] }),
    wstep: () => ({ tekst: 'Gratulacje! Masz 21 dni od wystawienia karty urodzenia.' }),
    kroki: o => [
      { t: 'Dziecko', pola: [{ k: 'imie', l: 'Pierwsze imię', ph: 'np. Helena', wym: true }, { k: 'imie2', l: 'Drugie imię (opcjonalnie)' }, { k: 'plec', l: 'Płeć', typ: 'wybor', opcje: ['Dziewczynka', 'Chłopiec'] }] },
      { t: 'Rodzice', pola: [{ k: 'drugi', l: 'Drugi rodzic', v: o.sc.partner || '', ph: 'imię i nazwisko' }, { k: 'nazw', l: 'Nazwisko dziecka', typ: 'wybor', opcje: [o.sc.nazw[0] === o.sc.nazw[1] ? o.sc.nazw[0] : `${o.sc.nazw[0]} / ${o.sc.nazw[1]}`, 'Nazwisko drugiego rodzica', 'Nazwisko dwuczłonowe'] }, { k: 'mel', l: 'Zameldowanie dziecka', typ: 'wybor', opcje: [{ t: o.moje.adres, o: 'Twój adres' }] }] },
      { t: 'Świadczenia', opis: 'Złożymy wnioski za Ciebie.', pola: [{ k: 'p800', l: '800 plus', typ: 'tak', v: 'tak', podp: 'Wypłata od dnia urodzenia, jeśli złożysz w ciągu 3 miesięcy.' }, { k: 'kdr', l: 'Dopisz do Karty Dużej Rodziny', typ: 'tak', v: o.docs.some(d => d.id === 'kdr') ? 'tak' : 'nie' }, { k: 'bec', l: 'Becikowe (1000 zł)', typ: 'tak', v: 'nie', podp: 'Przysługuje przy dochodzie do 1922 zł na osobę.' }] },
    ],
    zgoda: 'Oświadczam, że dane są zgodne z prawdą.',
    podsumowanie: (v, o) => [['Dziecko', `${v.imie}${v.imie2 ? ' ' + v.imie2 : ''} ${o.sc.nazw[v.plec === 'Dziewczynka' ? 0 : 1]}`], ['Urodzone', `16.10.2026, ${o.sc.szpital}`], ['Drugi rodzic', v.drugi || 'do uzupełnienia'], ['Zameldowanie', v.mel], ['800 plus', tak(v.p800) ? 'tak' : 'nie'], ['KDR', tak(v.kdr) ? 'tak' : 'nie'], ['Becikowe', tak(v.bec) ? 'tak' : 'nie']],
    przycisk: 'Podpisz i wyślij', wysylka: ['Wysyłam zgłoszenie do USC…', 'Nadaję numer PESEL…', 'Składam wnioski o świadczenia…'],
    wynik: (v, o) => ({ tytul: 'Zgłoszenie wysłane', opis: 'Odpis aktu urodzenia przyjdzie do skrzynki, zwykle następnego dnia roboczego.', wiersze: [['Dziecko', `${v.imie} ${o.sc.nazw[v.plec === 'Dziewczynka' ? 0 : 1]}`], ['PESEL', 'nadany jutro'], ['800 plus', tak(v.p800) ? 'wniosek w ZUS' : 'nie']],
      coDalej: ['Przekaż PESEL dziecka pracodawcy w ciągu 7 dni (zgłosi je do ubezpieczenia).', 'Wybierz przychodnię i lekarza dla dziecka w Internetowym Koncie Pacjenta.', ...(tak(v.kdr) ? ['Karta Dużej Rodziny dziecka pojawi się w aplikacji po decyzji gminy.'] : [])],
      sprawa: sprawa(`Zgłoszenie urodzenia: ${v.imie}`, 'Urząd Stanu Cywilnego', 'rodzina', 'PESEL jutro', [['Zgłoszenie', dzis.slice(0, 5), 2], ['Akt urodzenia i PESEL', 'w toku', 1], ['800 plus w ZUS', tak(v.p800) ? 'do miesiąca' : 'nie złożono', 0]], 'Odpis skrócony aktu urodzenia trafi bezpłatnie do skrzynki.') }),
  },
  {
    id: '800plus', t: '800 plus', opis: 'Wniosek i wypłaty', kat: 'rodzina', ik: 'coin', slowa: '800 plus swiadczenie wychowawcze zus', dostepna: o => dzieci(o).length > 0,
    karta: () => ({ czas: 'ok. 3 minut', oplata: 'bezpłatnie', potrzebne: ['Numer konta do wypłaty'], jak: ['Zaznaczasz dzieci', 'Podajesz konto', 'ZUS przysyła informację o przyznaniu do skrzynki'] }),
    kroki: o => [{ t: 'Dzieci i konto', pola: [{ k: 'dz', l: 'Dla których dzieci?', typ: 'wiele', opcje: dzieci(o).map(m => `${m.imie}, ${m.wiek} l.`), v: dzieci(o).map(m => `${m.imie}, ${m.wiek} l.`).join('|') }, { k: 'konto', l: 'Konto do wypłaty', v: 'PL61 1090 •••• •••• 4412', wym: true }] }],
    podsumowanie: v => [['Dzieci', wiele(v.dz).join(', ')], ['Kwota', `${wiele(v.dz).length * 800} zł miesięcznie`], ['Okres', 'od 01.06.2026 do 31.05.2027'], ['Konto', v.konto]],
    wynik: v => ({ tytul: 'Wniosek wysłany do ZUS', opis: 'Informację o przyznaniu dostaniesz do skrzynki.', wiersze: [['Dzieci', wiele(v.dz).join(', ')], ['Kwota', `${wiele(v.dz).length * 800} zł / mies.`]],
      sprawa: sprawa('800 plus', 'ZUS', 'rodzina', 'Decyzja do 2 mies.', [['Wniosek', dzis.slice(0, 5), 2], ['Weryfikacja w ZUS', 'w toku', 1], ['Informacja o przyznaniu', '', 0], ['Wypłaty', 'co miesiąc', 0]], 'Wypłata z wyrównaniem od miesiąca złożenia wniosku.') }),
  },
  {
    id: 'dodaj-osobe', t: 'Dodaj osobę', opis: 'Upoważnienie do dokumentów i spraw', kat: 'rodzina', ik: 'user', slowa: 'upowaznienie opieka mama tata rodzic dodaj osobe',
    karta: () => ({ czas: 'ok. 2 minut', oplata: 'bezpłatnie', potrzebne: ['PESEL tej osoby', 'Postanowienie sądu, jeśli jesteś opiekunem prawnym'], jak: ['Podajesz dane osoby i wybierasz, co chcesz widzieć', 'Osoba potwierdza prośbę w swoim mObywatelu', 'Jej dokumenty i sprawy pojawią się w Rodzinie'] }),
    kroki: () => [
      { t: 'Kogo chcesz dodać?', opis: 'Dzieci do 18 lat widzisz automatycznie, nie musisz ich dodawać.', pola: [{ k: 'kto', l: 'Kogo chcesz dodać?', typ: 'wybor', opcje: [{ t: 'Dorosłą osobę z rodziny', o: 'Np. mamę albo partnera. Musi zgodzić się w swoim mObywatelu.' }, { t: 'Osobę pod moją opieką prawną', o: 'Dodasz postanowienie sądu.' }] }] },
      { t: 'Dane osoby', pola: [{ k: 'imie', l: 'Imię i nazwisko', wym: true }, { k: 'pesel', l: 'PESEL', ph: '11 cyfr', wym: true, num: true }, { k: 'rel', l: 'Kim jest dla Ciebie?', typ: 'wybor', opcje: ['Rodzic', 'Partner lub partnerka', 'Dorosłe dziecko', 'Rodzeństwo', 'Inna osoba'] }, { k: 'post', l: 'Postanowienie sądu', typ: 'plik', plik: 'postanowienie-sadu.pdf', wym: true, gdy: v => v.kto.startsWith('Osobę pod') }] },
      { t: 'Co chcesz widzieć?', pola: [{ k: 'zakres', l: 'Zaznacz', typ: 'wiele', opcje: ['Dokumenty', 'Recepty i Konto Pacjenta', 'Pisma z urzędów', 'Płatności'], v: 'Dokumenty|Recepty i Konto Pacjenta' }] },
    ],
    podsumowanie: v => [['Osoba', v.imie], ['PESEL', v.pesel.slice(0, 6) + '•••' + v.pesel.slice(9)], ['Relacja', v.rel], ['Dostęp', wiele(v.zakres).join(', ') || 'brak'], ...(v.post ? [['Postanowienie sądu', 'dodane'] as Wiersz] : [])],
    przycisk: 'Wyślij prośbę', wysylka: ['Podpisuję prośbę…', 'Wysyłam do mObywatela tej osoby…'],
    wynik: v => ({ tytul: 'Prośba wysłana', opis: `${v.imie.split(' ')[0]} zobaczy ją w swoim mObywatelu. Po akceptacji dodamy tę osobę do Rodziny.`, wiersze: [['Dostęp', wiele(v.zakres).join(', ')]],
      coDalej: ['Prośba jest ważna 7 dni.', 'Upoważnienie możesz w każdej chwili cofnąć w Centrum prywatności.'],
      sprawa: sprawa(`Upoważnienie: ${v.imie}`, 'mObywatel', 'rodzina', 'Czeka na zgodę', [['Prośba wysłana', dzis.slice(0, 5), 2], ['Zgoda tej osoby', 'w toku', 1], ['Dostęp w Rodzinie', '', 0]], 'Dostaniesz powiadomienie, gdy osoba zaakceptuje prośbę.') }),
  },
  { id: 'kdr', t: 'Karta Dużej Rodziny', opis: 'Zniżki i partnerzy w okolicy', kat: 'rodzina', ik: 'family', slowa: 'kdr znizki partnerzy', ekranInfo: 'kdr' },

  /* =================== ZDROWIE I EMERYTURA =================== */
  { id: 'recepty', t: 'Recepty i skierowania', opis: 'Kody do apteki, historia', kat: 'zdrowie', ik: 'pill', slowa: 'recepta leki apteka mama ikp skierowanie', ekranInfo: 'recepty' },
  { id: 'szczepienia', t: 'Szczepienia', opis: 'Kalendarz szczepień rodziny', kat: 'zdrowie', ik: 'heart', slowa: 'szczepionka szczepienie dziecko', ekranInfo: 'szczepienia' },
  {
    id: 'ekuz', t: 'Karta EKUZ', opis: 'Leczenie w krajach UE', kat: 'zdrowie', ik: 'plane', slowa: 'ubezpieczenie zagranica nfz',
    karta: () => ({ czas: 'ok. 2 minut, karta w ok. 7 dni', oplata: 'bezpłatnie', potrzebne: ['Ubezpieczenie zdrowotne (sprawdzimy w eWUŚ)'], jak: ['Wybierasz osoby', 'NFZ sprawdza ubezpieczenie', 'Karta przychodzi pocztą; do tego czasu masz certyfikat zastępczy'] }),
    kroki: o => [{ t: 'Dla kogo', pola: [{ k: 'kto', l: 'Zaznacz osoby', typ: 'wiele', opcje: [o.imie, ...dzieci(o).map(m => m.imie)], v: o.imie }, { k: 'dost', l: 'Odbiór', typ: 'wybor', opcje: [{ t: 'Pocztą', o: o.dane.zamel }, { t: 'W oddziale NFZ', o: o.sc.miasto }] }, { k: 'cert', l: 'Wyjeżdżam w ciągu 7 dni (certyfikat zastępczy od razu)', typ: 'tak', v: 'nie' }] }],
    podsumowanie: v => [['Osoby', wiele(v.kto).join(', ')], ['Odbiór', v.dost], ['Certyfikat zastępczy', tak(v.cert) ? 'tak' : 'nie'], ['Opłata', 'bezpłatnie']],
    wynik: v => ({ tytul: 'Wniosek wysłany do NFZ', opis: tak(v.cert) ? 'Certyfikat zastępczy jest już w skrzynce.' : 'Karty przyjdą w około 7 dni.', wiersze: [['Osoby', wiele(v.kto).join(', ')], ['Ważność', 'zwykle do 5 lat']], coDalej: ['Zabierz kartę albo certyfikat na wyjazd.', 'W nagłym przypadku dzwoń pod 112 w każdym kraju UE.'] }),
  },
  { id: 'emerytura', t: 'Moja emerytura', opis: 'Wiek emerytalny i prognoza', kat: 'zdrowie', ik: 'brief', slowa: 'zus emerytura prognoza', ekranInfo: 'emerytura' },

  /* =================== BEZPIECZEŃSTWO =================== */
  { id: 'prywatnosc', t: 'Centrum prywatności', opis: 'Kto sprawdzał Twoje dane', kat: 'bezp', ik: 'eye', ekran: '/prywatnosc', slowa: 'dane dostep kto sprawdzal zgody' },
  {
    id: 'sms', t: 'Dziwny SMS lub strona', opis: 'Sprawdzimy i zgłosimy do CERT', kat: 'bezp', ik: 'alert', slowa: 'oszustwo phishing link sms dziwny', bezFaceId: true,
    karta: () => ({ czas: 'kilka sekund', oplata: 'bezpłatnie', potrzebne: ['Treść wiadomości albo adres strony'], jak: ['Wklejasz wiadomość', 'Sprawdzamy ją na Liście Ostrzeżeń CERT Polska', 'Jeśli to oszustwo, zgłaszamy je za Ciebie'] }),
    kroki: () => [{ t: 'Wiadomość', pola: [{ k: 'tresc', l: 'Wklej treść albo adres strony', typ: 'dlugi', v: 'Twoja przesyłka czeka w magazynie. Dopłać 2,49 zł za ponowne doręczenie: kurier-dopłata.click/pl', wym: true }, { k: 'skad', l: 'Skąd ją masz?', typ: 'wybor', opcje: ['SMS', 'E-mail', 'Komunikator', 'Strona internetowa'] }, { k: 'dane', l: 'Czy wpisano tam Twoje dane?', typ: 'wybor', opcje: ['Nie', 'Tak, dane karty', 'Tak, login do banku'] }] }],
    przycisk: 'Sprawdź', wysylka: ['Sprawdzam Listę Ostrzeżeń CERT Polska…', 'Analizuję adres…'],
    wynik: v => ({
      tytul: 'To oszustwo', ikona: 'alert', opis: 'Nie otwieraj linku. Zgłosiliśmy go do CERT Polska.', wiersze: [['Domena', 'kurier-dopłata.click']],
      kontrola: [['Domena zarejestrowana 3 dni temu', 'podejrzane', false], ['Na Liście Ostrzeżeń CERT', 'od wczoraj', false], ['Podszywa się pod Pocztę', 'tak', false], ['Prosi o drobną dopłatę', 'typowy wzorzec', false]],
      coDalej: v.dane === 'Nie' ? ['Usuń wiadomość.', 'Prześlij SMS na bezpłatny numer 8080, operator zablokuje nadawcę.'] : ['Od razu zablokuj kartę w aplikacji banku albo pod +48 828 828 828.', 'Zmień hasło do bankowości i zadzwoń do banku.', 'Zgłoś sprawę na policji.', 'Zastrzeż PESEL, jeśli nie jest jeszcze zastrzeżony.'],
      dalej: v.dane === 'Nie' ? [] : [{ t: 'Zastrzeż PESEL', trasa: '/usluga/zastrzez-pesel' }],
    }),
  },
  {
    id: 'incydent', t: 'Zgłoś incydent do CERT', opis: 'Włamanie, wyciek, oszustwo', kat: 'bezp', ik: 'shield', slowa: 'cert incydent wlamanie konto hacker wyciek',
    karta: () => ({ czas: 'ok. 3 minut', oplata: 'bezpłatnie', potrzebne: ['Opis tego, co się stało'], jak: ['Opisujesz incydent', 'Zgłoszenie trafia do CERT Polska', 'Dostajesz numer zgłoszenia i porady'] }),
    kroki: () => [{ t: 'Co się stało', pola: [{ k: 'co', l: 'Rodzaj incydentu', typ: 'wybor', opcje: ['Ktoś przejął moje konto', 'Oszustwo przy zakupach w sieci', 'Wyciek moich danych', 'Złośliwe oprogramowanie', 'Inne'] }, { k: 'opis', l: 'Opisz krótko', typ: 'dlugi', wym: true, ph: 'Co się stało i kiedy?' }, { k: 'zal', l: 'Zrzut ekranu (opcjonalnie)', typ: 'plik', plik: 'zrzut-ekranu.png' }] }],
    wynik: v => ({ tytul: 'Zgłoszenie przyjęte', opis: 'CERT Polska przeanalizuje zgłoszenie.', wiersze: [['Rodzaj', v.co], ['Numer zgłoszenia', nr('CERT')]], coDalej: ['Zmień hasła i włącz logowanie dwuetapowe.', 'Jeśli przepadły pieniądze, zgłoś to też na policji i w banku.'] }),
  },
  {
    id: 'nie-ja', t: 'To nie ja', opis: 'Zgłoś podejrzane sprawdzenie danych', kat: 'bezp', ik: 'alert', ukryta: true,
    kroki: (o, st, p) => {
      const w = o.priv.log.find(x => x.id === p.wpis);
      return [
        { t: 'Zablokujmy to', opis: w ? `${w.kto}, ${w.kiedy.toLowerCase()}: ${w.co.charAt(0).toLowerCase() + w.co.slice(1)}.` : undefined, pola: [
          { k: 'wpis', l: '', v: p.wpis ?? '', gdy: () => false },
          { k: 'zastrz', l: 'Zastrzeż PESEL', typ: 'tak', v: st.pesel ? 'nie' : 'tak', podp: 'Banki i firmy pożyczkowe dostaną odmowę.', gdy: () => !st.pesel },
          { k: 'firma', l: 'Powiadom firmę, że to nie Ty', typ: 'tak', v: 'tak', podp: 'Wstrzyma wniosek i oznaczy go jako podejrzany.' },
          { k: 'cert', l: 'Zgłoś do CERT Polska', typ: 'tak', v: 'tak' },
          { k: 'policja', l: 'Przygotuj zawiadomienie na policję', typ: 'tak', v: 'nie', podp: 'Wyślesz je przez e-Doręczenia, bez wizyty na komisariacie.' },
        ] },
        { t: 'Co się wydarzyło?', pola: [{ k: 'dane', l: 'Czy Twoje dane mógł ktoś poznać?', typ: 'wybor', opcje: ['Nie', 'Nie wiem', 'Tak'] }, { k: 'opis', l: 'Opis (opcjonalnie)', typ: 'dlugi', ph: 'Np. przyszedł SMS z kodem, o który nikt nie prosił' }] },
      ];
    },
    podsumowanie: v => [['Zastrzeżenie PESEL', tak(v.zastrz) ? 'tak' : 'bez zmian'], ['Powiadomienie firmy', tak(v.firma) ? 'tak' : 'nie'], ['Zgłoszenie do CERT', tak(v.cert) ? 'tak' : 'nie'], ['Zawiadomienie na policję', tak(v.policja) ? 'tak' : 'nie'], ['Podane dane', v.dane]],
    przycisk: 'Zablokuj i zgłoś', wysylka: ['Zastrzegam PESEL…', 'Powiadamiam firmę…', 'Wysyłam zgłoszenie…'],
    wynik: (v, _, api) => {
      if (tak(v.zastrz)) api.pesel(true);
      if (v.wpis) api.wpis(v.wpis, 'zgl');
      return { tytul: 'Zablokowane i zgłoszone', opis: 'Nikt nie weźmie teraz kredytu na Twoje dane.', wiersze: [['Numer zgłoszenia', nr('CERT')]],
        coDalej: [...(v.dane !== 'Nie' ? ['Zmień hasła do banku i poczty.'] : []), ...(tak(v.policja) ? ['Zawiadomienie czeka w skrzynce na Twój podpis.'] : []), 'Sprawdź, czy w BIK nie ma wniosków, które nie są Twoje.'] };
    },
  },
  { id: 'alerty', t: 'Alerty RCB', opis: 'Ostrzeżenia dla Twojej okolicy', kat: 'bezp', ik: 'megaphone', ekran: '/alerty', slowa: 'ostrzezenia pogoda rcb' },

  /* =================== WYBORY, NAUKA, PODRÓŻE =================== */
  {
    id: 'rejestr-wyborcow', t: 'Rejestr wyborców', opis: 'Głosuj tam, gdzie mieszkasz', kat: 'inne', ik: 'vote', slowa: 'wybory glosowanie obwod',
    karta: o => ({ czas: 'ok. 1 minuty, decyzja w 3 dni', oplata: 'bezpłatnie', potrzebne: ['Adres, pod którym mieszkasz'], jak: [`Dopisujemy Cię do rejestru wyborców w gminie ${o.sc.miasto}`, 'Meldunek się nie zmienia', 'Głosujesz tam w każdych wyborach'] }),
    kroki: o => [{ t: 'Gdzie mieszkasz', opis: o.sc.meldunek ? `Meldunek masz w ${o.sc.meldunek === 'Opole' ? 'Opolu' : o.sc.meldunek}, a mieszkasz gdzie indziej? Tu to zmienisz.` : undefined, pola: [{ k: 'adres', l: 'Adres zamieszkania', v: o.moje.adres, wym: true }, { k: 'gmina', l: 'Gmina', v: o.sc.miasto, wym: true }] }],
    wynik: (v, _, api) => { api.zalatw('glos'); return { tytul: 'Wniosek wysłany', opis: 'Decyzja przyjdzie do skrzynki.', wiersze: [['Gmina', v.gmina], ['Decyzja', 'do ' + za(3)]], sprawa: sprawa('Wpis do rejestru wyborców', `Urząd, ${v.gmina}`, 'wybory', 'Decyzja do ' + za(3).slice(0, 5), [['Wniosek', dzis.slice(0, 5), 2], ['Decyzja urzędu', 'do ' + za(3).slice(0, 5), 1], ['Wpis do rejestru', '', 0]], 'Swój lokal wyborczy zobaczysz w aplikacji przed wyborami.') }; },
  },
  {
    id: 'podroz', t: 'Bezpieczna podróż', opis: 'Zarejestruj wyjazd w Odyseuszu', kat: 'inne', ik: 'plane', slowa: 'wakacje wyjazd tajlandia zagranica odyseusz paszport',
    karta: () => ({ czas: 'ok. 2 minut', oplata: 'bezpłatnie', potrzebne: ['Kraj i daty wyjazdu'], jak: ['Rejestrujesz podróż', 'Sprawdzamy ważność paszportów', 'W razie zagrożenia konsul wyśle Ci SMS'] }),
    wstep: o => o.id === 'rafal' ? { flaga: 'Paszport Neli traci ważność 14.03.2027. Tajlandia wymaga paszportu ważnego co najmniej 6 miesięcy od wjazdu, więc przed wyjazdem trzeba wyrobić nowy.' } : {},
    kroki: o => [
      { t: 'Dokąd jedziesz?', pola: [{ k: 'kraj', l: 'Dokąd jedziesz?', typ: 'lista', opcje: KRAJE, v: o.id === 'rafal' ? 'Tajlandia' : '', ph: 'Wybierz kraj', wym: true }] },
      { t: 'Kiedy jedziesz?', opis: 'Dotknij dnia wyjazdu, a potem dnia powrotu.', pola: [{ k: 'kiedy', l: 'Termin', typ: 'okres', v: o.id === 'rafal' ? '27.12.2026|08.01.2027' : '', wym: true }] },
      { t: 'Kto jedzie?', pola: [{ k: 'kto', l: 'Kto jedzie?', typ: 'wiele', opcje: [o.imie, ...o.rodzina.map(m => m.imie)], v: o.imie }, { k: 'tel', l: 'Telefon w podróży', v: o.dane.tel, wym: true }] },
    ],
    podsumowanie: v => [['Kraj', v.kraj], ['Termin', okresTxt(v.kiedy)], ['Osoby', wiele(v.kto).join(', ')], ['Telefon', v.tel]],
    wynik: v => ({ tytul: 'Podróż zarejestrowana', opis: 'Dostaniesz SMS, jeśli w kraju podróży będzie niebezpiecznie.', wiersze: [['Kraj', v.kraj], ['Termin', okresTxt(v.kiedy)], ['Osoby', String(wiele(v.kto).length)]], coDalej: ['Sprawdź ostrzeżenia MSZ dla kraju podróży.', 'Weź kartę EKUZ, jeśli jedziesz do kraju UE.', 'Zapisz numer konsulatu.'], dalej: [{ t: 'Zamów kartę EKUZ', trasa: '/usluga/ekuz' }] }),
  },
  { id: 'ulgi-studenta', t: 'Ulgi studenta', opis: 'Co daje mLegitymacja', kat: 'inne', ik: 'cap', slowa: 'legitymacja znizka pociag student', ekranInfo: 'ulgi', dostepna: o => o.docs.some(d => d.id === 'leg') },
];
export const usluga = (id: string) => USLUGI.find(u => u.id === id);
export const trasaUslugi = (u: Usluga) => u.ekran ?? `/usluga/${u.id}`;

/* Zdania z danych (przypomnienia, terminy, pisma) to ekran aplikacji. */
const norm = (t: string) => t.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '');
export function trasaDla(q: string | null | undefined): string | null {
  if (!q) return null;
  if (q.startsWith('@toku:')) return `/sprawa/${q.slice(6)}`;
  const n = norm(q);
  const r: [RegExp, string][] = [
    [/odblok\w* pesel|cofn\w* zastrz/, '/usluga/cofnij-zastrzezenie'], [/zastrz.*pesel/, '/usluga/zastrzez-pesel'],
    [/dowod.*(waz|traci)/, '/usluga/wniosek-dowod'], [/portfel|zgubil|ukradl/, '/usluga/zgubiony-dowod'],
    [/stluczk|kolizj/, '/usluga/mstluczka'], [/kupuj|uzywan|historia pojazdu/, '/usluga/historia-pojazdu'],
    [/urodzil|urodzi/, '/usluga/narodziny'], [/sms|oszust|dziwn/, '/usluga/sms'], [/punkt/, '/usluga/punkty'],
    [/tajland|wyjazd|wakacj/, '/usluga/podroz'], [/recept/, '/usluga/recepty'], [/emerytur/, '/usluga/emerytura'],
    [/glosow|obwod|wybor/, '/usluga/rejestr-wyborcow'], [/niekaraln/, '/usluga/niekaralnosc'], [/szczepi/, '/usluga/szczepienia'],
    [/legitymac|znizk.*pociag/, '/usluga/ulgi-studenta'], [/prawo jazdy|prawk/, '/usluga/prawo-jazdy'],
    [/pism|urzad\w* skarbow|decyzj|stypendi/, '/skrzynka'],
    [/\boc\b|badani|przeglad|ubezpiecz/, '/usluga/oc-badanie'], [/podatek|zaplac|mandat|zus|sklad/, '/platnosci'],
    [/duzej rodziny|\bkdr\b/, '/usluga/kdr'],
  ];
  for (const [re, t] of r) if (re.test(n)) return t;
  return null;
}
export function szukaj(q: string, o: Osoba, st: Stan) {
  const n = norm(q.trim()); if (!n) return [];
  const slowa = n.split(/\s+/);
  return USLUGI.filter(u => !u.ukryta && (!u.dostepna || u.dostepna(o, st)) && slowa.every(s => norm(`${u.t} ${u.opis} ${u.slowa ?? ''}`).includes(s)));
}
