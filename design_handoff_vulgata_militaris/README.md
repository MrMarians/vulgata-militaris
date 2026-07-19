# Handoff: Vulgata Militaris — Parchment/Brass Theme + Custom Components

## Overview
Restyle the Quartz-based site at mrmarians.github.io/vulgata-militaris from Quartz's stock look to a dark-parchment, brass-accented academic aesthetic, and add three bespoke pieces the stock Quartz theme system doesn't provide: category-colored term highlighting on chapter pages, a lexical comparison chain (TM → LXX → Hexaplaric → Vulgate) on term cards, and an animated, draggable local graph with persistent node labels.

## About the design files
`Militaria in Vulgata Redesign.dc.html` in this folder is a **design reference**, not code to paste in. It's a single-file HTML/React mockup built to previsualize the look and interactions. The real site is a **Quartz 4 static-site generator** project (content in Markdown, styling in SCSS, layout in Preact components under `quartz/quartz/components`, theme config in `quartz.config.yaml`). Your job is to recreate the mockup's design **inside Quartz's existing systems** — its config-driven theme, its SCSS files, and (for the graph) its plugin/component architecture — not to ship any of this HTML directly.

## Fidelity
**High-fidelity.** Colors, type, spacing, and the three custom components below should match the mockup precisely. Use the mockup as the literal source of truth for hex/oklch values, font sizes, radii, and copy tone.

## ⚠ Root cause of "nothing changed" after editing quartz.config.yaml
The theme block in `quartz.config.yaml` is already correct and syntactically fine — **do not touch `quartz.config.default.yaml`, it's never read by the build, it's just the framework's pristine reference copy.**

The real blocker: this site has the third-party **`quartz-themes`** plugin enabled (`github:saberzero1/quartz-themes`, `theme: default`). That plugin injects a full parallel "Obsidian-style" CSS variable system (`--background-primary`, `--text-normal`, `--color-base-00`, etc., hardcoded per its `default.json` theme file) and then **remaps Quartz's native tokens onto it** — e.g. `--light: var(--background-primary, var(--color-base-00))` where `--color-base-00` is a hardcoded `#1C1C1C`. It loads in its own CSS `@layer` stacked so it wins over the config-driven `theme.colors` block. That's why editing `quartz.config.yaml` colors visibly does nothing.

**Fix — pick one:**
1. **Recommended:** disable the plugin in `quartz.config.yaml`:
   ```yaml
   - source:
       name: quartz-themes
       repo: github:saberzero1/quartz-themes
       subdir: plugin
     enabled: false   # was: true
   ```
   This lets Quartz's native theme system (which the `theme.colors` block already targets correctly) take over again. This is the path the parchment/brass palette below assumes.
2. Alternative (more work, not recommended): keep the plugin enabled but author a custom theme JSON for it matching the palette below and set `theme: <your-theme-id>`. Only do this if the site depends on other things this plugin provides (check `extras/*.css` and `TEMPLATE_CSS`/`TEMPLATE_OVERRIDE_CSS` in `.quartz/plugins/quartz-themes/src/templateCSS.ts` before assuming so).

After disabling the plugin, rebuild (`npx quartz build` / restart `npx quartz build --serve`) — config changes and plugin toggles require a rebuild, they don't hot-reload from a stale `public/` output.

## Design tokens

### Typography
- Headers/serif: **Source Serif 4** (weights 400–700, italic available)
- Body/UI: **Public Sans** (weights 400–700)
- Code: IBM Plex Mono (unchanged)
- Already correctly set in `quartz.config.yaml` → `theme.typography`.

### Core palette (already in quartz.config.yaml — confirm these survive after disabling quartz-themes)
| Token | Light | Dark |
|---|---|---|
| light (bg) | #f6f2ea | #1c1712 |
| lightgray | #e3dccb | #332c22 |
| gray | #b0a58c | #5c5344 |
| darkgray (body text) | #3d3527 | #d8cfbd |
| dark (headings) | #241f16 | #f0e9dc |
| secondary/tertiary (accent) | #8a5a1f | #d1a44e |
| highlight | rgba(138,90,31,0.1) | rgba(209,164,78,0.12) |
| textHighlight | #f0d99a88 | #d1a44e55 |

### Extended tokens (NOT in Quartz's native 9-slot theme — add as custom CSS variables in `variables.scss` or `custom.scss`)
These power the four semantic term categories (chapter highlighting + legend) and the two "model" badges (lexicon card sidebar). Source: mockup's `computeTheme()` function. Values are OKLCH — modern-CSS native, paste verbatim:

