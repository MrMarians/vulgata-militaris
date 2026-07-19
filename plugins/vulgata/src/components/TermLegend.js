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
`

const TermLegend = () => {
  const Component = (props) => {
    const slug = props.fileData?.slug ?? ""
    if (!slug.startsWith("books/")) return null
    return h(
      "div",
      { class: "term-legend" },
      CATEGORIES.map(([id, label]) =>
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
