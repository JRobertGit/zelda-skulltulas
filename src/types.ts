export type Kind = 'skulltula' | 'heart' | 'bottle' | 'upgrade' | 'song' | 'fairy' | 'shield' | 'mask' | 'reward' | 'chest' | 'quest' | 'story' | 'plant' | 'step';

export type Age = 'child' | 'adult';

export type SourceId = 'rpgsite' | 'respec' | 'game8' | 'nintendo' | 'thegamer' | 'gamingroute';

export interface Area {
  id: string;
  name: string;
  x: number;
  y: number;
  biome: 'forest' | 'field' | 'town' | 'castle' | 'ranch' | 'village' | 'grave' | 'dungeon' | 'water';
  /** The area stays off the map until the player has confirmed all of these. */
  revealAfter: string[];
}

export interface Ability {
  id: string;
  /** Short question text, shown only once askAfter is satisfied. */
  label: string;
  askAfter: string[];
  /** Collectible that this check also completes, such as a song. */
  entry?: string;
}

export interface Entry {
  id: string;
  area: string;
  kind: Kind;
  name: string;
  where: string;
  needs: string[];
  night?: boolean;
  age?: Age;
  minTokens?: number;
  /** Stays locked until this entry is collected, for quests done in order. */
  after?: string;
  /** Counted on Progress only. The story guarantees it, so it never prompts a warning. */
  quiet?: boolean;
  /** Ability the player automatically has once this entry is ticked. */
  grants?: string;
  /** Set when guides disagree. Says what the disagreement is. */
  disputed?: string;
  sources: SourceId[];
}

export interface Lockout {
  id: string;
  /** Area where the warning appears. Null means it only appears in the global watch list. */
  area: string | null;
  severity: 'forever' | 'for-a-while' | 'recoverable';
  /** Hidden until these are confirmed, so a warning can't spoil what comes later. */
  showAfter: string[];
  /** No longer relevant once these are confirmed. */
  hideAfter?: string[];
  /** No longer relevant once this entry is collected. */
  hideIfDone?: string;
  /** Also shown in the Next step box while this check is the next question. */
  warnBefore?: string;
  title: string;
  detail: string;
  disputed?: string;
  sources: SourceId[];
}

export interface State {
  version: 1;
  current: string;
  visited: string[];
  owned: string[];
  /** Checks the player answered "not yet", so they stop being asked. */
  notYet: string[];
  done: string[];
  /** Entries the player knowingly left behind through the leave warning. */
  skipped: string[];
  /** Entries the player marked as wrong. */
  flagged: string[];
  /** Skulltula tokens collected in areas this build doesn't list yet. */
  extraTokens: number;
  /** Where the player says they're heading, if anywhere. */
  destination: string | null;
  /** Side trips the player has added to the current route. */
  detours: string[];
  /** Goals with no place on the map, such as the Hall of Fallen Foes. */
  extras: string[];
  /** Zelda Notes Gossip Quests finished. */
  gossip: number;
}

export type Status = 'done' | 'now' | 'blocked';

export interface SideTrip {
  area: string;
  /** How many things can be collected in this area right now. */
  items: number;
  /** Extra walking steps, there and back, from the route. */
  steps: number;
  /** Things here that aren't reachable yet, so a later visit is needed anyway. */
  returnsAnyway: number;
  added: boolean;
}

export interface TripStop {
  area: string;
  /** Entries to collect at this stop. Empty for areas the route only passes through. */
  entries: string[];
}
