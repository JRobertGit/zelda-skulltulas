// SPOILERS: every location in the app lives here.
//
// Written from the full text of the RPG Site and Respec guides, which share an
// author and numbering, and compared against Game8's separate Gold Skulltula
// list. `disputed` records a real disagreement between them. Nothing here has
// been checked in the game itself, so the app lets the player mark entries wrong.
import type { Age, Entry, Kind, SourceId } from '../types';

const AUTHOR: SourceId[] = ['rpgsite', 'respec'];
const BOTH: SourceId[] = ['rpgsite', 'respec', 'game8'];

interface Options {
  night?: boolean;
  age?: Age;
  minTokens?: number;
  after?: string;
  quiet?: boolean;
  grants?: string;
  disputed?: string;
  sources?: SourceId[];
}

const make = (kind: Kind, id: string, area: string, name: string, where: string, needs: string[], o: Options = {}): Entry => ({
  id, area, kind, name, where, needs, sources: o.sources ?? AUTHOR, ...o,
});

const NIGHT_DISPUTE = 'Guides disagree on whether this appears only at night.';
const gs = (id: string, area: string, where: string, needs: string[], o: Options = {}) =>
  make('skulltula', id, area, 'Gold Skulltula', where, needs, { sources: BOTH, ...o });
const hp = (id: string, area: string, where: string, needs: string[], o: Options = {}) =>
  make('heart', id, area, 'Piece of Heart', where, needs, o);
const up = (id: string, area: string, name: string, where: string, needs: string[], o: Options = {}) =>
  make('upgrade', id, area, name, where, needs, o);
const song = (id: string, area: string, name: string, where: string, needs: string[], o: Options = {}) =>
  make('song', id, area, name, where, needs, o);
const fairy = (id: string, area: string, name: string, where: string, needs: string[], o: Options = {}) =>
  make('fairy', id, area, name, where, needs, o);
const mask = (id: string, area: string, name: string, where: string, needs: string[], o: Options = {}) =>
  make('mask', id, area, name, where, needs, { age: 'child', ...o });
const bottle = (id: string, area: string, where: string, needs: string[], o: Options = {}) =>
  make('bottle', id, area, 'Empty Bottle', where, needs, { grants: 'bottle', ...o });
const chest = (id: string, area: string, name: string, where: string, needs: string[], o: Options = {}) =>
  make('chest', id, area, name, where, needs, o);
const item = (id: string, area: string, name: string, where: string, needs: string[], o: Options = {}) =>
  make('reward', id, area, name, where, needs, o);

const child: Options = { age: 'child' };
const adult: Options = { age: 'adult' };
const adultNight: Options = { age: 'adult', night: true };
const childNight: Options = { age: 'child', night: true };

