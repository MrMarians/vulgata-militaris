import { h } from "preact"

// Sidebar info card for terminology-card pages (design handoff §3, mockup
// <aside>): category code, model badges, status, see-also links (extracted by
// the term-card transformer into fileData.termSeeAlso), dossier footnote.
// Model badge colors reuse the semantic category tokens from custom.scss;
// the two models absent from the mockup map to the closest category:
// juridical-diplomatic -> law, monarchic-professional -> command.

const MODEL_META = {
  "tribal-militia": { label: "Tribal militia", cls: "model-camp" },
  "holy-war": { label: "Holy war", cls: "model-holywar" },
  "juridical-diplomatic": { label: "Juridical-diplomatic", cls: "model-law" },
  "monarchic-professional": { label: "Monarchic-professional", cls: "model-command" },
}

const cardCss = `
.term-info {
  border: 1px solid var(--borderCol);
  border-radius: 12px;
  padding: 24px;
  background-color: var(--bgAlt);
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.term-info .term-info-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray);
  margin-bottom: 6px;
}
.term-info .term-info-category {
  font-size: 15px;
  font-weight: 600;
  color: var(--dark);
}
.term-info .term-info-models {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.term-info .term-info-pill {
  font-size: 12.5px;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: 999px;
  white-space: nowrap;
}
.term-info .term-info-pill.model-camp {
  background-color: var(--cat-camp-bg); color: var(--cat-camp-fg);
  border: 1px solid var(--cat-camp-border);
}
.term-info .term-info-pill.model-holywar {
  background-color: var(--model-holywar-bg); color: var(--model-holywar-fg);
  border: 1px solid var(--model-holywar-border);
}
.term-info .term-info-pill.model-law {
  background-color: var(--cat-law-bg); color: var(--cat-law-fg);
  border: 1px solid var(--cat-law-border);
}
.term-info .term-info-pill.model-command {
  background-color: var(--cat-command-bg); color: var(--cat-command-fg);
  border: 1px solid var(--cat-command-border);
}
.term-info .term-info-status {
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary);
}
.term-info .term-info-divider {
  height: 1px;
  background-color: var(--borderCol);
}
.term-info .term-info-seealso {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}
.term-info .term-info-seealso a {
  color: var(--secondary);
  background-color: transparent;
  padding: 0;
}
.term-info .term-info-footnote {
  font-size: 12.5px;
  color: var(--gray);
  line-height: 1.6;
}
`

const block = (label, children) =>
  h("div", {}, [h("div", { class: "term-info-label" }, label), ...children])
const divider = () => h("div", { class: "term-info-divider" })

const TermInfo = () => {
  const Component = (props) => {
    const fm = props.fileData?.frontmatter
    if (!fm || fm.type !== "terminology-card") return null

    const level = Array.isArray(fm.level) ? fm.level.join(" · ") : fm.level
    const categoryCode = [fm.category, level].filter(Boolean).join(" · ")
    const models = Array.isArray(fm.models) ? fm.models : []
    const seeAlso = Array.isArray(props.fileData?.termSeeAlso)
      ? props.fileData.termSeeAlso
      : []

    const sections = []
    if (categoryCode) {
      sections.push(block("Category", [h("div", { class: "term-info-category" }, categoryCode)]))
    }
    if (models.length > 0) {
      sections.push(
        block("Models", [
          h(
            "div",
            { class: "term-info-models" },
            models.map((m) => {
              const meta = MODEL_META[m] ?? { label: m, cls: "model-camp" }
              return h("span", { class: `term-info-pill ${meta.cls}`, key: m }, meta.label)
            }),
          ),
        ]),
      )
    }
    if (fm.status) {
      sections.push(block("Status", [h("div", { class: "term-info-status" }, String(fm.status))]))
    }
    if (seeAlso.length > 0) {
      sections.push(divider())
      sections.push(
        block("See also", [
          h(
            "div",
            { class: "term-info-seealso" },
            seeAlso.map((t) =>
              h(
                "a",
                {
                  key: t.slug,
                  href: t.slug.split("/").pop(),
                  class: "internal",
                  "data-slug": t.slug,
                },
                t.text,
              ),
            ),
          ),
        ]),
      )
    }
    if (fm.dossier) {
      sections.push(divider())
      sections.push(
        h("div", { class: "term-info-footnote" }, [
          "Full research dossier: ",
          h("i", {}, String(fm.dossier)),
          " (internal vault note, not published).",
        ]),
      )
    }

    return h("div", { class: "term-info" }, sections)
  }
  Component.css = cardCss
  return Component
}

export default TermInfo
