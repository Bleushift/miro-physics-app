# Physics Pathway – Miro Plugin

LaTeX equation editor with editing, colour control, physics equation library,
and interactive embeds for GeoGebra, PhET, YouTube, and Isaac Physics.

---

## Features

- **LaTeX editor** — type any expression, live KaTeX preview
- **Equation colours** — 6 preset colours + custom picker per equation
- **Editable equations** — select a placed equation and reload it for editing; updating replaces in-place
- **Physics library** — ~40 one-click equations across Mechanics, Waves, Electricity, Fields, Thermal, Quantum
- **YouTube embed** — paste a URL, creates a live playable video on the board
- **GeoGebra embed** — paste a material ID or URL, places an interactive applet
- **PhET embed** — pick from 12 A-Level sims or type a slug, places a live simulation
- **Isaac Physics** — places a clickable card (Isaac blocks iframes — card opens Isaac in a new tab)

---

## Hosting (FREE — no Vercel needed)

This is a **pure static HTML app** with no server or build step. Deploy the `src/` folder.

### Option A: Cloudflare Pages (recommended)
1. Push this repo to GitHub
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
3. Connect your repo, set **Build output directory** to `src`
4. Leave build command empty
5. Deploy → you get a `https://yourapp.pages.dev` URL

### Option B: GitHub Pages
1. Push this repo to GitHub
2. Go to repo → Settings → Pages
3. Source: Deploy from branch `main`, folder `/src`
4. Your URL: `https://yourusername.github.io/miro-physics-app`

---

## Register as a Miro App

1. Go to [miro.com/app/settings/user-profile/apps](https://miro.com/app/settings/user-profile/apps)
2. Click **Create new app**
3. Name: "Physics Pathway Tools"
4. Under **App URL**, paste your Cloudflare/GitHub Pages URL
5. Under **Permissions**, enable:
   - `boards:read`
   - `boards:write`
6. Click **Save**
7. Copy your **Client ID** (you won't need a server — this is for future reference only)

---

## Install on a board

1. Open any Miro board
2. Click the **three dots (…)** in the left toolbar → **Apps** → **Physics Pathway Tools**
3. The panel opens on the right

---

## Using equation editing

1. Place an equation using the LaTeX tab
2. Click the equation on the board to select it
3. Come back to the plugin panel → click **"Load selected equation for editing"**
4. Modify the LaTeX or colour
5. Click **Update** — the equation is replaced in the same position

This works because the plugin stores the original LaTeX source invisibly inside each
image it creates (using Miro's item metadata API).

---

## GeoGebra applets

The preset applets in the plugin use example IDs. To add your own:
1. Find a GeoGebra applet you want (e.g. from geogebra.org/search/physics)
2. The URL will be like `geogebra.org/m/abcdef12` — copy the 8-character ID
3. Paste it into the "Or paste a GeoGebra URL / material ID" box in the Embeds tab
4. To add it to the preset list, open `src/index.html`, find `GEOGEBRA_APPLETS` and add an entry:
   ```js
   { name: 'Your applet name', id: 'abcdef12' },
   ```

---

## Local development

```bash
npm install
npm run dev
# Open http://localhost:3000
# In Miro developer settings, set App URL to http://localhost:3000
```

Note: KaTeX preview works locally; Miro SDK calls only work when loaded inside a real Miro board.
