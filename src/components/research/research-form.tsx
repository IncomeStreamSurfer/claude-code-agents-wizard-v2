'use client';

import { useState } from 'react';
import { Loader2, Search, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRunResearch, type ResearchInput, type ResearchResponse } from '@/hooks/use-research';
import { useBrands } from '@/hooks/use-brands';

interface ResearchFormProps {
  onResearchComplete: (results: ResearchResponse) => void;
}

export function ResearchForm({ onResearchComplete }: ResearchFormProps) {
  const { data: brands } = useBrands();
  const runResearch = useRunResearch();

  const [formData, setFormData] = useState<ResearchInput>({
    productName: '',
    businessType: '',
    businessDescription: '',
    targetAudience: '',
    brand_id: undefined,
    usePrioritized: false,
    analyzeWithAI: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const results = await runResearch.mutateAsync(formData);
      onResearchComplete(results);
    } catch (error) {
      console.error('Research failed:', error);
    }
  };

  const updateField = (field: keyof ResearchInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isValid = formData.productName && formData.businessType &&
                  formData.businessDescription && formData.targetAudience;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Market Research
        </CardTitle>
        <CardDescription>
          Enter your product details to gather comprehensive market intelligence
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Brand Selection (Optional) */}
          {brands && brands.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="brand">Brand (Optional)</Label>
              <select
                id="brand"
                value={formData.brand_id || ''}
                onChange={(e) => updateField('brand_id', e.target.value || undefined)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">No brand selected</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Link research to a brand to save it for future reference
              </p>
            </div>
          )}

          {/* Product/Service Name */}
          <div className="space-y-2">
            <Label htmlFor="productName">Product/Service Name *</Label>
            <Input
              id="productName"
              placeholder="e.g., AdForge, Nike Air Max, Blue Apron"
              value={formData.productName}
              onChange={(e) => updateField('productName', e.target.value)}
              required
            />
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type *</Label>
            <Input
              id="businessType"
              placeholder="e.g., SaaS, E-commerce, Service, App"
              value={formData.businessType}
              onChange={(e) => updateField('businessType', e.target.value)}
              required
            />
          </div>

          {/* Business Description / Industry */}
          <div className="space-y-2">
            <Label htmlFor="businessDescription">Industry/Category *</Label>
            <Textarea
              id="businessDescription"
              placeholder="e.g., Digital marketing software, Athletic footwear, Meal kit delivery service"
              value={formData.businessDescription}
              onChange={(e) => updateField('businessDescription', e.target.value)}
              rows={2}
              required
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience *</Label>
            <Textarea
              id="targetAudience"
              placeholder="e.g., Small business owners, Fitness enthusiasts aged 25-40, Busy professionals who want healthy meals"
              value={formData.targetAudience}
              onChange={(e) => updateField('targetAudience', e.target.value)}
              rows={2}
              required
            />
          </div>

          {/* Options */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analyzeWithAI" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  AI Analysis
                </Label>
                <p className="text-xs text-muted-foreground">
                  Use Claude Haiku to analyze results and generate ad copy suggestions
                </p>
              </div>
              <Switch
                id="analyzeWithAI"
                checked={formData.analyzeWithAI}
                onCheckedChange={(checked) => updateField('analyzeWithAI', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="usePrioritized" className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  Quick Search
                </Label>
                <p className="text-xs text-muted-foreground">
                  Faster results with 3 focused searches instead of 6 comprehensive ones
                </p>
              </div>
              <Switch
                id="usePrioritized"
                checked={formData.usePrioritized}
                onCheckedChange={(checked) => updateField('usePrioritized', checked)}
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || runResearch.isPending}
          >
            {runResearch.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Researching... (this may take a minute)
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Start Research
              </>
            )}
          </Button>

          {runResearch.isError && (
            <p className="text-sm text-destructive text-center">
              {runResearch.error?.message || 'Research failed. Please try again.'}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
