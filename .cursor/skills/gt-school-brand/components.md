# GT School Brand: Component Recipes

Assumes the token block from SKILL.md is in place.

## Buttons

Six variants. All share `display: inline-flex`, `align-items: center`,
`gap: 0.5rem`, and a trailing arrow glyph on the forward-moving ones.

### CTA and Primary

Navy fill, Near White label, Inconsolata uppercase, chamfered. The CTA is the
larger of the two; the geometry is otherwise identical.

```css
.button-primary {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 16px;
  color: var(--gt-near-white);
  background: transparent;
  border: 0;
  font-family: var(--font-utility);
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
}

/* Separate layer so the focus outline is not clipped with the corner. */
.button-primary::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 0;
  background: var(--color-primary);
  border-radius: var(--radius-md);
  clip-path: polygon(
    0 0,
    100% 0,
    100% calc(100% - var(--cut-br)),
    calc(100% - var(--cut-br)) 100%,
    0 100%
  );
  transition: background 150ms ease;
}

.button-primary:hover::before {
  background: var(--color-primary-hover);
}
```

### Secondary

Gold fill. The label is **Dark Navy**, not white: white on Gold measures 2.6:1
and fails, while Dark Navy on Gold measures 7.4:1.

```css
.button-secondary {
  /* Inherit .button-primary structure, then: */
  color: var(--color-accent-ink);
}

.button-secondary::before {
  background: var(--color-accent);
}

.button-secondary:hover::before {
  background: var(--gt-gold-deep);
}
```

### Outline

Quiet action. Body sans, sentence case, no chamfer.

```css
.button-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px;
  color: var(--color-ink);
  background: transparent;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
}

.button-outline:hover {
  background: var(--color-surface);
  border-color: var(--color-primary);
}
```

### Text

Underlined label with a trailing arrow. No fill, no border.

```css
.button-text {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0;
  color: var(--color-primary);
  background: none;
  border: 0;
  font-family: var(--font-utility);
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-decoration: underline;
  text-underline-offset: 0.25em;
  cursor: pointer;
}
```

### Footer

Plain uppercase utility label, no decoration. For dense link lists.

```css
.button-footer {
  color: var(--color-ink);
  background: none;
  border: 0;
  font-family: var(--font-utility);
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
```

## Section bar

A full-width Navy bar introducing a major section, with the title in white
Literata. Strong device for documentation-style pages. Use sparingly in a
working tool, where a plain heading reads lighter.

```css
.section-bar {
  padding: 0.75rem 1rem;
  color: var(--gt-near-white);
  background: var(--color-primary);
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-weight: 300;
  font-size: 1.25rem;
}
```

## Feature card

Navy field, chamfered, white Literata heading, a small numbered badge, a
hairline rule, then body copy. Any image inside repeats the chamfer on its own
opposite corner.

```css
.feature-card {
  position: relative;
  isolation: isolate;
  padding: 2rem;
  color: var(--gt-near-white);
  border-radius: var(--radius-lg);
}

.feature-card::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 0;
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  clip-path: polygon(
    0 0,
    100% 0,
    100% calc(100% - 28px),
    calc(100% - 28px) 100%,
    0 100%
  );
}

.feature-card h3 {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: 2rem;
  color: var(--gt-near-white);
}

.feature-card-number {
  padding: 0.15rem 0.4rem;
  color: var(--gt-near-white);
  background: rgb(255 255 255 / 0.12);
  border-radius: var(--radius-xs);
  font-family: var(--font-utility);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.feature-card hr {
  margin: 1rem 0;
  border: 0;
  border-top: 1px solid rgb(255 255 255 / 0.25);
}

.feature-card p {
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.5;
}
```

The card chamfer is larger than a button's because the cut should read as a
constant angle, not a constant length. Scale it with the container: roughly
14px on a control, 28px on a card.

## Tag and badge

Compact Inconsolata mark on a warm tint. Squarer than a pill.

```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.45rem;
  color: var(--color-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  font-family: var(--font-utility);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  white-space: nowrap;
}
```

Ranked variants, descending in fill weight so the order reads without color:

```css
.tag[data-level='1'] {
  color: var(--color-accent-ink);
  background: var(--gt-gold);
  border-color: var(--gt-gold-deep);
}

.tag[data-level='2'] {
  color: var(--gt-navy);
  background: var(--gt-gold-lightest);
  border-color: var(--gt-gold-light);
}

.tag[data-level='3'] {
  color: var(--gt-blue);
  background: var(--color-panel);
  border-color: var(--gt-gold-light);
}

.tag[data-level='4'] {
  color: var(--color-muted);
  background: var(--color-panel);
  border-color: var(--color-border-strong);
}
```

## Callout

Warm tinted panel for context, cautions, and method notes.

```css
.callout {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  color: var(--color-ink-soft);
  background: var(--color-primary-soft);
  border: 1px solid var(--gt-gold-light);
  border-radius: var(--radius-md);
}

.callout strong {
  color: var(--color-ink);
}

.callout p {
  max-width: 76ch;
  font-size: 0.9rem;
  line-height: 1.5;
}
```

## Form field

White input on the warm page so the entry area reads as the active surface.

```css
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field > span {
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 620;
}

.field input,
.field select,
.field textarea {
  padding: 0.6rem 0.75rem;
  color: var(--color-ink);
  background: var(--color-panel);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.95rem;
}

.field input::placeholder,
.field textarea::placeholder {
  color: var(--color-muted);
}

.field > small {
  color: var(--color-muted);
  font-size: 0.78rem;
  line-height: 1.45;
}
```

Placeholder text uses `--color-muted` rather than a lighter grey, because
placeholders need the same 4.5:1 as body text.

## Sidebar navigation

White panel against the warm page. Active item takes a warm tint with a Gold
Light border.

```css
.sidebar {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: var(--color-panel);
  border-right: 1px solid var(--color-border);
}

.nav-item {
  display: flex;
  width: 100%;
  min-height: 2.6rem;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.88rem;
  font-weight: 620;
  text-align: left;
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;
}

.nav-item:hover {
  background: var(--color-surface);
}

.nav-item[aria-current='page'] {
  color: var(--color-primary-hover);
  background: var(--color-primary-soft);
  border-color: var(--gt-gold-light);
}

.nav-item > svg {
  flex: 0 0 auto;
  color: var(--color-muted);
}

.nav-item:hover > svg,
.nav-item[aria-current='page'] > svg {
  color: currentcolor;
}

.nav-label {
  white-space: nowrap;
}
```

When the rail collapses, hide `.nav-label` and keep an `aria-label` on the
button, otherwise the control loses its accessible name.

```css
@media (max-width: 78rem) {
  .nav-label {
    display: none;
  }

  .nav-item {
    justify-content: center;
  }
}
```

## Focus and motion

```css
:where(button, a, input, select, textarea, summary):focus-visible {
  outline: 0.1875rem solid var(--color-focus);
  outline-offset: 0.125rem;
}
```

Transitions run 150ms to 250ms on color, background, and border. Motion
conveys state, not decoration. Honor reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Prose

Body copy caps at 65 to 75 characters per line. Use `text-wrap: balance` on
headings and `text-wrap: pretty` on paragraphs. Inline code takes the utility
face on a warm tint:

```css
code {
  padding: 0.1rem 0.3rem;
  color: var(--color-ink);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  font-family: var(--font-utility);
  font-size: 0.85em;
}
```
