import { describe, expect, it } from 'vitest';
import { ABILITIES, AREAS, ROADS, TOTALS } from '../src/data/world';
import { ENTRIES } from '../src/data/entries';
import { LOCKOUTS } from '../src/data/lockouts';
import {
  availableIn,
  checksFor,
  freshState,
  heartTotals,
  isTripWorthwhile,
  lockoutsFor,
  markNotYet,
  moveTo,
  neighbours,
  nextQuestion,
  planTrip,
  returnItems,
  revealedAreas,
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
  waitingFor,
  waitingGates,
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

  it('lists exactly the totals the guides give', () => {
    const count = (kind: Entry['kind']) => ENTRIES.filter((e) => e.kind === kind).length;
    expect(count('skulltula')).toBe(TOTALS.skulltula);
    expect(count('heart')).toBe(TOTALS.heart);
    expect(count('bottle')).toBe(TOTALS.bottle);
    expect(count('song')).toBe(TOTALS.song);
  });

  it('makes everything collectable once every check is confirmed', () => {
    let all: State = { ...freshState(), owned: ABILITIES.map((a) => a.id), extraTokens: 100 };
    let ticked = true;
    while (ticked) {
      ticked = false;
      for (const e of ENTRIES) {
        if (statusOf(e, all) === 'now') {
          all = toggleDone(all, e.id);
          ticked = true;
        }
      }
    }
    expect(ENTRIES.filter((e) => statusOf(e, all) !== 'done').map((e) => e.id)).toEqual([]);
    expect(revealedAreas(all)).toHaveLength(AREAS.length);
  });

  it('can reach every check by following the askAfter chain', () => {
    const owned = new Set<string>();
    let grew = true;
    while (grew) {
      grew = false;
      for (const a of ABILITIES) {
        if (!owned.has(a.id) && a.askAfter.every((p) => owned.has(p))) {
          owned.add(a.id);
          grew = true;
        }
      }
    }
    expect(owned.size).toBe(ABILITIES.length);
  });

  it('links each check to an entry that gives that check back', () => {
    for (const a of ABILITIES.filter((x) => x.entry)) {
      expect(ENTRIES.find((e) => e.id === a.entry)?.grants, a.id).toBe(a.id);
    }
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
    expect(statusOf(entry('gs-field-grotto'), withOwned('bombs', 'adult'))).toBe('blocked');
    expect(statusOf(entry('gs-field-grotto'), withOwned('bombs', 'hookshot'))).toBe('blocked');
    expect(statusOf(entry('gs-field-grotto'), withOwned('bombs', 'hookshot', 'adult'))).toBe('now');
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
    expect(asked(withOwned('dekuClear', 'ocarina', 'lullaby', 'saria', 'bracelet'))).toContain('bombs');
    expect(asked(withOwned('dekuClear', 'ocarina', 'lullaby', 'saria', 'bracelet', 'bombs'))).toContain('boomerang');
  });

  it('stops asking about an ability once you confirm it', () => {
    const state = toggleAbility(freshState(), 'slingshot');
    expect(checksFor('deku', state).map((a) => a.id)).not.toContain('slingshot');
  });
});

describe('quests in order', () => {
  it('unlocks each step only after the one before', () => {
    let state = withOwned('adult');
    expect(statusOf(entry('q-egg'), state)).toBe('now');
    expect(statusOf(entry('q-cucco'), state)).toBe('blocked');
    state = toggleDone(state, 'q-egg');
    expect(statusOf(entry('q-cucco'), state)).toBe('now');
  });

  it('does not name a later mask until the earlier one is sold', () => {
    const state = toggleDone(withOwned('bombs'), 'mask-keaton');
    expect(availableIn('market', state).map((e) => e.id)).not.toContain('mask-skull');
    expect(availableIn('kakariko', state).map((e) => e.id)).toContain('mask-keaton-sell');
    const sold = toggleDone(state, 'mask-keaton-sell');
    expect(availableIn('market', sold).map((e) => e.id)).toContain('mask-skull');
  });

  it('every step references an entry that exists', () => {
    for (const e of ENTRIES) if (e.after) expect(entry(e.after), e.id).toBeDefined();
  });
});

describe('story items', () => {
  it('never prompt a warning, a route or a return trip', () => {
    const state = withOwned('slingshot');
    expect(availableIn('deku', state).map((e) => e.id)).not.toContain('story-emerald');
    const away: State = { ...withOwned('slingshot'), visited: ['kokiri', 'deku'] };
    expect(returnItems(away).map((e) => e.kind)).not.toContain('story');
    expect(statusOf(entry('story-emerald'), state)).toBe('now');
  });

  it('count when you confirm the matching check', () => {
    expect(toggleAbility(freshState(), 'bracelet').done).toContain('story-bracelet');
  });

  it('are filled in for older saves that already confirmed the check', () => {
    const loaded = sanitize({ owned: ['dekuClear', 'saria'], done: [] });
    expect(loaded.done).toEqual(expect.arrayContaining(['story-emerald', 'song-saria']));
  });
});

