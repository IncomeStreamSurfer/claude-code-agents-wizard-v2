'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Image, Video, FolderOpen, Sparkles, Plus, AlertCircle, ListChecks } from 'lucide-react';
import { AssetGallery, AssetFilters } from '@/components/creatives';
import { useCreatives, type CreativesFilters } from '@/hooks/use-creatives';
import { useBrands } from '@/hooks/use-brands';
import type { CreativeType, CreativeSource } from '@/types/database';
import Link from 'next/link';

export default function CreativePage() {
  // Filter state
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  const [selectedType, setSelectedType] = useState<CreativeType | undefined>();
  const [selectedSource, setSelectedSource] = useState<CreativeSource | undefined>();

  // Build filters object
  const filters: CreativesFilters = useMemo(() => {
    return {
      brandId: selectedBrand,
      type: selectedType,
      source: selectedSource,
      search: search || undefined,
    };
  }, [selectedBrand, selectedType, selectedSource, search]);

  // Fetch data
  const { data: creatives, isLoading, error } = useCreatives(filters);
  const { data: brands } = useBrands();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creative Studio</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered asset generation and management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/creative/generate/jobs">
            <Button variant="outline">
              <ListChecks className="h-4 w-4 mr-2" />
              Generation Queue
            </Button>
          </Link>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Asset
          </Button>
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Image Generation',
            icon: Image,
            desc: 'Create images with Nano Banana Pro',
            badge: 'AI',
            href: '/creative/generate/image'
          },
          {
            title: 'Video Generation',
            icon: Video,
            desc: 'Generate videos with VEO 3.1',
            badge: 'AI',
            href: '/creative/generate/video'
          },
          {
            title: 'Asset Library',
            icon: FolderOpen,
            desc: 'Browse and manage your assets',
            badge: null,
            href: '#asset-library'
          },
          {
            title: 'Templates',
            icon: Sparkles,
            desc: 'Pre-made creative templates',
            badge: null,
            href: null
          },
        ].map((item) => (
          item.href ? (
            <Link key={item.title} href={item.href}>
              <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <item.icon className="h-8 w-8 text-muted-foreground" />
                    {item.badge && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ) : (
            <Card key={item.title} className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <item.icon className="h-8 w-8 text-muted-foreground" />
                  {item.badge && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {item.badge}
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
            </Card>
          )
        ))}
      </div>

      {/* Asset Library Section */}
      <Card id="asset-library">
        <CardHeader>
          <CardTitle>Asset Library</CardTitle>
          <CardDescription>Browse and manage all your creative assets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <AssetFilters
            search={search}
            onSearchChange={setSearch}
            selectedBrand={selectedBrand}
            selectedType={selectedType}
            selectedSource={selectedSource}
            onBrandChange={setSelectedBrand}
            onTypeChange={setSelectedType}
            onSourceChange={setSelectedSource}
            brands={brands}
          />

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load assets</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading your creative assets. Please try again.
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          )}

          {/* Gallery */}
          {!isLoading && !error && creatives && (
            <AssetGallery creatives={creatives} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
