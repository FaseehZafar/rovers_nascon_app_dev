# League Hub 🏆

A native-feeling, white-label multi-sport league application built with React, TypeScript, Tailwind CSS, Three.js, and Google Gemini & Veo neural media engines.

Faithfully recreation of the high-contrast athletic design reference with loud condensed display typography, electric lime (`#C8F135`) and optimistic periwinkle violet (`#7B6CF2`) color blocks, halftone dot textures, rounded tactile controls, and data-driven sport engines.

---

## 🎨 Visual Language & Reference Fidelity

1. **Screen 1 (Home / Ligue Football)**: Full-bleed electric lime header, round white monogram crest, round translucent navigation button, giant two-line condensed headline (`LIGUE` over tone-on-tone olive `FOOTBALL`), periwinkle violet next-match row, underline search field, vertical-bar team performance strip with white playhead, and best players list with efficiency metrics.
2. **Screen 2 (Club Profile / Team Members)**: Bright periwinkle violet background, ghosted team monogram, round crest in white circle, giant white-and-black condensed title, lime subline (`53 PLAYERS`), white overlapping card, and paired comparison bars (`94 PROTECTIVE LINE 78`, `53 TEAMWORK 39`, `53 SPEED OF ATTACK REPULSION 39`).
3. **Screen 3 (Match Detail / Hunter Renfrow)**: Periwinkle violet canvas, round close button, giant ghosted jersey number (`89`), horizontal row of rounded stat tiles (`4.19 SEC / SPEED / 100M RUN`, `225 FT / POWER / BENCH PRESS`, `98% / STAMINA`), live score strip, and a full-width lime button (`READ FULL SCOUT REPORT`).

---

## 👥 Five Demo Roles (One-Tap Switcher)

Switch roles anytime via the top-right round menu button:

- **Super-Admin**: Full administrative control over the sport rules engine via live JSON schema editor with zero code branching, and system database reset.
- **League Organizer**: Live match scoring console with one-tap scoring event buttons, running match clock, and undo/compensating event audit log.
- **Club Manager**: Squad roster management (add athletes, transfers, loans, releases with plain-language rule validations).
- **Player**: Personal performance stats, training benchmarks, and team cohesion index.
- **Viewer / Fan**: Live score tracking, fixtures, standings with qualification status badges, and club store checkout with downloadable HMAC receipt.

---

## 🏷️ White-Label Multi-Tenant Theming

- **Apex National League (`tenant-alpha`)**: Electric Lime (`#C8F135`) & Periwinkle Violet (`#7B6CF2`) with Olive tone-on-tone accents.
- **Metro Championship Circuit (`tenant-beta`)**: Vivid Coral (`#FF6452`) & Sky Cyan (`#38BDF8`) with Deep Rust accents.

---

## ⚽ Data-Driven Sports (Zero Code Branching)

Every rule, button, period label, and score calculation is generated dynamically from the active sport configuration:
- **Football / Soccer**: Halves, Goals, Penalties, Yellow/Red Cards, Substitutions.
- **American Football**: Quarters, Touchdowns (6 pts), Field Goals (3 pts), 2-Point Conversions (2 pts), Safeties (2 pts).
- **Basketball**: Quarters, 3-Pointers, 2-Pointers, Free Throws, Personal Fouls.
- **Cricket**: Innings model with Runs, Boundaries, Sixes, Wickets.
- **Esports**: Map rounds, Kills, Squad Aces, Objectives.

---

## 🏟️ Three.js 3D Stadium & Tactic Arena

Built according to strict Three.js production directives:
- **Composite 3–12 Part Procedural Models**: Tiered grandstand structures, modern cantilever roof canopies, 4x composite floodlight towers with spotlights, and tactile player pucks with radial contact shadows.
- **Studio PBR Lighting & ACESFilmicToneMapping**: Procedural `RoomEnvironment` with `PMREMGenerator`, warm directional key light, and cool hemisphere fill.
- **Damped Camera & Lossless 60fps Loop**: Smooth exponential damping (`1 - Math.exp(-k * dt)`) across 4 camera view presets (Grandstand, Tactical Birds-Eye, Behind Goal, Field Cam) and interactive touch/mouse orbit.
- **Ergonomic Collapsible Bottom Dock**: <= 15% viewport footprint with solid dark surface (no backdrop-filter over WebGL) and a zen mode toggle.

---

## ✨ AI Media Lab (Gemini Nano Banana 2.1 & Veo)

- **Create Artwork**: Text prompt image synthesis with `gemini-nano-banana-2.1`.
- **Edit Photos**: Natural language image editing.
- **Animate to Video**: Photo-to-video motion synthesis powered by `veo-3.1-fast-generate-preview` in `16:9` (landscape) or `9:16` (portrait).

---

## 📴 Offline Resilience & Sync Queue

- Simulated Airplane Mode toggle in header.
- Persistent local storage buffer for scoring and roster actions made offline.
- Plain-language result descriptions and one-tap manual sync.

---

## 📱 Mobile & APK Build Command

To generate an Android APK for Expo / React Native:
```bash
npx eas-cli build --platform android --profile preview
```
Or to run locally on an Android device/emulator:
```bash
npx expo run:android
```
