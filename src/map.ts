import { AREAS, ROADS } from './data/world';
import { availableIn, entriesIn, revealedAreas, statusOf } from './logic';
import type { Area, State } from './types';

const BIOME: Record<Area['biome'], { fill: string; glyph: string }> = {
  forest: { fill: '#1f4d3a', glyph: '<path d="M0-9 6 0H3L7 6H-7L-3 0H-6Z" fill="#7fd6a0"/>' },
  dungeon: { fill: '#2e5233', glyph: '<path d="M-2 7V1C-7 1-8-3-5-5-4-9 3-9 5-6 8-4 7 1 2 1V7Z" fill="#a3d977"/>' },
  field: { fill: '#54692f', glyph: '<path d="M-7 5C-4 0-3-4-2-7M0 5C0 0 0-4 0-8M7 5C4 0 3-4 2-7" stroke="#d6e38a" stroke-width="1.8" fill="none" stroke-linecap="round"/>' },
  town: { fill: '#6b4a3a', glyph: '<path d="M-7 6V-1L-3-6 1-1V6ZM2 6V-3H7V6Z" fill="#f1c7a0"/>' },
  castle: { fill: '#46507a', glyph: '<path d="M-8 7V-5H-5V-2H-2V-5H2V-2H5V-5H8V7H2V2H-2V7Z" fill="#c8d2f5"/>' },
  ranch: { fill: '#8a6a2c', glyph: '<path d="M-8 6V-1L0-7 8-1V6ZM-3 6V1H3V6Z" fill="#ffe08a" fill-rule="evenodd"/>' },
  village: { fill: '#7d4d33', glyph: '<path d="M0-3V7M0-3-7-7M0-3 7 1M0-3 7-7M0-3-7 1" stroke="#ffd2a8" stroke-width="2.2" stroke-linecap="round"/>' },
  water: { fill: '#1f5573', glyph: '<path d="M-8-2C-5-5-3-5 0-2S5 1 8-2M-8 4C-5 1-3 1 0 4S5 7 8 4" stroke="#a6e3ff" stroke-width="2" fill="none" stroke-linecap="round"/>' },
  grave: { fill: '#3d3657', glyph: '<path d="M-5 7V-2A5 5 0 0 1 5-2V7Z" fill="#b6aee0"/><path d="M0-2V3M-2 0H2" stroke="#3d3657" stroke-width="1.5"/>' },
};


/** Each dungeon gets its own original icon and colour, so they're easy to tell apart. */
const DUNGEONS: Record<string, { fill: string; glyph: string }> = {
  deku: BIOME.dungeon,
  dodongo: { fill: '#6b2f22', glyph: '<path d="M-7 1C-7-5-3-8 0-8S7-5 7 1C7 4 5 5 4 5V8H-4V5C-5 5-7 4-7 1Z" fill="#f1d9b5"/><circle cx="-3" cy="0" r="2" fill="#6b2f22"/><circle cx="3" cy="0" r="2" fill="#6b2f22"/>' },
  jabu: { fill: '#1d6b6b', glyph: '<path d="M-8 0C-4-6 3-6 6 0C3 6-4 6-8 0ZM6 0L9-4V4Z" fill="#a6f0e6"/><circle cx="-3" cy="-1" r="1.3" fill="#1d6b6b"/>' },
  forest: { fill: '#2b6a3a', glyph: '<path d="M-6 6C-6-4 0-8 7-8C7 0 3 6-6 6Z" fill="#9fe39a"/><path d="M-6 6L3-3" stroke="#2b6a3a" stroke-width="1.6"/>' },
  fire: { fill: '#8a2b1d', glyph: '<path d="M0-9C3-5 7-2 7 2A7 7 0 0 1-7 2C-7-1-5-3-3-5C-3-2-2-1 0 0C1-3 0-6 0-9Z" fill="#ffb15c"/>' },
  ice: { fill: '#3f7ea6', glyph: '<path d="M0-8V8M-7-4L7 4M-7 4L7-4" stroke="#e3f7ff" stroke-width="2" stroke-linecap="round"/>' },
  water: { fill: '#1d4f8a', glyph: '<path d="M0-9C3-4 6-1 6 3A6 6 0 0 1-6 3C-6-1-3-4 0-9Z" fill="#9fd8ff"/>' },
  well: { fill: '#4a4f63', glyph: '<path d="M-7-5H7M-5-5V7M5-5V7M-7 2H7" stroke="#d6dbe8" stroke-width="2" fill="none" stroke-linecap="round"/>' },
  shadow: { fill: '#3a2366', glyph: '<path d="M-8 0C-4-6 4-6 8 0C4 6-4 6-8 0Z" fill="#d7c2ff"/><circle r="2.5" fill="#3a2366"/>' },
  spirit: { fill: '#8a5a1d', glyph: '<circle r="4" fill="#ffd28a"/><path d="M0-9V-6M0 6V9M-9 0H-6M6 0H9M-6-6L-4-4M4 4L6 6M-6 6L-4 4M4-4L6-6" stroke="#ffd28a" stroke-width="1.8" stroke-linecap="round"/>' },
  training: { fill: '#6e5a2e', glyph: '<circle r="7" fill="none" stroke="#ffe6b0" stroke-width="2"/><circle r="3" fill="#ffe6b0"/>' },
};

