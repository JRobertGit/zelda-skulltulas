import { AREAS, ROADS } from './data/world';
import { availableIn, entriesIn, statusOf } from './logic';
import type { Area, State } from './types';

const BIOME: Record<Area['biome'], { fill: string; glyph: string }> = {
  forest: { fill: '#1f4d3a', glyph: '<path d="M0-9 6 0H3L7 6H-7L-3 0H-6Z" fill="#7fd6a0"/>' },
  dungeon: { fill: '#2e5233', glyph: '<path d="M-2 7V1C-7 1-8-3-5-5-4-9 3-9 5-6 8-4 7 1 2 1V7Z" fill="#a3d977"/>' },
  field: { fill: '#54692f', glyph: '<path d="M-7 5C-4 0-3-4-2-7M0 5C0 0 0-4 0-8M7 5C4 0 3-4 2-7" stroke="#d6e38a" stroke-width="1.8" fill="none" stroke-linecap="round"/>' },
  town: { fill: '#6b4a3a', glyph: '<path d="M-7 6V-1L-3-6 1-1V6ZM2 6V-3H7V6Z" fill="#f1c7a0"/>' },
  castle: { fill: '#46507a', glyph: '<path d="M-8 7V-5H-5V-2H-2V-5H2V-2H5V-5H8V7H2V2H-2V7Z" fill="#c8d2f5"/>' },
  ranch: { fill: '#8a6a2c', glyph: '<path d="M-8 6V-1L0-7 8-1V6ZM-3 6V1H3V6Z" fill="#ffe08a" fill-rule="evenodd"/>' },
  village: { fill: '#7d4d33', glyph: '<path d="M0-3V7M0-3-7-7M0-3 7 1M0-3 7-7M0-3-7 1" stroke="#ffd2a8" stroke-width="2.2" stroke-linecap="round"/>' },
  grave: { fill: '#3d3657', glyph: '<path d="M-5 7V-2A5 5 0 0 1 5-2V7Z" fill="#b6aee0"/><path d="M0-2V3M-2 0H2" stroke="#3d3657" stroke-width="1.5"/>' },
};

/** Soft terrain behind the nodes: original decoration, not a map of the game. */
const TERRAIN = `
  <path d="M-10 -10H150C160 40 150 90 150 130 C140 190 80 200 -10 210Z" fill="#14342a"/>
  <path d="M-10 210C80 200 140 190 150 130 C170 110 230 120 260 130 C260 190 250 240 230 330H-10Z" fill="#2c3a20"/>
  <path d="M150 -10H370V110C330 120 290 125 260 130 C230 120 170 110 150 130 C150 90 160 40 150 -10Z" fill="#232a4a"/>
  <path d="M260 130C290 125 330 120 370 110V330H230C250 240 260 190 260 130Z" fill="#33263c"/>
  <g fill="#ffffff" opacity=".05"><circle cx="30" cy="30" r="20"/><circle cx="120" cy="30" r="12"/><circle cx="25" cy="88" r="14"/><circle cx="200" cy="255" r="26"/><circle cx="60" cy="295" r="18"/><circle cx="340" cy="85" r="14"/></g>
`;

function ring(progress: number): string {
  const r = 21;
  const length = 2 * Math.PI * r;
  const track = `<circle r="${r}" fill="none" stroke="#ffffff22" stroke-width="3.5"/>`;
  if (progress <= 0) return track;
  return `${track}<circle r="${r}" fill="none" stroke="#7ee0a1" stroke-width="3.5" stroke-linecap="round"
      stroke-dasharray="${length * progress} ${length}" transform="rotate(-90)"/>`;
}

/** Badges appear only on `badges`, so the map shows what matters instead of everything possible. */
export function mapSvg(state: State, route: string[] = [], badges: string[] = route): string {
  const at = (id: string) => AREAS.find((a) => a.id === id)!;
  const roads = ROADS.map(([a, b]) => {
    const [p, q] = [at(a), at(b)];
    return `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="#ffffff2e" stroke-width="3" stroke-dasharray="1 8" stroke-linecap="round"/>`;
  }).join('');

  const routeLine =
    route.length > 1
      ? `<polyline class="route-line" points="${route.map((id) => `${at(id).x},${at(id).y}`).join(' ')}" fill="none" stroke="#f2c14e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 9"/>`
      : '';

  const nodes = AREAS.map((area) => {
    const entries = entriesIn(area.id);
    const done = entries.filter((e) => statusOf(e, state) === 'done').length;
    const now = availableIn(area.id, state).length;
    const here = area.id === state.current;
    const stop = route.indexOf(area.id);
    const unseen = !state.visited.includes(area.id);
    const biome = BIOME[area.biome];
    const label = `${area.name}: ${done} of ${entries.length} done${here ? ', you are here' : ''}${badges.includes(area.id) ? `, ${now} available now` : ''}`;
    return `<g class="node ${here ? 'is-here' : ''} ${unseen ? 'is-unseen' : ''}" transform="translate(${area.x} ${area.y})"
        role="button" tabindex="0" aria-label="${label}" data-action="go" data-id="${area.id}" data-key="node-${area.id}">
      <circle r="30" fill="transparent"/>
      ${here ? '<circle class="glow" r="27" fill="#f2c14e"/>' : ''}
      <circle r="17" fill="${biome.fill}" stroke="${here ? '#f2c14e' : '#00000055'}" stroke-width="2"/>
      ${biome.glyph}
      ${ring(entries.length ? done / entries.length : 0)}
      ${now > 0 && badges.includes(area.id) ? `<g transform="translate(17 -17)"><circle r="10" fill="#f2c14e" stroke="#12172b" stroke-width="2"/><text class="badge" y="4" text-anchor="middle">${now}</text></g>` : ''}
      ${stop > 0 ? `<g transform="translate(-18 -17)"><circle r="9" fill="#12172b" stroke="#f2c14e" stroke-width="2"/><text class="stop" y="3.5" text-anchor="middle">${stop}</text></g>` : ''}
      <text class="label" y="38" text-anchor="middle">${area.name}</text>
    </g>`;
  }).join('');

  return `<svg class="map" viewBox="0 0 360 300" role="group" aria-label="Map of areas">
    ${TERRAIN}${roads}${routeLine}${nodes}
  </svg>`;
}
