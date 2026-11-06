import './styles.css';
import { ABILITIES, AREAS, TOTALS } from './data/world';
import { ENTRIES } from './data/entries';
import { LOCKOUTS } from './data/lockouts';
import { bottle, kindIcon, note, quarteredHeart, spider, ui } from './icons';
import {
  availableIn,
  checksFor,
  entriesIn,
  freshState,
  isTripWorthwhile,
  moveTo,
  neighbours,
  planTrip,
  routeAreas,
  routeStops,
  setDestination,
  sideTrips,
  returnItems,
  statusOf,
  tokenCount,
  toggleAbility,
  toggleDetour,
  toggleDone,
  toggleFlag,
} from './logic';
import { mapSvg } from './map';
import { downloadBackup, load, readBackup, save } from './store';
import type { Entry, Kind, Lockout, State } from './types';

type Tab = 'here' | 'trips' | 'progress';

let state: State = load();
let tab: Tab = 'here';
let leavingTo: string | null = null;
let choosingDestination = false;
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
  const area = AREAS.find((a) => a.id === state.current)!;
  const entries = entriesIn(area.id);
  const now = entries.filter((e) => statusOf(e, state) === 'now');
  const done = entries.filter((e) => statusOf(e, state) === 'done');
  const blocked = entries.filter((e) => statusOf(e, state) === 'blocked');
  const checks = checksFor(area.id, state);
  const nearby = neighbours(area.id)
    .map((id) => ({ id, count: state.visited.includes(id) ? availableIn(id, state).length : 0 }))
    .filter((n) => n.count > 0);

  const route = routeAreas(state);

  return `${mapSvg(state, route, route)}
    ${headingBar()}
    <section class="panel">
      <header class="panel-head">
        <h2>${esc(area.name)}</h2>
        <span class="count ${now.length ? 'hot' : ''}">${now.length ? `${now.length} to get` : checks.length ? 'Answer below' : 'All clear'}</span>
      </header>
      ${LOCKOUTS.filter((l) => l.area === area.id).map(lockoutBanner).join('')}
      ${checks.length ? `<div class="checks"><span class="checks-label">Tap any that are true, so I can show what you can reach</span>
        ${checks.map((a) => `<button class="chip" data-action="own" data-id="${a.id}" data-key="o-${a.id}">${esc(a.label)}</button>`).join('')}</div>` : ''}
      ${now.map(entryCard).join('')}
      ${now.length === 0 && checks.length === 0 ? `<div class="empty">${ui.check}<p>Nothing to grab here right now.</p></div>` : ''}
      ${blocked.length || area.moreLater ? `<p class="later">${ui.lock}More here later. You don't need to do anything yet.</p>` : ''}
      ${state.destination ? '' : nearby.map((n) => `<button class="nearby" data-action="go" data-id="${n.id}" data-key="n-${n.id}">${ui.foot}<span>Next door: <b>${esc(areaName(n.id))}</b> has ${n.count} ready</span></button>`).join('')}
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
          ${LOCKOUTS.filter((l) => l.area === stop.area).map(lockoutBanner).join('')}
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
    <p class="muted way-note">Tap an area on the map when you arrive there.</p>
  </section>`;
}

function destinationSheet(): string {
  if (!choosingDestination) return '';
  return `<div class="sheet-back" data-action="choose-close">
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="dest-title">
      <h2 id="dest-title">Where are you heading?</h2>
      <div class="dest-grid">
        ${AREAS.filter((a) => a.id !== state.current).map((a) => `<button class="btn ${a.id === state.destination ? 'primary' : ''}" data-action="destination" data-id="${a.id}" data-key="dest-${a.id}">${esc(a.name)}</button>`).join('')}
      </div>
      <div class="sheet-actions">
        ${state.destination ? '<button class="btn" data-action="destination" data-key="dest-none">Clear my route</button>' : ''}
        <button class="btn subtle" data-action="choose-close" data-key="dest-close">Cancel</button>
      </div>
    </div>
  </div>`;
}

// Return trips tab

function tripsView(): string {
  const items = returnItems(state);
  const trip = planTrip(state);
  const route = [state.current, ...trip.map((s) => s.area)];
  if (items.length === 0) {
    return `${mapSvg(state)}<section class="panel"><div class="empty big">${ui.check}<h2>No return trips</h2><p>Nothing is waiting in places you've been.</p></div></section>`;
  }
  const headline = isTripWorthwhile(state)
    ? `<span class="count hot">Worth a trip</span>`
    : `<span class="count">Can wait</span>`;
  return `${mapSvg(state, route)}
    <section class="panel">
      <header class="panel-head"><h2>${items.length} waiting</h2>${headline}</header>
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
    </section>`;
}

