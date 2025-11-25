# AdForge Design System - Quick Reference

One-page reference for common patterns and components.

## Import Paths

```tsx
// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Design Tokens
import { tokens } from "@/styles/design-system";

// Utilities
import { cn } from "@/lib/utils";
```

---

## Common Patterns

### Button Variants
```tsx
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Link Style</Button>
```

### Button Sizes
```tsx
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Form Field
```tsx
<div className="space-y-2">
  <Label htmlFor="field">Field Label</Label>
  <Input id="field" type="text" placeholder="Enter value..." />
</div>
```

### Card Layout
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Badge Variants
```tsx
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Draft</Badge>
```

### Loading State
```tsx
{isLoading ? (
  <Skeleton className="h-12 w-full" />
) : (
  <div>{content}</div>
)}
```

### Avatar with Fallback
```tsx
<Avatar>
  <AvatarImage src="/user.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### Dropdown Menu
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Tooltip
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" aria-label="Help">
        <Info className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Help text</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Sheet (Side Panel)
```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button>Open Panel</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Panel Title</SheetTitle>
    </SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>
```

---

## Spacing Scale

```tsx
tokens.spacing.xs   // 0.25rem (4px)
tokens.spacing.sm   // 0.5rem  (8px)
tokens.spacing.md   // 1rem    (16px)
tokens.spacing.lg   // 1.5rem  (24px)
tokens.spacing.xl   // 2rem    (32px)
tokens.spacing['2xl'] // 2.5rem (40px)
tokens.spacing['3xl'] // 3rem   (48px)
```

### Tailwind Spacing
```tsx
className="space-y-2"  // 8px vertical gap
className="space-y-4"  // 16px vertical gap
className="space-y-6"  // 24px vertical gap
className="gap-2"      // 8px grid/flex gap
className="gap-4"      // 16px grid/flex gap
className="p-4"        // 16px padding
className="px-6 py-4"  // 24px horizontal, 16px vertical
```

---

## Color Classes

### Text Colors
```tsx
className="text-foreground"         // Primary text
className="text-muted-foreground"   // Secondary text
className="text-primary"            // Brand color
className="text-destructive"        // Error text
```

### Background Colors
```tsx
className="bg-background"    // Page background
className="bg-card"          // Card background
className="bg-primary"       // Primary button
className="bg-secondary"     // Secondary button
className="bg-muted"         // Subtle backgrounds
className="bg-destructive"   // Error backgrounds
```

### Border Colors
```tsx
className="border-border"         // Default borders
className="border-input"          // Input borders
className="focus:ring-ring"       // Focus rings
```

---

## Responsive Breakpoints

```tsx
// Mobile first approach
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="text-sm md:text-base lg:text-lg"
className="p-4 lg:p-8"
className="hidden md:block"  // Hide on mobile
className="md:hidden"        // Show only on mobile
```

**Breakpoints**:
- `sm: 640px`  - Small tablets
- `md: 768px`  - Tablets
- `lg: 1024px` - Laptops
- `xl: 1280px` - Desktops
- `2xl: 1536px` - Large desktops

---

## Common Layouts

### Centered Container
```tsx
<div className="container mx-auto max-w-7xl px-4">
  {/* Content */}
</div>
```

### Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>
```

### Flex Row
```tsx
<div className="flex items-center justify-between">
  <div>Left</div>
  <div>Right</div>
</div>
```

### Flex Column
```tsx
<div className="flex flex-col space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Stack with Gap
```tsx
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

---

## Accessibility Quick Checks

### Icon-only Button
```tsx
<Button variant="ghost" size="icon" aria-label="Close">
  <X className="h-4 w-4" />
</Button>
```

### Form Field with Error
```tsx
<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
  />
  {error && (
    <p id="email-error" className="text-sm text-destructive" role="alert">
      {error.message}
    </p>
  )}
</div>
```

### Loading Button
```tsx
<Button disabled={isLoading} aria-busy={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

### Expandable Section
```tsx
<Button
  onClick={() => setOpen(!open)}
  aria-expanded={open}
  aria-controls="section"
>
  Toggle
</Button>
<div id="section" hidden={!open}>
  Content
</div>
```

---

## State Patterns

### Loading
```tsx
{isLoading && (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
)}
```

### Error
```tsx
{error && (
  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
    <p className="text-sm text-destructive" role="alert">{error.message}</p>
  </div>
)}
```

### Empty
```tsx
{items.length === 0 && (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <FileX className="h-12 w-12 text-muted-foreground mb-4" />
    <p className="text-muted-foreground">No items found</p>
  </div>
)}
```

### Success
```tsx
{success && (
  <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4">
    <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
  </div>
)}
```

---

## Animation Classes

```tsx
className="transition-all duration-200"           // Smooth transition
className="hover:scale-105"                       // Scale on hover
className="hover:opacity-80"                      // Fade on hover
className="animate-spin"                          // Spinning (loading icons)
className="animate-pulse"                         // Pulsing effect
className="transition-colors duration-200"        // Color transition only
```

---

## Common Icon Sizes

```tsx
<Icon className="h-3 w-3" />   // Small (12px) - badges
<Icon className="h-4 w-4" />   // Default (16px) - buttons, inline
<Icon className="h-5 w-5" />   // Medium (20px) - list items
<Icon className="h-6 w-6" />   // Large (24px) - headers
<Icon className="h-12 w-12" /> // Extra large (48px) - empty states
```

---

## Utility Function

### cn() - Merge Classes
```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isDisabled && "disabled-classes",
  className // Allow prop override
)} />
```

---

## Z-Index Scale

```tsx
tokens.zIndex.base          // 0
tokens.zIndex.dropdown      // 1000
tokens.zIndex.sticky        // 1100
tokens.zIndex.fixed         // 1200
tokens.zIndex.modalBackdrop // 1300
tokens.zIndex.modal         // 1400
tokens.zIndex.popover       // 1500
tokens.zIndex.tooltip       // 1600
```

---

## Shadow Utilities

```tsx
className="shadow-sm"    // Subtle shadow
className="shadow"       // Default shadow
className="shadow-md"    // Medium shadow
className="shadow-lg"    // Large shadow
className="shadow-xl"    // Extra large shadow
className="shadow-2xl"   // 2XL shadow
className="shadow-none"  // No shadow
```

---

## Border Radius

```tsx
className="rounded-sm"   // 0.25rem (4px)
className="rounded"      // 0.25rem (4px)
className="rounded-md"   // 0.375rem (6px)
className="rounded-lg"   // 0.5rem (8px)
className="rounded-xl"   // 0.75rem (12px)
className="rounded-2xl"  // 1rem (16px)
className="rounded-full" // 9999px (circle)
```

---

## Typography

### Font Sizes
```tsx
className="text-xs"    // 12px
className="text-sm"    // 14px
className="text-base"  // 16px
className="text-lg"    // 18px
className="text-xl"    // 20px
className="text-2xl"   // 24px
className="text-3xl"   // 30px
```

### Font Weights
```tsx
className="font-normal"    // 400
className="font-medium"    // 500
className="font-semibold"  // 600
className="font-bold"      // 700
```

### Line Height
```tsx
className="leading-tight"    // 1.25
className="leading-normal"   // 1.5
className="leading-relaxed"  // 1.75
```

---

**Print this page for quick reference during development!**
