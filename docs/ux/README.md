# AdForge UX Documentation

Welcome to the AdForge UX documentation. This directory contains guidelines, patterns, and best practices for maintaining a consistent and accessible user experience.

## Documentation Structure

### [Component Patterns](./component-patterns.md)
Standard implementation patterns for:
- Form layouts
- Data tables
- Modal dialogs
- Navigation components
- Loading, error, and empty states
- Responsive design
- Performance optimization

### [Accessibility Guidelines](./accessibility-guidelines.md)
WCAG 2.1 AA compliance guide covering:
- Keyboard navigation
- Screen reader support
- Color and contrast requirements
- Form accessibility
- Interactive element patterns
- Testing checklist

## Design System

### Design Tokens
Location: `D:\repos\ad-forge\src\styles\design-system\tokens.ts`

Central source of truth for:
- Colors (HSL values mapped to CSS variables)
- Spacing scale (based on 4px increments)
- Typography (font families, sizes, weights)
- Border radii
- Shadows
- Animation timings
- Z-index scale
- Breakpoints

Usage example:
```tsx
import { tokens } from '@/styles/design-system';

// Access token values
const spacing = tokens.spacing.md; // '1rem'
const color = tokens.colors.primary.DEFAULT; // 'hsl(var(--primary))'
```

### CSS Variables
Location: `D:\repos\ad-forge\src\app\globals.css`

Theme variables for both light and dark modes:
- Background/foreground colors
- Primary/secondary/accent colors
- Muted colors
- Card colors
- Border/input/ring colors
- Chart colors (5 color palette)

## Installed Components

All shadcn/ui components are located in `D:\repos\ad-forge\src\components\ui\`:

### Form Components
- **Button** - Primary interaction element with multiple variants
- **Input** - Text input field
- **Label** - Form field labels

### Layout Components
- **Card** - Container with header, content, and footer sections
- **Separator** - Visual divider between content sections
- **Sheet** - Slide-out panel for mobile navigation or side content

### Feedback Components
- **Badge** - Status indicators and tags
- **Skeleton** - Loading state placeholder
- **Tooltip** - Contextual information on hover/focus

### Navigation Components
- **Avatar** - User profile images with fallback
- **Dropdown Menu** - Contextual actions menu

## Component Configuration

### components.json
```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "postcss.config.mjs",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

## Quick Start Guide

### Using Components

1. Import the component:
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
```

2. Use with proper accessibility:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button onClick={handleClick}>
      Click Me
    </Button>
  </CardContent>
</Card>
```

### Adding New Components

To add more shadcn/ui components:
```bash
npx shadcn@latest add [component-name]
```

Available components: https://ui.shadcn.com/docs/components

## Styling Guidelines

### Tailwind Utility Classes
Use Tailwind CSS for styling:
```tsx
<div className="flex items-center gap-4 p-6 rounded-lg bg-card">
  {/* Content */}
</div>
```

### Custom Styles
When needed, use the `cn()` utility for conditional classes:
```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}>
  {/* Content */}
</div>
```

## Responsive Design

### Breakpoints
- **Mobile first**: Design for small screens first
- **sm (640px)**: Small tablets
- **md (768px)**: Tablets
- **lg (1024px)**: Laptops
- **xl (1280px)**: Desktops
- **2xl (1536px)**: Large desktops

### Usage
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

## Color System

### Semantic Colors
Use semantic color names that describe purpose, not appearance:

- `primary` - Primary brand color and CTAs
- `secondary` - Secondary actions
- `accent` - Highlights and emphasis
- `destructive` - Errors and destructive actions
- `muted` - Subtle backgrounds and disabled states
- `border` - Dividers and outlines
- `input` - Form field borders
- `ring` - Focus rings

### Theme Support
All colors automatically adapt to dark mode via CSS variables.

## Accessibility Requirements

### Mandatory for All Components
- Keyboard navigation support
- Visible focus indicators
- ARIA labels for icon-only buttons
- Proper semantic HTML
- Minimum 4.5:1 color contrast for text
- Screen reader announcements for dynamic content

### Testing
Run these checks before committing:
1. Keyboard navigation test
2. Screen reader test (NVDA/VoiceOver)
3. Axe DevTools scan
4. Lighthouse accessibility audit (target: 95+)

## Performance Best Practices

### Code Splitting
Use dynamic imports for heavy components:
```tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton className="h-64" />,
});
```

### Image Optimization
Always use Next.js Image component:
```tsx
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  className="rounded-lg"
/>
```

## Common Patterns

### Loading States
```tsx
import { Skeleton } from "@/components/ui/skeleton";

{isLoading ? (
  <Skeleton className="h-12 w-full" />
) : (
  <div>{data}</div>
)}
```

### Error Handling
```tsx
{error ? (
  <div className="text-destructive" role="alert">
    {error.message}
  </div>
) : (
  <div>{content}</div>
)}
```

### Empty States
```tsx
{items.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-muted-foreground">No items found</p>
  </div>
) : (
  <div>{items.map(...)}</div>
)}
```

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Questions and Support

For UX-related questions or guidance:
1. Check this documentation
2. Review [Component Patterns](./component-patterns.md)
3. Review [Accessibility Guidelines](./accessibility-guidelines.md)
4. Consult the UI/UX specialist agent

---

Last updated: 2025-11-24
