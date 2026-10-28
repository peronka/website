// Demo journey for the Live Activity card on the landing page: EIP 5402 from
// Warszawa to Gdańsk. Shared by the server render and the in-browser
// animation, so both place the train the same way.
import { fmt, toMinutes } from './departures';

export interface Stop {
  name: string;
  time: number; // planned departure; arrival for the last stop
  platform: number;
}

export const stops: Stop[] = [
  { name: 'W-wa Wsch.', time: toMinutes('08:12'), platform: 4 },
  { name: 'Ciechanów', time: toMinutes('09:01'), platform: 1 },
  { name: 'Działdowo', time: toMinutes('09:34'), platform: 2 },
  { name: 'Iława', time: toMinutes('10:02'), platform: 3 },
  { name: 'Tczew', time: toMinutes('10:55'), platform: 2 },
  { name: 'Gdańsk Gł.', time: toMinutes('11:42'), platform: 4 },
];

// Just before Działdowo, as in the design export.
export const JOURNEY_START = toMinutes('09:36');
export const JOURNEY_DELAY: number = 8;

// Minutes the train stands at each intermediate stop before departing.
const DWELL = 3;

// focus: the stop the train stands at or heads to; upcoming: the one after it.
export type StopState = 'passed' | 'focus' | 'upcoming' | 'future';

export function journey(now: number, delay: number) {
  const last = stops.length - 1;
  const dep = stops.map((s) => s.time + delay);
  const arr = dep.map((t, i) => (i === 0 || i === last ? t : t - DWELL));

  let position = last;
  let focus = last;
  let standing = true;
  for (let i = 1; i <= last; i++) {
    if (now < arr[i]) {
      position = i - 1 + Math.max(0, (now - dep[i - 1]) / (arr[i] - dep[i - 1]));
      focus = i;
      standing = false;
      break;
    }
    if (i < last && now < dep[i]) {
      position = i;
      focus = i;
      break;
    }
  }

  const arrived = now >= arr[last];
  const next = standing && focus < last ? focus + 1 : focus;
  return {
    position, // 0…last, fractional between stops
    states: stops.map((_, i): StopState =>
      i < focus ? 'passed' : i === focus ? 'focus' : i === focus + 1 ? 'upcoming' : 'future',
    ),
    // Time left to the destination; the footer counts down to the next stop.
    headline: arrived ? 'Na miejscu' : `za ${duration(arr[last] - now)}`,
    delayText: delay > 0 ? `+${delay} min opóźnienia` : 'Bez opóźnienia',
    next: `${stops[next].name} · peron ${stops[next].platform}`,
    nextIn: arrived ? 'na miejscu' : `za ${arr[next] - now} min`,
    arrival: fmt(dep[last]),
    arrived,
  };
}

function duration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// Horizontal position on the route line, as a percentage of its width.
export function routeOffset(position: number): string {
  return `${((2 * position + 1) / (2 * stops.length)) * 100}%`;
}
