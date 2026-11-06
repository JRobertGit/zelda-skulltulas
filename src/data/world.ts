// SPOILERS: game data lives in src/data.
import type { Ability, Area } from '../types';

export const AREAS: Area[] = [
  { id: 'deku', name: 'Deku Tree', x: 62, y: 44, biome: 'dungeon', moreLater: false },
  { id: 'kokiri', name: 'Kokiri Forest', x: 126, y: 104, biome: 'forest', moreLater: true },
  { id: 'lostwoods', name: 'Lost Woods', x: 44, y: 152, biome: 'forest', moreLater: true },
  { id: 'field', name: 'Hyrule Field', x: 180, y: 176, biome: 'field', moreLater: true },
  { id: 'market', name: 'Market', x: 208, y: 86, biome: 'town', moreLater: true },
  { id: 'castle', name: 'Hyrule Castle', x: 288, y: 44, biome: 'castle', moreLater: true },
  { id: 'lonlon', name: 'Lon Lon Ranch', x: 104, y: 246, biome: 'ranch', moreLater: false },
  { id: 'kakariko', name: 'Kakariko', x: 292, y: 152, biome: 'village', moreLater: true },
  { id: 'graveyard', name: 'Graveyard', x: 296, y: 246, biome: 'grave', moreLater: true },
];

/** Walking connections between areas, used for routes and "next door" reminders. */
export const ROADS: [string, string][] = [
  ['deku', 'kokiri'],
  ['kokiri', 'lostwoods'],
  ['kokiri', 'field'],
  ['field', 'market'],
  ['market', 'castle'],
  ['field', 'lonlon'],
  ['field', 'kakariko'],
  ['kakariko', 'graveyard'],
];

/** askAfter stops the app naming something before earlier steps are confirmed. */
export const ABILITIES: Ability[] = [
  { id: 'slingshot', label: 'Fairy Slingshot', askAfter: [] },
  { id: 'dekuClear', label: 'Deku Tree finished', askAfter: [] },
  { id: 'ocarina', label: 'Fairy Ocarina', askAfter: ['dekuClear'] },
  { id: 'bottle', label: 'Empty bottle', askAfter: ['dekuClear'] },
  { id: 'lullaby', label: "Zelda's Lullaby", askAfter: ['ocarina'] },
  { id: 'saria', label: "Saria's Song", askAfter: ['ocarina'] },
  { id: 'bombs', label: 'Bombs', askAfter: ['lullaby'] },
  { id: 'boomerang', label: 'Boomerang', askAfter: ['bombs'] },
  { id: 'dins', label: "Din's Fire", askAfter: ['bombs'] },
];

export const TOTALS = { skulltula: 100, heart: 36, bottle: 5, song: 13 } as const;
