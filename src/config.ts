// Site-wide settings. The App Store link stays empty until the listing is live;
// an empty link renders as a "coming soon" badge instead of a dead button.
export const site = {
  name: 'Peronka',
  tagline: 'Odjazdy i opóźnienia na żywo',
  description:
    'Odjazdy, przyjazdy, perony i opóźnienia pociągów ze stacji w całej Polsce — na żywo, z oficjalnych danych PKP PLK. Bez konta, za darmo.',
  appStoreUrl: '',
  // Override with PUBLIC_STATUS_API_BASE (e.g. http://localhost:8080) to
  // point the status page at a local backend.
  statusApiBase: import.meta.env.PUBLIC_STATUS_API_BASE ?? 'https://api.peronka.pl',
  disclaimer: 'Aplikacja niezależna — niepowiązana z PKP PLK S.A.',
  owner: {
    name: 'Chlebowski.it Filip Chlebowski',
    nip: '9522266552',
    url: 'https://chlebowski.it',
  },
  emails: {
    main: 'kontakt@peronka.pl',
    bugs: 'kontakt@peronka.pl',
    feedback: 'kontakt@peronka.pl',
    privacy: 'kontakt@peronka.pl',
  },
} as const;

// Mirrors backend/internal/status/types.go so the status page has a
// meaningful skeleton before /api/status responds.
export const statusComponents = [
  { key: 'api_schedule', name: 'API rozkładu', description: 'Endpoint api.peronka.app/v1 — pobieranie odjazdów i przyjazdów.' },
  { key: 'pdp_opendata', name: 'Dane PKP PLK OpenData', description: 'Źródło rozkładu i opóźnień — pdp-api.plk-sa.pl.' },
  { key: 'push', name: 'Powiadomienia push', description: 'Dostarczanie powiadomień o opóźnieniach i zmianach peronu.' },
  { key: 'ios_app', name: 'Aplikacja iOS', description: 'Aplikacja mobilna w App Store.' },
  { key: 'website', name: 'Strona peronka.pl', description: 'Strona publiczna i landing page.' },
] as const;

export const nav = [
  { href: '/#aplikacja', label: 'Aplikacja' },
  { href: '/#widzety', label: 'Widżety' },
  { href: '/#dane', label: 'Dane' },
  { href: '/status/', label: 'Status' },
] as const;