// Progress tab

function countOf(kind: Kind): number {
  return ENTRIES.filter((e) => e.kind === kind && state.done.includes(e.id)).length;
}

function progressView(): string {
  const tokens = Math.min(tokenCount(state), TOTALS.skulltula);
  const hearts = countOf('heart');
  const bottles = countOf('bottle');
  const songs = countOf('song');
  const heartCells = Array.from({ length: 9 }, (_, i) =>
    quarteredHeart(Math.max(0, Math.min(4, hearts - i * 4))),
  ).join('');
  const tokenCells = Array.from({ length: TOTALS.skulltula }, (_, i) =>
    `<i class="${i < tokens ? 'lit' : ''}"></i>`,
  ).join('');
  const flagged = state.flagged.length;
  const globals = LOCKOUTS.filter((l) => l.area === null);
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
      <header><span class="stat-icon">${kindIcon('heart')}</span><h2>Pieces of Heart</h2><b>${hearts}<small>/${TOTALS.heart}</small></b></header>
      <div class="heart-grid">${heartCells}</div>
    </div>
    <div class="stat-row">
      <div class="stat">
        <header><h2>Bottles</h2><b>${bottles}<small>/${TOTALS.bottle}</small></b></header>
        <div class="slots">${Array.from({ length: TOTALS.bottle }, (_, i) => bottle(i < bottles)).join('')}</div>
      </div>
      <div class="stat">
        <header><h2>Songs</h2><b>${songs}<small>/${TOTALS.song}</small></b></header>
        <div class="slots tight">${Array.from({ length: TOTALS.song }, (_, i) => note(i < songs)).join('')}</div>
      </div>
    </div>
    <div class="stat coming">
      <header><h2>Coming in later builds</h2></header>
      <ul class="soon">
        <li>Other areas and dungeons</li><li>Masks</li><li>Hall of Fallen Foes</li><li>Gossip Quests</li><li>amiibo masks</li><li>Zelda Notes quiz (long-term goal)</li>
      </ul>
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
    <p class="fineprint">Unofficial fan tool, not connected with Nintendo. Data comes from early community guides and may contain mistakes.</p>
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
  const views = { here: hereView, trips: tripsView, progress: progressView };
  const tabButton = (id: Tab, icon: string, label: string, badge = 0) =>
    `<button class="tab ${tab === id ? 'on' : ''}" data-action="tab" data-id="${id}" data-key="tab-${id}" ${tab === id ? 'aria-current="page"' : ''}>
      ${icon}<span>${label}</span>${badge ? `<em>${badge}</em>` : ''}
    </button>`;
  root.innerHTML = `
    ${saveFailed ? `<p class="save-warning" role="alert">This browser isn't saving your progress. Back up from Progress before closing.</p>` : ''}
    <main>${views[tab]()}</main>
    <nav class="tabs">
      ${tabButton('here', ui.map, 'Here')}
      ${tabButton('trips', ui.route, 'Return trips', trips)}
      ${tabButton('progress', ui.chart, 'Progress')}
    </nav>
    ${leaveSheet()}
    ${destinationSheet()}`;
  if (leavingTo) {
    root.querySelector<HTMLElement>('[data-key="stay"]')?.focus();
  } else if (focusKey) {
    root.querySelector<HTMLElement>(`[data-key="${CSS.escape(focusKey)}"]`)?.focus();
  }
}

function go(area: string): void {
  if (area === state.current) return;
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
      tab = tab === 'trips' ? 'trips' : 'here';
      if (id) go(id);
      break;
    case 'tab':
      tab = id as Tab;
      notice = '';
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
