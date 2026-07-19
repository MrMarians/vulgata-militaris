import { h } from "preact"

// Fixed top navigation bar (design handoff §1): wordmark "MILITARIA IN
// VVLGATA", Home/Lexicon/Chapter pill links with server-rendered active
// state, and a theme-toggle pill. The toggle carries class "darkmode" so the
// stock darkmode plugin's inline script wires the click handler; its label
// (the mode you'd switch TO) is swapped purely in CSS via [saved-theme].

const LINKS = [
  { label: "Home", target: "", active: (slug) => slug === "index" },
  {
    label: "Lexicon",
    target: "military-lexicon/",
    active: (slug) => slug.startsWith("military-lexicon"),
  },
  {
    label: "Chapter",
    target: "books/Liber-Numerorum/01",
    active: (slug) => slug.startsWith("books/"),
  },
]

const navCss = `
body {
  padding-top: 72px;
}
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 48px;
  background-color: var(--bgAlt);
  border-bottom: 1px solid var(--borderCol);
  flex-wrap: wrap;
}
.top-nav .top-nav-left {
  display: flex;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
}
.top-nav a.top-nav-brand {
  font-family: "Source Serif 4", serif;
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.03em;
  white-space: nowrap;
  color: var(--dark);
  background-color: transparent;
  padding: 0;
}
.top-nav a.top-nav-brand span {
  color: var(--secondary);
}
.top-nav .top-nav-links {
  display: flex;
  gap: 6px;
}
.top-nav a.top-nav-link {
  font-size: 14px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 7px;
  border: 1px solid transparent;
  color: var(--darkgray);
  background-color: transparent;
}
.top-nav a.top-nav-link.active {
  background-color: var(--highlight);
  border-color: var(--secondary);
  color: var(--secondary);
}
/* .darkmode.top-nav-toggle: extra specificity to undo the stock darkmode
   plugin's 20px icon-button sizing on this text pill */
.top-nav button.darkmode.top-nav-toggle {
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  width: auto;
  height: auto;
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid var(--gray);
  background-color: transparent;
  color: var(--gray);
  letter-spacing: 0.02em;
  white-space: nowrap;
  flex-shrink: 0;
}
.top-nav .toggle-to-light {
  display: none;
}
:root[saved-theme="dark"] .top-nav .toggle-to-light {
  display: inline;
}
:root[saved-theme="dark"] .top-nav .toggle-to-dark {
  display: none;
}
/* The wordmark replaces the sidebar page title */
.left.sidebar h2.page-title {
  display: none;
}
@media (max-width: 800px) {
  body {
    padding-top: 0;
  }
  .top-nav {
    position: static;
    padding: 14px 20px;
    gap: 12px;
  }
  .top-nav .top-nav-left {
    gap: 16px;
  }
}
`

// Same logic as the core's pathToRoot(slug): "" -> ".", one ".." per parent dir
const pathToRoot = (slug) => {
  const root = slug
    .split("/")
    .filter((x) => x !== "")
    .slice(0, -1)
    .map(() => "..")
    .join("/")
  return root.length === 0 ? "." : root
}

const TopNav = () => {
  const Component = (props) => {
    const slug = props.fileData?.slug ?? ""
    const root = pathToRoot(slug)

    return h("nav", { class: "top-nav" }, [
      h("div", { class: "top-nav-left" }, [
        h("a", { class: "top-nav-brand", href: `${root}/` }, [
          "MILITARIA ",
          h("span", {}, "IN VVLGATA"),
        ]),
        h(
          "div",
          { class: "top-nav-links" },
          LINKS.map((l) =>
            h(
              "a",
              {
                key: l.label,
                href: `${root}/${l.target}`,
                class: `top-nav-link${l.active(slug) ? " active" : ""}`,
              },
              l.label,
            ),
          ),
        ),
      ]),
      h("button", { class: "darkmode top-nav-toggle", type: "button" }, [
        h("span", { class: "toggle-to-dark" }, "Dark mode"),
        h("span", { class: "toggle-to-light" }, "Light mode"),
      ]),
    ])
  }
  Component.css = navCss
  return Component
}

export default TopNav
