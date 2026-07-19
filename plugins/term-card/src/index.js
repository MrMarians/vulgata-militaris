// Transformer for terminology-card pages (design handoff §3).
// Runs at order 65: after obsidian-flavored-markdown (30, wikilinks), gfm
// tables (40), table-of-contents (50) and crawl-links (60, data-slug), so the
// content hast has resolved links and the toc data can be pruned here.
//
// On pages with frontmatter `type: terminology-card` it:
//  1. replaces the leading content h1 with the mockup title row
//     (lemma + Hebrew form + transliteration) and a gloss line;
//  2. replaces the "## Textual tradition" heading + table with the
//     comparison-chain strip (TM → LXX → Hexaplaric → Vulgate) plus the
//     occurrences caption (and a TM-detail line when the table's TM cell
//     carries more than lemma — translit);
//  3. extracts the trailing "See also" links into file.data.termSeeAlso
//     (consumed by the term-info sidebar component) and removes the paragraph;
//  4. removes the "## Further reading" section (the dossier footnote moves to
//     the sidebar card) and prunes both sections from file.data.toc.
// All chain styling lives in quartz/styles/custom.scss (.term-chain etc.).

const el = (tagName, properties = {}, children = []) => ({
  type: "element",
  tagName,
  properties,
  children,
})
const text = (value) => ({ type: "text", value })

function textOf(node) {
  if (!node) return ""
  if (node.type === "text") return node.value
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (node.children) return node.children.map(textOf).join("")
  return ""
}

function isEl(node, tagName) {
  return node?.type === "element" && node.tagName === tagName
}

// First data row of the table -> array of td children arrays.
function extractRowCells(table) {
  const rows = []
  for (const section of table.children ?? []) {
    if (isEl(section, "tbody") || isEl(section, "thead")) {
      for (const tr of section.children ?? []) {
        if (isEl(tr, "tr")) rows.push(tr)
      }
    } else if (isEl(section, "tr")) {
      rows.push(section)
    }
  }
  const dataRow = rows.find((tr) => tr.children?.some((c) => isEl(c, "td")))
  if (!dataRow) return null
  return dataRow.children.filter((c) => isEl(c, "td")).map((td) => td.children ?? [])
}

function collectLinks(node, out = []) {
  if (isEl(node, "a")) {
    const slug = node.properties?.["data-slug"] ?? node.properties?.dataSlug
    if (slug) out.push({ slug: String(slug), text: textOf(node) })
  }
  for (const child of node.children ?? []) collectLinks(child, out)
  return out
}

const chainLabel = (label, extraClass) =>
  el("div", { className: ["chain-label", ...(extraClass ? [extraClass] : [])] }, [text(label)])

function buildChain(fm, lxxCell, hexCell, vulgCell) {
  const arrow = (accent) =>
    el(
      "div",
      { className: ["chain-arrow", ...(accent ? ["chain-arrow-accent"] : [])] },
      [text("→")],
    )
  const occurrences = fm.occurrences != null ? String(fm.occurrences) : null
  const hexText = textOf(hexCell).trim()

  return el("div", { className: ["term-chain"] }, [
    el("div", { className: ["chain-box", "chain-first"] }, [
      chainLabel("TM · Hebrew"),
      el("div", { className: ["chain-word"] }, [text(String(fm.lemma ?? "—"))]),
      el("div", { className: ["chain-translit"] }, [
        el("i", {}, [text(String(fm.translit ?? ""))]),
      ]),
    ]),
    arrow(false),
    el("div", { className: ["chain-box", "chain-mid"] }, [
      chainLabel("LXX · Greek"),
      el("div", { className: ["chain-word"] }, lxxCell),
    ]),
    arrow(false),
    el("div", { className: ["chain-box", "chain-mid", "chain-hex"] }, [
      chainLabel("Hexaplaric"),
      el(
        "div",
        { className: ["chain-word", "chain-word-hex"] },
        hexText === "" || hexText === "—" ? [text("—")] : hexCell,
      ),
    ]),
    arrow(true),
    el("div", { className: ["chain-box", "chain-vulgate"] }, [
      ...(occurrences ? [el("div", { className: ["chain-count"] }, [text(`${occurrences}×`)])] : []),
      chainLabel("Vulgate", "chain-label-vulgate"),
      el("div", { className: ["chain-word", "chain-word-vulgate"] }, vulgCell),
    ]),
  ])
}