describe('the next question', () => {
  it('reveals every area by answering only the next question', () => {
    let state = freshState();
    const asked: string[] = [];
    for (let question = nextQuestion(state); question; question = nextQuestion(state)) {
      asked.push(question.id);
      state = toggleAbility(state, question.id);
    }
    expect(asked[0]).toBe('dekuClear');
    expect(revealedAreas(state)).toHaveLength(AREAS.length);
  });

  it('never names anything past the next step', () => {
    expect(nextQuestion(freshState())?.id).toBe('dekuClear');
    expect(nextQuestion(withOwned('dekuClear'))?.id).toBe('ocarina');
    expect(nextQuestion(withOwned('dekuClear', 'ocarina'))?.id).toBe('lullaby');
  });

  it('keeps a not yet answer available so the map cannot get stuck', () => {
    const state = markNotYet(freshState(), 'dekuClear');
    expect(nextQuestion(state)).toBeNull();
    expect(waitingGates(state).map((a) => a.id)).toEqual(['dekuClear']);
    const answered = toggleAbility(state, 'dekuClear');
    expect(waitingGates(answered)).toEqual([]);
    expect(nextQuestion(answered)?.id).toBe('ocarina');
  });

  it('skips a question you already have', () => {
    expect(nextQuestion(withOwned('dekuClear', 'ocarina', 'lullaby'))?.id).toBe('saria');
  });
});

describe('hearts', () => {
  it('starts at 3 full hearts', () => {
    expect(heartTotals(freshState())).toEqual({ pieces: 0, containers: 0, full: 3, partial: 0 });
  });

  it('adds one per container and one per four pieces, with the rest as a partial heart', () => {
    const done = ['hp-ranch-silo', 'hp-kak-roof', 'hp-grave-dig', 'hp-grave-pull', 'hp-woods-mimic', 'story-heart-deku', 'story-heart-dodongo'];
    expect(heartTotals({ ...freshState(), done })).toEqual({ pieces: 5, containers: 2, full: 6, partial: 1 });
  });

  it('reaches exactly 20 with everything', () => {
    const done = ENTRIES.filter((e) => e.kind === 'heart' || e.id.startsWith('story-heart-')).map((e) => e.id);
    expect(heartTotals({ ...freshState(), done })).toEqual({ pieces: 36, containers: 8, full: 20, partial: 0 });
  });
});

describe('answering not yet', () => {
  it('stops asking, and clears the answer once you have it', () => {
    let state = markNotYet(freshState(), 'slingshot');
    expect(checksFor('deku', state)).toEqual([]);
    expect(waitingFor('deku', state).map((a) => a.id)).toEqual(['slingshot']);
    state = toggleAbility(state, 'slingshot');
    expect(state.notYet).toEqual([]);
    expect(waitingFor('deku', state)).toEqual([]);
  });
});

describe('songs', () => {
  const songs = (state: State) => state.done.filter((id) => entry(id)?.kind === 'song').length;

  it('counts a song confirmed through a check', () => {
    expect(songs(toggleAbility(freshState(), 'saria'))).toBe(1);
  });

  it('counts a song ticked directly, and treats it as confirmed', () => {
    const state = toggleDone(freshState(), 'song-saria');
    expect(songs(state)).toBe(1);
    expect(state.owned).toContain('saria');
  });

  it('does not double count, and undoes both ways', () => {
    const state = toggleDone(toggleAbility(freshState(), 'saria'), 'song-saria');
    expect(songs(state)).toBe(0);
    expect(state.owned).not.toContain('saria');
  });

  it("counts Epona's Song when ticked", () => {
    expect(songs(toggleDone(withOwned('ocarina'), 'song-epona'))).toBe(1);
  });
});

describe('spoiler protection', () => {
  it('shows only the first two areas on a fresh start', () => {
    expect(revealedAreas(freshState()).map((a) => a.id).sort()).toEqual(['deku', 'kokiri']);
  });

  it('asks nothing about later items on a fresh start', () => {
    const asked = new Set(AREAS.flatMap((a) => checksFor(a.id, freshState())).map((a) => a.id));
    expect([...asked].sort()).toEqual(['dekuClear', 'slingshot']);
  });

  it('keeps warnings hidden until they apply', () => {
    expect(lockoutsFor('temple', freshState())).toEqual([]);
    expect(lockoutsFor('temple', withOwned('songTime')).map((l) => l.id)).toEqual(['sword']);
    expect(lockoutsFor('temple', withOwned('songTime', 'forestClear'))).toEqual([]);
  });

  it('routes only through areas you have unlocked', () => {
    const state = setDestination(withOwned('dekuClear'), 'castle');
    expect(routeAreas(state)).toEqual(['kokiri', 'field', 'market', 'castle']);
    expect(sideTrips(state).map((t) => t.area)).not.toContain('trail');
  });
});

describe('ages', () => {
  it('keeps adult entries blocked until the sword is drawn', () => {
    expect(statusOf(entry('hp-fortress-chest'), withOwned('gerudoPass'))).toBe('blocked');
    expect(statusOf(entry('hp-fortress-chest'), withOwned('gerudoPass', 'adult'))).toBe('now');
  });

  it('blocks child entries between the sword and the Forest Temple', () => {
    expect(statusOf(entry('gs-kak-nw'), withOwned('dekuClear'))).toBe('now');
    expect(statusOf(entry('gs-kak-nw'), withOwned('dekuClear', 'adult'))).toBe('blocked');
    expect(statusOf(entry('gs-kak-nw'), withOwned('dekuClear', 'adult', 'forestClear'))).toBe('now');
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
    const values = trips.map((t) => t.items / t.steps);
    expect(values).toEqual([...values].sort((a, b) => b - a));
    expect(areas.indexOf('kakariko')).toBeLessThan(areas.indexOf('lonlon'));
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
    expect(state.done.sort()).toEqual(['gs-deku-switch', 'story-slingshot']);
    expect(state.extraTokens).toBe(100);
  });

  it('survives a save and restore round trip', () => {
    const state = toggleDone(moveTo(toggleAbility(freshState(), 'slingshot'), 'deku'), 'gs-deku-gate');
    expect(sanitize(JSON.parse(JSON.stringify(state)))).toEqual(state);
  });
});
