import './styles.css';
import { ABILITIES, AREAS, EXTRAS, GOSSIP_TOTAL, TOTALS } from './data/world';
import { ENTRIES } from './data/entries';
import { bottle, kindIcon, note, quarteredHeart, spider, ui } from './icons';
import {
  availableIn,
  checksFor,
  entriesIn,
  freshState,
  heartTotals,
  isTripWorthwhile,
  lockoutsFor,
  markNotYet,
  moveTo,
  neighbours,
  nextQuestion,
  planTrip,
  routeAreas,
  routeStops,
  setDestination,
  sideTrips,
  returnItems,
  revealedAreas,
  statusOf,
  tokenCount,
  toggleAbility,
  toggleDetour,
  toggleDone,
  toggleExtra,
  toggleFlag,
  waitingFor,
  waitingGates,
} from './logic';
import { mapSvg } from './map';
import { downloadBackup, load, readBackup, save } from './store';
import type { Entry, Kind, Lockout, State } from './types';

type Tab = 'here' | 'map' | 'trips' | 'progress';

let state: State = load();
let tab: Tab = 'here';
let leavingTo: string | null = null;
/** An area being looked at. Looking never counts as moving there. */
let viewing: string | null = null;
let choosingDestination = false;
/** Area tapped on the map, shown in a small card. */
let picked: string | null = null;
let zoom = 1;
let sheetOpen = false;
/** Set when the map should jump to the area in focus on the next render. */
let recenter = true;
const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
let confirmingReset = false;
let openDetail: string | null = null;
let saveFailed = false;
let notice = '';

const root = document.getElementById('app')!;
const esc = (text: string) =>
  text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const areaName = (id: string) => AREAS.find((a) => a.id === id)?.name ?? id;

function update(next: State): void {
  state = next;
  saveFailed = !save(state);
  render();
}

// Here tab

function entryCard(entry: Entry): string {
  const done = statusOf(entry, state) === 'done';
  const flagged = state.flagged.includes(entry.id);
  const open = openDetail === entry.id;
  return `<article class="card ${done ? 'is-done' : ''}">
    <span class="card-icon">${kindIcon(entry.kind)}</span>
    <div class="card-body">
      <h3>${esc(entry.name)}
        ${entry.night ? `<span class="pill night">${ui.moon}Night</span>` : ''}
        ${entry.age && state.owned.includes('adult') ? `<span class="pill age">${entry.age === 'child' ? 'Child' : 'Adult'}</span>` : ''}
        ${entry.sources.some((x) => x !== 'rpgsite' && x !== 'respec') || entry.disputed ? '' : '<span class="pill single">One guide</span>'}
        ${state.skipped.includes(entry.id) && !done ? '<span class="pill skipped">Skipped</span>' : ''}
      </h3>
      <p>${esc(entry.where)}</p>
      <div class="card-tools">
        ${entry.disputed ? `<button class="tool warn" data-action="detail" data-id="${entry.id}" data-key="d-${entry.id}" aria-expanded="${open}">${ui.query}Unsure</button>` : ''}
        <button class="tool ${flagged ? 'on' : ''}" data-action="flag" data-id="${entry.id}" data-key="f-${entry.id}" aria-pressed="${flagged}">${ui.flag}${flagged ? 'Marked wrong' : 'Wrong?'}</button>
      </div>
      ${open ? `<p class="detail">${esc(entry.disputed ?? '')}</p>` : ''}
    </div>
    <button class="tick" data-action="done" data-id="${entry.id}" data-key="t-${entry.id}" aria-pressed="${done}" aria-label="${done ? 'Mark not collected' : 'Mark collected'}: ${esc(entry.name)}">${ui.check}</button>
  </article>`;
}

