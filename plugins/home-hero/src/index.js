// Home page transformer (design handoff §2). On the index page only:
//  1. replaces the content h1 with the eyebrow label ("A digital garden —
//     Jerome's Vulgate", overridable via frontmatter `eyebrow`) + hero h1;
//  2. inserts the diamond-marked divider before the "Books" section;
//  3. turns the chapter-links paragraph after "Liber Numerorum" into the
//     numbered square grid (link text "Nm 12" -> "12", anchors preserved so
//     popovers/SPA keep working).
// Styling lives in quartz/styles/custom.scss (.home-*, .chapter-grid).

const el = (tagName, properties = {}, children = []) => ({
  type: "element",
  tagName,
  properties,
  children,
})
const text = (value) => ({ type: "text", value })

const isEl = (node, tagName) => node?.type === "element" && node.tagName === tagName

function textOf(node) {
  if (!node) return ""
  if (node.type === "text") return node.value
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (node.children) return node.children.map(textOf).join("")
  return ""
}

const DEFAULT_EYEBROW = "A digital garden — Jerome's Vulgate"

const HomeHero = () => {
  return {
    name: "HomeHero",
    htmlPlugins() {
      return [
        () => (tree, file) => {
          if (file.data?.slug !== "index") return
          const kids = tree.children
          if (!Array.isArray(kids)) return
          const fm = file.data?.frontmatter ?? {}

          // 1. Eyebrow + hero title in place of the content h1
          const h1i = kids.findIndex((n) => isEl(n, "h1"))
          if (h1i >= 0) {
            kids.splice(
              h1i,
              1,
              el("div", { className: ["home-eyebrow"] }, [
                text(String(fm.eyebrow ?? DEFAULT_EYEBROW)),
              ]),
              el("h1", { className: ["home-title"] }, [text(String(fm.title ?? ""))]),
            )
          }

          // 2. Diamond divider before the Books section
          const bi = kids.findIndex(
            (n) => isEl(n, "h2") && textOf(n).trim().startsWith("Books"),
          )
          if (bi >= 0) {
            kids.splice(bi, 0, el("div", { className: ["home-divider"] }))
          }

          // 3. Chapter grid: the paragraph following "Liber Numerorum"
          const li = kids.findIndex(
            (n) => isEl(n, "h3") && textOf(n).trim().startsWith("Liber Numerorum"),
          )
          if (li >= 0) {
            const pi = kids.findIndex((n, i) => i > li && isEl(n, "p"))
            if (pi >= 0 && pi - li <= 2) {
              const anchors = kids[pi].children.filter((n) => isEl(n, "a"))
              if (anchors.length > 0) {
                for (const a of anchors) {
                  const label = textOf(a).trim()
                  const num = label.replace(/^Nm\s+/i, "")
                  a.properties = a.properties ?? {}
                  const cls = a.properties.className
                  a.properties.className = [
                    ...(Array.isArray(cls) ? cls : cls ? [cls] : []),
                    "chapter-square",
                  ]
                  a.children = [text(num)]
                }
                kids.splice(pi, 1, el("div", { className: ["chapter-grid"] }, anchors))
              }
            }
          }
        },
      ]
    },
  }
}

export default HomeHero
