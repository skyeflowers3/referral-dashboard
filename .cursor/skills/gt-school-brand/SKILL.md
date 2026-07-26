---
name: gt-school-brand
description: Applies the GT School / GT Anywhere visual identity to a user interface, covering the Gold and Navy palette, Literata and Inter Tight and Inconsolata type roles, the bottom-right corner chamfer, verified contrast pairings, and component recipes. Use when asked to apply, match, retheme, or audit a UI against the GT School brand, GT Anywhere brand, or "the GT theme".
disable-model-invocation: true
---

# GT School Brand

Complete visual identity. Every value needed is in this file and
[components.md](components.md). Nothing needs to be looked up.

## The identity in one paragraph

Warm off-white paper carries the content. Navy does the structural work and
Gold is the accent. An editorial serif sets display type, a compact sans sets
everything functional, and a monospace sets marks like buttons and tags. One
corner of a primary action is cut away. The result reads as a printed academic
reference rather than a software dashboard.

## Palette

| Token | Hex | Role |
|---|---|---|
| Gold | `#e48b53` | Primary brand accent. A surface, never text. |
| Gold Deep | `#ab683e` | Gradient end. Warm text on light tints. |
| Gold Light | `#ebba9b` | Selected state, warm border. |
| Gold Lighter | `#f5ddcd` | Tinted panel, grouped region. |
| Gold Lightest | `#f8e8de` | Default tinted surface, tag background. |
| Navy | `#002a3a` | Secondary brand. Primary buttons, section bars. |
| Blue Dark | `#003b5c` | Structural accent. |
| Blue | `#004f71` | Structural accent, focus ring. |
| Dark Navy | `#001117` | Body text. Text on Gold. |
| Off White | `#fcf4ef` | Page background. |
| White | `#ffffff` | Panels and cards lifted off the paper. |
| Near White | `#fbfbfb` | Text on Navy fields. |
| Black | `#1a1a1a` | Deepest fill. |
| Grey | `#cac6c4` | Strong borders, outlined controls. |
| Grey Light | `#d9d9d9` | Quiet dividers. |

Gold Gradient runs `#e48b53` to `#ab683e`. Use it for large warm fills only,
never behind text.

## Typography

Three faces, three jobs. Install locally as packages rather than remote
stylesheets so rendering does not depend on a network:
`@fontsource-variable/literata`, `@fontsource-variable/inter-tight`,
`@fontsource-variable/inconsolata`.

| Role | Family | Weight | Used for |
|---|---|---|---|
| Display | Literata | 300 | Headings at 1.1rem and above |
| Body | Inter Tight | 400, 500, 620 | Prose, controls, compact headings |
| Utility | Inconsolata | 500, 600 | Buttons, tags, codes, badges |

Reference scale:

| Step | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Display XL | 52px | 300 | -0.031em | 1.15 |
| Display L | 48px | 300 | -0.02em | 1.15 |
| Display M | 32px | 300 | -0.02em | 1.15 |
| Body L | 18px | 400 | normal | 1.25 |
| Body | 16px | 400 | normal | 1.25 |
| Utility | 16px | 500 | 0.04em, uppercase | 1.2 |

Fallbacks: Literata falls back to `'Palatino Linotype', Palatino, Georgia,
serif`. Inter Tight falls back to `'Segoe UI', system-ui, sans-serif`.
Inconsolata falls back to `ui-monospace, Consolas, monospace`.

## Shape

Radius is `8px` by default, `12px` for large containers, `4px` for compact tags.

The signature is a chamfer: a `14px` cut across the bottom-right corner,
conventionally named `is-cut-br`.

```css
.is-cut-br {
  clip-path: polygon(
    0 0,
    100% 0,
    100% calc(100% - 14px),
    calc(100% - 14px) 100%,
    0 100%
  );
}
```

Spacing steps are named `tiny`, `xxsmall`, `xsmall`, `small`, `medium`,
`large`, `xlarge`.

## Contrast, already measured

These ratios are verified. Use them instead of recomputing.

Safe for body text:

| Pair | Ratio |
|---|---|
| Dark Navy on Off White | 17.7 |
| Dark Navy on Gold Lightest | 16.1 |
| Near White on Navy | 14.6 |
| Navy on Off White | 13.9 |
| Blue Dark on Off White | 10.9 |
| Blue on Off White | 8.2 |
| Dark Navy on Gold | 7.4 |
| Gold on Navy | 5.8 |

Fails, do not ship as text:

| Pair | Ratio |
|---|---|
| Gold on Off White | 2.4 |
| White on Gold | 2.6 |
| Gold Deep on Gold Lightest | 3.7 (large text only) |

Derived mid-tones that pass on Off White, for secondary and muted prose:

| Hex | Ratio | Use |
|---|---|---|
| `#33505c` | 7.9 | Soft ink, secondary paragraphs |
| `#4a6470` | 5.8 | Muted metadata, captions |

Warm and cool accents that pass on tinted surfaces, for per-item identity
colors:

