// In-browser clock for the demo departures on the landing page. The hero board
// and the home-screen widgets subscribe to this one simulation, so they always
// agree on the time and on which train leaves next.
import { ARRIVING, START, departsAt, initial, upcoming, type Departure } from './departures';

export interface Change {
  kind: 'delay' | 'platform';
  id: number;
}

export interface Frame {
  now: number;
  trains: readonly Departure[]; // not yet departed, in board order (by planned time)
  changes: readonly Change[];
}

// One simulated minute per tick, so the demo moves at a watchable pace.
const TICK_MS = 3000;
// The biggest view shows five rows; one more waits to slide in.
const QUEUE = 6;

let now = START;
let tick = 0;
let nextTrain = 0;
let nextId = initial.length;
let lastPlanned = Math.max(...initial.map((d) => d.planned));
const trains: Departure[] = initial.map((d) => ({ ...d }));

function rand(n: number) {
  return Math.floor(Math.random() * n);
}

// Platform n serves tracks 2n−1 and 2n.
function trackFor(platform: number) {
  return platform * 2 - rand(2);
}

function nextDeparture(): Departure {
  lastPlanned = Math.max(lastPlanned, now) + 2 + rand(5);
  const platform = 1 + rand(5);
  return {
    ...upcoming[nextTrain++ % upcoming.length],
    id: nextId++,
    planned: lastPlanned,
    delay: Math.random() < 0.75 ? 0 : 2 + rand(9),
    platform,
    track: trackFor(platform),
  };
}

function fill() {
  while (trains.length < QUEUE) trains.push(nextDeparture());
}

fill();
let frame: Frame = { now, trains: [...trains], changes: [] };

const listeners = new Set<(frame: Frame) => void>();

function step() {
  now += 1;
  tick += 1;
  for (let i = trains.length - 1; i >= 0; i--) if (departsAt(trains[i]) <= now) trains.splice(i, 1);
  fill();

  // Every few minutes something changes, like on a real station board. Delays
  // stay moderate so the board does not read as a meltdown.
  const changes: Change[] = [];
  const changeable = trains.slice(0, 5).filter((d) => departsAt(d) - now > ARRIVING + 2 && d.delay < 10);
  const target = changeable[rand(changeable.length)];
  if (target && tick % 5 === 2) {
    target.delay += 2 + rand(3);
    changes.push({ kind: 'delay', id: target.id });
  } else if (target && tick % 7 === 5) {
    // Shift by 1–4 so the platform always differs (platforms 1–5).
    target.platform = ((target.platform + rand(4)) % 5) + 1;
    target.track = trackFor(target.platform);
    changes.push({ kind: 'platform', id: target.id });
  }

  frame = { now, trains: [...trains], changes };
  for (const listener of listeners) listener(frame);
}

// Tick only while at least one subscribed view is on screen and the tab is visible.
const onScreen = new Set<Element>();
let timer = 0;
let observer: IntersectionObserver | undefined;

function sync() {
  const run = onScreen.size > 0 && !document.hidden;
  if (run && !timer) timer = window.setInterval(step, TICK_MS);
  if (!run && timer) {
    clearInterval(timer);
    timer = 0;
  }
}

// Calls `listener` with every simulated minute; returns the current frame.
export function subscribe(view: Element, listener: (frame: Frame) => void): Frame {
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      sync();
    });
    document.addEventListener('visibilitychange', sync);
  }
  observer.observe(view);
  listeners.add(listener);
  return frame;
}