export const ENTRIES: Entry[] = [
  // Deku Tree
  gs('gs-deku-switch', 'deku', 'Compass room: press the switch and go left, into the alcove', [], child),
  gs('gs-deku-gate', 'deku', 'Lower level, on the grate in the water at the north side', ['slingshot'], child),
  gs('gs-deku-vines', 'deku', 'Lower level: after climbing out of the water, turn around and look at the vines', ['slingshot'], child),
  gs('gs-deku-web', 'deku', 'Past the torch room: burn the north-west web with a Deku Stick', ['slingshot'], child),

  // Kokiri Forest
  gs('gs-kokiri-house', 'kokiri', "Behind the Know-It-All Brothers' house, south-west", ['dekuClear'], childNight),
  gs('gs-kokiri-soil', 'kokiri', 'Soft soil behind the shop: release a bottled bug', ['dekuClear', 'bottle'], child),
  gs('gs-kokiri-roof', 'kokiri', 'Behind the south-east house: use the Hookshot', ['hookshot'], adultNight),
  item('item-cow', 'kokiri', 'Lon Lon Cow', "Appears at your house after Malon's obstacle course. Optional: free milk", ['epona'], adult),

  // Lost Woods
  gs('gs-woods-soil-a', 'lostwoods', 'From the Kokiri entrance go left, then out the far side: soft soil. Release a bug', ['dekuClear', 'bottle'], child),
  gs('gs-woods-soil-b', 'lostwoods', 'Forest Stage (right, left, right, left, left): soft soil. Release a bug', ['dekuClear', 'bottle'], child),
  gs('gs-woods-bean', 'lostwoods', 'Past Mido, go left: ride the bean plant you planted as a child', ['beans'], adultNight),
  hp('hp-woods-mimic', 'lostwoods', 'Below the target: stand on the stump and copy the two Skull Kids until they pay up', ['ocarina'], child),
  hp('hp-woods-saria', 'lostwoods', "Lone Skull Kid, first left from Kokiri: play Saria's Song", ['saria'], child),
  up('up-woods-seeds', 'lostwoods', 'Biggest Deku Seed Bag', 'Right from the Kokiri entrance: hit the target three times', ['slingshot'], child),
  up('up-woods-sticks', 'lostwoods', 'Bigger Deku Stick Bag', 'End of the path past the first-left Skull Kid: beat the Business Scrub, then pay 40 Rupees', ['dekuClear'], child),
  up('up-woods-nuts', 'lostwoods', 'Bigger Deku Nut Bag', 'Last screen before the meadow: bomb the boulder, pay the grotto Business Scrub 40 Rupees', ['bombs'], child),
  up('up-woods-sticks2', 'lostwoods', 'Biggest Deku Stick Bag', 'Forest Stage grotto: wear the Skull Mask on stage', ['maskSkull'], child),
  up('up-woods-nuts2', 'lostwoods', 'Biggest Deku Nut Bag', 'Forest Stage grotto: wear the Mask of Truth on stage', ['maskTruth'], child),

  // Forest Meadow
  song('song-saria', 'meadow', "Saria's Song", 'Follow the music to the top of the meadow and talk to Saria', ['lullaby'], { ...child, grants: 'saria' }),
  gs('gs-meadow', 'meadow', 'Halfway through the maze, up on the right-hand wall', ['hookshot'], { ...adultNight, disputed: 'One guide places this near the temple stairs instead of mid-maze.' }),
  song('song-minuet', 'meadow', 'Minuet of Forest', 'Cutscene when you reach the meadow as an adult', ['hookshot'], adult),

  // Hyrule Field
  gs('gs-field-tree', 'field', 'Near the Kokiri Forest road: roll into the lone tree at the end of the stream', ['dekuClear'], { ...childNight, disputed: NIGHT_DISPUTE }),
  gs('gs-field-grotto', 'field', 'South woods, behind the ranch: bomb the crack, then use the Boomerang in the grotto', ['bombs', 'boomerang'], child),
  gs('gs-field-crate', 'field', 'Hidden grotto in the western marshland: smash the crate', ['boomerang', 'dins'], child),
  hp('hp-field-chest', 'field', 'Red-rock outcrop near the Gerudo side. As an adult read the Fairy Note, then open the chest as a child', ['adult', 'forestClear'], child),
  hp('hp-field-shop', 'field', 'Grotto by the single tree beside the castle-side moat. Read the note as an adult, give the password as a child, pay 100 Rupees', ['adult', 'forestClear', 'bombs'], child),
  item('quest-poes', 'field', 'Big Poes (all ten)', 'Jump Epona over the glowing purple lanterns, shoot them, bottle them, sell at the Market Poe Shop', ['epona', 'bow', 'bottle'], adult),

  // Market
  gs('gs-market-crate', 'market', 'First door on the right as you enter, the room of pots: roll into the crate that twitches', ['dekuClear'], child),
  bottle('bottle-poe', 'market', 'Poe Shop: reach 500 points by selling Big Poes', ['epona', 'bow', 'bottle'], adult),
  bottle('bottle-market', 'market', 'Potion Shop: agree to catch the bug for the shopkeeper', ['dekuClear'], { ...child, sources: BOTH }),
  up('up-market-seeds', 'market', 'Bigger Deku Seed Bag', 'Rupee Shooting Gallery: perfect 10/10', ['slingshot', 'dekuClear'], child),
  hp('hp-market-bowling', 'market', 'Bombchu Bowling prize. Play until you have all its prizes', ['bombs'], child),
  up('up-market-bombs', 'market', 'Biggest Bomb Bag', 'Bombchu Bowling prize', ['bombs'], child),
  item('item-bombchus', 'market', 'Bombchus', 'Bombchu Bowling prize', ['bombs'], child),
  hp('hp-market-dog', 'market', "Bring Richard to the dog lady. Of three white dogs, he usually starts in the alley near her house", ['dekuClear'], childNight),
  hp('hp-market-chest', 'market', 'Treasure Chest game in the back alley: the Lenses of Truth show what\'s inside', ['lens', 'forestClear'], childNight),
  mask('mask-keaton', 'market', 'Keaton Mask: borrow', 'Happy Mask Shop', ['bombs']),
  mask('mask-skull', 'market', 'Skull Mask: borrow', 'Happy Mask Shop, once the Keaton Mask is paid off. Wear it at the Forest Stage grotto before selling', ['bombs'], { grants: 'maskSkull', after: 'mask-keaton-sell' }),
  mask('mask-spooky', 'market', 'Spooky Mask: borrow', 'Happy Mask Shop, once the Skull Mask is paid off', ['bombs'], { after: 'mask-skull-sell' }),
  mask('mask-bunny', 'market', 'Bunny Hood: borrow', 'Happy Mask Shop, once the Spooky Mask is paid off', ['bombs'], { after: 'mask-spooky-sell' }),
  mask('mask-others', 'market', 'Zora, Goron and Gerudo Masks', 'Unlocked in the shop once the Bunny Hood is paid off', ['bombs'], { after: 'mask-bunny-sell' }),
  mask('mask-truth', 'market', 'Mask of Truth', 'The shop owner gives it to you once the Bunny Hood is paid off', ['bombs'], { grants: 'maskTruth', after: 'mask-bunny-sell' }),
  mask('mask-keaton-sell', 'kakariko', 'Keaton Mask: sell', 'To the guard at the Death Mountain gate. Pay the shop afterwards', ['bombs'], { after: 'mask-keaton' }),
  mask('mask-skull-sell', 'lostwoods', 'Skull Mask: sell', 'To the lone Skull Kid, first left from Kokiri. Use it at the Forest Stage grotto first. Pay the shop afterwards', ['bombs'], { after: 'mask-skull' }),
  mask('mask-spooky-sell', 'graveyard', 'Spooky Mask: sell', 'To the kid here during the day. Pay the shop afterwards', ['bombs'], { after: 'mask-spooky' }),
  mask('mask-bunny-sell', 'field', 'Bunny Hood: sell', 'To the running man. He often passes the Market gate early in the day. Pay the shop afterwards', ['bombs'], { after: 'mask-bunny' }),

  // Hyrule Castle
  gs('gs-castle-tree', 'castle', 'Before climbing the vine to the castle, look right behind the wall: roll into the tree', ['dekuClear'], { ...childNight, disputed: 'Guides differ on the exact tree and on whether it needs night.' }),
  gs('gs-castle-grotto', 'castle', "Where you found Talon asleep: tree in the corner facing the town. Play the Song of Storms to open the grotto", ['storms', 'forestClear'], child),
  fairy('fairy-castle', 'castle', 'Spin Attack', "Just past the gate: bomb the cracked wall, play Zelda's Lullaby, pay 50 Rupees", ['bombs', 'lullaby'], child),
  song('song-lullaby', 'castle', "Zelda's Lullaby", 'After the scenes in the castle courtyard', ['ocarina'], { ...child, grants: 'lullaby' }),

  // Temple of Time
  song('song-time', 'market', 'Song of Time', 'Scene at the Market gate once you have the three stones, then collect from the moat', ['boomerang'], { ...child, grants: 'songTime' }),
  song('song-prelude', 'temple', 'Prelude of Light', 'Talk to Sheik after the Forest Temple', ['forestClear'], adult),

  // Ganon's Castle (outside and in)
  gs('gs-ganon', 'ganon', 'Outside, keep east: on the back of the collapsed building. Don\'t go in yet', ['lightArrows'], adult),
  fairy('fairy-ganon', 'ganon', 'Gift of Halved Damage', "Leave the castle, lift the golden rock left of the bridge, play Zelda's Lullaby, pay 500 Rupees", ['goldenGauntlets'], adult),

  // Lon Lon Ranch
  gs('gs-ranch-tree', 'lonlon', 'Behind the Cucco Search building: roll into the two trees', ['dekuClear'], child),
  gs('gs-ranch-house', 'lonlon', 'On the ranch house window: use the Boomerang', ['boomerang'], childNight),
  gs('gs-ranch-tower', 'lonlon', 'Inside the south-west silo building: use the Boomerang', ['boomerang'], { ...child, disputed: NIGHT_DISPUTE }),
  hp('hp-ranch-silo', 'lonlon', 'South-west silo building: move the blocks and crawl through the gap', ['dekuClear'], child),
  bottle('bottle-ranch', 'lonlon', 'Win the Super Cucco game, first door on the left as you enter', ['dekuClear'], child),
  song('song-epona', 'lonlon', "Epona's Song", 'Take out your Ocarina in front of Malon in the paddock', ['ocarina'], child),
  item('item-epona', 'lonlon', 'Epona', "Pay to ride, play Epona's Song, then beat Ingo in the races and jump the fence", ['adult'], { ...adult, grants: 'epona' }),

  // Kakariko
  gs('gs-kak-ladder', 'kakariko', 'Ladder of the watchtower: shoot it with the Slingshot, then climb for the token', ['dekuClear', 'slingshot'], childNight),
  gs('gs-kak-nw', 'kakariko', 'Behind the north-western house', ['dekuClear'], childNight),
  gs('gs-kak-door', 'kakariko', 'Beside the door of the House of Skulltula', ['dekuClear'], childNight),
  gs('gs-kak-site', 'kakariko', 'Building site: climb the scaffold', ['dekuClear'], childNight),
  gs('gs-kak-tree', 'kakariko', 'Roll into the tree in the village', ['dekuClear'], { ...childNight, disputed: 'Guides differ: middle of town at night, or near the entrance at any time.' }),
  gs('gs-kak-roof', 'kakariko', 'Southernmost house: Hookshot the vines to its roof and look behind it', ['hookshot'], adultNight),
  hp('hp-kak-roof', 'kakariko', 'Use a Cucco to clear the fence at the Windmill, climb the ladder, then glide to the blue roof and talk to the man', ['dekuClear'], child),
  hp('hp-kak-owl', 'kakariko', 'Ride the owl from the mountain peak, then drop south onto the next roof', ['bombs'], child),
  hp('hp-kak-windmill', 'kakariko', "Dampe's race drops you in the Windmill: jump to the upper ledge", ['hookshot'], adult),
  bottle('bottle-kak', 'kakariko', "Return all seven of the Cucco Lady's Cuccos", ['dekuClear'], child),
  song('song-storms', 'kakariko', 'Song of Storms', 'Take out your Ocarina in front of the Windmill music man', ['hookshot'], { ...adult, grants: 'storms' }),
  song('song-nocturne', 'kakariko', 'Nocturne of Shadow', 'Story scenes on your next visit after the Water Temple', ['longshot'], adult),
  up('up-quiver', 'kakariko', 'Bigger Quiver', 'Win the target shooting game', ['bow'], adult),
  item('reward-10', 'kakariko', "Adult's Wallet", 'House of Skulltula, 10 tokens', [], { minTokens: 10, disputed: 'Guides disagree on its capacity: 200 or 500 Rupees.' }),
  item('reward-20', 'kakariko', 'Echo Gem', 'House of Skulltula, 20 tokens. Equip it: it reacts near Gold Skulltulas', [], { minTokens: 20, sources: BOTH }),
  item('reward-30', 'kakariko', "Giant's Wallet", 'House of Skulltula, 30 tokens', [], { minTokens: 30, sources: BOTH }),
  item('reward-40', 'kakariko', '20 Bombchus', 'House of Skulltula, 40 tokens', [], { minTokens: 40, sources: ['respec', 'game8'] }),
  hp('hp-kak-50', 'kakariko', 'House of Skulltula, 50 tokens', [], { minTokens: 50, sources: BOTH }),
  item('reward-100', 'kakariko', 'Endless 200 Rupees', 'House of Skulltula, 100 tokens', [], { minTokens: 100, sources: BOTH }),

  // Graveyard
  gs('gs-grave-soil', 'graveyard', 'Soft soil in the north-west: release a bottled bug', ['dekuClear', 'bottle'], child),
  gs('gs-grave-wall', 'graveyard', "Behind Dampe's hut: use the Boomerang", ['boomerang'], { ...childNight, disputed: NIGHT_DISPUTE }),
  hp('hp-grave-dig', 'graveyard', "Dampe's Gravedigging Tour: random. Pay extra when he says it's something hard", ['dekuClear'], childNight),
  hp('hp-grave-pull', 'graveyard', 'Pull open the right-most normal grave facing the big tomb, then drop in', ['dekuClear'], childNight),
  hp('hp-grave-bean', 'graveyard', 'Ride the bean plant you planted as a child, in the north', ['beans'], adult),
  hp('hp-grave-race', 'graveyard', "Beat Dampe's race in under a minute", ['hookshot'], adult),
  make('shield', 'shield-grave', 'graveyard', 'Hylian Shield', 'Second grave on the right of the path to the big tomb: pull it, defeat what\'s inside, open the chest', ['dekuClear'], childNight),
  song('song-sun', 'graveyard', "Sun's Song", "Top of the graveyard: play Zelda's Lullaby on the symbol, then go through the tomb", ['lullaby'], { ...child, grants: 'sun' }),

  // Well
  gs('gs-well-a', 'well', 'With the Lenses, past the Beamos room: beat the Like Like, then the wall', ['lens', 'boomerang'], child),
  gs('gs-well-b', 'well', 'West locked door off the central room', ['lens'], child),
  gs('gs-well-c', 'well', 'East locked door: the Lenses show the path', ['lens'], child),

  // Death Mountain Trail
  gs('gs-trail-soil', 'trail', 'Soft soil at the Dodongo Cavern entrance: release a bottled bug', ['bracelet', 'bottle'], child),
  gs('gs-trail-wall', 'trail', 'Bombable wall on the road back to Kakariko', ['bombs']),
  gs('gs-trail-rock-a', 'trail', 'Where rocks fell on you earlier: smash the rocks on the path with the Hammer', ['hammer'], adult),
  gs('gs-trail-rock-b', 'trail', 'Rock near the Goron City entrance: smash it with the Hammer', ['hammer'], adult),
  fairy('fairy-dins', 'trail', "Din's Fire", "Mountain peak, left of the owl: bomb the cave, play Zelda's Lullaby, pay up", ['bombs', 'lullaby'], { ...child, grants: 'dins' }),
  hp('hp-trail-bean', 'trail', 'Ride the bean plant you planted outside Dodongo Cavern as a child', ['beans'], adult),

  // Dodongo Cavern
  gs('gs-dodongo-stairs', 'dodongo', 'Bomb flower staircase: look up behind the stairs as you loop around', ['bracelet']),
  gs('gs-dodongo-rock', 'dodongo', 'From the main-room shortcut, turn right and bomb the rock', ['bombs']),
  gs('gs-dodongo-corridor', 'dodongo', '1F east, the Baby Dodongo corridor: bomb the alcove on the south side', ['bombs']),
  gs('gs-dodongo-mouth', 'dodongo', 'Through the skull\'s mouth, in the block room: bomb the cracked wall', ['bombs']),
  gs('gs-dodongo-pierre', 'dodongo', "Baby Dodongo corridor: play the Scarecrow's Song and Hookshot up", ['scarecrow', 'hookshot'], adult),

  // Goron City
  gs('gs-goron-crate', 'goron', 'Top tier: bomb into the west room, then through its maze to a crate', ['bombs'], child),
  gs('gs-goron-rock', 'goron', 'Behind the central rock the bridges connect to: Hookshot it from the grate below', ['hookshot'], adult),
  hp('hp-goron-pot', 'goron', 'Light the four torches, then throw a bomb into the spinning pot from above', ['bombs'], child),
  up('up-goron-bombs', 'goron', 'Bigger Bomb Bag', 'Stop the rolling Goron with a bomb in front of the sign, middle floor', ['bombs'], child),
  item('item-goron-tunic', 'goron', 'Goron Tunic', 'Stop the rolling Goron child with a bomb', ['hookshot', 'bombs'], adult),
  item('item-knife', 'goron', "Giant's Knife", 'Medigoron, right of the entrance: 200 Rupees. It breaks if you use it, and that is fine', ['hookshot'], adult),

  // The Crater
  gs('gs-crater-crate', 'crater', 'From the peak, duck in and go left: smash the two crates, then get out', ['bombs'], child),
  gs('gs-crater-soil', 'crater', 'Warp in with Bolero as a child: soft soil next to the warp. Release a bug, plant a bean', ['bolero', 'forestClear', 'bottle'], child),
  hp('hp-crater-grates', 'crater', 'After the Fire Temple: climb down between the two grates in the south', ['hammer'], adult),
  hp('hp-crater-bean', 'crater', 'Ride the bean plant by the warp point', ['bolero', 'forestClear', 'beans'], adult),
  hp('hp-crater-scrub', 'crater', 'As a child from the peak: go left and down to the Business Scrub. 100 Rupees. Heal first, the heat is a timer', ['bombs'], child),
  song('song-bolero', 'crater', 'Bolero of Fire', 'Hookshot across the broken bridge on your first adult visit', ['hookshot'], { ...adult, grants: 'bolero' }),
  fairy('fairy-double', 'crater', 'Double Magic', "West side: smash the rock, play Zelda's Lullaby, pay 200 Rupees", ['hammer'], adult),

  // Fire Temple
  gs('gs-fire-time', 'fire', 'Large lava room: ride the rising platform, play the Song of Time, beat the Like Like', ['forestClear', 'bombs'], adult),
  gs('gs-fire-maze', 'fire', 'Rolling boulder maze: bomb the wall in the north', ['forestClear', 'bombs'], adult),
  gs('gs-fire-pierre', 'fire', "Upper maze, facing south-west: play the Scarecrow's Song, Hookshot up, ride the lift", ['forestClear', 'scarecrow'], adult),
  gs('gs-fire-door', 'fire', 'Through the door past the last one, around the corner', ['forestClear', 'scarecrow'], adult),
  gs('gs-fire-hammer', 'fire', 'First room, right side of the lower floor: smash through, then smash the stones', ['hammer'], adult),

  // Zora's River
  gs('gs-river-soil', 'river', 'Soft soil by the bean seller: release a bug', ['bombs', 'bottle'], child),
  gs('gs-river-rock', 'river', 'Near the Lullaby symbol, go down to the rocks below. On the back of one', ['bombs'], { ...child, disputed: 'Guides disagree on the spot: back of the lower rocks, or a wall behind the vines.' }),
  gs('gs-river-adult-a', 'river', 'Raised section with the Gossip Stone, heading back toward the field', ['hookshot', 'beans'], adultNight),
  gs('gs-river-adult-b', 'river', 'Last corner of the river: turn around and look high up', ['hookshot'], adultNight),
  hp('hp-river-grotto', 'river', 'Carry a Cucco over the gap, climb the vines, take the Cucco in the grotto and flutter to the ledge', ['bombs'], child),
  hp('hp-river-end', 'river', 'Same Cucco, up to where the path zig-zags: flutter back down to the ledge', ['bombs'], child),
  hp('hp-river-frogs-a', 'river', 'Frogs halfway up: play the Song of Storms', ['storms', 'forestClear'], child),
  hp('hp-river-frogs-b', 'river', "Same frogs: play other songs until all five grow, then win their game", ['storms', 'forestClear'], child),

  // Zora's Domain
  gs('gs-domain', 'domain', 'From the old diving spot, look left and Hookshot', ['hookshot'], adultNight),
  hp('hp-domain-torches', 'domain', "Light the two torches behind the bottom waterfall with Din's Fire, then the rest quickly. A chest appears", ['dins'], child),
  up('up-silver-scale', 'domain', 'Silver Scale', "Diving game on King Zora's left", ['bombs'], { ...child, grants: 'silverScale' }),
  item('item-zora-tunic', 'domain', 'Zora Tunic', 'Use Blue Fire on King Zora, then talk to him', ['ironBoots'], adult),

  // Zora's Fountain
  gs('gs-fountain-tree', 'fountain', 'South-east island: roll into the trees', ['bombs'], child),
  gs('gs-fountain-night', 'fountain', 'Right of Jabu-Jabu: use the Boomerang', ['boomerang'], { ...childNight, disputed: 'Guides disagree on the spot: right of Jabu-Jabu, or the log to its south-west.' }),
  gs('gs-fountain-cave', 'fountain', 'Lift the huge rock next to the Fairy Fountain and go through the cave', ['silverGauntlets', 'lens'], adultNight),
  hp('hp-fountain-ice', 'fountain', 'Hop east across the ice blocks', ['hookshot'], adult),
  hp('hp-fountain-floor', 'fountain', 'Sink to the floor with the Iron Boots after leaving the Ice Cavern', ['ironBoots'], adult),
  fairy('fairy-farore', 'fountain', "Farore's Wind", "South-east: bomb the big rock, play Zelda's Lullaby, pay 100 Rupees", ['bombs', 'lullaby'], child),

  // Jabu-Jabu's Belly
  gs('gs-jabu-vines', 'jabu', 'Opposite the map chest, up the vines once the water is raised', ['bombs'], child),
  gs('gs-jabu-hole', 'jabu', 'Drop through the new hole after the tentacle: on the wall, use the Boomerang', ['boomerang'], child),
  gs('gs-jabu-ceiling', 'jabu', 'On the ceiling of the path right after that drop', ['boomerang'], child),
  gs('gs-jabu-last', 'jabu', 'Last room before the boss, on the vines', ['boomerang'], child),

  // Ice Cavern
  gs('gs-ice-blade', 'ice', 'Room with the spinning blade, up high', ['hookshot'], adult),
  gs('gs-ice-compass', 'ice', 'At the Compass chest, look up to the north-west', ['hookshot', 'bottle'], adult),
  gs('gs-ice-block', 'ice', 'As you step onto the ice block puzzle floor, look back high up', ['hookshot', 'bottle'], adult),
  song('song-serenade', 'ice', 'Serenade of Water', 'At the end of the cavern', ['hammer'], adult),

  // Lake Hylia
  gs('gs-lake-soil', 'lake', 'Soft soil outside the Lakeside Laboratory: release a bug', ['bombs', 'bottle'], child),
  gs('gs-lake-lab', 'lake', 'Side of the Laboratory, from the bridge: use the Boomerang', ['boomerang'], childNight),
  gs('gs-lake-outcrop', 'lake', 'Far south-west outcrop: crawl through the gap', ['silverScale'], child),
  gs('gs-lake-tree', 'lake', 'Longshot up to the vines on the tree where you land after the Water Temple', ['longshot'], adultNight),
  gs('gs-lake-tank', 'lake', 'Bottom of the Lab tank with the Iron Boots, then Hookshot it', ['ironBoots'], adult),
  hp('hp-lake-fish', 'lake', 'Fishing Pond: catch a fish of 55cm or more', ['bombs'], child),
  hp('hp-lake-bean', 'lake', 'Ride the bean plant by the Lab, around to its roof', ['beans', 'hookshot'], adult),
  hp('hp-lake-tank', 'lake', 'Lab tank: dive to the bottom using the Golden Scale, no boots', ['goldenScale'], adult),
  bottle('bottle-lake', 'lake', 'Underwater right by the Zora warp exit. It holds a letter for the story', ['silverScale'], child),
  up('up-golden-scale', 'lake', 'Golden Scale', 'Fishing Pond: catch a fish of 65cm or more', ['longshot'], { ...adult, grants: 'goldenScale' }),
  item('item-fire-arrows', 'lake', 'Fire Arrows', 'Shoot the rising sun with an arrow from where you land after the Water Temple', ['longshot', 'bow'], adult),
  song('song-scarecrow', 'lake', "Scarecrow's Song", 'Make up a tune as a child, then replay it to the scarecrow as an adult', ['hookshot'], { ...adult, grants: 'scarecrow' }),

  // Forest Temple
  gs('gs-forest-first', 'forest', 'First room: climb the vines and Hookshot it at the top', ['hookshot'], adult),
  gs('gs-forest-north', 'forest', 'Central room, at the north door: turn around and look left', ['hookshot'], adult),
  gs('gs-forest-balcony', 'forest', 'After the Boss Key, drop down to the balcony and follow the ledge south', ['hookshot', 'bow'], adult),
  gs('gs-forest-pierre', 'forest', "East chamber, after pushing the shortcut block: play the Scarecrow's Song above the door", ['scarecrow', 'bow'], adult),
  gs('gs-forest-rotate', 'forest', 'Rotating room: in one of the alcoves it reveals', ['bow'], adult),

  // Water Temple
  gs('gs-water-b1', 'water', 'Water at green: sink behind the floating block to B1, open the room with the switch', ['ironBoots'], adult),
  gs('gs-water-whirlpool', 'water', 'After the Longshot: above the water at the U-bend of the whirlpool corridor', ['longshot'], adult),
  gs('gs-water-pillar', 'water', 'Water at green: Longshot to the ceiling panel inside the central pillar', ['longshot'], adult),
  gs('gs-water-boulder', 'water', 'After the Boss Key: rolling boulder hallway, up where the water cascades', ['longshot'], adult),
  gs('gs-water-bomb', 'water', 'Water at green: blue-lit room, bomb the wall where you surface', ['longshot', 'bombs'], adult),

  // Shadow Temple
  gs('gs-shadow-scythe', 'shadow', 'Invisible scythe room: beat the Like Like, then through the door it opens', ['lens'], adult),
  gs('gs-shadow-spikes', 'shadow', 'Falling spikes room: push the block to the end, climb on top, look up and left', ['lens'], adult),
  gs('gs-shadow-fans', 'shadow', 'Fan rooms: after Hookshotting across the gap, turn around', ['lens', 'ironBoots'], adult),
  gs('gs-shadow-pierre', 'shadow', "Bottom of the lift: pull the block, play the Scarecrow's Song", ['lens', 'scarecrow'], adult),
  gs('gs-shadow-pots', 'shadow', 'After the boat, west room: throw bombs in the three pots', ['lens', 'bombs'], adult),

  // Gerudo Valley
  gs('gs-valley-bridge', 'valley', 'By the small plank bridge as you enter: use the Boomerang', ['boomerang'], childNight),
  gs('gs-valley-soil', 'valley', 'Flutter down with the Cucco from the first chest, to the ledge with the cow: soft soil', ['boomerang', 'bottle'], child),
  gs('gs-valley-rocks', 'valley', 'On the rock formation opposite the tents', ['longshot'], adultNight),
  gs('gs-valley-tents', 'valley', 'On the wall behind the tents', ['longshot'], adultNight),
  hp('hp-valley-chest', 'valley', 'Cucco left of the suspension bridge: glide south-west to the chest', ['boomerang'], child),
  hp('hp-valley-nook', 'valley', 'Past the cow, climb the stairs by the waterfall to the hidden area', ['boomerang'], child),

  // Gerudo Fortress
  gs('gs-fortress-wall', 'fortress', 'Far east door, outside: on the wall to your right', ['lens'], adultNight),
  gs('gs-fortress-target', 'fortress', 'Horseback Archery range: back of the north-eastern target', ['gerudoPass'], { ...adultNight, disputed: 'Guides differ on which target it is.' }),
  hp('hp-fortress-chest', 'fortress', 'Inside, climb the ladder by your old cell, then Hookshot east to the chest', ['gerudoPass'], adult),
  hp('hp-fortress-archery', 'fortress', 'Horseback Archery: 1000 points', ['gerudoPass', 'epona', 'bow'], adult),
  up('up-quiver2', 'fortress', 'Biggest Quiver', 'Horseback Archery: 1400 points', ['gerudoPass', 'epona', 'bow'], adult),

  // Training Ground
  item('item-ice-arrows', 'training', 'Ice Arrows', 'Center chest after finding all nine keys. Needs items from the Spirit Temple', ['silverGauntlets', 'lens'], adult),

  // Mirage Desert and Colossus
  gs('gs-desert', 'desert', 'Small building past the quicksand: down the pit in the middle', ['gerudoPass'], adult),
  gs('gs-colossus-birds', 'colossus', 'North of the area, beneath the birds', ['gerudoPass', 'hookshot'], adultNight),
  gs('gs-colossus-soil', 'colossus', 'Warp in as a child: soft soil left of the temple door. Release a bug, plant a bean', ['requiem', 'bottle'], child),
  gs('gs-colossus-bean', 'colossus', 'Ride the bean plant by the temple door', ['requiem', 'beans'], adultNight),
  hp('hp-colossus-bean', 'colossus', 'Stay on the bean plant to the further rock', ['requiem', 'beans'], adult),
  fairy('fairy-nayru', 'colossus', "Nayru's Love", "On your right as you enter: bomb the wall, play Zelda's Lullaby, pay 300 Rupees", ['gerudoPass'], adult),
  song('song-requiem', 'colossus', 'Requiem of Spirit', 'Walk toward the Spirit Temple door', ['gerudoPass'], { ...adult, grants: 'requiem' }),

  // Spirit Temple
  gs('gs-spirit-gate', 'spirit', 'Child path: through the gate that opens once you collect the crystals', ['requiem', 'boomerang'], child),
  gs('gs-spirit-statue', 'spirit', 'Giant statue room, far right of the statue from the map chest', ['requiem'], child),
  gs('gs-spirit-door', 'spirit', 'After the sun block puzzle: look behind you above the door', ['requiem'], child),
  gs('gs-spirit-time', 'spirit', 'Rolling boulder room: Song of Time moves the blue block. It hides in one alcove', ['silverGauntlets'], adult),
  gs('gs-spirit-pierre', 'spirit', "Statue room, ledge by the chest hand: play the Scarecrow's Song", ['silverGauntlets', 'scarecrow'], adult),
  // Biggoron Sword trading quest, in order
  ...([
    ['q-egg', 'kakariko', 'Pocket Egg', 'Talk to the Cucco Lady', ['adult'], undefined],
    ['q-cucco', 'kakariko', 'Pocket Cucco', "Let the egg hatch, then use it next to Talon in the house in the middle of the village", ['adult'], 'q-egg'],
    ['q-cojiro', 'kakariko', 'Cojiro', 'Take the Pocket Cucco back to the Cucco Lady', ['adult'], 'q-cucco'],
    ['q-mushroom', 'lostwoods', 'Odd Mushroom', "First left from Kokiri: show Cojiro to the Master Craftsman's Son. A 4 minute timer starts, no warps", ['adult'], 'q-cojiro'],
    ['q-poultice', 'kakariko', 'Odd Poultice', 'Bring the mushroom to the Potion Shop within 4 minutes', ['adult'], 'q-mushroom'],
    ['q-saw', 'lostwoods', "Poacher's Saw", 'Same spot, now Fado: hand over the Odd Poultice', ['adult'], 'q-poultice'],
    ['q-broken', 'valley', 'Broken Goron Sword', "Jump the bridge on Epona or Longshot across, then show the saw to the Master Craftsman", ['epona'], 'q-saw'],
    ['q-prescription', 'trail', 'Prescription', 'Mountain peak: show the sword to Biggoron', ['adult'], 'q-broken'],
    ['q-frog', 'domain', 'Eyeball Frog', 'Show the Prescription to King Zora. A 2:30 timer starts, no warps. Dive through the shortcut to the lake', ['adult'], 'q-prescription'],
    ['q-drops', 'lake', 'Eye Drops', 'Give the frog to the Lakeside Lab scientist within 2:30. A 3:30 timer starts, no warps', ['adult'], 'q-frog'],
    ['q-receipt', 'trail', 'Biggoron Receipt', 'Run the drops back to Biggoron within 3:30. Epona helps', ['adult'], 'q-drops'],
    ['q-biggoron', 'trail', 'Biggoron Sword', 'Wait three days, then show the receipt. The Sun\'s Song speeds it up', ['adult'], 'q-receipt'],
  ] as [string, string, string, string, string[], string | undefined][]).map(([id, area, name, where, needs, after]) =>
    make('quest', id, area, name, where, needs, { ...adult, after })),

  // Treasure chests the guides describe. This is NOT a complete list of the game's chests.
  chest('c-mido', 'kokiri', "Mido's House: four chests", 'Northernmost house on the west side. Rupees', [], { sources: ['respec', 'game8'] }),
  chest('c-deku-map', 'deku', 'Dungeon Map', 'Climb the vines in the lobby and follow the path round', [], { sources: ['respec', 'game8'] }),
  chest('c-deku-compass', 'deku', 'Compass', 'Press the switch and jump across the gap', [], { sources: ['respec', 'game8'] }),
  chest('c-deku-nuts', 'deku', 'Small chest: Deku Nuts', 'Behind the Compass chest, crawl through the gap', [], { sources: ['respec', 'game8'] }),
  chest('c-deku-sticks', 'deku', 'Small chest: Deku Sticks', 'Lower level: press the switch to burn the web', [], { sources: ['respec', 'game8'] }),
  chest('c-dodongo-map', 'dodongo', 'Dungeon Map', 'Main room: bomb flower on the north-west alcove rocks', ['bracelet'], { sources: ['respec', 'game8'] }),
  chest('c-dodongo-compass', 'dodongo', 'Compass', 'West door, then blast the rock to the south', ['bracelet'], { sources: ['respec', 'game8'] }),
  chest('c-dodongo-rupee', 'dodongo', 'Rupee chest', 'Appears after the Lizalfos fight', ['bracelet'], { sources: ['respec', 'game8'] }),
  chest('c-goron-maze', 'goron', 'West room chests', 'Top tier: bomb into the west room and through its maze', ['bombs']),
  chest('c-river-grotto', 'river', 'Grotto chest', 'Above the vines, in the corner grotto hidden in long grass', ['bombs'], { sources: ['respec', 'game8'] }),
  chest('c-jabu-map', 'jabu', 'Dungeon Map', 'Press the switch to raise the water, then the nearby chest', ['bombs'], { sources: ['respec', 'game8'] }),
  chest('c-jabu-compass', 'jabu', 'Compass', 'In one of the rooms along the long north corridor', ['boomerang'], { sources: ['respec', 'game8'] }),
  chest('c-forest-map', 'forest', 'Dungeon Map', 'North-east courtyard: drain the well, then Hookshot up to the big chest', ['hookshot']),
  chest('c-forest-compass', 'forest', 'Compass', 'Blue Poe staircase room: defeat the Poe', ['bow']),
  chest('c-fire-map', 'fire', 'Dungeon Map', 'South of the rolling boulder maze', ['forestClear']),
  chest('c-fire-compass', 'fire', 'Compass', 'Circular room: shoot the switch above the west door', ['forestClear']),
  chest('c-fire-race', 'fire', 'Three Rupee chests', 'Hookshot race puzzle near the upper Gold Skulltula', ['scarecrow']),
  chest('c-ice-map', 'ice', 'Dungeon Map', 'Melt the red ice around the chest with Blue Fire', ['bottle', 'hammer']),
  chest('c-ice-compass', 'ice', 'Compass', 'East of the spinning blade room, behind red ice', ['bottle', 'hammer']),
  chest('c-ice-rupee', 'ice', 'Rupee chest', 'Ice block room, west ledge: Song of Time makes a bridge', ['bottle', 'hammer']),
  chest('c-water-map', 'water', 'Dungeon Map', 'East path on 1F underwater, follow the blue line up', ['ironBoots']),
  chest('c-water-compass', 'water', 'Compass', "South of the central pillar: bomb the wall, swim through, beat the Like Like", ['ironBoots', 'bombs']),
  chest('c-water-b1', 'water', 'Rupee chest', 'B1 room with the Gold Skulltula, water at green', ['ironBoots']),
  chest('c-well-map', 'well', 'Dungeon Map', 'Below the Beamos room, behind the bombable rocks', ['longshot', 'bombs']),
  chest('c-well-compass', 'well', 'Compass', 'Middle rooms: enter through the hidden hole in the outer wall', ['lens']),
  chest('c-well-rupees', 'well', 'Rupee chests', 'North-west, south-west and the south crawlspace of the central room', ['lens']),
  chest('c-shadow-map', 'shadow', 'Dungeon Map', 'North of the right-hand crypt room, past the ReDead', ['lens']),
  chest('c-shadow-compass', 'shadow', 'Compass', 'Past the bombed east wall, through the false wall to the south', ['lens']),
  chest('c-shadow-invisible', 'shadow', 'Invisible chest', 'In the Gold Skulltula room past the invisible scythe', ['lens']),
  chest('c-spirit-map', 'spirit', 'Dungeon Map', "Light the unlit torch at the statue's foot with Din's Fire", ['requiem', 'dins']),
  chest('c-spirit-compass', 'spirit', 'Compass', "North-west room: play Zelda's Lullaby, then Hookshot to the chest", ['silverGauntlets']),

  // Story items: the game hands you these, so they only count on Progress.
  ...([
    ['story-sword', 'kokiri', 'Kokiri Sword', [], undefined],
    ['story-deku-shield', 'kokiri', 'Deku Shield', [], undefined],
    ['story-slingshot', 'deku', 'Fairy Slingshot', [], 'slingshot'],
    ['story-heart-deku', 'deku', 'Heart Container: Deku Tree', ['slingshot'], undefined],
    ['story-emerald', 'deku', 'Kokiri Emerald', ['slingshot'], 'dekuClear'],
    ['story-fairy-ocarina', 'field', 'Fairy Ocarina', ['dekuClear'], 'ocarina'],
    ['story-bracelet', 'goron', "Goron's Bracelet", ['saria'], 'bracelet'],
    ['story-bombs', 'dodongo', 'Bomb Bag', ['bracelet'], 'bombs'],
    ['story-heart-dodongo', 'dodongo', 'Heart Container: Dodongo Cavern', ['bombs'], undefined],
    ['story-ruby', 'dodongo', "Goron's Ruby", ['bombs'], undefined],
    ['story-boomerang', 'jabu', 'Boomerang', ['bombs'], 'boomerang'],
    ['story-heart-jabu', 'jabu', "Heart Container: Jabu-Jabu's Belly", ['boomerang'], undefined],
    ['story-sapphire', 'jabu', "Zora's Sapphire", ['boomerang'], undefined],
    ['story-ocarina-time', 'market', 'Ocarina of Time', ['boomerang'], undefined],
    ['story-master-sword', 'temple', 'Master Sword', ['songTime'], 'adult'],
    ['story-light-medallion', 'temple', 'Light Medallion', ['adult'], undefined],
    ['story-hookshot', 'graveyard', 'Hookshot', ['adult'], 'hookshot'],
    ['story-bow', 'forest', 'Fairy Bow', ['hookshot'], 'bow'],
    ['story-heart-forest', 'forest', 'Heart Container: Forest Temple', ['bow'], undefined],
    ['story-forest-medallion', 'forest', 'Forest Medallion', ['bow'], 'forestClear'],
    ['story-hammer', 'fire', 'Megaton Hammer', ['forestClear'], 'hammer'],
    ['story-heart-fire', 'fire', 'Heart Container: Fire Temple', ['hammer'], undefined],
    ['story-fire-medallion', 'fire', 'Fire Medallion', ['hammer'], undefined],
    ['story-iron-boots', 'ice', 'Iron Boots', ['hammer'], 'ironBoots'],
    ['story-longshot', 'water', 'Longshot', ['ironBoots'], 'longshot'],
    ['story-heart-water', 'water', 'Heart Container: Water Temple', ['longshot'], undefined],
    ['story-water-medallion', 'water', 'Water Medallion', ['longshot'], undefined],
    ['story-lens', 'well', 'Lenses of Truth', ['longshot'], 'lens'],
    ['story-hover', 'shadow', 'Hover Boots', ['lens'], undefined],
    ['story-heart-shadow', 'shadow', 'Heart Container: Shadow Temple', ['lens'], undefined],
    ['story-shadow-medallion', 'shadow', 'Shadow Medallion', ['lens'], undefined],
    ['story-pass', 'fortress', 'Gerudo Pass', ['lens'], 'gerudoPass'],
    ['story-silver-gauntlets', 'spirit', 'Silver Gauntlets', ['requiem'], 'silverGauntlets'],
    ['story-mirror', 'spirit', 'Mirror Shield', ['silverGauntlets'], undefined],
    ['story-heart-spirit', 'spirit', 'Heart Container: Spirit Temple', ['silverGauntlets'], undefined],
    ['story-spirit-medallion', 'spirit', 'Spirit Medallion', ['silverGauntlets'], undefined],
    ['story-light-arrows', 'temple', 'Light Arrows', ['silverGauntlets'], 'lightArrows'],
    ['story-golden-gauntlets', 'ganon', 'Golden Gauntlets', ['lightArrows'], 'goldenGauntlets'],
  ] as [string, string, string, string[], string | undefined][]).map(([id, area, name, needs, grants]) =>
    make('story', id, area, name, '', needs, { quiet: true, grants })),
];
