import { h } from "preact"

// Legend bar for chapter reading pages (design handoff §5): bordered/rounded
// bgAlt strip, one swatch+label entry per semantic term category. Swatch fill
// uses the --cat-*-border tokens defined in quartz/styles/custom.scss.
// Renders only on chapter pages (slug under books/).

const CATEGORIES = [
  ["camp", "Camp"],
  ["command", "Command & levy"],
  ["battle", "Battle"],
  ["law", "Law & covenant"],
]

const legendCss = `
.term-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: center;
  padding: 16px 20px;
  margin: 0 0 12px 0;
  background-color: var(--bgAlt);
  border: 1px solid var(--borderCol);
  border-radius: 10px;
  font-size: 13px;
  color: var(--darkgray);
}
.term-legend .term-legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
}
.term-legend .term-legend-swatch {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}
.term-legend .term-legend-swatch.swatch-camp { background-color: var(--cat-camp-border); }
.term-legend .term-legend-swatch.swatch-command { background-color: var(--cat-command-border); }
.term-legend .term-legend-swatch.swatch-battle { background-color: var(--cat-battle-border); }
.term-legend .term-legend-swatch.swatch-law { background-color: var(--cat-law-border); }
.term-legend { flex-wrap: wrap; }
.term-legend .term-legend-swatch.swatch-dom1 { background-color: var(--dom-1-border); }
.term-legend .term-legend-swatch.swatch-dom2 { background-color: var(--dom-2-border); }
.term-legend .term-legend-swatch.swatch-dom3 { background-color: var(--dom-3-border); }
.term-legend .term-legend-swatch.swatch-dom4 { background-color: var(--dom-4-border); }
.term-legend .term-legend-swatch.swatch-dom5 { background-color: var(--dom-5-border); }
.term-legend .term-legend-swatch.swatch-dom6 { background-color: var(--dom-6-border); }
.term-legend .term-legend-swatch.swatch-dom7 { background-color: var(--dom-7-border); }
.term-legend .term-legend-swatch.swatch-dom8 { background-color: var(--dom-8-border); }
.term-legend .term-legend-swatch.swatch-dom9 { background-color: var(--dom-9-border); }
`

// Italian pages (frontmatter lang: it): the nine MIL domains of the Latin lexicon
const DOMINI = [
  ["dom1", "Organizzazione, gradi"],
  ["dom2", "Accampamento, fortificazione"],
  ["dom3", "Marcia"],
  ["dom4", "Armi"],
  ["dom5", "Battaglia"],
  ["dom6", "Nemico, alleato"],
  ["dom7", "Segnali, comando"],
  ["dom8", "Procedura giuridica e rituale"],
  ["dom9", "Sterminio, bottino, prigionia"],
]

const TermLegend = () => {
  const Component = (props) => {
    const slug = props.fileData?.slug ?? ""
    if (!slug.startsWith("books/")) return null
    return h(
      "div",
      { class: "term-legend" },
      (props.fileData?.frontmatter?.lang === "it" ? DOMINI : CATEGORIES).map(([id, label]) =>
        h(
          "div",
          { class: "term-legend-item", key: id },
          h("span", { class: `term-legend-swatch swatch-${id}` }),
          label,
        ),
      ),
    )
  }
  Component.css = legendCss
  return Component
}

export default TermLegend
