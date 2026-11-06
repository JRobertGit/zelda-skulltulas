import { ABILITIES, AREAS, ROADS } from './data/world';
import { ENTRIES } from './data/entries';
import type { Ability, Entry, SideTrip, State, Status, TripStop } from './types';

/** Picking a route with fewer items than this isn't worth a dedicated trip. */
export const WORTHWHILE_TRIP = 3;

/** A side trip is suggested when it collects at least this many things per extra step. */
export const WORTHWHILE_SIDE_TRIP = 1;

export function freshState(): State {
  return {
    version: 1,
    current: 'kokiri',
    visited: ['kokiri'],
    owned: [],
    done: [],
    skipped: [],
    flagged: [],
    extraTokens: 0,
    destination: null,
    detours: [],
  };
}

export function tokenCount(state: State, entries: Entry[] = ENTRIES): number {
  const done = new Set(state.done);
  return entries.filter((e) => e.kind === 'skulltula' && done.has(e.id)).length + state.extraTokens;
}

export function statusOf(entry: Entry, state: State, entries: Entry[] = ENTRIES): Status {
  if (state.done.includes(entry.id)) return 'done';
  const hasNeeds = entry.needs.every((n) => state.owned.includes(n));
  const hasTokens = entry.minTokens === undefined || tokenCount(state, entries) >= entry.minTokens;
  return hasNeeds && hasTokens ? 'now' : 'blocked';
}

export function entriesIn(area: string, entries: Entry[] = ENTRIES): Entry[] {
  return entries.filter((e) => e.area === area);
}

export function availableIn(area: string, state: State, entries: Entry[] = ENTRIES): Entry[] {
  return entriesIn(area, entries).filter((e) => statusOf(e, state, entries) === 'now');
}

/** Questions worth asking here: they'd unblock something, and their earlier steps are confirmed. */
export function checksFor(area: string, state: State, entries: Entry[] = ENTRIES): Ability[] {
  const blocked = entriesIn(area, entries).filter((e) => statusOf(e, state, entries) === 'blocked');
  const wanted = new Set(blocked.flatMap((e) => e.needs).filter((n) => !state.owned.includes(n)));
  return ABILITIES.filter(
    (a) => wanted.has(a.id) && a.askAfter.every((p) => state.owned.includes(p)),
  );
}

export function neighbours(area: string): string[] {
  return ROADS.flatMap(([a, b]) => (a === area ? [b] : b === area ? [a] : []));
}

function shortestPath(from: string, to: string): string[] {
  const previous = new Map<string, string | null>([[from, null]]);
  const queue = [from];
  while (queue.length > 0) {
    const here = queue.shift()!;
    if (here === to) break;
    for (const next of neighbours(here)) {
      if (!previous.has(next)) {
        previous.set(next, here);
        queue.push(next);
      }
    }
  }
  const path: string[] = [];
  for (let step: string | null | undefined = to; step; step = previous.get(step)) path.unshift(step);
  return path[0] === from ? path : [];
}

/** Things collectable now in places already visited, except where the player is standing. */
export function returnItems(state: State, entries: Entry[] = ENTRIES): Entry[] {
  return entries.filter(
    (e) =>
      e.area !== state.current &&
      state.visited.includes(e.area) &&
      statusOf(e, state, entries) === 'now',
  );
}

/** A walking route through every area with return items, always going to the nearest next. */
export function planTrip(state: State, entries: Entry[] = ENTRIES): TripStop[] {
  const items = returnItems(state, entries);
  const remaining = new Set(items.map((e) => e.area));
  const stops: TripStop[] = [];
  let here = state.current;
  while (remaining.size > 0) {
    const paths = [...remaining].map((area) => shortestPath(here, area)).filter((p) => p.length > 0);
    if (paths.length === 0) break;
    const path = paths.reduce((best, p) => (p.length < best.length ? p : best));
    for (const area of path.slice(1)) {
      remaining.delete(area);
      stops.push({ area, entries: items.filter((e) => e.area === area).map((e) => e.id) });
    }
    here = path[path.length - 1];
  }
  return stops;
}

export function isTripWorthwhile(state: State, entries: Entry[] = ENTRIES): boolean {
  return returnItems(state, entries).length >= WORTHWHILE_TRIP;
}

/** The areas to walk through in order, starting at the current one, including added side trips. */
export function routeAreas(state: State): string[] {
  if (!state.destination) return [state.current];
  const path = shortestPath(state.current, state.destination);
  const distanceFromPath = (area: string) =>
    Math.min(...path.map((node) => shortestPath(node, area).length - 1));
  const offRoute = state.detours
    .filter((d) => !path.includes(d))
    .sort((a, b) => distanceFromPath(b) - distanceFromPath(a));
  const route: string[] = [];
  for (const node of path) {
    route.push(node);
    for (const detour of offRoute) {
      if (route.includes(detour)) continue;
      const attachesHere = path.find(
        (p) => shortestPath(p, detour).length - 1 === distanceFromPath(detour),
      );
      if (attachesHere !== node) continue;
      const out = shortestPath(node, detour);
      route.push(...out.slice(1), ...out.slice(0, -1).reverse());
    }
  }
  return route;
}

