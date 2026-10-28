// Illustrative departures for the hero board and the home-screen widgets, in
// the same shape the app shows on the departures screen. Shared by the server
// render (first paint) and station-sim.ts (the live simulation), so both
// derive rows the same way.

export type State = 'ok' | 'late' | 'in';

export interface Departure {
  id: number;
  planned: number; // minutes after midnight
  delay: number; // minutes
  train: string;
  color: string;
  dest: string;
  via: string;
  platform: number;
  track: number;
}

export type Train = Pick<Departure, 'train' | 'color' | 'dest' | 'via'>;

const EIP = '#7c3aed';
const IC = '#2563eb';
const TLK = '#475569';
const KM = '#16a34a';

// A train shows "Wjeżdża" this many minutes before it actually leaves.
export const ARRIVING = 3;

export const START = toMinutes('14:32');

export const initial: Departure[] = [
  { id: 0, planned: toMinutes('14:35'), delay: 0, train: 'EIP 1602', color: EIP, dest: 'Gdańsk Główny', via: 'przez Iława, Malbork', platform: 4, track: 8 },
  { id: 1, planned: toMinutes('14:38'), delay: 4, train: 'KM 19210', color: KM, dest: 'Skierniewice', via: 'przez Pruszków, Żyrardów', platform: 1, track: 2 },
  { id: 2, planned: toMinutes('14:41'), delay: 0, train: 'IC 3512', color: IC, dest: 'Kraków Główny', via: 'przez Radom, Kielce', platform: 3, track: 6 },
  { id: 3, planned: toMinutes('14:47'), delay: 12, train: 'TLK 38108', color: TLK, dest: 'Białystok', via: 'przez Małkinia', platform: 2, track: 4 },
  { id: 4, planned: toMinutes('14:50'), delay: 0, train: 'IC 1408', color: IC, dest: 'Poznań Główny', via: 'przez Kutno, Konin', platform: 5, track: 9 },
];

// Join the bottom of the board, in rotation, as earlier trains depart.
export const upcoming: Train[] = [
  { train: 'KM 19312', color: KM, dest: 'Łuków', via: 'przez Mińsk Mazowiecki, Siedlce' },
  { train: 'EIP 4500', color: EIP, dest: 'Katowice', via: 'przez Zawiercie, Sosnowiec Główny' },
  { train: 'IC 6100', color: IC, dest: 'Wrocław Główny', via: 'przez Łódź Kaliska, Kalisz' },
  { train: 'TLK 51104', color: TLK, dest: 'Olsztyn Główny', via: 'przez Działdowo, Nidzica' },
  { train: 'KM 19615', color: KM, dest: 'Radom', via: 'przez Piaseczno, Warka' },
  { train: 'IC 3818', color: IC, dest: 'Lublin Główny', via: 'przez Dęblin, Puławy' },
  { train: 'EIP 5300', color: EIP, dest: 'Rzeszów Główny', via: 'przez Kraków Główny, Tarnów' },
  { train: 'TLK 18100', color: TLK, dest: 'Szczecin Główny', via: 'przez Poznań Główny, Krzyż' },
  { train: 'KM 19224', color: KM, dest: 'Łowicz Główny', via: 'przez Błonie, Sochaczew' },
];

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function fmt(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function departsAt(d: Departure): number {
  return d.planned + d.delay;
}

export function untilText(d: Departure, now: number): string {
  return `za ${departsAt(d) - now} min`;
}

// The small widget's countdown, with the delay when there is one.
export function countdown(d: Departure, now: number): string {
  return d.delay > 0 ? `${untilText(d, now)} · +${d.delay} min` : untilText(d, now);
}

// Compact status for the medium widget's pill.
export function shortStatus(d: Departure, now: number): string {
  const { state } = view(d, now);
  return state === 'in' ? 'wjeżdża' : state === 'late' ? `+${d.delay}` : 'plan';
}

// Widget-sized station names: "Gdańsk Główny" → "Gdańsk Gł.".
export function shortName(name: string): string {
  return name.replace(/ Główny$/, ' Gł.').replace(/^Warszawa /, 'W-wa ');
}

export function disruptions(trains: readonly Departure[]): string {
  const n = trains.filter((d) => d.delay > 0).length;
  if (n === 0) return 'Bez utrudnień';
  if (n === 1) return '1 utrudnienie';
  const few = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
  return `${n} ${few ? 'utrudnienia' : 'utrudnień'}`;
}

// What a row displays at a given moment.
export function view(d: Departure, now: number) {
  const state: State = departsAt(d) - now <= ARRIVING ? 'in' : d.delay > 0 ? 'late' : 'ok';
  return {
    time: fmt(departsAt(d)),
    planned: d.delay > 0 ? fmt(d.planned) : '',
    platform: `Peron ${d.platform}`,
    state,
    status: state === 'in' ? 'Wjeżdża' : state === 'late' ? `+${d.delay} min` : 'Planowo',
  };
}