| Hex | On | Ratio |
|---|---|---|
| `#14384a` | `#f8e8de` | 10.4 |
| `#6f4526` | `#f8e8de` | 6.9 |
| `#2f5364` | `#f5ddcd` | 6.3 |
| `#8a5430` | `#f5ddcd` | 4.8 |

## Named rules

**Gold Is Not Ink.** Gold never carries text on a light background. Gold is a
surface, and text on Gold is Dark Navy. Where a warm accent must be text, use
Gold Deep or darker on a Gold Lightest or Gold Lighter tint.

**The Serif Has A Floor.** Literata 300 is a display face. Below about 1.1rem
it stops being legible, so compact headings, data labels, and table headers use
Inter Tight 620 instead. A light serif never labels a data row.

**The Utility Face Is For Marks.** Inconsolata sets buttons, tags, tier codes,
and badges. It never sets prose.

**Chamfer On A Pseudo-Element.** `clip-path` clips the focus outline along with
the corner, so apply the chamfer to an absolutely positioned `::before` behind
the content and leave the element itself unclipped. Give the element
`position: relative` and `isolation: isolate`, and the pseudo-element
`z-index: -1`.

**One Notch Per Screen.** The chamfer marks the single most important action in
view. Repeating it on every surface turns a signature into wallpaper.

**Warm Tints Under Cool Accents.** Tinted surfaces come from the Gold family
even when the content's accent color is from the Navy family. Do not invent
cool tints.

**Ordinals Descend In Weight.** When encoding ranked levels, vary fill as well
as hue so the order survives without color: Gold fill, then warm tint, then
outlined warm, then outlined grey. Always pair with a text label or numeral.

## Token block

Paste and adapt. Semantic names sit on top of brand names so components never
reference a raw hex.

```css
:root {
  --font-display: 'Literata Variable', 'Palatino Linotype', Palatino, Georgia, serif;
  --font-body: 'Inter Tight Variable', 'Segoe UI', system-ui, sans-serif;
  --font-utility: 'Inconsolata Variable', ui-monospace, Consolas, monospace;

  --gt-gold: #e48b53;
  --gt-gold-deep: #ab683e;
  --gt-gold-light: #ebba9b;
  --gt-gold-lighter: #f5ddcd;
  --gt-gold-lightest: #f8e8de;
  --gt-navy: #002a3a;
  --gt-blue-dark: #003b5c;
  --gt-blue: #004f71;
  --gt-dark-navy: #001117;
  --gt-off-white: #fcf4ef;
  --gt-near-white: #fbfbfb;
  --gt-black: #1a1a1a;
  --gt-grey: #cac6c4;
  --gt-grey-light: #d9d9d9;

  --color-bg: var(--gt-off-white);
  --color-panel: #ffffff;
  --color-surface: var(--gt-gold-lightest);
  --color-surface-strong: var(--gt-gold-lighter);
  --color-surface-selected: var(--gt-gold-light);
  --color-ink: var(--gt-dark-navy);
  --color-ink-soft: #33505c;
  --color-muted: #4a6470;
  --color-border: #ecd9cb;
  --color-border-strong: var(--gt-grey);
  --color-primary: var(--gt-navy);
  --color-primary-hover: var(--gt-dark-navy);
  --color-primary-soft: var(--gt-gold-lighter);
  --color-accent: var(--gt-gold);
  --color-accent-ink: var(--gt-dark-navy);
  --color-focus: var(--gt-blue);

  --radius-xs: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --cut-br: 14px;
}

body {
  color: var(--color-ink);
  background: var(--color-bg);
  font-family: var(--font-body);
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 300;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

h1 { letter-spacing: -0.03em; }
```

## Applying to an existing interface

1. Read the current stylesheet and find every color, font, and radius
   declaration, including hardcoded values outside the token block. Hardcoded
   values are the usual reason a retheme looks half-finished.
2. Replace the token layer first, then hunt the strays. Search for `oklch(`,
   `rgb(`, `hsl(`, and `#` in component styles.
3. Map surfaces before accents. Page background to Off White, panels and
   sidebars to White, grouped regions to Gold Lightest.
4. Assign the three faces by size, not by element. Anything below 1.1rem that
   was a heading becomes Inter Tight 620.
5. Remove weight overrides on display headings. Old stylesheets often set
   `font-weight: 650` on `h1`, which fights Literata 300.
6. Apply the chamfer to exactly one primary action per screen.
7. Convert small labels, tags, and badges to Inconsolata uppercase with
   `letter-spacing: 0.03em`.
8. Check every new text pair against the tables above. If a pair is not listed,
   compute it and require 4.5:1 for body text and 3:1 for text at 18.66px bold
   or 24px regular.
9. If the interface encodes ranked levels or per-item identity, use the ordinal
   ramp and the verified accent hexes rather than inventing hues. The palette
   does not contain many distinguishable colors, so lean on fill weight and
   labels.
10. Look at the result at the smallest supported width. Collapsing a labelled
    sidebar to an icon rail is the common failure point, since hiding the label
    also removes the accessible name unless an `aria-label` is added.

## Component recipes

See [components.md](components.md) for buttons, section bars, cards, tags,
forms, and navigation, with copy-paste CSS.
