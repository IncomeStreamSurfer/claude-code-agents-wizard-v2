'use client';

import { MoreVertical, Edit, Trash2, User, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { TalentWithBrand } from '@/hooks/use-talents';
import type { PlatformType } from '@/types/database';

interface TalentCardProps {
  talent: TalentWithBrand;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const platformLabels: Record<PlatformType, string> = {
  meta: 'Meta',
  google: 'Google',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  programmatic: 'Programmatic',
};

const platformColors: Record<PlatformType, string> = {
  meta: 'bg-blue-500',
  google: 'bg-red-500',
  tiktok: 'bg-pink-500',
  linkedin: 'bg-blue-600',
  pinterest: 'bg-red-600',
  programmatic: 'bg-purple-500',
};

export function TalentCard({ talent, onClick, onEdit, onDelete }: TalentCardProps) {
  const primaryImage = talent.reference_images?.[0];
  const hasMultipleImages = (talent.reference_images?.length || 0) > 1;
  const isExpiring = talent.expires_at && new Date(talent.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const isExpired = talent.expires_at && new Date(talent.expires_at) < new Date();

  return (
    <Card
      className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={talent.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          {hasMultipleImages && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
            >
              +{(talent.reference_images?.length || 1) - 1}
            </Badge>
          )}
          {!talent.is_active && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
            >
              Inactive
            </Badge>
          )}
          {isExpired && (
            <Badge
              variant="destructive"
              className="absolute bottom-2 left-2 bg-destructive/80 backdrop-blur-sm"
            >
              Expired
            </Badge>
          )}
          {!isExpired && isExpiring && (
            <Badge
              variant="secondary"
              className="absolute bottom-2 left-2 bg-yellow-500/80 backdrop-blur-sm text-white"
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              Expiring Soon
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{talent.name}</h3>
          {talent.brand && (
            <p className="text-sm text-muted-foreground">{talent.brand.name}</p>
          )}
          {talent.expires_at && (
            <p className="text-xs text-muted-foreground">
              Expires: {new Date(talent.expires_at).toLocaleDateString()}
            </p>
          )}
          {talent.approved_platforms && talent.approved_platforms.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {talent.approved_platforms.map((platform) => (
                <Badge
                  key={platform}
                  variant="outline"
                  className="text-xs"
                >
                  {platformLabels[platform]}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {talent.reference_images?.length || 0} photo{talent.reference_images?.length !== 1 ? 's' : ''}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
