'use client';

import { useState, useMemo } from 'react';
import { User, AlertCircle } from 'lucide-react';
import { useTalents, useDeleteTalent, type TalentWithBrand } from '@/hooks/use-talents';
import { TalentsHeader } from '@/components/talents/talents-header';
import { TalentCard } from '@/components/talents/talent-card';
import { TalentModal } from '@/components/talents/talent-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function TalentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTalent, setEditingTalent] = useState<TalentWithBrand | null>(null);

  // Fetch talents
  const { data: talents, isLoading, error } = useTalents();
  const deleteTalent = useDeleteTalent();

  // Filter talents
  const filteredTalents = useMemo(() => {
    if (!talents) return [];

    let filtered = talents;

    // Filter by brand
    if (selectedBrandId) {
      filtered = filtered.filter((t) => t.brand_id === selectedBrandId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.notes?.toLowerCase().includes(query) ||
          t.brand?.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [talents, selectedBrandId, searchQuery]);

  // Handlers
  const handleAddTalent = () => {
    setEditingTalent(null);
    setModalOpen(true);
  };

  const handleTalentClick = (talentId: string) => {
    const talent = talents?.find((t) => t.id === talentId);
    if (talent) {
      setEditingTalent(talent);
      setModalOpen(true);
    }
  };

  const handleEditTalent = (talentId: string) => {
    const talent = talents?.find((t) => t.id === talentId);
    if (talent) {
      setEditingTalent(talent);
      setModalOpen(true);
    }
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingTalent(null);
    }
  };

  const handleDeleteTalent = async (talentId: string) => {
    if (!confirm('Are you sure you want to delete this talent? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteTalent.mutateAsync(talentId);
    } catch (error) {
      console.error('Failed to delete talent:', error);
      // TODO: Show error toast
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <TalentsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedBrandId={selectedBrandId}
          onBrandChange={setSelectedBrandId}
          onAddTalent={handleAddTalent}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>

        <TalentModal
          open={modalOpen}
          onOpenChange={handleModalClose}
          talent={editingTalent}
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <TalentsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedBrandId={selectedBrandId}
          onBrandChange={setSelectedBrandId}
          onAddTalent={handleAddTalent}
        />

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load talents</h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading your talents. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>

        <TalentModal
          open={modalOpen}
          onOpenChange={handleModalClose}
          talent={editingTalent}
        />
      </div>
    );
  }

  // Empty state
  if (!filteredTalents || filteredTalents.length === 0) {
    const hasFilters = searchQuery.trim().length > 0 || selectedBrandId !== null;

    return (
      <div className="space-y-8">
        <TalentsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedBrandId={selectedBrandId}
          onBrandChange={setSelectedBrandId}
          onAddTalent={handleAddTalent}
        />

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <User className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {hasFilters ? 'No talents found' : 'No talents yet'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {hasFilters
              ? 'Try adjusting your filters or search query to find what you\'re looking for.'
              : 'Get started by adding your first talent with reference photos for AI training.'}
          </p>
          {!hasFilters && (
            <Button onClick={handleAddTalent}>Add Your First Talent</Button>
          )}
        </div>

        <TalentModal
          open={modalOpen}
          onOpenChange={handleModalClose}
          talent={editingTalent}
        />
      </div>
    );
  }

  // Talents grid view
  return (
    <div className="space-y-8">
      <TalentsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedBrandId={selectedBrandId}
        onBrandChange={setSelectedBrandId}
        onAddTalent={handleAddTalent}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTalents.map((talent) => (
          <TalentCard
            key={talent.id}
            talent={talent}
            onClick={() => handleTalentClick(talent.id)}
            onEdit={() => handleEditTalent(talent.id)}
            onDelete={() => handleDeleteTalent(talent.id)}
          />
        ))}
      </div>

      <TalentModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        talent={editingTalent}
      />
    </div>
  );
}
