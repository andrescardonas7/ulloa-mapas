---
name: css-protips
description: >-
  Practical, battle-tested CSS protips (sourced from AllThingsSmitty/css-protips, CC0).
  Load when writing or reviewing raw CSS, Tailwind utilities, layout fixes, responsive
  design, focus states, typography scaling, image handling, or any micro-CSS decision.
  Complements ui-skills, design-taste-frontend, fixing-accessibility, and the
  02-front-end/ rules. Never load for pure architecture or non-CSS tasks.
license: CC0-1.0 (original tips); MIT (this adaptation)
metadata:
  source: https://github.com/AllThingsSmitty/css-protips
  original-author: AllThingsSmitty
  hub-adaptation: true
  skill-author: local-hub
---

# CSS Protips (Practical Excellence)

**Source**: Curated and adapted from the excellent [AllThingsSmitty/css-protips](https://github.com/AllThingsSmitty/css-protips) collection (CC0-1.0).
**Purpose in this hub**: Provide tactical, low-level CSS knowledge that agents can apply surgically when the work is in stylesheets, Tailwind classes, or component styling. These are not high-level architecture rules — they are proven micro-patterns that prevent common pain.

## When to Load This Skill

- Editing any `.css`, `.scss`, `*.module.css`, or Tailwind class strings in TSX/JSX.
- Debugging layout shifts, spacing issues, alignment, responsive behavior, or focus states.
- Reviewing UI components for CSS quality (especially before `/code-review` or design-taste work).
- User explicitly asks for "CSS tips", "pro tips", "mejores prácticas CSS", "how to do X in CSS without hacks".
- Fixing broken images, custom list styling, fluid typography, or form zoom issues on mobile.
- The task involves raw CSS that `ui-skills` or design systems do not yet cover.

**Do NOT load** for pure React architecture, API design, or when the problem is already solved by Tailwind defaults + shadcn/ui primitives.

**Invocation**:
- In chat: "Apply css-protips to this component" or "Review the CSS here against css-protips".
- As a sub-skill inside a larger review (e.g., with `code-review-and-quality` or `frontend-ui-engineering`).

## Relationship to Other Hub Resources

- **ui-skills**: Higher-level constraints (Tailwind discipline, animation rules, z-index scale, etc.). This skill provides the *why* and the micro-patterns behind many of those constraints.
- **design-taste-frontend / gpt-taste / image-taste-frontend**: Visual and experiential quality. css-protips supplies the technical substrate.
- **fixing-accessibility**: Overlaps on focus styles and semantic behavior; defer to accessibility rules when conflict.
- **02-front-end/web-development.mdc** and **accessibility.mdc**: Reference these for the "big picture"; load this skill for the tactical details.
- **baseline-ui** (if present in your environment): Shares philosophy of preventing layout anti-patterns.

## Foundations

### 1. Use a CSS Reset (Simplified)

A minimal reset gives every element a clean, consistent starting point.

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

**Hub note**: In Tailwind projects, the reset is largely handled by `@tailwind base`. Only add this when you need to override or work outside Tailwind. If you follow tip #2 (inherit box-sizing), you can often omit the `box-sizing` line here.

**When to apply**: New project root styles or when fighting mysterious margin/padding inheritance.

### 2. Inherit `box-sizing`

Let `box-sizing` cascade from `html` so plugins and components inherit the right model.

```css
html {
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}
```

**Tailwind equivalent**: Usually unnecessary (Tailwind sets it globally), but valuable when embedding third-party widgets or using Shadow DOM.

### 3. Use `all: unset` Instead of Resetting Properties One by One

```css
button {
  all: unset;
}
```

Replaces the long list of `background: none; border: none; ...`.

**Caveat**: `all: unset` also unsets inherited properties. Test thoroughly on complex components.

### 4. Use `:empty` to Hide Empty Elements

```css
:empty {
  display: none;
}
```

**Important**: Elements with only whitespace (`<p> </p>`) are **not** considered empty. CMS-injected empty tags are the classic use case.

### 5. Hide Consecutive `<br>` Used as Spacing

```css
br + br {
  display: none;
}
```

Prevents CMS users (and some markdown converters) from abusing `<br>` for visual space.

## Selectors & Specificity

### 6. Use `:not()` for Cleaner "Except the Last" Patterns

Instead of adding then removing borders:

```css
/* Good */
.nav li:not(:last-child) {
  border-right: 1px solid #666;
}
```

**Tailwind**: `border-r` on all but last via `&:not(:last-child)` in arbitrary variants or a small utility.

### 7. Negative `nth-child` for "First N Items"

```css
li:nth-child(-n + 3) { display: block; }   /* 1, 2, 3 */
li:not(:nth-child(-n + 3)) { display: block; } /* everything except first 3 */
```

Excellent for progressive disclosure or "show first N, collapse rest".

### 8. The "Lobotomized Owl" Selector (`* + *`)

```css
* + * {
  margin-top: 1.5em;
}
```

Applies consistent vertical rhythm to *flow* content without targeting specific tags.

**When to reach for it**: Article bodies, comment threads, stacked card lists where you want uniform gaps between any two siblings.

**Modern note**: In Tailwind, `space-y-*` on a parent is often cleaner and more explicit. Use the owl when you cannot or should not add a wrapper.

### 9. Control Specificity with `:is()`

```css
:is(section, article, aside, nav) :is(h1, h2, h3) {
  color: var(--color-prose-heading);
}
```

Replaces an explosion of selector combinations. `:is()` has zero specificity contribution from the list itself.

### 10. Style "Default" Links (CMS-Inserted)

```css
a[href]:not([class]) {
  color: #0066cc;
  text-decoration: underline;
}
```

Links injected by a CMS that have no class get a safe, distinct treatment without polluting the cascade for styled links.

**a11y note**: Ensure the color still meets contrast.

## Typography & Sizing

### 11. Add `line-height` to `body`

```css
body {
  line-height: 1.6;
}
```

Text elements inherit it. No need to repeat on every `p`, `li`, `h*`.

### 12. `rem` for Global/Modular Sizing, `em` for Local

```css
html { font-size: 100%; } /* 16px base */

h2 { font-size: 2em; }           /* local to context */
p  { font-size: 1em; }

article { font-size: 1.125rem; } /* 18px, independent of parent */
aside .note { font-size: 0.875rem; }
```

Modules become self-contained and predictable.

### 13. Fluid Typography with `:root` + `calc()`

```css
:root {
  font-size: calc(1vw + 1vh + 0.5vmin);
}

body {
  font: 1rem/1.6 sans-serif;
}
```

Gives pleasant scaling across viewport sizes. Combine with `clamp()` for production.

### 14. Prevent Mobile Form Zoom

```css
input[type="text"],
input[type="number"],
select,
textarea {
  font-size: 16px; /* >= 16px stops iOS Safari zoom on focus */
}
```

Critical for any form-heavy interface on iOS.

### 15. Check for Local Fonts Before Downloading

```css
@font-face {
  font-family: "Dank Mono";
  src: local("Dank Mono"), local("Dank Mono"),
       url(".../DankMono.woff2");
}
```

**Performance win**: skips network request when the font is already installed.

## Layout & Alignment

### 16. Vertical Centering (Flexbox or Grid)

Flexbox:

```css
body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

Grid (often cleaner):

```css
body {
  min-height: 100vh;
  display: grid;
  place-items: center;
}
```

### 17. `aspect-ratio` Instead of Padding Hacks

```css
img,
.video-container {
  aspect-ratio: 16 / 9;
  object-fit: cover; /* or contain */
}
```

Prevents layout shift and replaces the old `padding-bottom: 56.25%` trick.

### 18. Intrinsic Ratio Boxes (the classic padding technique)

```css
.container {
  position: relative;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 */
}

.container > * {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
```

Still useful when `aspect-ratio` support is a concern or for complex nested cases.

### 19. Kill Margin Hacks with Flexbox `space-between`

```css
.list {
  display: flex;
  justify-content: space-between;
}

.list .item {
  flex-basis: 23%; /* or use gap + flex */
}
```

**Modern Tailwind**: `flex justify-between gap-4` (or `gap-x-*`) is preferred. The old nth-child/first-child hacks are almost never needed.

### 20. Logical Properties: `margin-inline` / `margin-block`

```css
.card {
  margin-inline: auto;   /* replaces margin-left + margin-right */
  margin-block: 2rem;    /* replaces margin-top + margin-bottom */
}
```

Better for RTL support and future-proofing.

## Images, Media & Icons

### 21. Prefer SVG for Icons

```css
.logo {
  background-image: url("/icons/logo.svg");
  background-size: contain;
}
```

Scales perfectly. Add a fallback for `.no-svg` environments if you support very old browsers:

```css
.no-svg .icon-only::after {
  content: attr(aria-label);
}
```

### 22. Style Broken Images Gracefully

```css
img {
  display: block;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 2;
  text-align: center;
  position: relative;
}

img::before {
  content: "Image failed to load";
  display: block;
  margin-bottom: 0.5rem;
}

img::after {
  content: "(" attr(src) ")";
  display: block;
  font-size: 0.75rem;
  opacity: 0.7;
}
```

Much kinder than a broken icon.

### 23. Hide Autoplay Videos That Are Not Muted

```css
video[autoplay]:not([muted]) {
  display: none;
}
```

Protects users from unexpected sound (especially in custom user stylesheets or embedded widgets).

### 24. Pure CSS Sliders with `max-height` + `overflow`

```css
.slider {
  max-height: 200px;
  overflow-y: hidden;
  transition: max-height 0.3s ease;
}

.slider:hover,
.slider:focus-within {
  max-height: 600px;
  overflow-y: auto;
}
```

Simple, no JS. Use for "read more" style content.

## Forms, Links & Interaction

### 25. Strong, Consistent Focus Styles

```css
a:focus-visible,
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px dotted currentColor;
  outline-offset: 0.1em;
}
```

Never `outline: none` without a visible replacement. Matches the spirit of the accessibility rule in this hub.

### 26. Use `pointer-events` to Disable Interaction

```css
button:disabled {
  opacity: 0.6;
  pointer-events: none;
}
```

Cleaner than trying to intercept clicks in JS for disabled states.

### 27. Attribute Selectors for Empty Links

```css
a[href^="http"]:empty::before {
  content: attr(href);
}
```

Useful for link lists generated from data where the visible text may be absent.

**a11y warning**: Screen readers and copy/paste behavior can be surprising. Prefer real text when possible.

## Lists & Tables

### 28. Comma-Separated Lists (CSS Generated)

```css
ul > li:not(:last-child)::after {
  content: ", ";
}
```

**Strong caveat**: Not ideal for accessibility (screen readers) and copy/paste loses the commas. Use real text or `Intl.ListFormat` in JS for production user-facing lists.

### 29. Equal-Width Table Cells

```css
.calendar,
.data-table {
  table-layout: fixed;
}
```

Prevents the browser from trying to auto-balance columns in a way that causes jitter.

## Using These Tips in the Hub

1. **Start with the higher-level rules** (`ui-skills`, `accessibility.mdc`, `web-development.mdc`).
2. **Reach for css-protips** when you hit a specific micro-problem not solved by the primitives.
3. **Prefer Tailwind utilities + logical properties** over raw CSS unless you are writing a design-system foundation or a one-off that truly needs it.
4. **Always check a11y impact** — several tips in the original collection carry explicit warnings (comma lists, empty links, generated content). The hub's accessibility rule takes precedence.
5. **Document why** you chose a particular protip in a comment or nearby ADR when it is non-obvious.

## Maintenance

- When the upstream repo adds or changes a tip, evaluate whether it still applies in a Tailwind + component-library world.
- New tips should be added with: modern Tailwind/React example, clear "when to use", and a11y/performance caveats.
- If a tip becomes obsolete (e.g., `aspect-ratio` is now universal), mark it as deprecated rather than deleting.

## References

- Original collection: https://github.com/AllThingsSmitty/css-protips
- Related hub skills: `ui-skills`, `design-taste-frontend`, `fixing-accessibility`, `fixing-motion-performance`
- Related rules: `02-front-end/accessibility.mdc`, `02-front-end/web-development.mdc`

---

**Version**: 1.0.0 (initial hub adaptation)
**Last reviewed**: 2026-05-29

This skill is intentionally focused and self-contained. It does not execute code, access the network, or request credentials. It is safe to load in any context where CSS decisions are being made.
