# Hatef Shared Button & Action Control Contract

> **Version:** 3.0
> **Status:** 🔒 LOCKED
> **Canonical primitives:** `Button` and `IconButton`

## 1. Core rule

Every ordinary CTA, submit action, back action, download action, "show more" action,
and button-like navigation link must render through the shared `Button` component.

Every icon-only action must render through `IconButton`.

A page may not invent its own button colors, radius, height, padding, font, shadow,
hover, focus, disabled state, or transition.

## 2. Button API

```jsx
<Button variant="primary" size="md">...</Button>
<Button variant="secondary" size="md">...</Button>
<Button variant="outline" size="md">...</Button>
<Button variant="ghost" size="sm">...</Button>
<Button variant="inverse" size="md">...</Button>
<Button variant="link" size="sm">...</Button>
<Button variant="danger" size="md">...</Button>
```

Navigation is handled by the same component:

```jsx
<Button to="/news">...</Button>
<Button href="#section">...</Button>
<Button href="https://example.com">...</Button>
```

Custom navigation behavior can still use the same visual primitive:

```jsx
<Button as={SmartLink} href="/about#mission">...</Button>
```

## 3. Canonical dimensions

Button geometry is no longer page-defined. The default dimension preset is derived from `size`:

```text
sm = 36px high × 144px wide   (compact)
md = 44px high × 184px wide   (standard)
lg = 52px high × 220px wide   (wide)
```

Exceptions are explicit and still come from the shared component:

```jsx
<Button size="md" width="wide">...</Button>
<Button size="md" width="content">...</Button>
<Button fullWidth>...</Button>
<Button mobileFullWidth>...</Button>
```

Allowed shared width presets:

```text
compact = 144px
standard = 184px
wide = 220px
content = intrinsic width
full = 100%
```

`link` is intentionally text-like and always uses intrinsic content width.

## 4. Variants

| Variant | Use |
|---|---|
| primary | Main page/action CTA |
| secondary | Cyan highlighted CTA |
| outline | Secondary action / back / more |
| ghost | Low-emphasis control |
| inverse | Controls on dark/image surfaces |
| link | Textual action that behaves like a button |
| danger | Destructive action only |

## 5. Canonical semantic presets

The same semantic action must map to the same shared variant/size across pages:

```text
Primary page/form CTA       → primary / md
Highlighted secondary CTA   → secondary / md
Dark/image-surface CTA      → inverse / md
Back / more / view-all      → outline / sm (md only when the action needs stronger prominence)
Text-only action            → link / sm
Download action             → outline / sm
Destructive action          → danger / md
Carousel/navigation icon    → IconButton outline / md
Dark-surface icon action    → IconButton inverse / md
Close/low-emphasis icon     → IconButton ghost / md
```

Pages may not select a different hover model for these roles. If a new semantic family is genuinely required, it must be added to this contract first rather than styled locally.

## 6. IconButton

Icon-only controls use the same size scale:

```text
sm = 36px
md = 44px
lg = 52px
```

Variants:

```text
outline
ghost
inverse
danger
```

## 7. Page CSS: allowed

A local class attached to `Button` or `IconButton` may control layout only:

```text
margin
position / inset
z-index
align-self / justify-self
flex / grid-area
```

## 8. Page CSS: forbidden

```text
width / min-width / max-width
height / min-height
padding
color
background
border
border-radius
box-shadow
font-size / font-weight / font-family
opacity
cursor
transition
transform (visual hover motion)
```

Those properties belong only in the canonical UI primitive.

## 9. Different semantics are NOT forced into Button

The following are separate interaction families and should not be disguised as a
standard CTA:

```text
Tabs / segmented selectors
Accordion / disclosure headers
Carousel dots
Pagination page controls
Timeline steps
```

They require their own shared primitive/pattern, but ordinary CTA styling must
never be duplicated inside them.


## 10. Filled blue button color and hover

Filled Navy and Cyan buttons always use white text. Black/dark text on a blue filled surface is not permitted.

```text
primary   → Navy + white text
secondary → Cyan/Action + white text
```

Their hover must be visibly interactive, not merely a slight darkening:

```text
2px lift
stronger role-colored shadow/ring
controlled darker fill
active state returns to baseline
```

The hover model is defined only in `Button.css` and button interaction tokens.

## 11. Dimension ownership

Pages must not set Button width, min-width or max-width. Use the shared dimension presets instead. This rule is enforced by `npm run audit:buttons`.

## 12. Regression protection

Run:

```bash
npm run audit:buttons
```

The audit checks shared Button/IconButton local classes for prohibited visual CSS,
and reports remaining raw controls/debt.

---

**Hatef Button Contract v3.0 — LOCKED**

## 13. Interaction System Ownership

Button hover/focus behavior participates in the global interaction contract:

```text
src/styles/tokens.css
src/styles/interactions.css
src/styles/INTERACTION_SPEC.md
```

Page CSS must not restyle a shared Button indirectly through selectors such as:

```css
.some-panel a { ... }
.some-panel button { ... }
```

If a container also contains ordinary text links, exclude shared primitives explicitly
or target the text-link class itself.

The canonical Button selectors intentionally have stronger ownership specificity so
ordinary container rules cannot silently change Button color, radius, typography,
shadow, padding or hover behavior.
