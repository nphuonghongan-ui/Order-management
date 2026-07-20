---
name: Logistics Core
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#434654'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#4f5f7b'
  on-secondary: '#ffffff'
  secondary-container: '#cdddff'
  on-secondary-container: '#51617e'
  tertiary: '#004b58'
  on-tertiary: '#ffffff'
  tertiary-container: '#006476'
  on-tertiary-container: '#70e2ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#b7c7e8'
  on-secondary-fixed: '#091c35'
  on-secondary-fixed-variant: '#374763'
  tertiary-fixed: '#adecff'
  tertiary-fixed-dim: '#5dd6f3'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5d'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
  nav-accent: '#ea580c'
  on-nav-accent: '#ffffff'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  table-header:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  row-height-dense: 32px
  row-height-standard: 48px
---

## Brand & Style

This design system is engineered for high-utility supply chain environments where data density and clarity are paramount. The brand personality is **reliable, precise, and authoritative**, moving away from decorative elements toward a functionalist aesthetic. 

The design style is **Corporate / Modern** with a focus on systematic organization. It utilizes a structured hierarchy that minimizes cognitive load while maximizing the information displayed on a single screen. Visual flair is restricted to functional status indicators and subtle tonal shifts, ensuring the user's focus remains on operational efficiency and exception management.

## Colors

The palette is anchored in **Corporate Blue** and **Slate Greys** to establish a sense of stability and institutional trust. 

- **Primary:** Used for primary actions, active states, and critical navigation.
- **Secondary:** Applied to secondary iconography and supporting UI elements to reduce visual noise.
- **Neutrals:** A range of cool-toned greys (Slate) is used for borders, backgrounds, and text hierarchy.
  - **`slate` `#64748B` (`215 16% 47%`)** — neutral muted text tone. Use for icon accents, footer metadata, sub-table column headers, and empty-state copy where a slightly lighter, less blue-leaning tone reads better than `--muted-foreground` (`#434654`). Dark-mode mirror: `215 14% 65%`. Exposed as `text-slate`, `bg-slate`, `border-slate`, etc.
- **Functional Status:** These colors are reserved strictly for data-driven statuses (Shipped, Pending, Issue). They utilize high-saturation tones to ensure they catch the eye immediately within dense data tables.
- **Nav Accent (Orange):** A scoped secondary accent used **exclusively for nav hover/active feedback** (the 2px underline under active or hovered nav links). Do not use for primary CTAs, status indicators, or any other component. Hex `#ea580c` (HSL `21 90% 48%`); dark-mode mirror `#ea580c` at 55% lightness. Exposed as `text-nav-accent` and `border-nav-accent` via `tailwind.config.js`.

## Typography

The typography system prioritizes legibility in high-density layouts. **Inter** is the primary typeface for its exceptional clarity at small sizes. 

- **Headlines:** Keep sizing modest to preserve vertical space.
- **Labels:** Monospaced **JetBrains Mono** is used for ID numbers, tracking codes, and SKU data to ensure characters are distinct and easy to scan.
- **Data Tables:** Use `body-md` for row content and `table-header` for column titles to create a clear structural distinction.
- **Mobile:** Large headlines scale down to `18px` to ensure dashboard headers do not push content below the fold.

## Layout & Spacing

This design system uses a **Fluid Grid** model with a base unit of **4px**. This tight spacing rhythm allows for the "Data-Dense" requirement essential for supply chain monitoring.

- **Desktop:** 12-column grid with 16px gutters. Sidebars are fixed at 240px to maximize the central data viewing area.
- **Tablet:** 8-column grid. Sidebars collapse into icons.
- **Mobile:** Single column with 16px side margins.
- **Density Toggles:** Interfaces should support a "Dense" view (32px row heights) for power users and a "Standard" view (48px row heights) for casual monitoring.

## Elevation & Depth

To maintain a clean and professional look, depth is communicated through **Tonal Layers** and **Low-contrast Outlines** rather than heavy shadows.

- **Surface Levels:** The base background is light grey (#F4F5F7). Content "cards" or table containers use a pure white surface.
- **Borders:** Use 1px solid strokes in a light slate (#EBECF0) to define boundaries. 
- **Active State:** Use a subtle 2px primary color left-border on active list items or table rows to indicate selection.
- **Shadows:** Restricted to "Global Overlays" like modals or dropdown menus, using a soft, neutral-grey shadow (0px 4px 12px rgba(9, 30, 66, 0.15)).

## Shapes

The shape language is **Soft (0.25rem)**. This provides a modern touch without sacrificing the "Industrial" and "Professional" feel of the interface. 

- **Small elements (0.25rem):** Checkboxes, input fields, and standard buttons.
- **Large elements (0.5rem):** Data cards, modals, and main content containers.
- **Pill shapes:** Reserved exclusively for status badges and tags to make them instantly recognizable against the rectangular grid of data tables.

## Components

### Data Tables
The core component of the system. Tables must feature sticky headers, sortable columns, and row-hover states. Column alignment: Text to the left, numerical data to the right.

### Status Badges
Pill-shaped with a light background tint and dark text (e.g., Success: Light Green BG / Dark Green Text). This ensures readability while providing a clear color signal.

### Buttons
Default filled buttons, active filter chips, and primary CTA buttons use the **Primary Light** token (`#0052cc`, mapped to `--primary-light` in `index.css` and exposed as the Tailwind utility `bg-primary-light` via `tailwind.config.js`).

**Token source of truth:** `--primary-light` (HSL `216 100% 40%`). Do not hardcode `bg-[#0052CC]` — always use `bg-primary-light` so the value can be changed in one place.

**Hover state:** the main `Button` component darkens to `bg-primary-light/80` (80% opacity). The `ActionToolbar` CTA reverses on hover to `bg-primary` (the darker Primary token) for a pressed-in feel.

### Action Toolbars
Positioned above data tables. Includes search inputs, filter chips, and primary action buttons (e.g., "Create Shipment"). Use secondary button styles for bulk actions like "Export" or "Print Labels."

### Input Fields
Clean, outlined boxes with clear labels and placeholder text. Focus states use a 2px Primary Blue border. Error states replace the border with Status Red.

**Placeholder opacity:** All input and textarea placeholders use `opacity: 0.7` (Tailwind `placeholder:opacity-70`) for improved readability against the background while maintaining a clear visual distinction from actual input text.

The value is sourced from the `--placeholder-opacity` design token (defined in `@theme` in `index.css`) and wired into `tailwind.config.js` as `opacity.70` so the `placeholder:opacity-70` utility and the base-layer `::placeholder` rule resolve to the same value. Change the token in one place to update everywhere.

### Lists
Used for sidebar navigation and "Recent Activity" feeds. Active items should be highlighted with a subtle blue background (#DEEBFF) and primary blue text.

### Progress Trackers
Horizontal stepped indicators for shipment stages. Use Primary Blue for completed steps, Neutral Grey for upcoming, and Status Red for stalled segments.