```scss
// add to quartz/quartz/styles/variables.scss (or top of custom.scss)
:root[saved-theme="light"] {
  --cat-camp-bg: oklch(0.92 0.045 55);     --cat-camp-fg: oklch(0.36 0.09 55);     --cat-camp-border: oklch(0.68 0.09 55);
  --cat-command-bg: oklch(0.92 0.035 240); --cat-command-fg: oklch(0.38 0.08 240); --cat-command-border: oklch(0.68 0.08 240);
  --cat-battle-bg: oklch(0.92 0.05 25);    --cat-battle-fg: oklch(0.4 0.1 25);     --cat-battle-border: oklch(0.68 0.09 25);
  --cat-law-bg: oklch(0.9 0.04 150);       --cat-law-fg: oklch(0.36 0.08 150);     --cat-law-border: oklch(0.66 0.08 150);
  --model-holywar-bg: oklch(0.91 0.04 285); --model-holywar-fg: oklch(0.4 0.09 285); --model-holywar-border: oklch(0.68 0.08 285);
}
:root[saved-theme="dark"] {
  --cat-camp-bg: oklch(0.30 0.055 55);     --cat-camp-fg: oklch(0.88 0.06 55);     --cat-camp-border: oklch(0.5 0.09 55);
  --cat-command-bg: oklch(0.28 0.045 240); --cat-command-fg: oklch(0.85 0.055 240); --cat-command-border: oklch(0.48 0.08 240);
  --cat-battle-bg: oklch(0.28 0.06 25);    --cat-battle-fg: oklch(0.85 0.07 25);   --cat-battle-border: oklch(0.5 0.1 25);
  --cat-law-bg: oklch(0.28 0.05 150);      --cat-law-fg: oklch(0.83 0.06 150);     --cat-law-border: oklch(0.48 0.08 150);
  --model-holywar-bg: oklch(0.28 0.05 285); --model-holywar-fg: oklch(0.85 0.06 285); --model-holywar-border: oklch(0.5 0.08 285);
}
```
"Tribal militia" model badge reuses `--cat-camp-*` (see mockup: `tribalMilitia: cat.camp`).

The background radial-gradient "grain" wash on the page body (`grainA`/`grainB` in the mockup) is optional polish — a very subtle radial highlight top-left / shadow bottom-right over the flat `--light` background. Skip if it complicates the base layout; not load-bearing for the aesthetic.

## Screens / components

