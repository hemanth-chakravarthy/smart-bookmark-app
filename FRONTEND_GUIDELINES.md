# Frontend Guidelines

## Product: Smart Bookmark App

---

## 1. Design Principles

### 1.1 Clarity
Every UI element must have a clear purpose. Avoid decorative components that do not contribute to user goals.

### 1.2 Consistency
- Reuse components and patterns across screens
- Maintain consistent spacing, typography, and interaction patterns

### 1.3 Efficiency
- Minimize number of actions required to complete tasks
- Prioritize keyboard-friendly interactions

### 1.4 Accessibility
- Follow WCAG 2.1 Level AA standards
- Ensure usability for all users (keyboard, screen readers)

### 1.5 Responsiveness
- Design mobile-first
- Ensure seamless experience across devices

---

## 2. Design Tokens

### 2.1 Color System

```css
/* Primary */
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;

/* Neutral */
--color-neutral-50: #f9fafb;
--color-neutral-100: #f3f4f6;
--color-neutral-200: #e5e7eb;
--color-neutral-300: #d1d5db;
--color-neutral-400: #9ca3af;
--color-neutral-500: #6b7280;
--color-neutral-600: #4b5563;
--color-neutral-700: #374151;
--color-neutral-800: #1f2937;
--color-neutral-900: #111827;

/* Semantic */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;
```

#### Usage Rules

| Category | Usage |
|----------|-------|
| Primary | CTAs, links, focus states |
| Neutral | text, backgrounds, borders |
| Error | destructive actions, validation |
| Success | confirmations |
| Warning | caution states |

---

### 2.2 Typography

```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'Fira Code', monospace;

--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;

--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

#### Usage

| Element | Style |
|---------|-------|
| Headings | font-semibold / font-bold |
| Body | text-base + leading-normal |
| Labels | text-sm + font-medium |

---

### 2.3 Spacing System

```css
--spacing-0: 0;
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;
```

#### Rules
- Component padding → spacing-4
- Sections → spacing-8 to spacing-12
- Inline gaps → spacing-2 to spacing-4

---

### 2.4 Radius & Shadows

```css
--radius-sm: 2px;
--radius-base: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;

--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
```

---

## 3. Layout System

### Grid
- 12-column grid
- Max width: 1280px
- Gutters: 24px

### Breakpoints

| Breakpoint | Width |
|------------|-------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |

### Layout Patterns

**Centered Layout**
```jsx
<div className="max-w-7xl mx-auto px-4">
  {content}
</div>
```

**Two Column**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>{left}</div>
  <div>{right}</div>
</div>
```

---

## 4. Component Library

### 4.1 Buttons

**Primary**
```jsx
<button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
  Primary
</button>
```

**Secondary**
```jsx
<button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg">
  Secondary
</button>
```

**Danger**
```jsx
<button className="px-4 py-2 bg-error text-white rounded-lg">
  Delete
</button>
```

#### States
- Hover → darker shade
- Focus → ring outline
- Disabled → opacity-50

---

### 4.2 Input Fields

```jsx
<input
  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
/>
```

**Error State**
```jsx
<input className="border-error focus:ring-error" />
<p className="text-error text-sm">Invalid input</p>
```

---

### 4.3 Cards

```jsx
<div className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md">
  Content
</div>
```

---

### 4.4 Modals

```jsx
<div className="fixed inset-0 flex items-center justify-center">
  <div className="bg-black/50 absolute inset-0" />
  <div className="bg-white p-6 rounded-lg shadow-lg">
    Modal Content
  </div>
</div>
```

---

## 5. Accessibility

- WCAG 2.1 AA compliant
- Contrast ratio ≥ 4.5:1
- All elements keyboard accessible
- Focus ring required
- Use semantic HTML

---

## 6. Animations

```css
transition: all 200ms ease-in-out;
```

### Rules
- Max duration: 300ms
- Animate only transform & opacity
- Respect reduced motion settings

---

## 7. Icon System

- **Library:** Lucide React
- **Sizes:** 16px / 20px / 24px

```jsx
import { Trash } from "lucide-react";
<Trash className="w-5 h-5" />
```

---

## 8. State Indicators

### Loading
```jsx
<div className="animate-spin h-8 w-8 border-b-2 border-primary-500"></div>
```

### Empty State
```jsx
<div className="text-center py-12">
  <p>No bookmarks yet</p>
</div>
```

### Error State
```jsx
<div className="bg-error/10 text-error p-3 rounded">
  Something went wrong
</div>
```

---

## 9. Responsive Design

- Mobile-first approach
- Touch targets ≥ 44px
- Stack layout on small screens
- Grid layout on larger screens

---

## 10. Performance

- Use Next.js optimized rendering
- Lazy load components where needed
- Avoid unnecessary re-renders

---

## 11. Browser Support

- Chrome (latest 2)
- Firefox (latest 2)
- Safari (latest 2)
- Edge (latest 2)

---

## Final Note

The frontend must feel:

- **Fast**
- **Clean**
- **Predictable**
- **Production-ready**

Every component should prioritize usability over visual complexity.