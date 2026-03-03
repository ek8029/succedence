# Succedence Layout & Spacing Rules

**🚨 MANDATORY: All UI changes MUST follow these rules. If a request conflicts with these rules, propose a compliant alternative.**

---

## Core Principles

1. **Gap-first spacing**: Use `flex`/`grid` with `gap` instead of per-element `margin-top`/`margin-bottom`
2. **Single container system**: All content uses `<PageContainer>` for horizontal constraints
3. **Vertical rhythm**: All sections use `<Section>` with defined variants
4. **No arbitrary spacing**: Use design tokens only (no `mt-[37px]` or `px-[63px]`)
5. **Consistent responsive breakpoints**: Follow Tailwind's standard breakpoints

---

## Layout Components

### PageContainer
**Purpose**: Enforces consistent max-width and horizontal padding across all pages

```tsx
<PageContainer>
  <Section>...</Section>
</PageContainer>
```

**Specs**:
- Max-width: `max-w-7xl` (1280px)
- Padding: `px-6 md:px-8 lg:px-16`
- Always centers content with `mx-auto`

**Rules**:
- ✅ Every page section must be wrapped in `<PageContainer>`
- ❌ NO custom containers with different max-widths
- ❌ NO ad-hoc padding like `px-12` or `px-[73px]`

---

### Section
**Purpose**: Enforces consistent vertical spacing (padding) for page sections

```tsx
<Section variant="hero">...</Section>
<Section variant="default" withBorder="top">...</Section>
<Section variant="tight">...</Section>
```

**Variants**:
- `hero`: `py-24 md:py-32` - For hero sections and major CTAs
- `default`: `py-16 md:py-20` - Standard section spacing (default)
- `tight`: `py-12 md:py-16` - Compact sections

**Border options**: `top`, `bottom`, `both`, `none` (uses `border-slate/40`)

**Rules**:
- ✅ All page sections must use `<Section>` for vertical spacing
- ❌ NO custom `py-*` values outside these variants
- ❌ NO arbitrary padding like `pt-[47px]` or `pb-[83px]`

---

### Stack
**Purpose**: Vertical layout with gap-based spacing (replaces margin-based stacking)

```tsx
<Stack gap="lg">
  <h2>Heading</h2>
  <p>Paragraph</p>
</Stack>
```

**Gap sizes** (design tokens):
- `xs`: `gap-4` (16px)
- `sm`: `gap-6` (24px)
- `md`: `gap-8` (32px) - **default**
- `lg`: `gap-12` (48px)
- `xl`: `gap-16` (64px)

**Rules**:
- ✅ Use `<Stack>` for vertical spacing between related elements
- ✅ Choose gap size based on content relationship (tighter = more related)
- ❌ NO `mb-*` or `mt-*` on children (let gap handle it)
- ❌ NO arbitrary gap values

---

### Cluster
**Purpose**: Horizontal layout with gap-based spacing (replaces margin-based horizontal layouts)

```tsx
<Cluster gap="xs" align="center" wrap>
  <button>Button 1</button>
  <button>Button 2</button>
</Cluster>
```

**Gap sizes**: Same as Stack (`xs`, `sm`, `md`, `lg`, `xl`)

**Align options**: `start`, `center`, `end`, `stretch`

**Justify options**: `start`, `center`, `end`, `between`

**Rules**:
- ✅ Use `<Cluster>` for horizontal button groups, inline elements
- ✅ Use `wrap` prop for responsive wrapping
- ❌ NO `ml-*` or `mr-*` on children
- ❌ NO flex utilities on parent when using Cluster

---

## Design Tokens

### Spacing Scale

**Section vertical spacing** (for `<Section>` variants):
```
section-hero: 96px (py-24)
section-hero-md: 128px (md:py-32)
section: 64px (py-16)
section-md: 80px (md:py-20)
section-tight: 48px (py-12)
section-tight-md: 64px (md:py-16)
```

**Component spacing** (for `<Stack>` and `<Cluster>` gaps):
```
component-xs: 16px (gap-4)
component-sm: 24px (gap-6)
component-md: 32px (gap-8)
component-lg: 48px (gap-12)
component-xl: 64px (gap-16)
```

**Rules**:
- ✅ Only use spacing values from this scale
- ❌ NO custom spacing like `gap-[37px]` or `py-[29px]`
- ❌ NO hardcoded pixel values in Tailwind classes

---

### Container Widths

**Max widths**:
- Page container: `max-w-7xl` (1280px)
- Content blocks: `max-w-3xl` (768px) for CTAs, hero content
- Text readability: `max-w-xl` (576px) or `max-w-prose` (65ch)

