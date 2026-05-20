# SciTrek frontend style guide

Reference for building pages and features in this app. Match the home page (`app/page.tsx`, `components/hero.tsx`) and auth pages (`components/auth-page.tsx`) unless there is a strong reason not to.

## Components (required)

Use primitives from `components/ui/` — do not recreate buttons, inputs, dialogs, etc. by hand.

| Use for | Component |
|--------|-----------|
| Actions, links styled as buttons | `Button` |
| Text fields | `Input` + `Label` |
| Grouped content / panels | `Card` and its subcomponents |
| Dividers | `Separator` |
| Mobile nav, side panels | `Sheet` |
| Modals | `Dialog` |
| Menus | `DropdownMenu` |
| Tabs | `Tabs` |
| Tags, status | `Badge` |
| Avatars | `Avatar` |
| Notifications | `Toaster` (from `components/ui/sonner`) in root layout |

Shared layout pieces live in `components/` (e.g. `Navbar`, `AuthPage`). Compose UI from the table above; extend variants with `className` and `cn()` from `@/lib/utils`.

**Base UI / shadcn:** Primitives use `@base-ui/react`. For links inside buttons, use `nativeButton={false}` and `render={<Link href="..." />}`. Prefer `event.currentTarget` when reading input values in handlers.

## Color palette

### Page surfaces (marketing / auth)

These are intentional overrides on top of shadcn CSS variables in `app/globals.css`:

| Token | Hex | Usage |
|-------|-----|--------|
| Page background | `#f5f5f0` | `main` / full-page sections |
| Panel background | `#eeede8` | Cards, carousel block, auth form panel |
| Field surface | `white` | Inputs sitting on `#eeede8` panels |

Use semantic tokens where possible elsewhere: `text-foreground`, `text-muted-foreground`, `bg-background`, `border-border`.

### Brand gradient (CTAs, accents)

Primary action gradient (blue → teal):

```css
linear-gradient(135deg, #1a3a8a 0%, #5a8ee0 40%, #3a9e7b 100%)
```

Optional shadow on primary buttons:

```css
box-shadow: 0 2px 20px rgba(90, 142, 224, 0.4);
```

Outline / secondary button (gradient border on page bg):

```css
background: linear-gradient(#f5f5f0, #f5f5f0) padding-box,
  linear-gradient(135deg, #5a8ee0, #3a9e7b, #c45090) border-box;
border: 1.5px solid transparent;
```

Bullet / dot accent: same gradient as the primary CTA, `135deg` from `#1a3a8a` through `#5a8ee0` to `#3a9e7b`.

### Orb / data viz colors (hero only)

Subject orbs use inline `radial-gradient(...)` per module — see `components/hero.tsx`. Do not reuse orb palettes for general UI chrome.

## Typography

| Role | Class / font |
|------|----------------|
| Headlines, logo | `font-heading` (Figtree) |
| Body, UI | `font-sans` (Inter) — default on `html` |
| Code | `font-mono` (Geist Mono) |

**Headlines:** `font-normal` or `font-medium`, `tracking-tight`, tight line height (`leading-[1.05]`–`leading-[1.1]`).

| Level | Example classes |
|-------|------------------|
| Hero h1 | `font-heading text-5xl sm:text-6xl lg:text-7xl` |
| Page h1 (auth, inner pages) | `font-heading text-4xl sm:text-5xl` |
| Section / form h2 | `font-heading text-2xl font-medium` |
| Body | `text-sm leading-relaxed text-muted-foreground` |
| Labels | `Label` + `text-foreground/90` |

## Layout

- **Max width:** `max-w-6xl mx-auto` for page content (aligned with navbar).
- **Horizontal padding:** `px-8` on sections; navbar uses `px-12` on its inner row.
- **Fixed navbar:** Height `h-16`. Content below it starts at **`pt-24`** (auth, compact pages) or **`pt-32`** (hero / tall landing). Prefer top-aligned sections (`justify-start`), not vertically centered full-page blocks, unless a screen is intentionally sparse.
- **Spacing:** Section gaps `gap-10`–`gap-12`; form fields `space-y-5`; stacked copy `space-y-6`.

### Auth / two-column pattern

```
[ back link ]

[ h1 + lead (+ bullets) ]  |  [ panel #eeede8 + form ]
```

Grid: `lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16`. Form panel: `rounded-2xl bg-[#eeede8] p-8 sm:p-10 shadow-sm`.

## Buttons

- **Primary:** `Button` `size="lg"`, `rounded-full`, white text, gradient background + shadow (see above), `hover:opacity-90`, `border-0`.
- **Ghost / nav:** `variant="ghost"`, `rounded-full`, `text-muted-foreground hover:text-foreground`.
- **Outline (marketing):** gradient border trick on `#f5f5f0`, `rounded-full`, `size="lg"`.

Full-width form submit: `w-full h-11 rounded-full` with the primary gradient.

## Form fields

Build with `Label` + `Input` from `components/ui/`.

On `#eeede8` panels:

```
h-11 rounded-xl border-white/60 bg-white px-3.5 shadow-sm
focus-visible:border-[#5a8ee0]/50 focus-visible:ring-[#5a8ee0]/25
```

Use placeholders for hints (`placeholder:text-muted-foreground` is on `Input` by default). Group fields with `space-y-2`; separate sections with `Separator` (`bg-foreground/10` on warm panels).

## Panels and cards

- **Warm panel:** `rounded-2xl bg-[#eeede8] p-8` (optionally `sm:p-10`, `shadow-sm`).
- **shadcn Card:** Use when you need header/footer slots on neutral `bg-card`; on marketing pages the warm panel wrapper is often enough.

## Navigation

- `Navbar`: fixed, `bg-[#f5f5f0]/80 backdrop-blur-sm`, logo links home via `Button` + `Link`.
- In-page anchors: ghost `Button` + `Link`, `rounded-full`.
- Mobile: `Sheet` + `SheetTrigger` / `SheetContent` + `Separator` before auth links.

## Motion and interaction

- Transitions: `transition-colors`, `transition-opacity` on hovers.
- Respect `motion-reduce` where animations exist (see hero carousel).
- Toasts: `sonner` via `toast.success` / `toast.error`.

## Dark mode

Theme via `next-themes` (`ThemeProvider`, class on `html`). Warm hex backgrounds are light-mode first; in dark mode rely on shadcn tokens (`dark:` variants on inputs, `bg-card`, etc.). Test both modes when touching forms.

## Do / don’t

**Do**

- Reuse `components/ui/*` and existing layout components.
- Keep page bg `#f5f5f0` and panel bg `#eeede8` consistent on marketing and auth flows.
- Use `font-heading` for titles and the SciTrek wordmark.
- Clear fixed nav with `pt-24` or `pt-32`.

**Don’t**

- Add new one-off button or input implementations.
- Center sparse pages vertically with `justify-center` + `flex-1` unless explicitly designing empty states.
- Introduce new accent colors outside the blue–teal–magenta gradient family without updating this doc.
- Send plaintext passwords from the client (encrypt with RSA per `lib/crypto.ts`).

## File map

| Area | Location |
|------|----------|
| Global tokens | `app/globals.css` |
| Fonts | `app/layout.tsx` |
| UI primitives | `components/ui/` |
| shadcn config | `components.json` |
| Example marketing | `components/hero.tsx`, `components/navbar.tsx` |
| Example auth | `components/auth-page.tsx`, `components/auth-form.tsx` |

When adding a new page, start from an existing pattern in this table and pull UI from `components/ui/` first.
