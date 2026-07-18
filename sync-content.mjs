// sync-content.mjs
// Publish helper for the "vulgata-militaris" Quartz site.
//
// The published site is built by GitHub (Actions), which only ever sees the
// files committed to THIS repository. The Obsidian vault's wiki/ folder lives
// OUTSIDE this repo and is never uploaded to GitHub, so Quartz's content/ folder
// cannot be a symlink to it — a symlink would dangle on the build server and the
// site would come out empty. Instead we mirror the vault's wiki/ into content/
// as real files right before building or pushing. You still author only in the
// vault; this script does the copy, so nothing is duplicated by hand.
//
// Usage (from this folder):  node sync-content.mjs
// Then:                      npx quartz build --serve   (local preview)
//   or commit + push         (publish to GitHub Pages)

import { cpSync, rmSync, lstatSync, unlinkSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const here = dirname(fileURLToPath(import.meta.url))

// The research vault sits next to this repo on disk. If you rename or move the
// vault, update this one line.
const VAULT_WIKI = join(
  here,
  "..",
  "military models from the Hebrew Bible to the Hieronymian Vulgate",
  "wiki",
)
const CONTENT = join(here, "content")

// Remove whatever content/ currently is: a leftover symlink (unlink the LINK
// only — never follow it into the vault) or a previous real copy.
try {
  const st = lstatSync(CONTENT)
  if (st.isSymbolicLink()) unlinkSync(CONTENT)
  else rmSync(CONTENT, { recursive: true, force: true })
} catch (err) {
  if (err.code !== "ENOENT") throw err
}

// Mirror the vault's wiki/ into content/ as real files.
cpSync(VAULT_WIKI, CONTENT, { recursive: true })

console.log(`Synced content from:\n  ${VAULT_WIKI}\ninto:\n  ${CONTENT}`)