**Rules**:
- ✅ Use `max-w-7xl` for all page containers
- ✅ Use `max-w-xl` or `max-w-prose` for long-form text
- ❌ NO arbitrary max-widths like `max-w-[843px]`

---

### Grid Strategy

**Hero sections**:
```tsx
<div className="grid lg:grid-cols-2 gap-16 items-center">
  <Stack gap="lg">...</Stack>
  <Stack gap="sm">...</Stack>
</div>
```

**Feature grids**:
```tsx
<div className="grid md:grid-cols-2 gap-12">...</div>
<div className="grid md:grid-cols-3 gap-x-16 gap-y-8">...</div>
```

**Rules**:
- ✅ Use grid for 2+ column layouts
- ✅ Use `gap-12` or `gap-16` for grid spacing
- ✅ All grids collapse to 1 column on mobile
- ❌ NO fixed column widths (use grid-cols-*)

---

## Forbidden Patterns

### ❌ NEVER use:

1. **Ad-hoc spacing**:
   ```tsx
   // ❌ BAD
   <div className="mt-[37px] mb-[29px]">

   // ✅ GOOD
   <Stack gap="lg">
   ```

2. **Custom containers**:
   ```tsx
   // ❌ BAD
   <div className="max-w-[1234px] px-[73px]">

   // ✅ GOOD
   <PageContainer>
   ```

3. **Per-element margins in stacks**:
   ```tsx
   // ❌ BAD
   <div>
     <h2 className="mb-6">Title</h2>
     <p className="mb-4">Text</p>
   </div>

   // ✅ GOOD
   <Stack gap="sm">
     <h2>Title</h2>
     <p>Text</p>
   </Stack>
   ```

4. **Inconsistent section padding**:
   ```tsx
   // ❌ BAD
   <section className="py-17 pt-32">

   // ✅ GOOD
   <Section variant="hero">
   ```

---

## Responsive Behavior

### Breakpoints
- Mobile: `<768px` (default, no prefix)
- Tablet: `md:` (≥768px)
- Desktop: `lg:` (≥1024px)
- Wide: `xl:` (≥1280px)

### Mobile-first approach
```tsx
// ✅ GOOD - mobile first
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

// ❌ BAD - desktop first
<div className="grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
```

**Rules**:
- ✅ Write styles mobile-first (base = mobile, add `md:`/`lg:` for larger)
- ✅ All multi-column grids collapse to 1 column on mobile
- ✅ Use `<Cluster wrap>` for button groups that need to wrap

---

## Quick Reference

| Use Case | Component/Pattern |
|----------|------------------|
| Page-level horizontal constraints | `<PageContainer>` |
| Vertical section spacing | `<Section variant="...">` |
| Vertical spacing within a section | `<Stack gap="...">` |
| Horizontal spacing (buttons, inline) | `<Cluster gap="...">` |
| 2-3 column layouts | `grid md:grid-cols-2 gap-12` |
| Long text readability | `max-w-xl` or `max-w-prose` |

---

## Enforcement

**For all AI/developer edits**:
1. ✅ Check if existing layout components can be used
2. ✅ Use design tokens only (no arbitrary values)
3. ✅ Prefer gap-based spacing over margins
4. ✅ If unsure, ask or propose an alternative

**If a request conflicts with these rules**:
- Propose a compliant alternative
- Explain which rule would be violated
- Suggest how to achieve the desired outcome using the layout system

---

## Examples

### ✅ GOOD - Compliant pattern
```tsx
<Section variant="hero">
  <PageContainer>
    <Stack gap="lg">
      <Stack gap="md">
        <h1 className="font-serif text-5xl lg:text-6xl text-warm-white leading-[1.1]">
          Heading
        </h1>
        <p className="text-xl text-off-white/90 max-w-xl">
          Description text
        </p>
      </Stack>

      <Cluster gap="xs" wrap>
        <Link href="/..." className="px-8 py-4 bg-amber">
          Primary CTA
        </Link>
        <Link href="/..." className="px-8 py-4 border">
          Secondary CTA
        </Link>
      </Cluster>
    </Stack>
  </PageContainer>
</Section>
```

### ❌ BAD - Non-compliant pattern
```tsx
<section className="container mx-auto px-12 pt-[47px] pb-[83px] max-w-[1234px]">
  <div>
    <h1 className="mb-[37px] text-5xl">
      Heading
    </h1>
    <p className="mb-[29px] mt-[15px]">
      Description
    </p>
    <div className="flex gap-[17px]">
      <button className="mr-4">CTA 1</button>
      <button>CTA 2</button>
    </div>
  </div>
</section>
```

---

**Last updated**: 2026-03-02
**Owner**: Senior UI Engineer
**Status**: 🔒 Enforced - All changes must comply
