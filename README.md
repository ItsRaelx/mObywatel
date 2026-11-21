# mObywatel — prototyp aplikacji mobilnej

Klikalna makieta aplikacji mObywatel w **Expo (React Native) + TypeScript**. Działa w całości na telefonie,
bez serwera i bez sieci, na fikcyjnych danych czterech osób z pokazu.

> To prototyp. Nie jest to aplikacja mObywatel ani usługa administracji publicznej. Osoby, numery i sprawy są zmyślone.

## Uruchomienie na telefonie

1. Zainstaluj **Expo Go** (App Store / Google Play).
2. W katalogu projektu: `npm install`, potem `npx expo start` (ta sama sieć Wi‑Fi) albo `npx expo start --tunnel` (dowolna sieć).
3. Zeskanuj kod QR z terminala: na iPhonie aparatem, na Androidzie w Expo Go.

Przy pierwszym uruchomieniu aplikacja prowadzi przez krótkie wprowadzenie, wybór osoby z pokazu i ustawienie PIN-u.

## Co jest w środku

- **Start**: najważniejsze sprawy z licznikiem dni, mDowód, sprawy w toku, alerty (prywatność, RCB), skróty.
- **Dokumenty**: karty w proporcjach ID-1 z animowanym hologramem, dokumenty rodziny.
- **Kod QR**: pokaż kod (z wyborem, co widzi druga osoba: tylko wiek, tożsamość, prawo jazdy, ulga),
  zeskanuj kod (prawdziwy aparat), sprawdź dokument innej osoby.
- **Usługi**: ponad 40 spraw w prostych krokach (formularz → podsumowanie → Face ID → wynik), wyszukiwarka.
- **Więcej**: skrzynka e-Doręczeń, płatności, terminy, rodzina, moje dane, centrum prywatności, alerty RCB, ustawienia, osoba w pokazie.
- Jasny i ciemny motyw, logowanie PIN-em i prawdziwym Face ID / odciskiem palca.

## Grafiki

Ikony, portrety, ilustracje pojazdów, wzory kart i kody QR są rysowane w kodzie (`src/lib`). Generator QR jest własny
(`src/lib/qr.ts`). Z zewnątrz pochodzą tylko oficjalne znaki pobrane ze stron rządowych — patrz `assets/ZRODLA.md`.

## Struktura

- `src/app/` — ekrany (Expo Router)
- `src/ui/` — komponenty: karty dokumentów, elementy interfejsu, wprowadzenie i blokada
- `src/data/` — dane osób (`osoby.json`), katalog usług, typy
- `src/lib/` — generator QR, ikony, ilustracje
- `src/state/` — stan aplikacji, motyw, Face ID

## Sprawdzanie

```bash
npx tsc --noEmit
npx eslint src
```