/** Long names wrap onto two lines so neighbouring labels never touch. */
function label2(name: string): string {
  const words = name.split(' ');
  if (name.length <= 11 || words.length < 2) {
    return `<text class="label" y="36" text-anchor="middle">${name}</text>`;
  }
  let best = 1;
  for (let i = 1; i < words.length; i++) {
    const gap = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    const was = Math.abs(words.slice(0, best).join(' ').length - words.slice(best).join(' ').length);
    if (gap < was) best = i;
  }
  return `<text class="label" text-anchor="middle"><tspan x="0" y="35">${words.slice(0, best).join(' ')}</tspan><tspan x="0" y="47">${words.slice(best).join(' ')}</tspan></text>`;
}

function ring(progress: number): string {
  const r = 21;
  const length = 2 * Math.PI * r;
  const track = `<circle r="${r}" fill="none" stroke="#ffffff22" stroke-width="3.5"/>`;
  if (progress <= 0) return track;
  return `${track}<circle r="${r}" fill="none" stroke="#7ee0a1" stroke-width="3.5" stroke-linecap="round"
      stroke-dasharray="${length * progress} ${length}" transform="rotate(-90)"/>`;
}

interface MapOptions {
  route?: string[];
  /** Areas that show an "available now" count. Others stay quiet. */
  badges?: string[];
  /** Area outlined as selected. */
  selected?: string | null;
  /** Fade areas that the route doesn't touch. */
  dimOffRoute?: boolean;
  /** Width as a percentage of the screen, for zooming. */
  zoom?: number;
}

/** The map as an SVG. Tapping an area sends the "pick" action. */
export function mapSvg(state: State, options: MapOptions = {}): string {
  const { route = [], badges = route, selected = null, dimOffRoute = false, zoom = 1 } = options;
  const at = (id: string) => AREAS.find((a) => a.id === id)!;
  const shown = revealedAreas(state);
  const open = new Set(shown.map((a) => a.id));
  // Leave room for the soft glow around each area so it isn't clipped.
  const top = Math.min(...shown.map((a) => a.y)) - 34;
  const height = Math.max(...shown.map((a) => a.y)) + 70 - top;
  const roads = ROADS.filter(([a, b]) => open.has(a) && open.has(b)).map(([a, b]) => {
    const [p, q] = [at(a), at(b)];
    return `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="#ffffff26" stroke-width="2.5" stroke-dasharray="1 7" stroke-linecap="round"/>`;
  }).join('');

  const routeLine =
    route.length > 1
      ? `<polyline class="route-line" points="${route.map((id) => `${at(id).x},${at(id).y}`).join(' ')}" fill="none" stroke="#f2c14e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 9"/>`
      : '';

  const nodes = shown.map((area) => {
    const entries = entriesIn(area.id);
    const done = entries.filter((e) => statusOf(e, state) === 'done').length;
    const now = availableIn(area.id, state).length;
    const here = area.id === state.current;
    const stop = route.indexOf(area.id);
    const unseen = !state.visited.includes(area.id);
    const biome = DUNGEONS[area.id] ?? BIOME[area.biome];
    const label = `${area.name}: ${done} of ${entries.length} done${here ? ', you are here' : ''}${badges.includes(area.id) ? `, ${now} available now` : ''}`;
    const dim = dimOffRoute && !route.includes(area.id);
    return `<g class="node ${here ? 'is-here' : ''} ${unseen ? 'is-unseen' : ''} ${dim ? 'is-dim' : ''}" transform="translate(${area.x} ${area.y})"
        role="button" tabindex="0" aria-label="${label}" data-action="pick" data-id="${area.id}" data-key="node-${area.id}">
      <circle r="30" fill="transparent"/>
      ${here ? '<circle class="glow" r="27" fill="#f2c14e"/>' : ''}
      <circle r="17" fill="${biome.fill}" stroke="${here ? '#f2c14e' : area.id === selected ? '#ffffff' : '#00000055'}" stroke-width="${area.id === selected && !here ? 3 : 2}"/>
      ${biome.glyph}
      ${ring(entries.length ? done / entries.length : 0)}
      ${now > 0 && badges.includes(area.id) ? `<g transform="translate(17 -17)"><circle r="10" fill="#f2c14e" stroke="#12172b" stroke-width="2"/><text class="badge" y="4" text-anchor="middle">${now}</text></g>` : ''}
      ${stop > 0 ? `<g transform="translate(-18 -17)"><circle r="9" fill="#12172b" stroke="#f2c14e" stroke-width="2"/><text class="stop" y="3.5" text-anchor="middle">${stop}</text></g>` : ''}
      ${label2(area.name)}
    </g>`;
  }).join('');

  return `<svg class="map" style="width:${Math.round(zoom * 100)}%" viewBox="0 ${top} 400 ${height}" role="group" aria-label="Map of areas">
    ${roads}${routeLine}${nodes}
  </svg>`;
}