### 1. Header / nav (all pages)
- Sticky top, `z-index:20`, flex row, space-between, 18px/48px padding, background `--lightgray` (bgAlt), 1px bottom border `--border`.
- Wordmark: "MILITARIA" in `--dark` + "IN VVLGATA" in accent, Source Serif 4, 600, 18px, letter-spacing 0.03em.
- Nav buttons (Home/Lexicon/Chapter): Public Sans 600 14px, 7px/14px padding, 7px radius, pill-style active state = accent-tinted background + accent border + accent text; inactive = transparent bg, transparent border, muted text.
- Theme toggle button: pill (999px radius), 8px/16px padding, 13px 600, transparent bg, border in a slightly stronger border tone, muted text, label reads "Light mode" / "Dark mode" (i.e., shows the mode you'd switch **to**).
- Standard Quartz `darkmode` component already does the light/dark switching mechanically — only needs mapping to this visual style (this is mostly what `quartz-themes`' `button.darkmode` CSS currently overrides, see root-cause section).

### 2. Home page
- Max-width 1120px centered, 88px/48px/64px padding.
- Eyebrow label (12px, 700, letter-spacing 0.16em, uppercase, accent color) → H1 "Militaria in Vulgata" (Source Serif 4, 600, 64px, line-height 1.05) → lede paragraph (Source Serif 4, 21px, 1.6 line-height, muted) → intro paragraph (15px, muted, with an accent inline link to "Introduction").
- Diamond-marked divider: 1px line in `--border`, with a small 8×8px accent square rotated 45° sitting on the left end.
- "Books" section: 12px uppercase eyebrow, H2 28px "Liber Numerorum", then a chapter grid: `grid-template-columns: repeat(auto-fill, minmax(52px,1fr))`, gap 9px, 36 numbered buttons (Source Serif 4, 16px/500, 11px vertical padding, 6px radius, 1px border, bgAlt background).
- "Military lexicon" section: eyebrow label, then a stack (16px gap) of category rows, each: bold category name + em dash + middle-dot-separated term list (15.5px, line-height 2.1); the first term per row is an accent-colored clickable link to its lexicon card, the rest are plain text (this mirrors the mockup exactly — don't linkify all terms, only the lead one, unless you're building real per-term pages for all of them).
- Footer note: 13px muted text citing source editions, 24px top padding, top border.

### 3. Lexicon card (term detail page)
- Two-column layout: content column (1fr) + sticky 300px right sidebar, 56px gap, max-width 1120px.
- **Title row**: H1 lemma (Source Serif 4, 600, 52px) + Hebrew form/transliteration in muted Source Serif 4 22px, baseline-aligned, 18px gap.
- Italic gloss line below (Source Serif 4 italic 17px, muted).
- **Comparison chain** (the key custom component — does not exist in stock Quartz, build as a reusable partial/shortcode/template): a horizontal strip of 4 boxes joined by arrow connectors, representing TM (Hebrew) → LXX (Greek) → Hexaplaric → Vulgate:
  - Each box: 10.5px uppercase label (bold, letter-spacing 0.08em, muted) + the word in Source Serif 4 (20px normal boxes, 16px for empty "—" Hexaplaric slot).
  - Flex-basis ratios: TM 1.3, arrow 0 0 30px, LXX 1.3, arrow 0 0 30px, Hexaplaric 0.9, arrow 0 0 30px, Vulgate 1.3.
  - First 3 boxes + first 2 arrows: neutral bg/border (bgAlt/border). Boxes touch (no gap) — first box gets left corners rounded 10px, last box right corners rounded 10px, middles square.
  - **Vulgate box is the hero**: accent-colored border + background (accentBg), accent-strong text, bold 21px word, plus a small pill badge floating at top-right showing the occurrence count (e.g. "193×") — accent-filled pill, background color, 10.5px bold text, absolute-positioned -11px above the box.
  - The connector arrow immediately before the Vulgate box is drawn in accent color (border + bg) instead of neutral, visually "leading into" the result.
  - Below the chain: small muted caption line with scope/verification counts.
- **Definition block**: Source Serif 4, 17px, 1.8 line-height, max-width 640px, 2 short paragraphs; inline accent-colored bold links to related terms (e.g. the sibling verb card).
- **"Loci" list** (H3, 19px/600): flex column, 10px gap, 14.5px rows, each: bold accent chapter reference (clickable) + verse numbers + optional italic muted annotation.
- **Sidebar** (sticky, 96px from top, bordered card, 12px radius, 24px padding, 18px gap between blocks, bgAlt background):
  - Category code (e.g. "B · L1"), 11px uppercase label + 15px/600 value.
  - "Models" pill row: rounded-full (999px) badges per model, 12.5px/600, colored per category token above (tribal militia = camp colors, holy war = its own purple-ish token).
  - Status label (13px/600, accent color, e.g. "draft").
  - Divider (1px border line) between each block.
  - "See also" — column of accent-colored term links.
  - **Graph mini-panel** — see section 4.
  - Footnote about the internal research dossier (12.5px muted).

### 4. Local graph (sidebar, term pages) — animated + draggable
This is the piece that needs real engineering, not just CSS. Stock Quartz ships a canvas-rendered force-directed graph (see `quartz/.quartz/plugins/graph/src/components` in the codebase — that's the installed plugin source, safe to fork/patch) that already supports drag-to-reposition and zoom, but: (a) it's `<canvas>`-based so node labels are NOT persistent DOM text — they only render on hover/focus, and (b) nodes are static, no idle animation. The mockup instead wants:
- A small (not full-page) inline panel, viewBox `0 0 260 190`, one **center node** (the current term, accent-colored, r=8) with several **satellite nodes** (r=4–5, colored by category) connected by straight lines.
- Labels are **always-visible DOM text** positioned absolutely over the SVG by percentage (`left: (x/260)*100%`, `top: ((y+labelDy)/190)*100%`), not baked into the SVG/canvas — this is what makes them crisp and hoverable like Obsidian's graph.
- Idle animation: each satellite node pulses via CSS `transform: scale()` keyframes (two alternating variants so nodes don't pulse in unison — `nodePulseA` 2.6s scale 1↔1.2, `nodePulseB` 3.1s scale 1↔1.15, staggered by `i * 0.18s` delay), center node pulses slower/subtler (`centerPulse` 2.4s, scale 1↔1.08). Connector lines have a marching-ants flow: `stroke-dasharray: 4 4`, animated `stroke-dashoffset` via `@keyframes lineFlow` 1s linear infinite. Exact keyframes are in the mockup's `<helmet><style>` block — copy verbatim.
- Drag: pointerdown on a node starts a drag session (store dragged node id in state), pointermove (listened on the SVG root, clamped to the viewBox bounds) updates that node's x/y, pointerup/pointerleave ends it. This logic is plain vanilla JS/React state in the mockup (see `onSvgPointerMove`/`onSvgPointerUp`/node `onDown` handlers) — directly portable to Preact, which is what Quartz's own components use.
- **Recommended implementation path**: don't try to retrofit the canvas force-graph. Build a small standalone Preact component (new Quartz "emitter"/component, modeled on the existing `graph` plugin's structure and registered the same way in `quartz.config.yaml`) that renders exactly this SVG+DOM-label micro-graph, fed by each term's `seeAlso`/related-terms frontmatter (or by real backlink data pulled the same way the stock graph plugin sources its links, if you want it auto-populated rather than hand-authored per term).
- Node/edge colors: satellite fill = category border-token (e.g. `--cat-camp-border`) or muted gray for non-term nodes (chapter refs like "Nm 10"); center = accent.

### 5. Chapter reading page
- Max-width 760px (narrower than other pages — reading-optimized), 64px/48px/96px padding.
- Breadcrumb "Liber Numerorum" (13px muted) → H1 chapter ref (Source Serif 4 600 46px).
- **Legend bar**: bordered/rounded (10px) bgAlt strip, flex row, 18px gap, 16px/20px padding, one entry per category: 10×10px rounded-3px color swatch (using `--cat-*-border` as the swatch fill) + label, 13px text.
- **Verse text**: Source Serif 4, 18.5px, line-height 1.85. Each verse: superscript accent-colored bold verse number (12px), then inline segments — plain text runs plus **highlighted term spans**: `background: var(--cat-{category}-bg); color: var(--cat-{category}-fg); border-bottom: 1.5px solid var(--cat-{category}-border); border-radius: 3px; padding: 1px 3px;`. This is a straightforward CSS class (`.term-tag.term-camp`, `.term-tag.term-command`, etc.) — the harder part is **marking which words are which term** in the source Markdown. The mockup uses a lightweight `[[term|display]]` wikilink-like syntax parsed at render time (see `parseSegments()`/`RAW_VERSES` in the mockup file) — replicate that convention in the Markdown content (Quartz's `obsidian-flavored-markdown` transformer already parses `[[wikilinks]]`; you likely want a custom remark/rehype step that also tags matched terms with their category class, using the same category lookup table as the lexicon).
- Chapter nav footer: prev/next row, 14px, disabled state at 0.4 opacity, active accent-colored 600-weight.

## Design tokens summary
- Radii: 6–7px (buttons/small cards), 10px (chain boxes, legend bar), 12px (sidebar card), 999px (pills/toggle).
- Borders: 1px solid `--border` everywhere neutral; 1px/1.5px solid accent where highlighting "the answer" (Vulgate box, term highlight underline).
- Spacing scale in use: 6, 8, 9, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 88, 96px.
- Type scale: 10.5, 11, 12, 12.5, 13, 14, 14.5, 15, 15.5, 16, 17, 18.5, 19, 21, 22, 28, 46, 52, 64px.

## Verification screenshots
\`screenshots/\` in this bundle contains reference captures from the live mockup — use these to visually check the rebuilt Quartz pages against, state by state:
- \`01-home-dark.png\` / \`02-home-light.png\` — home page, both themes.
- \`03-lexicon-light.png\` / \`04-lexicon-dark.png\` — lexicon/term card (top half: title, comparison chain, sidebar).
- \`05-chapter-dark.png\` / \`06-chapter-light.png\` — chapter reading page (top: legend + opening verses).
- \`07-chapter-light-scrolled.png\` — chapter page scrolled further down, showing more term-highlight variety (command/battle categories) mid-paragraph.
- \`08-graph-sidebar-closeup.png\` — the local graph panel at a scroll position that shows the full node layout, labels, and connector lines clearly (static capture — animation/drag obviously won't show in a screenshot, verify those live).

When you (Claude Code) finish an implementation pass, take matching screenshots of the real site at the same routes/theme states and diff them against these by eye against the component specs above — colors, type sizes, spacing, and the comparison-chain/graph layouts should match closely. Pixel-perfect is not required, but the visual rhythm (density, radii, palette, hierarchy) should read as the same design.

## Assets
No image assets — purely typographic + CSS (radial-gradient wash, oklch flat colors). Fonts loaded via Google Fonts (Source Serif 4, Public Sans) — already declared correctly in `quartz.config.yaml`.

## Files in this bundle
- `Militaria in Vulgata Redesign.dc.html` — the full interactive mockup (home / lexicon card / chapter reading, both themes, working graph drag+animation). Open directly in a browser to reference exact behavior; view source for the literal token values and interaction logic referenced throughout this README.
- Relevant existing repo files to edit (not included here, already in the target repo): `quartz.config.yaml` (theme block — mostly done, just fix the plugin conflict above), `quartz/quartz/styles/variables.scss`, `quartz/quartz/styles/custom.scss`, and a new custom graph component alongside `quartz/.quartz/plugins/graph/src/components`.
