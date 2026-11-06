// SPOILERS: every location in the app lives here.
// Each entry is checked against at least two guides where possible. Any
// disagreement is recorded in `disputed` and shown in the app.
import type { Entry } from '../types';

const G8_RPG = ['game8', 'rpgsite'] as const;
const RPG_RESPEC = ['rpgsite', 'respec'] as const;

export const ENTRIES: Entry[] = [
  // Deku Tree
  { id: 'gs-deku-switch', area: 'deku', kind: 'skulltula', name: 'Gold Skulltula', where: 'Upper floor, optional alcove reached after the switch and raised platforms', needs: [], sources: [...G8_RPG] },
  { id: 'gs-deku-gate', area: 'deku', kind: 'skulltula', name: 'Gold Skulltula', where: 'Basement, behind the north gate', needs: ['slingshot'], sources: [...G8_RPG] },
  { id: 'gs-deku-web', area: 'deku', kind: 'skulltula', name: 'Gold Skulltula', where: 'Basement, vines in the room behind the burnable webs', needs: ['slingshot'], sources: [...G8_RPG] },
  { id: 'gs-deku-vines', area: 'deku', kind: 'skulltula', name: 'Gold Skulltula', where: 'Basement, look back at the vines near where you drop in', needs: ['slingshot'], sources: [...G8_RPG] },

  // Kokiri Forest
  { id: 'gs-kokiri-house', area: 'kokiri', kind: 'skulltula', name: 'Gold Skulltula', where: "Back wall of the Know-It-All Brothers' house", needs: ['dekuClear'], night: true, disputed: 'Guides describe this house differently: one says west, another south-east.', sources: [...G8_RPG] },
  { id: 'gs-kokiri-soil', area: 'kokiri', kind: 'skulltula', name: 'Gold Skulltula', where: 'Soft soil behind the shop: release a bottled bug', needs: ['dekuClear', 'bottle'], sources: [...G8_RPG] },

  // Lost Woods
  { id: 'gs-woods-soil-a', area: 'lostwoods', kind: 'skulltula', name: 'Gold Skulltula', where: 'Soft soil after going left twice: release a bottled bug', needs: ['dekuClear', 'bottle'], sources: [...G8_RPG] },
  { id: 'gs-woods-soil-b', area: 'lostwoods', kind: 'skulltula', name: 'Gold Skulltula', where: 'Soft soil on the Forest Stage route, behind the Business Scrub: release a bottled bug', needs: ['dekuClear', 'bottle'], sources: [...G8_RPG] },
  { id: 'hp-woods-mimic', area: 'lostwoods', kind: 'heart', name: 'Piece of Heart', where: 'Copy the song of the two Skull Kids on the stumps', needs: ['ocarina'], sources: [...RPG_RESPEC] },
  { id: 'hp-woods-saria', area: 'lostwoods', kind: 'heart', name: 'Piece of Heart', where: "Lone Skull Kid, first left from Kokiri Forest: play Saria's Song", needs: ['saria'], sources: [...RPG_RESPEC] },
  { id: 'up-woods-seeds', area: 'lostwoods', kind: 'upgrade', name: 'Biggest Deku Seed Bag', where: 'Hit the Lost Woods target three times in a row', needs: ['slingshot'], sources: ['rpgsite'] },
  { id: 'up-woods-sticks', area: 'lostwoods', kind: 'upgrade', name: 'Bigger Deku Stick Bag', where: 'Business Scrub at the end of the path: beat it, then pay 40 Rupees', needs: ['dekuClear'], sources: ['rpgsite'] },
  { id: 'up-woods-nuts', area: 'lostwoods', kind: 'upgrade', name: 'Bigger Deku Nut Bag', where: 'Bomb the boulder near the meadow, then pay the grotto Business Scrub 40 Rupees', needs: ['bombs'], sources: ['rpgsite'] },

  // Hyrule Field
  { id: 'gs-field-tree', area: 'field', kind: 'skulltula', name: 'Gold Skulltula', where: 'Roll into the lone tree at the end of the stream, south-east part of the field', needs: ['dekuClear'], disputed: 'One guide says night only, another lists it as any time.', sources: [...G8_RPG] },
  { id: 'gs-field-grotto', area: 'field', kind: 'skulltula', name: 'Gold Skulltula', where: 'South-west of the field, near the ranch: bomb the floor crack, then use the Boomerang in the grotto', needs: ['bombs', 'boomerang'], sources: [...G8_RPG] },
  { id: 'gs-field-crate', area: 'field', kind: 'skulltula', name: 'Gold Skulltula', where: 'Hidden grotto in the western marsh area: smash the crate', needs: ['boomerang', 'dins'], sources: [...G8_RPG] },

  // Market
  { id: 'gs-market-crate', area: 'market', kind: 'skulltula', name: 'Gold Skulltula', where: 'Room full of pots, door on the right as you enter: smash the crate that twitches', needs: ['dekuClear'], sources: [...G8_RPG] },
  { id: 'bottle-market', area: 'market', kind: 'bottle', name: 'Empty Bottle', where: "Potion Shop: help the shopkeeper with the bug problem", needs: ['dekuClear'], grants: 'bottle', sources: ['rpgsite', 'respec', 'game8'] },
  { id: 'up-market-seeds', area: 'market', kind: 'upgrade', name: 'Bigger Deku Seed Bag', where: 'Shooting Gallery: get a perfect score', needs: ['slingshot', 'dekuClear'], sources: ['rpgsite'] },
  { id: 'hp-market-bowling', area: 'market', kind: 'heart', name: 'Piece of Heart', where: 'Bombchu Bowling Alley prize', needs: ['bombs'], sources: [...RPG_RESPEC] },
  { id: 'up-market-bombs', area: 'market', kind: 'upgrade', name: 'Biggest Bomb Bag', where: 'Bombchu Bowling Alley prize', needs: ['bombs'], sources: ['rpgsite'] },
  { id: 'hp-market-dog', area: 'market', kind: 'heart', name: 'Piece of Heart', where: 'Bring the right white dog, Richard, to its owner. It usually starts in the back alley', needs: ['dekuClear'], night: true, sources: [...RPG_RESPEC] },

  // Hyrule Castle
  { id: 'gs-castle-tree', area: 'castle', kind: 'skulltula', name: 'Gold Skulltula', where: 'Roll into the tree in front of the west building, before the moat', needs: ['dekuClear'], disputed: 'One guide says night only, another lists it as any time.', sources: [...G8_RPG] },
  { id: 'fairy-castle', area: 'castle', kind: 'fairy', name: 'Great Fairy: Spin Attack upgrade', where: 'Sneak past the main gate, bomb the cracked wall, then play Zelda\'s Lullaby', needs: ['bombs', 'lullaby'], sources: ['rpgsite'] },

  // Lon Lon Ranch
  { id: 'gs-ranch-tree', area: 'lonlon', kind: 'skulltula', name: 'Gold Skulltula', where: 'Roll into the tree behind the house with the Cucco game', needs: ['dekuClear'], sources: [...G8_RPG] },
  { id: 'gs-ranch-house', area: 'lonlon', kind: 'skulltula', name: 'Gold Skulltula', where: 'Boomerang it off the house wall by the window', needs: ['boomerang'], night: true, sources: [...G8_RPG] },
  { id: 'gs-ranch-tower', area: 'lonlon', kind: 'skulltula', name: 'Gold Skulltula', where: 'Boomerang it inside the tall ruined tower, far south-west', needs: ['boomerang'], disputed: 'One guide says night only, another lists it as any time.', sources: [...G8_RPG] },
  { id: 'hp-ranch-silo', area: 'lonlon', kind: 'heart', name: 'Piece of Heart', where: 'Crumbling tower, south-west edge: solve the block puzzle and crawl through', needs: ['dekuClear'], sources: [...RPG_RESPEC] },
  { id: 'bottle-ranch', area: 'lonlon', kind: 'bottle', name: 'Empty Bottle', where: 'Win the Super Cucco game', needs: ['dekuClear'], grants: 'bottle', sources: ['rpgsite'] },
  { id: 'song-epona', area: 'lonlon', kind: 'song', name: "Epona's Song", where: 'Show Malon your Ocarina in the horse paddock', needs: ['ocarina'], sources: ['rpgsite'] },

  // Kakariko
  { id: 'gs-kak-ladder', area: 'kakariko', kind: 'skulltula', name: 'Gold Skulltula', where: 'Ladder of the watchtower, near the top', needs: ['dekuClear', 'slingshot'], night: true, sources: [...G8_RPG] },
  { id: 'gs-kak-nw', area: 'kakariko', kind: 'skulltula', name: 'Gold Skulltula', where: 'Wall of the north-west house, before the Death Mountain gate', needs: ['dekuClear'], night: true, sources: [...G8_RPG] },
  { id: 'gs-kak-door', area: 'kakariko', kind: 'skulltula', name: 'Gold Skulltula', where: 'Beside the door of the House of Skulltula', needs: ['dekuClear'], night: true, sources: ['game8', 'rpgsite', 'respec'] },
  { id: 'gs-kak-site', area: 'kakariko', kind: 'skulltula', name: 'Gold Skulltula', where: 'Bricks in the building site, middle of the village', needs: ['dekuClear'], night: true, sources: [...G8_RPG] },
  { id: 'gs-kak-tree', area: 'kakariko', kind: 'skulltula', name: 'Gold Skulltula', where: 'Roll into the lone tree near the village entrance', needs: ['dekuClear'], disputed: 'One guide says night only, another lists it as any time.', sources: [...G8_RPG] },
  { id: 'hp-kak-roof', area: 'kakariko', kind: 'heart', name: 'Piece of Heart', where: 'Glide with a Cucco from behind the Windmill to the blue roof, then talk to the person there', needs: ['dekuClear'], sources: [...RPG_RESPEC] },
  { id: 'hp-kak-owl', area: 'kakariko', kind: 'heart', name: 'Piece of Heart', where: 'Rooftop near where the owl drops you after its ride from the mountain peak', needs: ['bombs'], sources: [...RPG_RESPEC] },
  { id: 'bottle-kak', area: 'kakariko', kind: 'bottle', name: 'Empty Bottle', where: "Return all the Cucco Lady's chicks", needs: ['dekuClear'], grants: 'bottle', sources: ['rpgsite'] },
  { id: 'reward-10', area: 'kakariko', kind: 'reward', name: '10 token reward', where: 'House of Skulltula', needs: [], minTokens: 10, sources: [...RPG_RESPEC] },
  { id: 'reward-20', area: 'kakariko', kind: 'reward', name: '20 token reward', where: 'House of Skulltula', needs: [], minTokens: 20, disputed: 'Guides disagree on what this reward is, and one lists it at 22 tokens.', sources: [...RPG_RESPEC] },
  { id: 'reward-30', area: 'kakariko', kind: 'reward', name: '30 token reward', where: 'House of Skulltula', needs: [], minTokens: 30, disputed: 'Reward details are not confirmed.', sources: ['rpgsite'] },
  { id: 'reward-40', area: 'kakariko', kind: 'reward', name: '40 token reward', where: 'House of Skulltula', needs: [], minTokens: 40, disputed: 'Reward details are not confirmed.', sources: ['game8'] },
  { id: 'hp-kak-50', area: 'kakariko', kind: 'heart', name: 'Piece of Heart', where: 'House of Skulltula, 50 token reward', needs: [], minTokens: 50, sources: [...RPG_RESPEC] },
  { id: 'reward-100', area: 'kakariko', kind: 'reward', name: '100 token reward', where: 'House of Skulltula', needs: [], minTokens: 100, sources: ['rpgsite'] },

  // Graveyard
  { id: 'gs-grave-soil', area: 'graveyard', kind: 'skulltula', name: 'Gold Skulltula', where: 'Soft soil on the north side: release a bottled bug', needs: ['dekuClear', 'bottle'], sources: [...G8_RPG] },
  { id: 'gs-grave-wall', area: 'graveyard', kind: 'skulltula', name: 'Gold Skulltula', where: "Boomerang it off the wall behind Dampe's hut", needs: ['boomerang'], disputed: 'One guide says night only, another lists it as any time.', sources: [...G8_RPG] },
  { id: 'hp-grave-dig', area: 'graveyard', kind: 'heart', name: 'Piece of Heart', where: "Top prize on Dampe's Gravedigging Tour: keep paying when he says it's something hard", needs: ['dekuClear'], night: true, sources: [...RPG_RESPEC] },
  { id: 'hp-grave-pull', area: 'graveyard', kind: 'heart', name: 'Piece of Heart', where: 'Pull back the rear-right grave, not the giant tomb, and go underneath', needs: ['dekuClear'], night: true, sources: [...RPG_RESPEC] },
  { id: 'shield-grave', area: 'graveyard', kind: 'shield', name: 'Hylian Shield', where: 'Free inside one of the graves you can pull open', needs: ['dekuClear'], night: true, sources: ['rpgsite'] },
  { id: 'song-sun', area: 'graveyard', kind: 'song', name: "Sun's Song", where: "Top of the graveyard: play Zelda's Lullaby at the plinth to open the crypt", needs: ['lullaby'], sources: ['rpgsite'] },
];
