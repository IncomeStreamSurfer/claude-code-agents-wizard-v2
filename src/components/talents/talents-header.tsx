'use client';

import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBrands } from '@/hooks/use-brands';

interface TalentsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBrandId: string | null;
  onBrandChange: (brandId: string | null) => void;
  onAddTalent: () => void;
}

export function TalentsHeader({
  searchQuery,
  onSearchChange,
  selectedBrandId,
  onBrandChange,
  onAddTalent,
}: TalentsHeaderProps) {
  const { data: brands } = useBrands();

  const selectedBrand = brands?.find((b) => b.id === selectedBrandId);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Talents</h1>
        <p className="text-muted-foreground mt-1">
          Manage your talent roster and reference photos
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {/* Brand Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[200px] justify-start">
              {selectedBrand ? selectedBrand.name : 'All Brands'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => onBrandChange(null)}>
              All Brands
            </DropdownMenuItem>
            {brands?.map((brand) => (
              <DropdownMenuItem
                key={brand.id}
                onClick={() => onBrandChange(brand.id)}
              >
                {brand.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search */}
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search talents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Add Talent Button */}
        <Button onClick={onAddTalent} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Talent
        </Button>
      </div>
    </div>
  );
}
