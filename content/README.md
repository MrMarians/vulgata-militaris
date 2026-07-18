# wiki/

Source content for the Quartz-published site. The site itself is built by the sibling
`quartz/` project (see `../../quartz/`); this folder holds the Markdown content Quartz will
publish. It is generated/maintained content, distinct from the read-only research data in
`../data/`, `../lexicon/`, `../notes/`, `../report/` — those are inputs, never edited here.

## Structure

- `books/<NN_BookName>/<chapter>.md` — one page per Vulgate chapter: cleaned Latin text
  with Quartz-compatible front matter. Piloting with `books/Liber Numerorum/`, sourced from
  `../data/vulgata_catholic/04_Numeri/`.
- `military lexicon/<latin-term>.md` — one terminology card per military-lexicon lemma (TM/Hebrew, LXX,
  hexaplaric tradition, Vulgate renderings, occurrences, loci), linked from chapter pages.
  Sourced from `../lexicon/hebrew_military_lexicon.tsv`, `../lexicon/latin_renderings.tsv`,
  and `../notes/term-dossiers/`.
- `index.md` — site home page; will list the available books/chapters.

## Status

Skeleton only, created 2026-07-18. No chapter or card content yet.
