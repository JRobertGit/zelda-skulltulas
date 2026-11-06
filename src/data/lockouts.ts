// SPOILERS: warnings about things that close off, temporarily or for good.
// This only holds documented cases, so an empty list doesn't prove an area is safe.
import type { Lockout } from '../types';

export const LOCKOUTS: Lockout[] = [
  {
    id: 'courtyard',
    area: 'castle',
    severity: 'forever',
    title: 'The courtyard closes for good later',
    detail: 'No collectibles are lost, only the scenes through its windows. Look now if you want to see them.',
    sources: ['game8'],
  },
  {
    id: 'moat-scene',
    area: 'market',
    severity: 'for-a-while',
    title: 'A later story scene shuts optional things here for a while',
    detail: 'It happens at the castle moat, later in the story. Finish your optional stops here while you can.',
    sources: ['respec'],
  },
  {
    id: 'cuccos',
    area: 'kakariko',
    severity: 'recoverable',
    title: 'The Cuccos reset if you stay away too long',
    detail: 'Finish the Cucco roof jump on this visit. If you miss it, there is another way much later.',
    sources: ['rpgsite', 'respec'],
  },
  {
    id: 'beans',
    area: null,
    severity: 'for-a-while',
    title: "The Zora's River bean seller runs out",
    detail: 'Buy all his beans when you first meet him.',
    disputed: 'One guide says every bean is needed for 100%. Another lists beans as recoverable.',
    sources: ['rpgsite', 'respec', 'game8'],
  },
  {
    id: 'autosaves',
    area: null,
    severity: 'forever',
    title: 'Only the last five autosaves are kept',
    detail: 'Make a manual save before anything risky so you always have a safe point to go back to.',
    sources: ['game8'],
  },
  {
    id: 'dialogue',
    area: null,
    severity: 'forever',
    title: 'Early dialogue changes as the story moves on',
    detail: 'Nothing collectible is lost. Talk to people after big events if you want to hear everything.',
    sources: ['game8'],
  },
];