function lockoutBanner(lockout: Lockout): string {
  const labels = { forever: 'Gone for good', 'for-a-while': 'Closes for a while', recoverable: 'Second chance later' };
  return `<aside class="alert ${lockout.severity}">
    ${ui.warn}
    <div><strong>${esc(lockout.title)}</strong><p>${esc(lockout.detail)}</p>
    ${lockout.disputed ? `<p class="detail">${esc(lockout.disputed)}</p>` : ''}
    <span class="tag">${labels[lockout.severity]}</span></div>
  </aside>`;
}

function hereView(): string {
  const area = AREAS.find((a) => a.id === (viewing ?? state.current))!;
  const isHere = area.id === state.current;
  const entries = entriesIn(area.id);
  const now = entries.filter((e) => statusOf(e, state) === 'now');
  const done = entries.filter((e) => statusOf(e, state) === 'done');
  const blocked = entries.filter((e) => statusOf(e, state) === 'blocked');
  const checks = checksFor(area.id, state);
  const next = nextQuestion(state);
  const areaChecks = checks.filter((a) => a.id !== next?.id);
  const waiting = [...new Set([...waitingGates(state), ...waitingFor(area.id, state)])];
  const shown = new Set(revealedAreas(state).map((a) => a.id));
  const doors = neighbours(area.id)
    .filter((id) => shown.has(id))
    .map((id) => ({ id, count: state.visited.includes(id) ? availableIn(id, state).length : 0 }));

  return `${headingBar()}
    <section class="panel">
      <header class="panel-head">
        <div class="where"><span>${isHere ? "You're in" : 'Looking at'}</span><h2>${esc(area.name)}</h2></div>
        <span class="count ${now.length ? 'hot' : ''}">${now.length ? `${now.length} to get` : areaChecks.length ? 'Answer below' : 'Nothing yet'}</span>
      </header>
      ${doors.length ? `<div class="doors"><span>Next door</span>${doors.map((d) => `<button class="door" data-action="go" data-id="${d.id}" data-key="door-${d.id}">${esc(areaName(d.id))}${d.count ? `<em>${d.count}</em>` : ''}</button>`).join('')}</div>` : ''}
      ${next ? `<div class="next-step"><span class="checks-label">Next step: unlocks more of the map</span>
        <div class="check-row"><span>${esc(next.label)}</span>
          <button class="chip yes" data-action="own" data-id="${next.id}" data-key="o-${next.id}">Yes</button>
          <button class="chip" data-action="not-yet" data-id="${next.id}" data-key="n-${next.id}">Not yet</button></div></div>` : ''}
      ${isHere ? '' : `<button class="im-here" data-action="arrive" data-id="${area.id}" data-key="arrive">${ui.foot}I'm here now</button>`}
      ${lockoutsFor(area.id, state).map(lockoutBanner).join('')}
      ${areaChecks.length ? `<div class="checks"><span class="checks-label">Do you have these yet?</span>
        ${areaChecks.map((a) => `<div class="check-row"><span>${esc(a.label)}</span>
          <button class="chip yes" data-action="own" data-id="${a.id}" data-key="o-${a.id}">Yes</button>
          <button class="chip" data-action="not-yet" data-id="${a.id}" data-key="n-${a.id}">Not yet</button></div>`).join('')}</div>` : ''}
      ${waiting.length ? `<div class="waiting"><span>Got it now?</span>${waiting.map((a) => `<button class="chip small" data-action="own" data-id="${a.id}" data-key="w-${a.id}">${esc(a.label)}</button>`).join('')}</div>` : ''}
      ${now.map(entryCard).join('')}
      ${now.length === 0 && areaChecks.length === 0 ? `<div class="empty">${ui.check}<p>Nothing to grab here right now.</p></div>` : ''}
      ${blocked.length ? `<p class="later">${ui.lock}More here later. You don't need to do anything yet.</p>` : ''}
      ${done.length ? `<details class="done-list"><summary>${done.length} collected here</summary>${done.map(entryCard).join('')}</details>` : ''}
    </section>
    ${onTheWay()}`;
}

function headingBar(): string {
  return state.destination
    ? `<button class="heading set" data-action="choose" data-key="heading">${ui.route}<span>Heading to <b>${esc(areaName(state.destination))}</b></span><small>Change</small></button>`
    : `<button class="heading" data-action="choose" data-key="heading">${ui.route}<span>Where are you heading?</span></button>`;
}

function onTheWay(): string {
  if (!state.destination) return '';
  const stops = routeStops(state);
  const trips = sideTrips(state);
  return `<section class="panel way">
    <header class="panel-head"><h2>On your way</h2></header>
    <ol class="route">
      ${stops.map((stop, index) => {
        const entries = stop.entries.map((id) => ENTRIES.find((e) => e.id === id)!);
        return `<li class="${entries.length ? '' : 'pass'}">
          <span class="route-num">${index + 1}</span>
          <div class="route-stop"><h3>${esc(areaName(stop.area))}</h3>
          ${lockoutsFor(stop.area, state).map(lockoutBanner).join('')}
          ${entries.length === 0 ? '<p class="muted">Nothing to grab here yet</p>' : entries.map(entryCard).join('')}
          </div>
        </li>`;
      }).join('')}
    </ol>
    ${trips.length ? `<h3 class="side-title">Worth a side trip?</h3>
      ${trips.map((trip) => `<article class="side ${trip.added ? 'on' : ''}">
        <div class="side-body"><h4>${esc(areaName(trip.area))}</h4>
          <p><b>${trip.items}</b> to get · <b>${trip.steps}</b> extra steps</p>
          ${trip.returnsAnyway ? `<p class="muted">You'll be back later anyway for ${trip.returnsAnyway} more</p>` : '<p class="good">Could save a return trip</p>'}
        </div>
        <button class="btn ${trip.added ? '' : 'primary'}" data-action="detour" data-id="${trip.area}" data-key="dt-${trip.area}" aria-pressed="${trip.added}">${trip.added ? 'Remove' : 'Add'}</button>
      </article>`).join('')}` : ''}
    <p class="muted way-note">Look at an area from the Map tab or Next door, then tap I'm here now when you arrive.</p>
  </section>`;
}

function destinationSheet(): string {
  if (!choosingDestination) return '';
  return `<div class="sheet-back" data-action="choose-close">
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="dest-title">
      <h2 id="dest-title">Where are you heading?</h2>
      <div class="dest-grid">
        ${revealedAreas(state).filter((a) => a.id !== state.current).map((a) => `<button class="btn ${a.id === state.destination ? 'primary' : ''}" data-action="destination" data-id="${a.id}" data-key="dest-${a.id}">${esc(a.name)}</button>`).join('')}
      </div>
      <div class="sheet-actions">
        ${state.destination ? '<button class="btn" data-action="destination" data-key="dest-none">Clear my route</button>' : ''}
        <button class="btn subtle" data-action="choose-close" data-key="dest-close">Cancel</button>
      </div>
    </div>
  </div>`;
}

// Map tab

function mapScreen(svg: string, overlay: string, hint: string): string {
  return `<div class="map-screen">
    <div class="map-bar">
      <p class="map-hint">${esc(hint)}</p>
      <button class="map-btn" data-action="zoom" data-id="-1" data-key="zoom-out" aria-label="Zoom out">−</button>
      <button class="map-btn" data-action="zoom" data-id="1" data-key="zoom-in" aria-label="Zoom in">+</button>
      <button class="map-btn" data-action="recenter" data-key="recenter" aria-label="Show where you are">${ui.pin}</button>
    </div>
    <div class="map-scroll">${svg}</div>
    ${overlay}
  </div>`;
}

function mapView(): string {
  const route = state.destination ? routeAreas(state) : [];
  const badges = [...new Set([...state.visited, ...route])];
  const area = picked ? AREAS.find((a) => a.id === picked) : null;
  const count = area ? availableIn(area.id, state).length : 0;
  const card = area
    ? `<div class="pick-card">
        <div class="pick-head"><strong>${esc(area.name)}</strong><span>${area.id === state.current ? "You're here" : count ? `${count} to get` : 'Nothing yet'}</span></div>
        <div class="pick-actions">
          <button class="btn" data-action="go" data-id="${area.id}" data-key="pick-look">See its list</button>
          ${area.id === state.current ? '' : `<button class="btn primary" data-action="arrive" data-id="${area.id}" data-key="pick-arrive">I'm here now</button>`}
        </div>
      </div>`
    : '';
  const hint = state.destination ? `Gold line: your way to ${areaName(state.destination)}` : 'Drag to move, pinch to zoom';
  return mapScreen(mapSvg(state, { route, badges, selected: picked, zoom }), card, hint);
}

// Return trips tab

function tripsView(): string {
  const items = returnItems(state);
  const trip = planTrip(state);
  const route = [state.current, ...trip.map((s) => s.area)];
  if (items.length === 0) {
    return mapScreen(mapSvg(state, { zoom }), `<div class="trip-sheet small"><div class="empty big">${ui.check}<h2>No return trips</h2><p>Nothing is waiting in places you've been.</p></div></div>`, 'Nothing to go back for');
  }
  const headline = isTripWorthwhile(state)
    ? `<span class="count hot">Worth a trip</span>`
    : `<span class="count">Can wait</span>`;
  const stops = trip.filter((s) => s.entries.length).length;
  const sheet = `<section class="trip-sheet ${sheetOpen ? 'open' : ''}">
      <button class="sheet-grip" data-action="sheet" data-key="sheet" aria-expanded="${sheetOpen}">
        <i></i><span class="panel-head"><h2>${items.length} waiting · ${stops} ${stops === 1 ? 'stop' : 'stops'}</h2>${headline}</span>
      </button>
      <div class="sheet-body">
      <ol class="route">
        ${trip.map((stop, index) => {
          const entries = stop.entries.map((id) => ENTRIES.find((e) => e.id === id)!);
          return `<li class="${entries.length ? '' : 'pass'}">
            <span class="route-num">${index + 1}</span>
            <div class="route-stop"><h3>${esc(areaName(stop.area))}</h3>
            ${entries.length === 0 ? '<p class="muted">Pass through</p>' : entries.map(entryCard).join('')}
            </div>
          </li>`;
        }).join('')}
      </ol>
      </div>
    </section>`;
  return mapScreen(mapSvg(state, { route, dimOffRoute: true, zoom }), sheet, 'Gold line: your return route');
}

