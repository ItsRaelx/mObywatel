# mObywatel: prototyp aplikacji

**Projekt na [mObywatel Challenge](https://mobywatel.ai/)**, konkurs na koncepcję lepszej aplikacji mObywatel (zgłoszenia do 30 listopada 2026).

Klikalna koncepcja aplikacji mObywatel zbudowana w **Expo (React Native) i TypeScript**.
Działa na iPhonie, Androidzie i w przeglądarce. Nie potrzebuje serwera ani sieci, a wszystkie dane są fikcyjne.

> To niezależny prototyp. Nie jest to aplikacja mObywatel ani usługa administracji publicznej.
> Osoby, numery, firmy i sprawy są zmyślone.

## Najważniejsze założenia

- **Prostota.** Każda sprawa to kilka krótkich kroków: karta usługi, pytania, podsumowanie, podpis, wynik. Bez długich formularzy.
- **Jedna aplikacja zamiast wielu stron.** Dokumenty, pisma, płatności, terminy i ponad 40 usług w jednym miejscu.
- **Jasne potwierdzanie.** Wnioski i oświadczenia podpisuje się PIN-em mObywatela, płatności potwierdza Face ID.
- **Kontrola nad danymi.** Przy kodzie QR wybierasz, co zobaczy druga osoba (na przykład tylko wiek). Centrum prywatności pokazuje, kto i kiedy sprawdzał Twoje dane.
- **Działa wszędzie.** Telefon bez internetu, Android i iOS, przeglądarka. Jasny i ciemny motyw.

## Co można przeklikać

| Zakładka | Zawartość |
|---|---|
| **Start** | najbliższe terminy z licznikiem dni, mDowód, alerty (prywatność, RCB), skróty |
| **Dokumenty** | mDowód z danymi dowodu plastikowego, prawo jazdy, legitymacje, pojazdy z historią badań, ubezpieczeniem i licznikiem, dokumenty rodziny |
| **Kod QR** | pokaż swój kod z wyborem zakresu danych, zeskanuj kod aparatem, sprawdź dokument innej osoby |
| **Usługi** | ponad 40 spraw: zastrzeżenie PESEL, mStłuczka z potwierdzeniem przez kod QR drugiego kierowcy, Bezpieczna podróż z listą krajów i kalendarzem, zaświadczenia, rejestracja pojazdu, 800 plus i inne |
| **Więcej** | skrzynka e-Doręczeń, płatności, terminy, rodzina, moje dane, centrum prywatności, urządzenia, ustawienia |

Zgłoszenia błędów w danych, brakującego dokumentu albo nieznanego sprawdzenia mają własne formularze.

### Osoby w pokazie

| Osoba | Sprawy do sprawdzenia |
|---|---|
| **Marta Kowalska**, Warszawa | pismo z urzędu skarbowego, kończące się OC, zgubiony portfel, stłuczka, nowe dziecko |
| **Jan Wiśniewski**, Kraków | pismo w sprawie VAT, dwa samochody, zastrzeżony PESEL |
| **Ewa Nowak**, Lublin | dowód ważny jeszcze kilka tygodni, prognoza emerytury, recepty dla mamy |
| **Kacper Zieliński**, Gdańsk | mandat i punkty karne, legitymacja studencka, miejsce głosowania |

W pokazie działa **dowolny 4-cyfrowy PIN**, a Face ID jest tylko animacją.

## Uruchomienie

Wymagany Node.js 20 lub nowszy.

```bash
npm install
npx expo start            # telefon w tej samej sieci Wi-Fi
npx expo start --tunnel   # telefon w dowolnej sieci
```

Na telefonie zainstaluj **Expo Go** i zeskanuj kod QR z terminala (iPhone: aparat, Android: Expo Go).

### Wersja w przeglądarce

```bash
npx expo export -p web    # gotowa strona w katalogu dist/
npx serve -s dist
```

Na szerokim ekranie strona pokazuje aplikację w ramce telefonu, z wyborem osoby, motywem i kodem QR do otwarcia na telefonie.
Na telefonie od razu otwiera się sama aplikacja. Osobę można wskazać w adresie, na przykład `/?osoba=ewa`.

## Struktura

```
src/app/     ekrany (Expo Router)
src/ui/      komponenty: karty dokumentów, kreator usług, PIN i Face ID, strona pokazowa
src/data/    osoby z pokazu, katalog usług, pojazdy
src/lib/     generator QR, ikony, ilustracje
src/state/   stan aplikacji i motyw
```

## Sprawdzanie

```bash
npx tsc --noEmit
npx expo lint
```

## Grafiki

Ikony, portrety, ilustracje pojazdów, wzory kart i kody QR są rysowane w kodzie (`src/lib`), a generator QR jest własny.
Z zewnątrz pochodzą tylko oficjalne znaki pobrane ze stron rządowych, opisane w [`assets/ZRODLA.md`](assets/ZRODLA.md).

## Zgłoszenie do mObywatel Challenge

Treść do formularza na [mobywatel.ai](https://mobywatel.ai/#zglos).

| Pole | Treść |
|---|---|
| Imię i nazwisko lub nazwa zespołu | Dawid Iwański |
| E-mail | *(podawany tylko w formularzu)* |
| Miejscowość | *(do uzupełnienia)* |
| Zgłaszam jako | Osoba prywatna |
| Tytuł koncepcji | mObywatel w kilku krokach: prosta aplikacja, która załatwia sprawy do końca |
| Link do klikalnego prototypu | *(adres strony po publikacji, działa bez logowania)* |
| Dodatkowy link | adres tego repozytorium |
| Polskie modele i technologie | Prototyp celowo nie używa AI: działa w całości na telefonie, bez serwera i bez wysyłania danych. Zbudowany na otwartych technologiach (Expo, React Native, TypeScript). Generator kodów QR, ikony i ilustracje są własne. |

**Opis**

> Problem: dziś wiele spraw w mObywatelu kończy się przekierowaniem na stronę, długim formularzem albo wizytą w urzędzie. Trudno też sprawdzić, kto i kiedy korzystał z naszych danych.
>
> Dla kogo: dla każdego, kto ma telefon, od studenta po osobę na emeryturze. Prototyp pokazuje cztery osoby z różnymi sprawami: mamę trojga dzieci z Warszawy, przedsiębiorcę z Krakowa, nauczycielkę z Lublina i studenta z Gdańska.
>
> Co jest najważniejsze:
> 1. Każda sprawa w kilku krokach. Karta usługi mówi, ile to trwa i co będzie potrzebne, potem są krótkie pytania z gotowymi odpowiedziami, podsumowanie z możliwością poprawy i wynik z informacją, co dalej. Ponad 40 usług działa w ten sam sposób.
> 2. Jasne potwierdzanie. Wnioski i oświadczenia podpisuje się PIN-em mObywatela, płatności potwierdza Face ID. Bez przełączania do banku czy innej aplikacji.
> 3. Dokumenty, które coś mówią. Przy pojeździe widać historię badań, ubezpieczenie, przebieg licznika i właścicieli. Przy mDowodzie także dane dowodu plastikowego. Aplikacja sama przypomina o kończącym się OC czy dowodzie.
> 4. Kontrola nad danymi. Pokazując kod QR, wybieram, co zobaczy druga osoba, na przykład tylko to, że mam 18 lat. Centrum prywatności pokazuje każde sprawdzenie danych, a przy nieznanym jednym dotknięciem można je zgłosić.
> 5. Sprawy między ludźmi. W mStłuczce drugi kierowca potwierdza dane zdarzenia, skanując kod QR, bez papierowego oświadczenia.
> 6. Działa wszędzie: iPhone, Android i przeglądarka, w jasnym i ciemnym motywie, także bez internetu.
>
> Prototyp jest natywną aplikacją, którą można zainstalować na telefonie, a w przeglądarce otwiera się w ramce telefonu z wyborem osoby. W pokazie działa dowolny PIN.

Zgody: zaznacz akceptację zasad (wymagana) i, jeśli chcesz, zgodę na publikację tytułu, linku i imienia i nazwiska.

## Licencja

Wszelkie prawa zastrzeżone. Kod jest publiczny wyłącznie jako zgłoszenie do mObywatel Challenge: organizator i jury mogą go przeglądać, uruchamiać, oceniać i prezentować w zakresie potrzebnym do konkursu. Każde inne użycie wymaga zgody autora. Szczegóły w pliku [`LICENSE`](LICENSE).

Godło, nazwa i znaki mObywatela oraz znak Karty Dużej Rodziny należą do ich właścicieli i są tu wyłącznie w celach pokazowych.
Osoby z pokazu i ich scenariusze powstały na podstawie prototypu [mobywatel.ai](https://mobywatel.ai/), z zachowaniem informacji o jego autorze (patrz `LICENSE`).
