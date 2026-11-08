# Before You Leave

An unofficial phone tracker for reaching 100% in the Switch 2 remake of Ocarina of Time with as little backtracking as possible. It warns you about optional things you can get now, and about anything that closes off.

**Spoilers:** everything in `src/data/` contains locations and warnings. Don't read it if you're avoiding spoilers.

## Use it

Open **https://jrobertgit.github.io/zelda-skulltulas/** on your phone.

It covers the whole game, and areas stay hidden until you reach them. Nothing has been checked in the game itself yet, so use **Wrong?** on anything that doesn't match.

Progress is saved in the phone's browser and tied to the exact address. Use **Progress > Back up** to keep a copy, or to move to another address.

## Run it locally

```sh
npm install
npm run serve
```

Then open `http://<computer-name>.local:4173` from a device on the same Wi-Fi. Find the name with `scutil --get LocalHostName`.

## Publish

`npm run deploy` tests, builds and publishes to GitHub Pages.

## Develop

- `npm test` runs the logic and data checks.
- `npm run build` type-checks and builds to `dist/`, which can be moved to any static host later.

## Data

Gold Skulltulas are compared across RPG Site and Respec (one author), Game8, TheGamer and Gaming Route (which combines Nintendo Life and VGC). Other entries are compared across early community guides, because the game launched on 2026-11-05. Where guides disagree, `disputed` records it and the app shows it. All text and art are original to this project.
