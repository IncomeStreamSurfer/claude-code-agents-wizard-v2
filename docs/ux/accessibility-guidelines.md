# AdForge Accessibility Guidelines

This document outlines accessibility requirements and best practices for AdForge to ensure WCAG 2.1 AA compliance.

## Table of Contents
- [Overview](#overview)
- [Keyboard Navigation](#keyboard-navigation)
- [Screen Reader Support](#screen-reader-support)
- [Color and Contrast](#color-and-contrast)
- [Forms and Inputs](#forms-and-inputs)
- [Interactive Elements](#interactive-elements)
- [Testing Checklist](#testing-checklist)

---

## Overview

AdForge is committed to providing an accessible experience for all users, including those with disabilities. We follow WCAG 2.1 Level AA standards.

### Target Compliance
- **WCAG 2.1 Level AA**: All features must meet this standard
- **Keyboard Navigation**: 100% keyboard accessible
- **Screen Reader Support**: Full ARIA implementation
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text

---

## Keyboard Navigation

### Required Keyboard Support

All interactive elements must support these keyboard interactions:

| Element Type | Supported Keys |
|-------------|----------------|
| Buttons | Enter, Space |
| Links | Enter |
| Dropdowns | Arrow keys, Enter, Escape |
| Modals | Escape (to close), Tab (trapped focus) |
| Tabs | Arrow keys, Home, End |
| Form inputs | Tab, Shift+Tab, Arrow keys (for radio/checkbox groups) |

### Focus Management

#### Visible Focus Indicators
Always ensure focus indicators are visible:

```tsx
// Good: Uses ring utilities for focus
<Button className="focus:ring-2 focus:ring-ring focus:ring-offset-2">
  Click me
</Button>

// Bad: Removes focus outline
<Button className="focus:outline-none">
  Don't do this
</Button>
```

#### Focus Trapping in Modals
```tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Dialog component already handles focus trapping
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    {/* Focus is automatically trapped here */}
  </DialogContent>
</Dialog>
```

#### Skip to Main Content
Every page should have a skip link:

```tsx
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
```

---

## Screen Reader Support

### Semantic HTML

Always use semantic HTML elements:

```tsx
// Good
<header>
  <nav>
    <ul>
      <li><a href="/dashboard">Dashboard</a></li>
    </ul>
  </nav>
</header>

// Bad
<div className="header">
  <div className="nav">
    <div className="link">Dashboard</div>
  </div>
</div>
```

### ARIA Labels and Descriptions

#### Icon-Only Buttons
```tsx
import { X, Menu } from "lucide-react";

// Always provide aria-label for icon-only buttons
<Button variant="ghost" size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

<Button variant="ghost" size="icon" aria-label="Open menu">
  <Menu className="h-4 w-4" />
</Button>
```

#### Complex Interactions
```tsx
// Use aria-describedby for additional context
<Input
  id="password"
  type="password"
  aria-describedby="password-requirements"
/>
<p id="password-requirements" className="text-sm text-muted-foreground">
  Must be at least 8 characters with uppercase, lowercase, and numbers
</p>
```

#### Live Regions
```tsx
// Announce dynamic content changes
<div role="status" aria-live="polite">
  {notification && <p>{notification}</p>}
</div>

// For urgent announcements
<div role="alert" aria-live="assertive">
  {error && <p>{error}</p>}
</div>
```

### ARIA States

#### Loading States
```tsx
<Button disabled={isLoading} aria-busy={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

#### Expanded/Collapsed States
```tsx
<Button
  onClick={() => setExpanded(!expanded)}
  aria-expanded={expanded}
  aria-controls="content-section"
>
  Toggle Section
</Button>
<div id="content-section" hidden={!expanded}>
  {/* Content */}
</div>
```

---

## Color and Contrast

### Contrast Requirements

| Text Type | Minimum Ratio | Example |
|-----------|--------------|---------|
| Normal text (< 18px) | 4.5:1 | Body text, labels |
| Large text (≥ 18px or 14px bold) | 3:1 | Headings, large UI text |
| UI components | 3:1 | Buttons, form borders |
| Graphical objects | 3:1 | Icons, graphs |

### Testing Contrast

Use the design tokens from `globals.css` which are pre-tested for WCAG AA compliance:

```tsx
// These token combinations meet contrast requirements
<p className="text-foreground bg-background">Normal text</p>
<p className="text-muted-foreground">Muted text (still meets 4.5:1)</p>
<Button>Primary button (meets 3:1)</Button>
```

### Don't Rely on Color Alone

Always provide additional visual cues:

```tsx
// Good: Icon + color + text
<Badge variant="destructive">
  <AlertCircle className="mr-1 h-3 w-3" />
  Error
</Badge>

// Bad: Color only
<div className="text-red-500">Error</div>
```

---

## Forms and Inputs

### Label Association

Every input must have an associated label:

```tsx
// Good: Explicit association with htmlFor
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />

// Also acceptable: Implicit association
<Label>
  Email Address
  <Input type="email" />
</Label>
```

### Error Messages

Error messages must be programmatically associated:

```tsx
<div>
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && (
    <p id="email-error" className="text-sm text-destructive" role="alert">
      {errors.email.message}
    </p>
  )}
</div>
```

### Required Fields

Indicate required fields clearly:

```tsx
<Label htmlFor="name">
  Name <span className="text-destructive" aria-label="required">*</span>
</Label>
<Input id="name" required aria-required="true" />
```

### Field Groups

Use fieldset for related inputs:

```tsx
<fieldset>
  <legend className="text-sm font-medium mb-2">Notification Preferences</legend>
  <div className="space-y-2">
    <div className="flex items-center">
      <input type="checkbox" id="email-notif" />
      <Label htmlFor="email-notif" className="ml-2">Email notifications</Label>
    </div>
    <div className="flex items-center">
      <input type="checkbox" id="sms-notif" />
      <Label htmlFor="sms-notif" className="ml-2">SMS notifications</Label>
    </div>
  </div>
</fieldset>
```

---

## Interactive Elements

### Buttons vs Links

Choose the correct element:

```tsx
// Use <button> for actions
<Button onClick={handleSubmit}>Save Changes</Button>

// Use <Link> for navigation
<Link href="/dashboard">Go to Dashboard</Link>

// If styling a link as a button
<Link href="/dashboard">
  <Button asChild>
    <span>Go to Dashboard</span>
  </Button>
</Link>
```

### Tooltips

Tooltips must be accessible:

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" aria-label="More information">
        <Info className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>This is additional information</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Disabled States

Clearly indicate disabled states:

```tsx
// Visually and programmatically disabled
<Button disabled aria-disabled="true">
  Cannot Click
</Button>

// Explain why something is disabled
<Tooltip>
  <TooltipTrigger asChild>
    <span tabIndex={0}>
      <Button disabled aria-label="Save (Complete form to enable)">
        Save
      </Button>
    </span>
  </TooltipTrigger>
  <TooltipContent>
    <p>Complete all required fields to enable</p>
  </TooltipContent>
</Tooltip>
```

---

## Testing Checklist

### Manual Testing

- [ ] Navigate entire app using only keyboard
- [ ] Test with screen reader (NVDA on Windows, VoiceOver on Mac)
- [ ] Verify all focus indicators are visible
- [ ] Check all form validations are announced
- [ ] Ensure modals trap focus and close with Escape
- [ ] Test with 200% browser zoom
- [ ] Check with Windows High Contrast mode

### Automated Testing

Use these tools:

1. **Axe DevTools** (Browser extension)
   - Install for Chrome/Firefox
   - Run on every page
   - Fix all violations

2. **Lighthouse** (Chrome DevTools)
   - Run accessibility audit
   - Target: 95+ score

3. **WAVE** (Browser extension)
   - Visual feedback on issues
   - Check color contrast

### Code Review Checklist

When reviewing UI code, verify:

- [ ] All images have `alt` text
- [ ] All inputs have associated labels
- [ ] Icon-only buttons have `aria-label`
- [ ] Error messages use `aria-describedby`
- [ ] Focus management in modals/dialogs
- [ ] Keyboard navigation works
- [ ] Semantic HTML is used
- [ ] Color is not the only visual indicator
- [ ] Loading/busy states are announced

---

## Common Violations and Fixes

### Missing Alt Text
```tsx
// Bad
<img src="/logo.png" />

// Good
<Image src="/logo.png" alt="AdForge logo" />

// For decorative images
<Image src="/decoration.png" alt="" role="presentation" />
```

### Empty Links/Buttons
```tsx
// Bad
<Button>
  <ChevronRight />
</Button>

// Good
<Button aria-label="Next page">
  <ChevronRight />
</Button>
```

### Insufficient Color Contrast
```tsx
// Bad
<p className="text-gray-400">Hard to read text</p>

// Good
<p className="text-muted-foreground">Readable text (meets WCAG AA)</p>
```

### Non-Keyboard Accessible
```tsx
// Bad
<div onClick={handleClick}>Click me</div>

// Good
<Button onClick={handleClick}>Click me</Button>
```

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Articles](https://webaim.org/articles/)

---

## Questions?

For accessibility questions or guidance, consult the UI/UX specialist agent or reference this documentation.
