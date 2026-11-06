// SPOILERS: game data lives in src/data.
import type { Ability, Area } from '../types';

const COL = [50, 137, 224, 311];
const row = (n: number) => 40 + n * 80;

/** The layout is a simplified diagram, not a real map of the game. */
export const AREAS: Area[] = [
  { id: 'fire', name: 'Fire Temple', x: COL[0], y: row(0), biome: 'dungeon', revealAfter: ['forestClear'] },
  { id: 'crater', name: 'The Crater', x: COL[1], y: row(0), biome: 'grave', revealAfter: ['bombs'] },
  { id: 'goron', name: 'Goron City', x: COL[2], y: row(0), biome: 'town', revealAfter: ['lullaby'] },
  { id: 'dodongo', name: 'Dodongo Cavern', x: COL[3], y: row(0), biome: 'dungeon', revealAfter: ['bracelet'] },
  { id: 'shadow', name: 'Shadow Temple', x: COL[0], y: row(1), biome: 'dungeon', revealAfter: ['lens'] },
  { id: 'graveyard', name: 'Graveyard', x: COL[1], y: row(1), biome: 'grave', revealAfter: ['dekuClear'] },
  { id: 'trail', name: 'Death Mtn Trail', x: COL[2], y: row(1), biome: 'grave', revealAfter: ['lullaby'] },
  { id: 'domain', name: "Zora's Domain", x: COL[3], y: row(1), biome: 'water', revealAfter: ['bombs'] },
  { id: 'well', name: 'The Well', x: COL[0], y: row(2), biome: 'dungeon', revealAfter: ['longshot'] },
  { id: 'kakariko', name: 'Kakariko', x: COL[1], y: row(2), biome: 'village', revealAfter: ['dekuClear'] },
  { id: 'river', name: "Zora's River", x: COL[2], y: row(2), biome: 'water', revealAfter: ['bombs'] },
  { id: 'fountain', name: "Zora's Fountain", x: COL[3], y: row(2), biome: 'water', revealAfter: ['bombs'] },
  { id: 'ganon', name: "Ganon's Castle", x: COL[0], y: row(3), biome: 'castle', revealAfter: ['lightArrows'] },
  { id: 'castle', name: 'Hyrule Castle', x: COL[1], y: row(3), biome: 'castle', revealAfter: ['dekuClear'] },
  { id: 'market', name: 'Market', x: COL[2], y: row(3), biome: 'town', revealAfter: ['dekuClear'] },
  { id: 'jabu', name: "Jabu-Jabu's Belly", x: COL[3], y: row(3), biome: 'dungeon', revealAfter: ['bombs'] },
  { id: 'valley', name: 'Gerudo Valley', x: COL[0], y: row(4), biome: 'field', revealAfter: ['boomerang'] },
  { id: 'field', name: 'Hyrule Field', x: COL[1], y: row(4), biome: 'field', revealAfter: ['dekuClear'] },
  { id: 'temple', name: 'Temple of Time', x: COL[2], y: row(4), biome: 'castle', revealAfter: ['boomerang'] },
  { id: 'ice', name: 'Ice Cavern', x: COL[3], y: row(4), biome: 'dungeon', revealAfter: ['hammer'] },
  { id: 'fortress', name: 'Gerudo Fortress', x: COL[0], y: row(5), biome: 'town', revealAfter: ['lens'] },
  { id: 'lonlon', name: 'Lon Lon Ranch', x: COL[1], y: row(5), biome: 'ranch', revealAfter: ['dekuClear'] },
  { id: 'kokiri', name: 'Kokiri Forest', x: COL[2], y: row(5), biome: 'forest', revealAfter: [] },
  { id: 'deku', name: 'Deku Tree', x: COL[3], y: row(5), biome: 'dungeon', revealAfter: [] },
  { id: 'training', name: 'Training Ground', x: COL[0], y: row(6), biome: 'dungeon', revealAfter: ['gerudoPass'] },
  { id: 'lake', name: 'Lake Hylia', x: COL[1], y: row(6), biome: 'water', revealAfter: ['bombs'] },
  { id: 'lostwoods', name: 'Lost Woods', x: COL[2], y: row(6), biome: 'forest', revealAfter: ['dekuClear'] },
  { id: 'meadow', name: 'Forest Meadow', x: COL[3], y: row(6), biome: 'forest', revealAfter: ['lullaby'] },
  { id: 'desert', name: 'Mirage Desert', x: COL[0], y: row(7), biome: 'field', revealAfter: ['gerudoPass'] },
  { id: 'water', name: 'Water Temple', x: COL[1], y: row(7), biome: 'dungeon', revealAfter: ['ironBoots'] },
  { id: 'forest', name: 'Forest Temple', x: COL[3], y: row(7), biome: 'dungeon', revealAfter: ['hookshot'] },
  { id: 'colossus', name: 'Desert Colossus', x: COL[0], y: row(8), biome: 'field', revealAfter: ['gerudoPass'] },
  { id: 'spirit', name: 'Spirit Temple', x: COL[1], y: row(8), biome: 'dungeon', revealAfter: ['requiem'] },
];

