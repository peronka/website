# Peronka — strona (Astro)

Statyczna strona peronka.pl zbudowana w Astro 7. Projekt: ramki „Web — … (Astro)” w `ui.pen`.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # wynik w dist/
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
- `src/components/sections/` — sekcje landingu (Hero, AppFeatures, Widgets, DataSource, Cta)
- `src/components/Phone.astro` — ramka iPhone'a w CSS (skaluje się jednostkami `cqi`)
- `src/components/DepartureBoard.astro` — tablica odjazdów w hero
- `src/config.ts` — adresy e-mail, link do App Store, adres API statusu
- `src/assets/` — zrzuty z aplikacji i widżety wyeksportowane z `ui.pen`

## Link do App Store

`site.appStoreUrl` w `src/config.ts` jest pusty, dopóki aplikacja nie jest w sklepie —
przyciski pokazują wtedy „Wkrótce w App Store”. Po publikacji wpisz URL i podmień przycisk
na oficjalną plakietkę Apple („Pobierz w App Store”), zgodnie z wytycznymi Apple.
