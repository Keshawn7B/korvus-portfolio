# Minecraft-Style Interactive Bio Section

A drop-in static demo for a portfolio website: visitors walk around a small blocky world and discover real information at glowing sign stations.

## Run locally

```bash
cd ~/korvus-workspace/portfolio/demos/minecraft-bio-section
python3 -m http.server 8787
```

Open: <http://127.0.0.1:8787>

## Controls

- Move: `WASD` or arrow keys
- Look: mouse/touch drag
- Mobile: on-screen direction buttons

## Stations included

- Portfolio Plaza — explains the concept
- AI Automation Workshop — Korvus / Hermes personal AI system
- Game Dev Biome — Roblox action-game direction
- Builder Toolkit — practical coding/automation tools
- Learning Tower — growth areas and shipping mindset

## Integration notes

This demo is intentionally dependency-free: HTML, CSS, and vanilla Canvas JavaScript. To integrate into an Astro/Next/static portfolio, copy the section markup, CSS, and `world.js`, or embed this folder as a standalone route/iframe while the full site stack is still being chosen.

Public-safety note: the copy avoids private credentials, private chat details, and relationship/private-life specifics. Replace or expand the station text only with information you are comfortable publishing.
