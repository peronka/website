# Peronka — strona (Astro)

Strona peronka.pl zbudowana w Astro 7, hostowana na Vercelu. Wszystkie strony są statyczne,
poza endpointem `/api/powiadom/` (funkcja serwerowa przez `@astrojs/vercel`).
Projekt: ramki „Web — … (Astro)” w `ui.pen`.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # wynik w .vercel/output/
npm run check     # astro check (typy)
```

Wymaga Node ≥ 22.23 (wymóg Astro 7).

## Struktura

- `src/pages/index.astro` — landing
- `src/pages/polityka-prywatnosci.astro`, `regulamin.astro` — treść w `src/legal/*.md`,
  układ ze spisem treści w `src/layouts/Legal.astro`
- `src/pages/kontakt.astro` — skrzynki e-mail z `src/config.ts`
- `src/pages/status.astro` — pobiera `GET {statusApiBase}/api/status` w przeglądarce
  i odświeża co `refresh_seconds`; lokalnie: `PUBLIC_STATUS_API_BASE=http://localhost:8080 npm run dev`
- `src/pages/404.astro`
- `src/pages/api/powiadom.ts` — zapis na powiadomienie o premierze (Brevo double opt-in);
  `zapisano.astro` i `potwierdzono.astro` — strony po zapisie i po kliknięciu linku z maila
- `src/components/sections/` — sekcje landingu (Hero, AppFeatures, Widgets, DataSource, Cta)
- `src/components/Phone.astro` — ramka iPhone'a w CSS (skaluje się jednostkami `cqi`)
- `src/components/DepartureBoard.astro` — tablica odjazdów w hero
- `src/config.ts` — adresy e-mail, link do App Store, adres API statusu
- `src/assets/` — zrzuty z aplikacji i widżety wyeksportowane z `ui.pen`

## Link do App Store

`site.appStoreId` w `src/config.ts` buduje link do App Store i baner Safari
(`<meta name="apple-itunes-app">` w `Base.astro`). Hero, sekcja „Pobierz” i menu mobilne
pokazują oficjalną plakietkę „Pobierz w App Store” (`src/assets/brand/app-store-badge-pl.svg`,
pobrana z Apple Marketing Tools) — zgodnie z wytycznymi Apple nie zmieniaj jej kolorów ani
nie dodawaj efektów. Gdy `appStoreUrl` jest pusty, zamiast plakietki jest formularz „Powiadom mnie”.

## Powiadomienie o premierze (Brevo)

Formularz wysyła adres do `/api/powiadom/`, który woła Brevo
`POST /v3/contacts/doubleOptinConfirmation`. Brevo wysyła mail z linkiem potwierdzającym
i dopisuje kontakt do listy dopiero po kliknięciu; potem przekierowuje na `/potwierdzono/`.

Zmienne środowiskowe (wzór w `.env.example`, na produkcji: Vercel → Settings → Environment Variables):

- `BREVO_API_KEY` — klucz API (Brevo → SMTP & API → API Keys)
- `BREVO_LIST_ID` — ID listy, na którą trafiają potwierdzone adresy
- `BREVO_DOI_TEMPLATE_ID` — ID szablonu maila potwierdzającego (szablon z tagiem `optin`
  i linkiem `{{ doubleoptin }}`)

Bez nich endpoint odpowiada 503, a formularz pokazuje „Zapisy są chwilowo niedostępne”.
Po wysłaniu maila o premierze usuń listę — tak obiecuje polityka prywatności.
