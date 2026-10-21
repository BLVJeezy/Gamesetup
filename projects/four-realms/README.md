# Four Realms: Awakening

A browser-first third-person elemental duel prototype, built beside the original
Mr. Mak workspace. Nothing in the desktop application is replaced.

## Play locally

Requires Node.js 22.20 or later. From this directory:

```sh
npm ci
npm run build
npm start
```

Open http://localhost:3000. For two computers on the same network, both open the
host computer's LAN address on port 3000. For internet play, deploy the included
Dockerfile to a persistent Node/container host with HTTPS and WebSocket support.
The same server serves the client and `/socket`; no separate credentials or
third-party service is needed. `PORT` defaults to 3000.

Choose an element before entering. Training uses a clearly labeled sparring bot.
Multiplayer > Create room returns a six-character code. The other player selects
any element and joins that code. Combat starts only when both are present. First
knockout wins; both must request a rematch. Leaving a duel frees the slot.

For client development: `npm start` in one terminal, `npm run dev` in another.
The Vite proxy forwards WebSocket traffic to port 3000.

## Implemented

- Full-screen reference-art menu, gold typography, four element selections.
- Real-time Three.js arena with temple pavilions, mountains, ocean, shadows,
  ornamental stone court, cover pillars, and articulated placeholder fighters.
- Camera-relative movement, orbit/follow camera, sprint FOV, jump, dash, guard.
- Fire, water, earth and air projectiles with distinct speed/damage/cooldown.
- Live health, focus, enemy health, cooldowns, win/loss and rematches.
- Private two-player WebSocket rooms with a 30 Hz authoritative simulation.
- Server controls positions, resource costs, collisions, damage and winners.
- Basic touch controls, keyboard navigation and connection error messages.

## Visual acceptance — not yet met

The user's five supplied images are the art-direction target, not captures of
this game's 3D renderer. The menu uses the supplied menu image directly, with
functional UI layered over it. The runtime arena and characters are original
stylized blockouts; they do **not** reproduce the photorealistic environments or
production-quality characters in the references. The four nation images are
preserved in `public/art` for future environment production.

The Spider-Man clip informed camera distance, responsive follow and sprint FOV.
Web swinging, parkour, authored motion capture, full cities, an open world and
AAA cinematic quality are not implemented. There is no audio yet.

Next visual milestone: replace the placeholder fighter with a licensed/owned,
rigged character, authored locomotion and bending clips; build one reference-
matched arena with textured architecture before expanding the world. Do not
advertise the concept images as runtime screenshots.

## Hosting and multiplayer limits

This is a private duel prototype, not a production competitive service. Rooms
are held in memory on one process; restarting clears them. No account system,
ranked matchmaking, persistent progression, reconnect recovery, horizontal
scaling or client-side prediction is included. Internet latency still needs
real-device testing. Deploy on a persistent WebSocket-capable service; a static
website host alone can run training but cannot provide this multiplayer server.

## Verification

`npm test` checks element damage, cooldowns, movement bounds, pillar collisions,
input sanitization, guard, knockout and actual two-client WebSocket sessions.
`npm run build` builds the browser client. See `VERIFICATION.md` for browser
checks and current limitations.

## Asset provenance

`public/art/*.jpeg`: supplied by the user on 21 October 2026. These are concept
references, with embedded UI. No Spider-Man footage is redistributed. All arena
geometry and placeholder character code are original for this prototype.
