# AdForge Component Inventory

Complete list of all shadcn/ui components installed in the project, their dependencies, and usage examples.

## Installation Summary

**Date Installed**: 2025-11-24
**Total Components**: 11
**Configuration**: New York style with CSS variables
**Location**: `D:\repos\ad-forge\src\components\ui\`

---

## Installed Components

### 1. Button
**File**: `button.tsx`
**Dependencies**: `@radix-ui/react-slot`, `class-variance-authority`

**Variants**:
- `default` - Primary button with brand color
- `destructive` - For delete/remove actions
- `outline` - Secondary actions
- `secondary` - Less prominent actions
- `ghost` - Minimal style for toolbars
- `link` - Styled as hyperlink

**Sizes**:
- `default` (h-9)
- `sm` (h-8)
- `lg` (h-10)
- `icon` (h-9 w-9) - Square button for icons

**Example**:
```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" size="icon" aria-label="Settings">
  <Settings className="h-4 w-4" />
</Button>
```

---

### 2. Input
**File**: `input.tsx`
**Dependencies**: None

**Types Supported**:
- text, email, password, number, tel, url, search, date, etc.

**Example**:
```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>
```

---

### 3. Label
**File**: `label.tsx`
**Dependencies**: `@radix-ui/react-label`

**Example**:
```tsx
import { Label } from "@/components/ui/label";

<Label htmlFor="input-id">Field Label</Label>
```

---

### 4. Card
**File**: `card.tsx`
**Dependencies**: None

**Exports**:
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Subtitle/description
- `CardContent` - Main content area
- `CardFooter` - Footer section

**Example**:
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
</Card>
```

---

### 5. Avatar
**File**: `avatar.tsx`
**Dependencies**: `@radix-ui/react-avatar`

**Exports**:
- `Avatar` - Container
- `AvatarImage` - Image element
- `AvatarFallback` - Fallback content (initials, icon)

**Example**:
```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

<Avatar>
  <AvatarImage src="/user.jpg" alt="User name" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

---

### 6. Dropdown Menu
**File**: `dropdown-menu.tsx`
**Dependencies**: `@radix-ui/react-dropdown-menu`

**Exports**:
- `DropdownMenu` - Root component
- `DropdownMenuTrigger` - Trigger button
- `DropdownMenuContent` - Menu container
- `DropdownMenuItem` - Individual menu item
- `DropdownMenuLabel` - Section label
- `DropdownMenuSeparator` - Visual divider
- `DropdownMenuGroup` - Grouping items
- `DropdownMenuCheckboxItem` - Checkbox items
- `DropdownMenuRadioGroup` / `DropdownMenuRadioItem` - Radio items

**Example**:
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### 7. Separator
**File**: `separator.tsx`
**Dependencies**: `@radix-ui/react-separator`

**Orientations**:
- `horizontal` (default)
- `vertical`

**Example**:
```tsx
import { Separator } from "@/components/ui/separator";

<div className="space-y-4">
  <div>Section 1</div>
  <Separator />
  <div>Section 2</div>
</div>

{/* Vertical separator */}
<div className="flex items-center gap-4">
  <div>Item 1</div>
  <Separator orientation="vertical" className="h-6" />
  <div>Item 2</div>
</div>
```

---

### 8. Sheet
**File**: `sheet.tsx`
**Dependencies**: `@radix-ui/react-dialog`

**Exports**:
- `Sheet` - Root component
- `SheetTrigger` - Trigger button
- `SheetContent` - Panel content
- `SheetHeader` - Header section
- `SheetTitle` - Title text
- `SheetDescription` - Description text
- `SheetFooter` - Footer section

**Sides**:
- `left`
- `right` (default)
- `top`
- `bottom`

**Example**:
```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open Sheet</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
      <SheetDescription>Sheet description</SheetDescription>
    </SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>
```

---

### 9. Tooltip
**File**: `tooltip.tsx`
**Dependencies**: `@radix-ui/react-tooltip`

**Exports**:
- `TooltipProvider` - Wrapper (required at app root or parent)
- `Tooltip` - Individual tooltip
- `TooltipTrigger` - Element that triggers tooltip
- `TooltipContent` - Tooltip content

**Example**:
```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" aria-label="Help">
        <Info className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>This is helpful information</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### 10. Badge
**File**: `badge.tsx`
**Dependencies**: `class-variance-authority`