/** What to collect at each stop on the way, excluding where the player is standing. */
export function routeStops(state: State, entries: Entry[] = ENTRIES): TripStop[] {
  const seen = new Set([state.current]);
  const stops: TripStop[] = [];
  for (const area of routeAreas(state)) {
    if (seen.has(area)) continue;
    seen.add(area);
    stops.push({ area, entries: availableIn(area, state, entries).map((e) => e.id) });
  }
  return stops;
}

/** Off-route areas worth a detour, or already added, with the best value first. */
export function sideTrips(state: State, entries: Entry[] = ENTRIES): SideTrip[] {
  if (!state.destination) return [];
  const path = shortestPath(state.current, state.destination);
  const trips: (SideTrip & { value: number })[] = [];
  for (const { id: area } of AREAS) {
    if (path.includes(area)) continue;
    const items = availableIn(area, state, entries).length;
    if (items === 0) continue;
    const distance = Math.min(...path.map((node) => shortestPath(node, area).length - 1));
    const steps = distance * 2;
    const value = items / steps;
    const added = state.detours.includes(area);
    if (value < WORTHWHILE_SIDE_TRIP && !added) continue;
    const returnsAnyway = entriesIn(area, entries).filter(
      (e) => statusOf(e, state, entries) === 'blocked',
    ).length;
    trips.push({ area, items, steps, returnsAnyway, added, value });
  }
  return trips
    .sort((a, b) => b.value - a.value)
    .map(({ value: _value, ...trip }) => trip);
}

export function setDestination(state: State, area: string | null): State {
  return { ...state, destination: area === state.current ? null : area, detours: [] };
}

export function toggleDetour(state: State, area: string): State {
  return { ...state, detours: toggled(state.detours, area) };
}

function toggled(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function toggleDone(state: State, id: string, entries: Entry[] = ENTRIES): State {
  const entry = entries.find((e) => e.id === id);
  if (!entry) return state;
  const finishing = !state.done.includes(id);
  const owned =
    finishing && entry.grants && !state.owned.includes(entry.grants)
      ? [...state.owned, entry.grants]
      : state.owned;
  return {
    ...state,
    owned,
    done: toggled(state.done, id),
    skipped: state.skipped.filter((x) => x !== id),
  };
}

export function toggleAbility(state: State, id: string): State {
  return { ...state, owned: toggled(state.owned, id) };
}

export function toggleFlag(state: State, id: string): State {
  return { ...state, flagged: toggled(state.flagged, id) };
}

/** Moves to another area. Whatever is still available here gets remembered as skipped. */
export function moveTo(state: State, area: string, entries: Entry[] = ENTRIES): State {
  if (area === state.current) return state;
  const left = availableIn(state.current, state, entries).map((e) => e.id);
  return {
    ...state,
    current: area,
    visited: state.visited.includes(area) ? state.visited : [...state.visited, area],
    skipped: [...new Set([...state.skipped, ...left])],
    destination: area === state.destination ? null : state.destination,
    detours: area === state.destination ? [] : state.detours.filter((d) => d !== area),
  };
}

/** Rebuilds a state from untrusted saved or imported data, dropping anything unknown. */
export function sanitize(raw: unknown): State {
  const base = freshState();
  if (typeof raw !== 'object' || raw === null) return base;
  const data = raw as Record<string, unknown>;
  const areaIds = new Set(AREAS.map((a) => a.id));
  const entryIds = new Set(ENTRIES.map((e) => e.id));
  const abilityIds = new Set(ABILITIES.map((a) => a.id));
  const pick = (value: unknown, allowed: Set<string>): string[] =>
    Array.isArray(value)
      ? [...new Set(value.filter((v): v is string => typeof v === 'string' && allowed.has(v)))]
      : [];
  const current =
    typeof data.current === 'string' && areaIds.has(data.current) ? data.current : base.current;
  const visited = pick(data.visited, areaIds);
  const extra = Number(data.extraTokens);
  return {
    version: 1,
    current,
    visited: visited.includes(current) ? visited : [...visited, current],
    owned: pick(data.owned, abilityIds),
    done: pick(data.done, entryIds),
    skipped: pick(data.skipped, entryIds),
    flagged: pick(data.flagged, entryIds),
    extraTokens: Number.isFinite(extra) ? Math.min(100, Math.max(0, Math.floor(extra))) : 0,
    destination:
      typeof data.destination === 'string' && areaIds.has(data.destination) && data.destination !== current
        ? data.destination
        : null,
    detours: pick(data.detours, areaIds),
  };
}