const TermCardTransformer = () => {
  return {
    name: "TermCardTransformer",
    htmlPlugins() {
      return [
        () => (tree, file) => {
          const fm = file.data?.frontmatter
          if (!fm || fm.type !== "terminology-card") return
          const kids = tree.children
          if (!Array.isArray(kids)) return

          // 1. Title row
          const h1i = kids.findIndex((n) => isEl(n, "h1"))
          if (h1i >= 0) {
            const titleRow = el("div", { className: ["term-title-row"] }, [
              el("h1", { className: ["term-lemma"] }, [text(String(fm.title ?? ""))]),
              el("span", { className: ["term-hebrew"] }, [
                text(`${fm.lemma ?? ""} · `),
                el("i", {}, [text(String(fm.translit ?? ""))]),
              ]),
            ])
            const gloss = el("p", { className: ["term-gloss"] }, [text(String(fm.gloss ?? ""))])
            kids.splice(h1i, 1, titleRow, gloss)
          }

          // 2. Comparison chain
          const h2i = kids.findIndex(
            (n) => isEl(n, "h2") && textOf(n).trim().startsWith("Textual tradition"),
          )
          if (h2i >= 0) {
            const ti = kids.findIndex((n, i) => i > h2i && isEl(n, "table"))
            if (ti >= 0 && ti - h2i <= 2) {
              const cells = extractRowCells(kids[ti])
              if (cells && cells.length >= 5) {
                const [tmCell, lxxCell, hexCell, vulgCell, occCell] = cells
                const replacement = [
                  buildChain(fm, lxxCell, hexCell, vulgCell),
                  el("p", { className: ["term-chain-caption"] }, occCell),
                ]
                // Preserve TM detail the short chain box cannot show
                const tmText = textOf(tmCell).replace(/\s+/g, " ").trim()
                const shortForm = `${fm.lemma ?? ""} — ${fm.translit ?? ""}`
                  .replace(/\s+/g, " ")
                  .trim()
                if (tmText !== shortForm && tmText !== "") {
                  replacement.push(
                    el("p", { className: ["term-chain-caption", "term-chain-tm"] }, [
                      el("b", {}, [text("TM: ")]),
                      ...tmCell,
                    ]),
                  )
                }
                kids.splice(h2i, ti - h2i + 1, ...replacement)
              }
            }
          }

          // 3. See also -> sidebar data
          const si = kids.findIndex(
            (n) => isEl(n, "p") && textOf(n).trim().startsWith("See also"),
          )
          if (si >= 0) {
            file.data.termSeeAlso = collectLinks(kids[si])
            kids.splice(si, 1)
          }

          // 4. Drop "Further reading" section (dossier footnote lives in sidebar)
          const fi = kids.findIndex(
            (n) => isEl(n, "h2") && textOf(n).trim().startsWith("Further reading"),
          )
          if (fi >= 0) {
            let end = kids.findIndex(
              (n, i) => i > fi && (isEl(n, "h1") || isEl(n, "h2")),
            )
            if (end === -1) end = kids.length
            kids.splice(fi, end - fi)
          }

          // 5. Prune removed sections from the ToC data
          if (Array.isArray(file.data.toc)) {
            file.data.toc = file.data.toc.filter(
              (e) =>
                !["Textual tradition", "Further reading"].includes(
                  String(e?.text ?? "").trim(),
                ),
            )
          }
        },
      ]
    },
  }
}

export default TermCardTransformer
