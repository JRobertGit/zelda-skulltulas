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


function ring(progress: number): string {
  const r = 21;
  const length = 2 * Math.PI * r;
  const track = `<circle r="${r}" fill="none" stroke="#ffffff22" stroke-width="3.5"/>`;
  if (progress <= 0) return track;
  return `${track}<circle r="${r}" fill="none" stroke="#7ee0a1" stroke-width="3.5" stroke-linecap="round"
      stroke-dasharray="${length * progress} ${length}" transform="rotate(-90)"/>`;
}

/** Badges appear only on `badges`, so the map shows what matters instead of everything possible. */
export function mapSvg(state: State, route: string[] = [], badges: string[] = route, viewing: string = state.current): string {
  const at = (id: string) => AREAS.find((a) => a.id === id)!;
  const shown = revealedAreas(state);
  const open = new Set(shown.map((a) => a.id));
  const top = Math.min(...shown.map((a) => a.y)) - 40;
  const height = Math.max(...shown.map((a) => a.y)) + 62 - top;
  const glows = shown
    .map((a) => `<circle cx="${a.x}" cy="${a.y}" r="44" fill="${BIOME[a.biome].fill}" opacity=".24"/>`)
    .join('');
  const roads = ROADS.filter(([a, b]) => open.has(a) && open.has(b)).map(([a, b]) => {
    const [p, q] = [at(a), at(b)];
    return `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="#ffffff2e" stroke-width="3" stroke-dasharray="1 8" stroke-linecap="round"/>`;
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
    const biome = BIOME[area.biome];
    const label = `${area.name}: ${done} of ${entries.length} done${here ? ', you are here' : ''}${badges.includes(area.id) ? `, ${now} available now` : ''}`;
    return `<g class="node ${here ? 'is-here' : ''} ${unseen ? 'is-unseen' : ''}" transform="translate(${area.x} ${area.y})"
        role="button" tabindex="0" aria-label="${label}" data-action="go" data-id="${area.id}" data-key="node-${area.id}">
      <circle r="30" fill="transparent"/>
      ${here ? '<circle class="glow" r="27" fill="#f2c14e"/>' : ''}
      <circle r="17" fill="${biome.fill}" stroke="${here ? '#f2c14e' : area.id === viewing ? '#ffffff' : '#00000055'}" stroke-width="${area.id === viewing && !here ? 3 : 2}"/>
      ${biome.glyph}
      ${ring(entries.length ? done / entries.length : 0)}
      ${now > 0 && badges.includes(area.id) ? `<g transform="translate(17 -17)"><circle r="10" fill="#f2c14e" stroke="#12172b" stroke-width="2"/><text class="badge" y="4" text-anchor="middle">${now}</text></g>` : ''}
      ${stop > 0 ? `<g transform="translate(-18 -17)"><circle r="9" fill="#12172b" stroke="#f2c14e" stroke-width="2"/><text class="stop" y="3.5" text-anchor="middle">${stop}</text></g>` : ''}
      <text class="label" y="38" text-anchor="middle">${area.name}</text>
    </g>`;
  }).join('');

  return `<div class="map-wrap"><svg class="map" viewBox="0 ${top} 360 ${height}" role="group" aria-label="Map of areas">
    ${glows}${roads}${routeLine}${nodes}
  </svg></div>`;
}
