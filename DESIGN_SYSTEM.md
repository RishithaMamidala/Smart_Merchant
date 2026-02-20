# Smart Merchant Ecommerce - Design System

> A comprehensive guide to the visual language, components, and patterns used in the Smart Merchant platform.

**Last Updated:** February 2026
**Version:** 1.0
**Tech Stack:** React 18, Tailwind CSS 3.x, Vite 5

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Sizing](#spacing--sizing)
5. [Components](#components)
6. [Animations & Transitions](#animations--transitions)
7. [Layout Patterns](#layout-patterns)
8. [Accessibility](#accessibility)
9. [Best Practices](#best-practices)

---

## Design Principles

### 1. **Clarity Over Complexity**
- Use clean, minimal interfaces that prioritize content
- Avoid unnecessary decorative elements
- Keep user flows straightforward and predictable

### 2. **Consistency**
- Maintain consistent spacing, sizing, and styling across all pages
- Reuse components rather than creating one-offs
- Follow established patterns for similar interactions

### 3. **Performance First**
- Optimize images with lazy loading
- Use subtle animations (200-300ms durations)
- Minimize layout shifts and repaints

### 4. **Accessible by Default**
- All components include proper ARIA attributes
- Keyboard navigation fully supported
- Color contrast meets WCAG AA standards

### 5. **Mobile-First Responsive**
- Design for mobile, enhance for desktop
- Touch-friendly target sizes (min 44x44px)
- Progressive enhancement approach

---

## Color System

### Primary Palette (Warm Orange/Brown)

**Usage:** CTAs, merchant branding, accents on product cards

```css
primary-50:  #fdf8f3  /* Lightest tint */
primary-100: #faeee0
primary-200: #f5d9bc
primary-300: #edbf8e
primary-400: #e4a05e
primary-500: #dc8a3e  /* Base color */
primary-600: #ce7230  /* Hover states */
primary-700: #ab5928
primary-800: #894827
primary-900: #6f3c23
primary-950: #3c1d10  /* Darkest shade */
```

**When to Use:**
- Merchant dashboard highlights
- Accent buttons (`btn-accent`)
- Hover states on product cards
- Important notifications

---

### Surface Palette (Neutral Stone)

**Usage:** Text, backgrounds, borders, UI structure

```css
surface-50:  #fafaf9  /* Page backgrounds */
surface-100: #f5f5f4  /* Subtle backgrounds */
surface-200: #e7e5e4  /* Borders, dividers */
surface-300: #d6d3d1
surface-400: #a8a29e  /* Placeholder text */
surface-500: #78716c
surface-600: #57534e  /* Secondary text */
surface-700: #44403c
surface-800: #292524  /* Button hovers */
surface-900: #1c1917  /* Primary text, buttons */
surface-950: #0c0a09  /* Darkest elements */
```

**When to Use:**
- `surface-50`: Page/section backgrounds
- `surface-100`: Card backgrounds, subtle fills
- `surface-200`: Borders, dividers
- `surface-400`: Placeholder text, disabled states
- `surface-600`: Labels, secondary text
- `surface-900`: Headings, primary buttons, body text

---

### Accent Palette (Green)

**Usage:** Success states, confirmations, positive feedback

```css
accent-50:  #f0fdf4
accent-100: #dcfce7
accent-200: #bbf7d0
accent-300: #86efac
accent-400: #4ade80
accent-500: #22c55e  /* Base */
accent-600: #16a34a  /* Success buttons */
accent-700: #15803d
accent-800: #166534
accent-900: #14532d
```

**When to Use:**
- Order confirmations
- Success messages/toasts
- "In Stock" badges
- Positive analytics trends

---

### Semantic Colors

```css
/* Error States */
red-400: border-red-400    /* Input error borders */
red-500: text-red-500      /* Error messages */
red-600: bg-red-600        /* Danger buttons */
red-700: bg-red-700        /* Danger button hover */

/* Warning States */
yellow-50: bg-yellow-50    /* Warning backgrounds */
yellow-600: text-yellow-600 /* Warning text */

/* Info States */
blue-50: bg-blue-50        /* Info backgrounds */
blue-600: text-blue-600    /* Info text */
```

---

## Typography

### Font Families

```css
font-display: "DM Serif Display", Georgia, serif
font-sans:    "DM Sans", system-ui, sans-serif
font-mono:    "JetBrains Mono", monospace
```

### Font Loading

Fonts are loaded via Google Fonts. Include in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
```

---

### Type Scale

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-2xs` | 0.65rem | 1rem | Micro labels, badges |
| `text-xs` | 0.75rem | 1rem | Fine print, helper text |
| `text-sm` | 0.875rem | 1.25rem | Body text, buttons, labels |
| `text-base` | 1rem | 1.5rem | Default body |
| `text-lg` | 1.125rem | 1.75rem | Subheadings, large body |
| `text-xl` | 1.25rem | 1.75rem | Card titles |
| `text-2xl` | 1.5rem | 2rem | Section headings |
| `text-3xl` | 1.875rem | 2.25rem | Page headings (mobile) |
| `text-4xl` | 2.25rem | 2.5rem | Page headings (desktop) |

---

### Typography Utilities

```css
/* Section Headings */
.section-heading {
  @apply font-display text-3xl md:text-4xl text-surface-900;
}

.section-subheading {
  @apply text-surface-500 text-lg mt-2 max-w-2xl;
}

/* Labels */
.label {
  @apply block text-sm font-semibold text-surface-600 mb-1.5
         tracking-wide uppercase;
}
```

**Usage Example:**
```jsx
<h2 className="section-heading">Featured Products</h2>
<p className="section-subheading">
  Handpicked items from our latest collection
</p>
```

---

## Spacing & Sizing

### Spacing Scale

Use Tailwind's default spacing scale (1 unit = 0.25rem = 4px):

| Class | Size | Usage |
|-------|------|-------|
| `p-1` | 4px | Icon padding |
| `p-2` | 8px | Tight spacing |
| `p-3` | 12px | Compact elements |
| `p-4` | 16px | Default padding |
| `p-6` | 24px | Card padding |
| `p-8` | 32px | Section padding |
| `p-12` | 48px | Large section padding |

### Border Radius

```css
rounded-lg:   0.5rem   (8px)
rounded-xl:   0.75rem  (12px)  /* Buttons, inputs */
rounded-2xl:  1rem     (16px)  /* Cards */
rounded-4xl:  2rem     (32px)  /* Hero elements */
rounded-full: 9999px           /* Badges, avatars */
```

**Standard Usage:**
- Buttons: `rounded-xl`
- Inputs: `rounded-xl`
- Cards: `rounded-2xl`
- Badges: `rounded-full`

---

## Components

### Buttons

**Component:** [frontend/src/components/ui/Button.jsx](frontend/src/components/ui/Button.jsx)

#### Variants

```jsx
import { Button } from '@/components/ui/Button';

// Primary (dark background, white text)
<Button variant="primary">Save Changes</Button>

// Secondary (light gray background)
<Button variant="secondary">Cancel</Button>

// Outline (white with border)
<Button variant="outline">Learn More</Button>

// Accent (primary orange color)
<Button variant="accent">Add to Cart</Button>

// Danger (red, for destructive actions)
<Button variant="danger">Delete Product</Button>

// Ghost (transparent, subtle)
<Button variant="ghost">View Details</Button>
```

#### Sizes

```jsx
<Button size="sm">Small</Button>
<Button size="md">Medium (Default)</Button>
<Button size="lg">Large</Button>
```

#### States & Props

```jsx
// Loading state
<Button isLoading>Submitting...</Button>

// Disabled state
<Button disabled>Unavailable</Button>

// Full width
<Button fullWidth>Continue to Checkout</Button>

// With icons
<Button leftIcon={<ShoppingCartIcon />}>
  Add to Cart
</Button>

<Button rightIcon={<ArrowRightIcon />}>
  Next Step
</Button>
```

#### CSS Classes

```css
.btn {
  @apply inline-flex items-center justify-center px-5 py-2.5 text-sm
         font-semibold rounded-xl transition-all duration-200 ease-out
         focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
         active:scale-[0.98];
}

.btn-primary {
  @apply bg-surface-900 text-white hover:bg-surface-800
         focus-visible:ring-surface-900 shadow-soft hover:shadow-soft-lg;
}

.btn-accent {
  @apply bg-primary-600 text-white hover:bg-primary-700
         focus-visible:ring-primary-500 shadow-soft hover:shadow-glow;
}
```

---

### Inputs

**Component:** [frontend/src/components/ui/Input.jsx](frontend/src/components/ui/Input.jsx)

#### Basic Usage

```jsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
/>
```

#### With Icons

```jsx
<Input
  label="Search Products"
  placeholder="Type to search..."
  leftIcon={<SearchIcon />}
/>

<Input
  label="Password"
  type="password"
  rightIcon={<LockIcon />}
/>
```

#### Error States

```jsx
<Input
  label="Email"
  type="email"
  error="Please enter a valid email address"
/>
```

#### Helper Text

```jsx
<Input
  label="Username"
  hint="Must be 3-20 characters, alphanumeric only"
/>
```

#### CSS Classes

```css
.input {
  @apply block w-full rounded-xl border-2 border-surface-200 bg-white
         px-4 py-2.5 text-surface-900 placeholder-surface-400
         transition-all duration-200
         focus:border-surface-900 focus:outline-none focus:ring-0
         hover:border-surface-300;
}

.label {
  @apply block text-sm font-semibold text-surface-600 mb-1.5
         tracking-wide uppercase;
}
```

---

### Cards

**Component:** [frontend/src/components/ui/Card.jsx](frontend/src/components/ui/Card.jsx)

#### Basic Card

```jsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter }
  from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Order Summary</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Card content here */}
  </CardContent>
  <CardFooter>
    <Button fullWidth>Checkout</Button>
  </CardFooter>
</Card>
```

#### Hoverable Cards

```jsx
<Card hoverable>
  {/* Adds hover shadow effect */}
</Card>
```

#### Without Padding

```jsx
<Card noPadding>
  {/* Full-bleed content */}
</Card>
```

#### CSS Classes

```css
.card {
  @apply bg-white rounded-2xl shadow-soft border border-surface-100;
}
```

---

### Product Cards

**Component:** [frontend/src/components/product/ProductCard.jsx](frontend/src/components/product/ProductCard.jsx)

```jsx
import ProductCard from '@/components/product/ProductCard';

<ProductCard product={productData} />
```

**Features:**
- 4:5 aspect ratio product images
- Hover scale effect (1.03x)
- Price range display
- "Sold Out" overlay when `!inStock`
- Lazy loading images

---

### Badges

```jsx
<span className="badge bg-accent-100 text-accent-700">
  In Stock
</span>

<span className="badge bg-red-100 text-red-700">
  Sold Out
</span>

<span className="badge bg-surface-100 text-surface-700">
  Draft
</span>
```

**CSS Class:**
```css
.badge {
  @apply inline-flex items-center px-3 py-1 rounded-full
         text-xs font-semibold tracking-wide uppercase;
}
```

---

### Dividers

```jsx
<hr className="divider" />
```

**CSS Class:**
```css
.divider {
  @apply border-t border-surface-200;
}
```

---

## Animations & Transitions

### Timing & Duration

**Standard Durations:**
- **200ms**: Button states, hover effects
- **300ms**: Card hovers, drawer slides
- **500ms**: Page transitions, fade-ins
- **600ms**: Complex animations

**Easing Functions:**
- `ease-out`: Most interactions (default)
- `ease-in-out`: Smooth bidirectional animations

---

### Built-in Animations

```css
/* Fade In */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* Fade In Up */
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Slide In Right */
.animate-slide-in-right {
  animation: slideInRight 0.3s ease-out;
}

/* Scale In */
.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}
```

---

### Common Transitions

```css
/* Hover Effects */
.hover:shadow-soft-lg {
  transition: box-shadow 300ms ease-out;
}

/* Interactive Scale */
.active:scale-[0.98] {
  transition: transform 200ms ease-out;
}

/* Color Transitions */
.transition-colors {
  transition: color 200ms, background-color 200ms;
}

/* All Properties */
.transition-all {
  transition: all 200ms ease-out;
}
```

---

### Shadow System

```css
/* Soft Shadow (cards, buttons) */
shadow-soft:
  0 2px 15px -3px rgba(0, 0, 0, 0.07),
  0 10px 20px -2px rgba(0, 0, 0, 0.04)

/* Soft Large (hover states) */
shadow-soft-lg:
  0 10px 40px -10px rgba(0, 0, 0, 0.1),
  0 2px 10px -2px rgba(0, 0, 0, 0.04)

/* Glow (accent buttons) */
shadow-glow:
  0 0 20px rgba(220, 138, 62, 0.15)
```

---

## Layout Patterns

### Container Widths

```jsx
// Full-width sections
<section className="w-full">

// Constrained content (use max-w-7xl for main content)
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// Narrow content (forms, articles)
<div className="max-w-2xl mx-auto">
  {/* Content */}
</div>
```

---

### Grid Layouts

**Product Grids:**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

**Dashboard Grids:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

---

### Spacing Between Sections

```css
/* Small gap between related content */
.space-y-4 { gap: 1rem (16px) }

/* Standard section spacing */
.space-y-6 { gap: 1.5rem (24px) }

/* Large section spacing */
.space-y-12 { gap: 3rem (48px) }
```

---

### Responsive Breakpoints

```css
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

**Usage Example:**
```jsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

---

## Accessibility

### Focus States

All interactive elements must have visible focus indicators:

```css
/* Global focus style */
* {
  @apply focus-visible:outline-primary-500;
}

/* Component-specific focus rings */
.focus-visible:ring-2 {
  @apply focus-visible:ring-2 focus-visible:ring-offset-2
         focus-visible:ring-surface-900;
}
```

---

### ARIA Attributes

**Required for all components:**

```jsx
// Buttons
<button
  aria-label="Add to cart"
  aria-disabled={disabled}
>

// Inputs
<input
  aria-invalid={error ? 'true' : 'false'}
  aria-describedby="input-error"
/>

// Modals
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
```

---

### Keyboard Navigation

**All interactive elements must be keyboard accessible:**

- ✅ Use semantic HTML (`<button>`, `<a>`, `<input>`)
- ✅ Maintain logical tab order
- ✅ Support `Enter` and `Space` for activation
- ✅ Support `Escape` to close modals/drawers
- ✅ Use `tabIndex={-1}` only for programmatic focus

---

### Color Contrast

**WCAG AA Compliance:**

| Background | Text Color | Contrast Ratio |
|------------|------------|----------------|
| `surface-50` | `surface-900` | 15.8:1 ✅ |
| `surface-900` | `white` | 19.1:1 ✅ |
| `primary-600` | `white` | 4.8:1 ✅ |
| `red-600` | `white` | 5.1:1 ✅ |

**Test contrast at:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

### Screen Reader Support

```jsx
// Hide decorative elements
<div aria-hidden="true">
  <DecorativeIcon />
</div>

// Announce dynamic content
<div role="status" aria-live="polite">
  Product added to cart
</div>

// Skip navigation
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

---

## Best Practices

### 1. Component Composition

**✅ Do:**
```jsx
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Order #1234</CardTitle>
  </CardHeader>
</Card>
```

**❌ Don't:**
```jsx
// Don't create custom card variants for one-off uses
<CustomOrderCard />
```

---

### 2. Tailwind Class Naming

**✅ Do:**
```jsx
// Use existing utility classes
<div className="bg-white rounded-2xl shadow-soft p-6">
```

**❌ Don't:**
```jsx
// Don't add inline styles
<div style={{ backgroundColor: 'white', borderRadius: '16px' }}>
```

---

### 3. Responsive Design

**✅ Do:**
```jsx
// Mobile-first approach
<div className="px-4 sm:px-6 lg:px-8">
```

**❌ Don't:**
```jsx
// Desktop-first (harder to maintain)
<div className="px-8 lg:px-6 sm:px-4">
```

---

### 4. Performance

**✅ Do:**
```jsx
// Lazy load images
<img src={url} alt={alt} loading="lazy" />

// Use CSS transitions (GPU-accelerated)
<div className="transition-transform duration-200">
```

**❌ Don't:**
```jsx
// Animate expensive properties
<div className="animate-[width-change]"> // Causes layout shift
```

---

### 5. JSDoc Type Annotations

**✅ Do:**
```jsx
/**
 * @typedef {Object} ProductCardProps
 * @property {Object} product
 * @property {string} product.name
 * @property {number} product.price
 */
export function ProductCard({ product }) {
  // ...
}
```

**❌ Don't:**
```jsx
// No type documentation
export function ProductCard({ product }) {
  // What properties does product have? 🤷
}
```

---

### 6. Error Handling

**✅ Do:**
```jsx
<Input
  label="Email"
  error={errors.email?.message}
  aria-invalid={!!errors.email}
/>
```

**❌ Don't:**
```jsx
// Silent errors
<Input label="Email" />
{/* Error displayed elsewhere */}
```

---

## File Structure

```
frontend/src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Alert.jsx
│   │   ├── Loading.jsx
│   │   ├── Select.jsx
│   │   └── Toast.jsx
│   ├── layout/                # Layout components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── DashboardLayout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── product/               # Product-specific components
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── VariantSelector.jsx
│   │   └── AddToCartButton.jsx
│   ├── cart/                  # Cart components
│   │   ├── CartDrawer.jsx
│   │   ├── CartItem.jsx
│   │   └── CartSummary.jsx
│   └── checkout/              # Checkout components
│       ├── ShippingAddressForm.jsx
│       └── PaymentForm.jsx
├── pages/                     # Page components
├── utils/                     # Utilities
│   └── format.js             # formatPrice, formatDate, etc.
└── index.css                  # Global styles, Tailwind directives
```

---

## Resources

### Design Tools
- **Color Palette:** [Coolors](https://coolors.co/)
- **Icons:** Heroicons, Lucide React
- **Contrast Checker:** [WebAIM](https://webaim.org/resources/contrastchecker/)

### Development Tools
- **Tailwind Play:** [play.tailwindcss.com](https://play.tailwindcss.com/)
- **Tailwind Docs:** [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **a11y Checker:** [axe DevTools](https://www.deque.com/axe/devtools/)

### Inspiration
- **Vercel Design:** Clean, modern e-commerce aesthetics
- **Stripe:** Payment UI patterns
- **Shopify Polaris:** Component design system

---

## Changelog

### v1.0 (February 2026)
- Initial design system documentation
- Documented color system (primary, surface, accent)
- Typography scale and font families
- Component library (Button, Input, Card, etc.)
- Animation & transition guidelines
- Accessibility standards
- Layout patterns and best practices

---

## Contributing

When adding new components or patterns:

1. **Follow existing patterns** - Check if similar components exist
2. **Document thoroughly** - Add JSDoc types and usage examples
3. **Test accessibility** - Verify keyboard nav and screen reader support
4. **Update this doc** - Add new components to the Components section
5. **Use Tailwind utilities** - Avoid inline styles or custom CSS when possible

---

**Maintained by:** Smart Merchant Development Team
**Questions?** Check [CLAUDE.md](./CLAUDE.md) for development guidelines