**Variants**:
- `default` - Primary badge
- `secondary` - Secondary badge
- `destructive` - Error/warning badge
- `outline` - Outlined badge

**Example**:
```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Draft</Badge>
```

---

### 11. Skeleton
**File**: `skeleton.tsx`
**Dependencies**: None

**Example**:
```tsx
import { Skeleton } from "@/components/ui/skeleton";

{/* Loading placeholder */}
<div className="space-y-4">
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-12 w-3/4" />
</div>
```

---

## Radix UI Dependencies Installed

The following Radix UI primitives were automatically installed:

- `@radix-ui/react-avatar@1.1.11`
- `@radix-ui/react-dialog@1.1.15` (used by Sheet)
- `@radix-ui/react-dropdown-menu@2.1.16`
- `@radix-ui/react-label@2.1.8`
- `@radix-ui/react-separator@1.1.8`
- `@radix-ui/react-slot@1.2.4` (used by Button)
- `@radix-ui/react-tooltip@1.2.8`

## Utility Dependencies

- `class-variance-authority@0.7.1` - Component variant management
- `clsx@2.1.1` - Conditional class names
- `tailwind-merge@2.5.5` - Merge Tailwind classes intelligently

## Missing Components (Can be added later)

These components are NOT yet installed but available from shadcn/ui:

### Forms
- `checkbox` - Checkbox input
- `radio-group` - Radio button group
- `select` - Dropdown select
- `switch` - Toggle switch
- `textarea` - Multi-line text input
- `form` - Form wrapper with validation

### Layout
- `accordion` - Collapsible sections
- `tabs` - Tabbed interface
- `dialog` - Modal dialogs
- `scroll-area` - Custom scrollbar

### Data Display
- `table` - Data tables
- `aspect-ratio` - Maintain aspect ratio
- `calendar` - Date picker calendar
- `progress` - Progress bar

### Feedback
- `alert` - Alert messages
- `toast` - Toast notifications
- `alert-dialog` - Confirmation dialogs

### Navigation
- `breadcrumb` - Breadcrumb navigation
- `navigation-menu` - Complex navigation
- `menubar` - Menu bar
- `command` - Command palette
- `context-menu` - Right-click menu

### Overlays
- `popover` - Popover content
- `hover-card` - Card on hover

To install any of these:
```bash
npx shadcn@latest add [component-name]
```

---

## Component Usage Statistics

Based on AdForge's expected needs:

**High Priority (Already Installed)**:
- Button, Input, Label - Core form elements
- Card - Content containers
- Avatar, Dropdown Menu - User interface
- Badge, Skeleton - Status and loading
- Tooltip - Contextual help

**Medium Priority (May need soon)**:
- `dialog` - Modals for confirmations
- `table` - Data tables for campaigns/analytics
- `select` - Dropdown selections
- `checkbox`, `switch` - Form controls
- `tabs` - Organize dashboard sections
- `toast` - Success/error notifications
- `progress` - Upload/generation progress

**Low Priority (Nice to have)**:
- `calendar` - Date pickers for campaigns
- `command` - Quick actions
- `popover` - Additional context
- `accordion` - FAQ sections
- `breadcrumb` - Deep navigation

---

## Theme Configuration

All components use CSS variables from `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode values */
}
```

## Customization

### Extending Components

Components can be customized via `className` prop:

```tsx
<Button className="w-full text-lg">
  Custom Styled Button
</Button>
```

### Creating Variants

Add new variants to button example:

```tsx
// In button.tsx
const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      // ... existing variants
      premium: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
    },
  },
});

// Usage
<Button variant="premium">Premium Action</Button>
```

---

## Best Practices

1. **Always use `asChild`** when wrapping components:
```tsx
<Button asChild>
  <Link href="/dashboard">Dashboard</Link>
</Button>
```

2. **Provide accessibility props**:
```tsx
<Button variant="ghost" size="icon" aria-label="Close">
  <X className="h-4 w-4" />
</Button>
```

3. **Use Skeleton for loading states**:
```tsx
{isLoading ? <Skeleton className="h-12" /> : <Content />}
```

4. **Wrap Tooltips in TooltipProvider**:
```tsx
<TooltipProvider>
  {/* All tooltips here */}
</TooltipProvider>
```

---

Last updated: 2025-11-24