/**
 * Walking connections, used for routes and "next door" reminders.
 * Warp songs and shortcuts aren't modelled, so route lengths are rough estimates.
 */
export const ROADS: [string, string][] = [
  ['deku', 'kokiri'],
  ['kokiri', 'lostwoods'],
  ['kokiri', 'field'],
  ['lostwoods', 'meadow'],
  ['meadow', 'forest'],
  ['field', 'market'],
  ['market', 'castle'],
  ['market', 'temple'],
  ['castle', 'ganon'],
  ['field', 'lonlon'],
  ['field', 'kakariko'],
  ['kakariko', 'graveyard'],
  ['kakariko', 'well'],
  ['graveyard', 'shadow'],
  ['kakariko', 'trail'],
  ['trail', 'dodongo'],
  ['trail', 'goron'],
  ['trail', 'crater'],
  ['crater', 'fire'],
  ['field', 'river'],
  ['river', 'domain'],
  ['domain', 'fountain'],
  ['fountain', 'jabu'],
  ['fountain', 'ice'],
  ['field', 'lake'],
  ['lake', 'water'],
  ['field', 'valley'],
  ['valley', 'fortress'],
  ['fortress', 'training'],
  ['fortress', 'desert'],
  ['desert', 'colossus'],
  ['colossus', 'spirit'],
];

/**
 * Progress checks. askAfter stops the app naming something before earlier
 * steps are confirmed, which keeps later items and events from being spoiled.
 * `entry` links a check to the collectible it also completes, such as a song.
 */
