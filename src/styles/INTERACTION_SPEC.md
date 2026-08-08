# Hatef Global Interaction System

> **Status:** PROPOSED / Phase 07C visual validation pending
> **Scope:** Hover, focus-adjacent, selected and disabled visual language

## Canonical sources

```text
src/styles/tokens.css
src/styles/interactions.css
src/components/ui/Button/Button.css
src/components/ui/IconButton/IconButton.css
```

## Core rule

The **interaction family**, not the individual page, owns hover behavior.

A page may define layout and geometry, but it must not invent a new hover color,
shadow, lift amount, media zoom or text movement for an existing family.

## Text links

Light surface:

```text
Hover color → Action 700
Whole text label → no horizontal/vertical movement
```

Dark surface:

```text
Hover color → Accent 500
Whole text label → no movement
```

Directional movement belongs to an arrow/icon, not the label.

## Interactive cards

```text
Border → Action 100
Shadow → md
Lift → -4px
```

## Standard media

```text
brightness(.82)
scale(1.025)
```

## Overlay-reveal media

Only for media whose hover reveals readable overlay content:

```text
brightness(.56) saturate(1.04)
scale(1.035)
```

## Carousel / indicator dots

```text
Hover background → Neutral 400
Hover scale → 1.15
Selected background → Accent 500
Selected scale → 1.25
```

## Tabs / segmented controls

```text
No vertical lift
Hover/selected surface → Action 50
Border → Action family
```

Selected controls stay geometrically stable.

## Icon / directional action

```text
Icon-only lift → max 2px
Directional arrow shift → max 3px
```

## Form fields

```text
Hover border → border-strong
Focus → shared focus ring
```

## Shared Button protection

`Button` and `IconButton` are visual primitives. Container rules must not silently
restyle them.

Bad:

```css
.some-panel a {
  min-height: 42px;
  background: red;
}
```

If that container can contain a shared Button, target the actual text-link class or
explicitly exclude `.ui-button`.

## Specialized exceptions

Custom choreography remains allowed only when it expresses real behavior:

```text
submenu reveal
overlay reveal
tooltip reveal
complex statistics reveal
About journey navigation
decorative pseudo-element motion
partner-logo grayscale reveal
```

These exceptions still use Design System duration/easing where practical.

## Regression gates

```bash
npm run audit:buttons
npm run audit:interactions
```

`audit:interactions` rejects raw page-specific public hover colors, shadows and motion
outside documented special interaction families.

Dashboard interactions remain deferred to Phase 12.

## Filled Button hover

Filled Navy and Cyan buttons are a stronger interaction family than generic controls:

```text
text = white
hover lift = -2px
hover = darker controlled fill + role-colored shadow/ring
active = return to baseline
```

Button hover is owned by `src/components/ui/Button/Button.css`; page CSS must never replace it.