// Progress tab

function countOf(kind: Kind): number {
  return ENTRIES.filter((e) => e.kind === kind && state.done.includes(e.id)).length;
}

function progressView(): string {
  const tokens = Math.min(tokenCount(state), TOTALS.skulltula);
  const life = heartTotals(state);
  const hearts = life.pieces;
  const containerTotal = ENTRIES.filter((e) => e.id.startsWith('story-heart-')).length;
  const bottles = countOf('bottle');
  const songs = countOf('song');
  const heartCells = Array.from({ length: 20 }, (_, i) =>
    quarteredHeart(i < life.full ? 4 : i === life.full ? life.partial : 0),
  ).join('');
  const tokenCells = Array.from({ length: TOTALS.skulltula }, (_, i) =>
    `<i class="${i < tokens ? 'lit' : ''}"></i>`,
  ).join('');
  const flagged = state.flagged.length;
  const globals = lockoutsFor(null, state);
  const named = (kind: Kind) => ENTRIES.filter((e) => e.kind === kind && state.done.includes(e.id)).map((e) => e.name);
  const nameList = (names: string[]) => names.length ? `<ul class="names">${names.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : '';
  const others: [string, Kind[]][] = [['Upgrades', ['upgrade']], ['Great Fairies', ['fairy']], ['Mask quest', ['mask']], ['Biggoron Sword quest', ['quest']], ['Other items', ['reward', 'shield']]];
  const story = ENTRIES.filter((e) => e.kind === 'story');
  const storyDone = story.filter((e) => state.done.includes(e.id));
  const storyNow = story.filter((e) => statusOf(e, state) === 'now');
  const chests = ENTRIES.filter((e) => e.kind === 'chest');
  const chestsDone = chests.filter((e) => state.done.includes(e.id));
  const extras = EXTRAS.filter((x) => (x.after as readonly string[]).every((a) => state.owned.includes(a)));
  const owned = ABILITIES.filter((a) => state.owned.includes(a.id));
  return `<section class="panel flush">
    <div class="stat">
      <header><span class="stat-icon">${spider()}</span><h2>Gold Skulltulas</h2><b>${tokens}<small>/${TOTALS.skulltula}</small></b></header>
      <div class="token-grid" role="img" aria-label="${tokens} of ${TOTALS.skulltula} tokens">${tokenCells}</div>
      <div class="stepper"><span>Found outside the mapped areas</span>
        <button data-action="extra" data-id="-1" data-key="ex-" aria-label="One fewer">−</button>
        <output>${state.extraTokens}</output>
        <button data-action="extra" data-id="1" data-key="ex+" aria-label="One more">+</button>
      </div>
    </div>
    <div class="stat">
      <header><span class="stat-icon">${kindIcon('heart')}</span><h2>Hearts</h2><b>${life.full}<small>/20</small></b></header>
      <div class="heart-grid">${heartCells}</div>
      <p class="muted heart-sum">3 to start + <b>${life.containers}</b>/${containerTotal} Heart Containers + <b>${hearts}</b>/${TOTALS.heart} Pieces of Heart${life.partial ? ` (${life.partial} toward the next)` : ''}</p>
    </div>
    <div class="stat-row">
      <div class="stat">
        <header><h2>Bottles</h2><b>${bottles}<small>/${TOTALS.bottle}</small></b></header>
        <div class="slots">${Array.from({ length: TOTALS.bottle }, (_, i) => bottle(i < bottles)).join('')}</div>
      </div>
      <div class="stat">
        <header><h2>Songs</h2><b>${songs}<small>/${TOTALS.song}</small></b></header>
        <div class="slots tight">${Array.from({ length: TOTALS.song }, (_, i) => note(i < songs)).join('')}</div>
        ${nameList(named('song'))}
      </div>
    </div>
    ${others.map(([title, kinds]) => {
      const all = ENTRIES.filter((e) => kinds.includes(e.kind));
      const got = all.filter((e) => state.done.includes(e.id));
      return `<div class="stat"><header><h2>${title}</h2><b>${got.length}<small>/${all.length}</small></b></header>
        <div class="bar"><i style="width:${all.length ? (got.length / all.length) * 100 : 0}%"></i></div>
        ${nameList(got.map((e) => e.name))}</div>`;
    }).join('')}
    <div class="stat">
      <header><h2>Known chests</h2><b>${chestsDone.length}<small>/${chests.length}</small></b></header>
      <div class="bar"><i style="width:${chests.length ? (chestsDone.length / chests.length) * 100 : 0}%"></i></div>
      <p class="muted quiz">No complete chest list exists yet, so this is only what guides describe. The game has more.</p>
    </div>
    <div class="stat">
      <header><h2>Story items</h2><b>${storyDone.length}<small>/${story.length}</small></b></header>
      <div class="bar"><i style="width:${(storyDone.length / story.length) * 100}%"></i></div>
      ${storyNow.length ? `<p class="muted quiz">Tap any you have:</p>${storyNow.map((e) => `<button class="extra" data-action="done" data-id="${e.id}" data-key="st-${e.id}" aria-pressed="false"><span class="tick small">${ui.check}</span>${esc(e.name)}</button>`).join('')}` : ''}
      ${storyDone.length ? `<details class="done-list"><summary>${storyDone.length} collected, tap to undo</summary>${storyDone.map((e) => `<button class="extra" data-action="done" data-id="${e.id}" data-key="st-${e.id}" aria-pressed="true"><span class="tick small">${ui.check}</span>${esc(e.name)}</button>`).join('')}</details>` : ''}
    </div>
    <div class="stat">
      <header><h2>Extras</h2></header>
      ${extras.map((x) => `<button class="extra" data-action="extra-goal" data-id="${x.id}" data-key="x-${x.id}" aria-pressed="${state.extras.includes(x.id)}"><span class="tick small">${ui.check}</span>${esc(x.label)}</button>`).join('')}
      <div class="stepper"><span>Gossip Quests (Zelda Notes)</span>
        <button data-action="gossip" data-id="-1" data-key="g-" aria-label="One fewer">−</button>
        <output>${state.gossip}/${GOSSIP_TOTAL}</output>
        <button data-action="gossip" data-id="1" data-key="g+" aria-label="One more">+</button>
      </div>
      <p class="muted quiz">Zelda Notes quiz: your long-term goal, tracked in the app itself. It isn't part of your 100% here.</p>
    </div>
    <div class="stat">
      <header><h2>Always keep in mind</h2></header>
      ${globals.map(lockoutBanner).join('')}
    </div>
    <div class="stat">
      <header><h2>Your save</h2></header>
      ${notice ? `<p class="detail" role="status">${esc(notice)}</p>` : ''}
      ${owned.length ? `<p class="muted">What you've told me you have. Tap to undo a mistake.</p>
      <div class="owned">${owned.map((a) => `<button class="chip on" data-action="own" data-id="${a.id}" data-key="u-${a.id}" aria-pressed="true">${ui.check}${esc(a.label)}</button>`).join('')}</div>` : ''}
      ${flagged ? `<p class="muted">${flagged} marked wrong. Their IDs are in your backup file.</p>` : ''}
      <div class="save-row">
        <button class="btn" data-action="backup" data-key="backup">${ui.download}Back up</button>
        <label class="btn">${ui.upload}Restore<input type="file" accept="application/json,.json" data-action="restore" hidden/></label>
      </div>
      ${confirmingReset
        ? `<div class="save-row"><button class="btn danger" data-action="reset-yes" data-key="ry">Erase everything</button><button class="btn" data-action="reset-no" data-key="rn">Keep it</button></div>`
        : `<button class="btn subtle" data-action="reset" data-key="r">Start over</button>`}
    </div>
    <p class="fineprint">Unofficial fan tool, not connected with Nintendo. Data comes from early community guides and hasn't been checked in the game. "One guide" means only one source covers it. Warp songs aren't counted in routes.</p>
  </section>`;
}

// Leave warning

function leaveSheet(): string {
  if (!leavingTo) return '';
  const left = availableIn(state.current, state);
  const nights = left.filter((e) => e.night).length;
  return `<div class="sheet-back" data-action="stay">
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="leave-title">
      <h2 id="leave-title">Before you leave ${esc(areaName(state.current))}</h2>
      <div class="sheet-icons">${left.map((e) => `<span title="${esc(e.name)}">${kindIcon(e.kind)}</span>`).join('')}</div>
      <p><b>${left.length}</b> ${left.length === 1 ? 'thing is' : 'things are'} still here for you${nights ? `, ${nights} at night` : ''}.</p>
      <div class="sheet-actions">
        <button class="btn primary" data-action="stay" data-key="stay">Stay</button>
        <button class="btn" data-action="leave" data-key="leave">Go to ${esc(areaName(leavingTo))}</button>
      </div>
    </div>
  </div>`;
}

// Shell

function render(): void {
  const focusKey = (document.activeElement as HTMLElement | null)?.dataset?.key;
  const trips = returnItems(state).length;
  const views = { here: hereView, map: mapView, trips: tripsView, progress: progressView };
  const scroller = root.querySelector<HTMLElement>('.map-scroll');
  const kept = scroller ? [scroller.scrollLeft, scroller.scrollTop] : null;
  const tabButton = (id: Tab, icon: string, label: string, badge = 0) =>
    `<button class="tab ${tab === id ? 'on' : ''}" data-action="tab" data-id="${id}" data-key="tab-${id}" ${tab === id ? 'aria-current="page"' : ''}>
      ${icon}<span>${label}</span>${badge ? `<em>${badge}</em>` : ''}
    </button>`;
  root.innerHTML = `
    ${saveFailed ? `<p class="save-warning" role="alert">This browser isn't saving your progress. Back up from Progress before closing.</p>` : ''}
    <main>${views[tab]()}</main>
    <nav class="tabs">
      ${tabButton('here', ui.pin, 'Here')}
      ${tabButton('map', ui.map, 'Map')}
      ${tabButton('trips', ui.route, 'Return trips', trips)}
      ${tabButton('progress', ui.chart, 'Progress')}
    </nav>
    ${leaveSheet()}
    ${destinationSheet()}`;
  const map = root.querySelector<HTMLElement>('.map-scroll');
  if (map && (recenter || !kept)) {
    centerMap();
    recenter = false;
  } else if (map && kept) {
    [map.scrollLeft, map.scrollTop] = kept;
  }
  if (leavingTo) {
    root.querySelector<HTMLElement>('[data-key="stay"]')?.focus();
  } else if (focusKey) {
    root.querySelector<HTMLElement>(`[data-key="${CSS.escape(focusKey)}"]`)?.focus();
  }
}

/** Scrolls the map so the area in focus sits in the middle of the screen. */
function centerMap(): void {
  const wrap = root.querySelector<HTMLElement>('.map-scroll');
  const node = wrap?.querySelector(`.node[data-id="${picked ?? viewing ?? state.current}"]`);
  if (!wrap || !node) return;
  const box = node.getBoundingClientRect();
  const frame = wrap.getBoundingClientRect();
  wrap.scrollLeft += box.left + box.width / 2 - frame.left - wrap.clientWidth / 2;
  wrap.scrollTop += box.top + box.height / 2 - frame.top - wrap.clientHeight / 2;
}

function setZoom(next: number): void {
  zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
}

function arrive(area: string): void {
  viewing = null;
  if (area === state.current) {
    render();
    return;
  }
  if (availableIn(state.current, state).length > 0) {
    leavingTo = area;
    render();
    return;
  }
  update(moveTo(state, area));
}

function handle(action: string, id: string | undefined): void {
  switch (action) {
    case 'go':
      // Looking at an area never counts as moving there.
      tab = 'here';
      picked = null;
      viewing = id === state.current ? null : (id ?? null);
      render();
      window.scrollTo(0, 0);
      break;
    case 'pick':
      picked = picked === id ? null : (id ?? null);
      render();
      break;
    case 'zoom':
      setZoom(zoom + Number(id) * 0.5);
      recenter = true;
      render();
      break;
    case 'recenter':
      picked = null;
      viewing = null;
      recenter = true;
      render();
      break;
    case 'sheet':
      sheetOpen = !sheetOpen;
      render();
      break;
    case 'arrive':
      picked = null;
      if (id) arrive(id);
      break;
    case 'not-yet':
      if (id) update(markNotYet(state, id));
      break;
    case 'extra-goal':
      if (id) update(toggleExtra(state, id));
      break;
    case 'gossip':
      update({ ...state, gossip: Math.min(GOSSIP_TOTAL, Math.max(0, state.gossip + Number(id))) });
      break;
    case 'tab':
      tab = id as Tab;
      notice = '';
      picked = null;
      recenter = true;
      render();
      window.scrollTo(0, 0);
      break;
    case 'done':
      if (id) update(toggleDone(state, id));
      break;
    case 'flag':
      if (id) update(toggleFlag(state, id));
      break;
    case 'own':
      if (id) update(toggleAbility(state, id));
      break;
    case 'detail':
      openDetail = openDetail === id ? null : (id ?? null);
      render();
      break;
    case 'choose':
      choosingDestination = true;
      render();
      break;
    case 'choose-close':
      choosingDestination = false;
      render();
      break;
    case 'destination':
      choosingDestination = false;
      update(setDestination(state, id ?? null));
      break;
    case 'detour':
      if (id) update(toggleDetour(state, id));
      break;
    case 'stay':
      leavingTo = null;
      render();
      break;
    case 'leave': {
      const target = leavingTo;
      leavingTo = null;
      viewing = null;
      if (target) update(moveTo(state, target));
      break;
    }
    case 'extra':
      update({ ...state, extraTokens: Math.min(100, Math.max(0, state.extraTokens + Number(id))) });
      break;
    case 'backup':
      downloadBackup(state);
      notice = 'Backup saved to your downloads.';
      render();
      break;
    case 'reset':
      confirmingReset = true;
      render();
      break;
    case 'reset-no':
      confirmingReset = false;
      render();
      break;
    case 'reset-yes':
      confirmingReset = false;
      update(freshState());
      break;
  }
}

root.addEventListener('click', (event) => {
  const target = event.target as Element;
  const el = target.closest<HTMLElement | SVGElement>('[data-action]');
  if (!el || el instanceof HTMLInputElement) return;
  // Clicks inside the leave sheet shouldn't count as tapping the backdrop.
  if (el.classList.contains('sheet-back') && target.closest('.sheet')) return;
  handle(el.dataset.action!, el.dataset.id);
});

root.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && (leavingTo || choosingDestination)) {
    handle(leavingTo ? 'stay' : 'choose-close', undefined);
    return;
  }
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const el = event.target as Element;
  if (el instanceof SVGElement && (el as SVGElement).dataset.action) {
    event.preventDefault();
    handle(el.dataset.action!, el.dataset.id);
  }
});

// Pinch to zoom the map. The width changes live, and the zoom is kept on release.
let pinch: { start: number; zoom: number } | null = null;
const spread = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
root.addEventListener('touchstart', (event) => {
  if (event.touches.length === 2 && (event.target as Element).closest('.map-scroll')) {
    pinch = { start: spread(event.touches), zoom };
  }
}, { passive: true });
root.addEventListener('touchmove', (event) => {
  if (!pinch || event.touches.length !== 2) return;
  event.preventDefault();
  const wrap = root.querySelector<HTMLElement>('.map-scroll');
  const svg = wrap?.querySelector<SVGElement>('.map');
  if (!wrap || !svg) return;
  const before = zoom;
  setZoom(pinch.zoom * (spread(event.touches) / pinch.start));
  const ratio = zoom / before;
  svg.style.width = `${Math.round(zoom * 100)}%`;
  wrap.scrollLeft = (wrap.scrollLeft + wrap.clientWidth / 2) * ratio - wrap.clientWidth / 2;
  wrap.scrollTop = (wrap.scrollTop + wrap.clientHeight / 2) * ratio - wrap.clientHeight / 2;
}, { passive: false });
root.addEventListener('touchend', () => {
  pinch = null;
});

root.addEventListener('change', async (event) => {
  const input = event.target as HTMLInputElement;
  if (input.dataset.action !== 'restore' || !input.files?.[0]) return;
  try {
    const restored = await readBackup(input.files[0]);
    notice = 'Backup restored.';
    update(restored);
  } catch {
    notice = "That file couldn't be read, so nothing changed.";
    render();
  }
});

render();
