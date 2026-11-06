import { describe, expect, it } from 'vitest';
import { ABILITIES, AREAS, ROADS, TOTALS } from '../src/data/world';
import { ENTRIES } from '../src/data/entries';
import { LOCKOUTS } from '../src/data/lockouts';
import {
  availableIn,
  checksFor,
  freshState,
  isTripWorthwhile,
  moveTo,
  neighbours,
  planTrip,
  returnItems,
  routeAreas,
  routeStops,
  sanitize,
  setDestination,
  sideTrips,
  statusOf,
  tokenCount,
  toggleAbility,
  toggleDetour,
  toggleDone,
} from '../src/logic';
import type { Entry, State } from '../src/types';

const entry = (id: string): Entry => ENTRIES.find((e) => e.id === id)!;
const withOwned = (...owned: string[]): State => ({ ...freshState(), owned });

describe('data integrity', () => {
  it('uses unique ids and valid references', () => {
    const ids = ENTRIES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    const areas = new Set(AREAS.map((a) => a.id));
    const abilities = new Set(ABILITIES.map((a) => a.id));
    for (const e of ENTRIES) {
      expect(areas.has(e.area), e.id).toBe(true);
      for (const need of e.needs) expect(abilities.has(need), `${e.id}:${need}`).toBe(true);
      if (e.grants) expect(abilities.has(e.grants), e.id).toBe(true);
      expect(e.sources.length, e.id).toBeGreaterThan(0);
    }
    for (const lockout of LOCKOUTS) {
      if (lockout.area) expect(areas.has(lockout.area), lockout.id).toBe(true);
    }
  });

  it('connects every area by road', () => {
    const seen = new Set(['kokiri']);
    const queue = ['kokiri'];
    while (queue.length) {
      for (const next of neighbours(queue.shift()!)) {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
    expect(seen.size).toBe(AREAS.length);
    for (const [a, b] of ROADS) expect(a).not.toBe(b);
  });

  it('never lists more than the game totals', () => {
    const count = (kind: Entry['kind']) => ENTRIES.filter((e) => e.kind === kind).length;
    expect(count('skulltula')).toBeLessThanOrEqual(TOTALS.skulltula);
    expect(count('heart')).toBeLessThanOrEqual(TOTALS.heart);
    expect(count('bottle')).toBeLessThanOrEqual(TOTALS.bottle);
    expect(count('song')).toBeLessThanOrEqual(TOTALS.song);
  });
});

describe('what you can get now', () => {
  it('separates available from not yet possible', () => {
    const state = freshState();
    expect(statusOf(entry('gs-deku-switch'), state)).toBe('now');
    expect(statusOf(entry('gs-deku-gate'), state)).toBe('blocked');
    expect(statusOf(entry('gs-deku-gate'), withOwned('slingshot'))).toBe('now');
  });

  it('requires every listed ability', () => {
    expect(statusOf(entry('gs-field-grotto'), withOwned('bombs'))).toBe('blocked');
    expect(statusOf(entry('gs-field-grotto'), withOwned('bombs', 'boomerang'))).toBe('now');
  });

  it('marks ticked entries as done', () => {
    const state = toggleDone(freshState(), 'gs-deku-switch');
    expect(statusOf(entry('gs-deku-switch'), state)).toBe('done');
    expect(tokenCount(state)).toBe(1);
  });

  it('unlocks token rewards from ticked and manually added tokens', () => {
    expect(statusOf(entry('reward-10'), freshState())).toBe('blocked');
    expect(statusOf(entry('reward-10'), { ...freshState(), extraTokens: 9 })).toBe('blocked');
    const nine = { ...freshState(), extraTokens: 9 };
    expect(statusOf(entry('reward-10'), toggleDone(nine, 'gs-deku-switch'))).toBe('now');
  });

  it('gives you a bottle when you tick one, and keeps it if you untick', () => {
    const state = toggleDone(freshState(), 'bottle-ranch');
    expect(state.owned).toContain('bottle');
    expect(toggleDone(state, 'bottle-ranch').owned).toContain('bottle');
  });
});

describe('checks', () => {
  it('only asks about things that would unblock an entry here', () => {
    expect(checksFor('deku', freshState()).map((a) => a.id)).toEqual(['slingshot']);
    expect(checksFor('deku', withOwned('slingshot'))).toEqual([]);
  });

  it('does not name later abilities before their earlier steps', () => {
    const asked = (state: State) => AREAS.flatMap((a) => checksFor(a.id, state)).map((a) => a.id);
    expect(asked(freshState())).not.toContain('boomerang');
    expect(asked(freshState())).not.toContain('bombs');
    expect(asked(withOwned('dekuClear', 'ocarina', 'lullaby'))).toContain('bombs');
    expect(asked(withOwned('dekuClear', 'ocarina', 'lullaby', 'bombs'))).toContain('boomerang');
  });

  it('stops asking about an ability once you confirm it', () => {
    const state = toggleAbility(freshState(), 'slingshot');
    expect(checksFor('deku', state).map((a) => a.id)).not.toContain('slingshot');
  });
});

describe('leaving an area', () => {
  it('remembers what you skipped and records the new visit', () => {
    const state = { ...freshState(), current: 'deku', visited: ['deku'] };
    const moved = moveTo(state, 'kokiri');
    expect(moved.current).toBe('kokiri');
    expect(moved.visited).toEqual(['deku', 'kokiri']);
    expect(moved.skipped).toEqual(availableIn('deku', state).map((e) => e.id));
  });

  it('treats moving to the current area as no change', () => {
    const state = freshState();
    expect(moveTo(state, 'kokiri')).toBe(state);
  });

  it('clears a skipped entry when you collect it', () => {
    const state = { ...freshState(), skipped: ['gs-deku-switch'] };
    expect(toggleDone(state, 'gs-deku-switch').skipped).toEqual([]);
  });
});

describe('return trips', () => {
  const everything = ['dekuClear', 'slingshot', 'bottle'];

  it('only includes visited areas other than the current one', () => {
    const state: State = { ...withOwned(...everything), visited: ['kokiri', 'deku'] };
    const areas = new Set(returnItems(state).map((e) => e.area));
    expect(areas.has('deku')).toBe(true);
    expect(areas.has('kokiri')).toBe(false);
    expect(areas.has('kakariko')).toBe(false);
  });

  it('plans a connected route, picking items up in areas it passes through', () => {
    const state: State = {
      ...withOwned(...everything),
      current: 'deku',
      visited: ['deku', 'kokiri', 'field', 'market', 'kakariko'],
    };
    const trip = planTrip(state);
    const route = ['deku', ...trip.map((s) => s.area)];
    route.slice(1).forEach((area, i) => {
      expect(neighbours(route[i])).toContain(area);
    });
    const wanted = new Set(returnItems(state).map((e) => e.area));
    for (const area of wanted) expect(trip.find((s) => s.area === area)?.entries.length).toBeGreaterThan(0);
    expect(new Set(trip.flatMap((s) => s.entries)).size).toBe(returnItems(state).length);
  });

  it('holds back until a trip is worthwhile', () => {
    const none = freshState();
    expect(planTrip(none)).toEqual([]);
    expect(isTripWorthwhile(none)).toBe(false);
    const three: State = { ...withOwned('slingshot'), visited: ['kokiri', 'deku'] };
    expect(returnItems(three).length).toBeGreaterThanOrEqual(3);
    expect(isTripWorthwhile(three)).toBe(true);
  });
});

describe('heading somewhere', () => {
  const afterDeku = (): State => ({ ...withOwned('dekuClear', 'slingshot'), current: 'kokiri', visited: ['deku', 'kokiri'] });

  it('routes along connected roads to the destination', () => {
    const route = routeAreas(setDestination(afterDeku(), 'castle'));
    expect(route).toEqual(['kokiri', 'field', 'market', 'castle']);
  });

  it('lists only what is on the way, in order', () => {
    const stops = routeStops(setDestination(afterDeku(), 'castle'));
    expect(stops.map((s) => s.area)).toEqual(['field', 'market', 'castle']);
    expect(stops.flatMap((s) => s.entries)).toContain('gs-market-crate');
    expect(stops.flatMap((s) => s.entries)).not.toContain('gs-kak-tree');
  });

  it('has no route and no side trips without a destination', () => {
    expect(routeAreas(afterDeku())).toEqual(['kokiri']);
    expect(sideTrips(afterDeku())).toEqual([]);
  });

  it('suggests off-route areas only, with the best value first', () => {
    const trips = sideTrips(setDestination(afterDeku(), 'castle'));
    const areas = trips.map((t) => t.area);
    expect(areas).not.toContain('field');
    expect(areas).not.toContain('market');
    expect(areas[0]).toBe('kakariko');
    expect(areas).toContain('lonlon');
  });

  it('says when an area needs a later visit anyway', () => {
    const lonlon = sideTrips(setDestination(afterDeku(), 'castle')).find((t) => t.area === 'lonlon')!;
    expect(lonlon.steps).toBe(2);
    expect(lonlon.returnsAnyway).toBeGreaterThan(0);
  });

  it('adds a side trip as out and back, then rejoins the route', () => {
    const state = toggleDetour(setDestination(afterDeku(), 'castle'), 'lonlon');
    expect(routeAreas(state)).toEqual(['kokiri', 'field', 'lonlon', 'field', 'market', 'castle']);
    expect(routeStops(state).map((s) => s.area)).toEqual(['field', 'lonlon', 'market', 'castle']);
    expect(sideTrips(state).find((t) => t.area === 'lonlon')?.added).toBe(true);
  });

  it('does not walk a shared branch twice', () => {
    let state = setDestination(afterDeku(), 'castle');
    state = toggleDetour(toggleDetour(state, 'kakariko'), 'graveyard');
    expect(routeAreas(state)).toEqual([
      'kokiri', 'field', 'kakariko', 'graveyard', 'kakariko', 'field', 'market', 'castle',
    ]);
  });

  it('clears the route on arrival and keeps it on the way', () => {
    let state = setDestination(afterDeku(), 'market');
    state = moveTo(state, 'field');
    expect(state.destination).toBe('market');
    expect(routeAreas(state)).toEqual(['field', 'market']);
    state = moveTo(state, 'market');
    expect(state.destination).toBeNull();
    expect(state.detours).toEqual([]);
  });

  it('removes a side trip once you reach it', () => {
    let state = toggleDetour(setDestination(afterDeku(), 'castle'), 'lonlon');
    state = moveTo(moveTo(state, 'field'), 'lonlon');
    expect(state.detours).toEqual([]);
    expect(state.destination).toBe('castle');
  });

  it('ignores a destination equal to the current area', () => {
    expect(setDestination(afterDeku(), 'kokiri').destination).toBeNull();
  });

  it('keeps older saves working', () => {
    const { destination: _d, detours: _t, ...old } = afterDeku();
    const loaded = sanitize(old);
    expect(loaded.destination).toBeNull();
    expect(loaded.detours).toEqual([]);
    expect(loaded.owned).toEqual(afterDeku().owned);
  });
});

describe('restoring saved data', () => {
  it('falls back to a fresh state on junk', () => {
    expect(sanitize(null)).toEqual(freshState());
    expect(sanitize('oops')).toEqual(freshState());
  });

  it('drops unknown ids and clamps numbers', () => {
    const state = sanitize({
      current: 'nowhere',
      visited: ['deku', 'nowhere', 7],
      owned: ['slingshot', 'hack'],
      done: ['gs-deku-switch', 'gs-deku-switch', 'nope'],
      extraTokens: 5000,
    });
    expect(state.current).toBe('kokiri');
    expect(state.visited).toEqual(['deku', 'kokiri']);
    expect(state.owned).toEqual(['slingshot']);
    expect(state.done).toEqual(['gs-deku-switch']);
    expect(state.extraTokens).toBe(100);
  });

  it('survives a save and restore round trip', () => {
    const state = toggleDone(moveTo(withOwned('slingshot'), 'deku'), 'gs-deku-gate');
    expect(sanitize(JSON.parse(JSON.stringify(state)))).toEqual(state);
  });
});