export const ABILITIES: Ability[] = [
  { id: 'slingshot', label: 'Fairy Slingshot', askAfter: [], entry: 'story-slingshot' },
  { id: 'dekuClear', label: 'Deku Tree finished', askAfter: [], entry: 'story-emerald' },
  { id: 'ocarina', label: 'Fairy Ocarina', askAfter: ['dekuClear'], entry: 'story-fairy-ocarina' },
  { id: 'bottle', label: 'Any empty bottle', askAfter: ['dekuClear'] },
  { id: 'lullaby', label: "Zelda's Lullaby", askAfter: ['ocarina'], entry: 'song-lullaby' },
  { id: 'saria', label: "Saria's Song", askAfter: ['lullaby'], entry: 'song-saria' },
  { id: 'sun', label: "Sun's Song", askAfter: ['lullaby'], entry: 'song-sun' },
  { id: 'bracelet', label: "Goron's Bracelet", askAfter: ['saria'], entry: 'story-bracelet' },
  { id: 'bombs', label: 'Bombs', askAfter: ['bracelet'], entry: 'story-bombs' },
  { id: 'dins', label: "Din's Fire", askAfter: ['bombs'], entry: 'fairy-dins' },
  { id: 'beans', label: 'Magic Beans', askAfter: ['bombs'] },
  { id: 'boomerang', label: 'Boomerang', askAfter: ['bombs'], entry: 'story-boomerang' },
  { id: 'silverScale', label: 'Silver Scale', askAfter: ['bombs'], entry: 'up-silver-scale' },
  { id: 'songTime', label: 'Song of Time', askAfter: ['boomerang'], entry: 'song-time' },
  { id: 'maskSkull', label: 'Skull Mask', askAfter: ['bombs'], entry: 'mask-skull' },
  { id: 'maskTruth', label: 'Mask of Truth', askAfter: ['bombs'], entry: 'mask-truth' },
  { id: 'adult', label: 'Drew the Master Sword', askAfter: ['songTime'], entry: 'story-master-sword' },
  { id: 'hookshot', label: 'Hookshot', askAfter: ['adult'], entry: 'story-hookshot' },
  { id: 'epona', label: 'Epona', askAfter: ['adult'], entry: 'item-epona' },
  { id: 'storms', label: 'Song of Storms', askAfter: ['hookshot'], entry: 'song-storms' },
  { id: 'scarecrow', label: "Scarecrow's Song", askAfter: ['hookshot'], entry: 'song-scarecrow' },
  { id: 'bow', label: 'Fairy Bow', askAfter: ['hookshot'], entry: 'story-bow' },
  { id: 'forestClear', label: 'Forest Temple finished', askAfter: ['bow'], entry: 'story-forest-medallion' },
  { id: 'bolero', label: 'Bolero of Fire', askAfter: ['forestClear'], entry: 'song-bolero' },
  { id: 'hammer', label: 'Megaton Hammer', askAfter: ['bolero'], entry: 'story-hammer' },
  { id: 'ironBoots', label: 'Iron Boots', askAfter: ['hammer'], entry: 'story-iron-boots' },
  { id: 'longshot', label: 'Longshot', askAfter: ['ironBoots'], entry: 'story-longshot' },
  { id: 'goldenScale', label: 'Golden Scale', askAfter: ['longshot'], entry: 'up-golden-scale' },
  { id: 'lens', label: 'Lenses of Truth', askAfter: ['longshot'], entry: 'story-lens' },
  { id: 'gerudoPass', label: 'Gerudo Pass', askAfter: ['lens'], entry: 'story-pass' },
  { id: 'requiem', label: 'Requiem of Spirit', askAfter: ['gerudoPass'], entry: 'song-requiem' },
  { id: 'silverGauntlets', label: 'Silver Gauntlets', askAfter: ['requiem'], entry: 'story-silver-gauntlets' },
  { id: 'lightArrows', label: 'Light Arrows', askAfter: ['silverGauntlets'], entry: 'story-light-arrows' },
  { id: 'goldenGauntlets', label: 'Golden Gauntlets', askAfter: ['lightArrows'], entry: 'story-golden-gauntlets' },
];

export const TOTALS = { skulltula: 100, heart: 36, bottle: 5, song: 13 } as const;

/** Goals that don't belong to a place on the map. */
export const EXTRAS = [
  { id: 'hall-enemies', label: 'Hall of Fallen Foes: every enemy recorded and beaten once', after: ['dekuClear'] },
  { id: 'hall-child', label: 'Hall of Fallen Foes: child boss rush', after: ['forestClear'] },
  { id: 'hall-adult', label: 'Hall of Fallen Foes: adult boss rush', after: ['forestClear'] },
  { id: 'amiibo-link', label: 'Young Link amiibo mask (figure due 2027)', after: [] },
  { id: 'amiibo-zelda', label: 'Young Zelda amiibo mask (figure due 2027)', after: [] },
] as const;

export const GOSSIP_TOTAL = 100;
