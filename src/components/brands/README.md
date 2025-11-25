# Brands Feature

This directory contains all the components for the brand management feature.

## Components

### BrandsHeader
- Search input for filtering brands
- View mode toggle (grid/list)
- Add brand button
- Responsive layout

**Props:**
```typescript
interface BrandsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode; // 'grid' | 'list'
  onViewModeChange: (mode: ViewMode) => void;
  onAddBrand: () => void;
}
```

### BrandCard
- Grid view component for displaying brand information
- Shows brand logo (or placeholder with first letter)
- Displays brand name, industry, and website
- Product count badge
- Edit and delete actions in dropdown menu
- Hover effects and responsive design

**Props:**
```typescript
interface BrandCardProps {
  brand: BrandWithCount;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}
```

### BrandListItem
- List view component for displaying brand information
- Horizontal layout optimized for scanning
- Shows same information as card but in row format
- Clickable website link with external icon
- Edit and delete actions

**Props:**
```typescript
interface BrandListItemProps {
  brand: BrandWithCount;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}
```

## Hooks

### use-brands.ts
Located in `/src/hooks/use-brands.ts`

Provides React Query hooks for brand operations:

- `useBrands()` - Fetch all brands
- `useBrand(id)` - Fetch single brand
- `useCreateBrand()` - Create new brand
- `useUpdateBrand()` - Update existing brand
- `useDeleteBrand()` - Delete brand

All mutations automatically invalidate relevant queries for cache consistency.

## Page

### /brands
Main brands page at `/src/app/(dashboard)/brands/page.tsx`

Features:
- Real-time search filtering
- Toggle between grid and list views
- Loading states with skeleton UI
- Error handling with retry option
- Empty states for no brands or no search results
- Responsive design (mobile-first)
- Delete confirmation dialog

## Usage Example

```tsx
import { useBrands, useDeleteBrand } from '@/hooks/use-brands';
import { BrandCard } from '@/components/brands';

function MyComponent() {
  const { data: brands, isLoading } = useBrands();
  const deleteBrand = useDeleteBrand();

  const handleDelete = async (id: string) => {
    await deleteBrand.mutateAsync(id);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {brands?.map((brand) => (
        <BrandCard
          key={brand.id}
          brand={brand}
          onDelete={() => handleDelete(brand.id)}
        />
      ))}
    </div>
  );
}
```

## API Integration

All components expect the following API endpoints:

- `GET /api/brands` - List all brands (with product counts)
- `GET /api/brands/:id` - Get single brand
- `POST /api/brands` - Create brand
- `PATCH /api/brands/:id` - Update brand
- `DELETE /api/brands/:id` - Delete brand

## Navigation

The Brands link has been added to the sidebar navigation under the "BRAND" section.

## Future Enhancements

- Add brand creation modal/form
- Add brand editing modal/form
- Add brand detail page
- Implement brand filtering by industry
- Add sorting options (name, date created, etc.)
- Add bulk operations
- Add brand export functionality
