/**
 * Prompt Templates for Image and Video Generation
 *
 * These templates follow the 6-component structure for professional results:
 * 1. SUBJECT - Specific identification
 * 2. ACTION - What is happening
 * 3. ENVIRONMENT - Setting and context
 * 4. ART STYLE - Technical specifications
 * 5. LIGHTING - Explicit illumination description
 * 6. DETAILS - Mood and refinement
 */

import { StylePreset } from '../ai/types';

// ============================================================================
// Image Generation Templates
// ============================================================================

export type ImageType = 'hero_shot' | 'lifestyle' | 'product_only' | 'ugc_style';

export interface ImageTemplate {
  base: string;
  withTalent?: string;
  withProduct?: string;
  modifiers: Record<StylePreset, string>;
  negativePrompts: Record<StylePreset, string>;
}

/**
 * 6-Component Prompt Structure Templates
 *
 * Each template follows:
 * [SUBJECT] + [ACTION] + [ENVIRONMENT] + [ART STYLE] + [LIGHTING] + [DETAILS]
 */
export const IMAGE_TEMPLATES: Record<ImageType, ImageTemplate> = {
  hero_shot: {
    // Base template when no product/talent specified
    base: `[SUBJECT] Professional product photography setup with premium commercial styling
[ACTION] Product positioned at 45-degree angle, centered in frame with intentional negative space for text overlay
[ENVIRONMENT] Clean seamless studio background, {brand_style} aesthetic
[ART STYLE] Shot on Canon 5D Mark IV with 85mm f/1.4 lens, professional commercial photography, advertising campaign quality
[LIGHTING] Soft box lighting from above at 45-degrees, rim light from behind creating subtle edge glow, shadow-free presentation
[DETAILS] Crisp focus on product, shallow depth of field with f/2.8 bokeh, {brand_color} color accents, polished commercial finish`,

    // Template when talent/model is included
    withTalent: `[SUBJECT] {talent_description} naturally showcasing {product_name}, professional model pose, authentic expression
[ACTION] Model confidently presenting product, genuine interaction, natural hand positioning with visible product details
[ENVIRONMENT] {brand_style} styled environment, complementary background elements, professional studio or lifestyle setting
[ART STYLE] Shot on Canon 5D Mark IV with 85mm f/1.4 lens, professional advertising photography, magazine-quality composition
[LIGHTING] Key light at 45-degrees for flattering facial lighting, fill light to reduce shadows, subtle rim light for subject separation
[DETAILS] Natural skin texture visible, crisp product focus, {brand_color} color harmony, aspirational yet authentic mood`,

    // Template when product is specified
    withProduct: `[SUBJECT] {product_name}, {product_description}, premium commercial product shot
[ACTION] Product positioned as hero element, angled to show key features and brand details, label clearly visible
[ENVIRONMENT] Clean professional background, {brand_style} aesthetic, complementary surface texture
[ART STYLE] Shot on Canon 5D Mark IV with 100mm macro lens for sharp detail, professional product photography, advertising-grade quality
[LIGHTING] Soft diffused studio lighting, three-point setup with key, fill, and rim lights, subtle reflections on glossy surfaces
[DETAILS] Ultra-sharp product details, visible textures and materials, {brand_color} color grading, premium commercial finish`,

    modifiers: {
      minimal: 'pure white seamless background, soft even lighting eliminating all shadows, minimalist composition with generous negative space, clean edges, ultra-crisp details, commercial catalog quality',
      bold: 'dramatic chiaroscuro lighting with deep shadows, high contrast presentation, vibrant saturated {brand_color} accents, dynamic diagonal composition, striking visual impact, bold advertising statement',
      lifestyle: 'natural environment context, warm golden hour quality lighting, authentic lifestyle setting with organic props, real-world context, approachable premium feel, genuine atmosphere',
      promotional: 'eye-catching sale-ready presentation, gradient background incorporating {brand_color}, professional advertising quality, vibrant attention-grabbing colors, polished commercial finish',
    },
    negativePrompts: {
      minimal: 'clutter, busy background, harsh shadows, distortion, low quality, blurry, noise, artifacts, color cast, distracting elements',
      bold: 'flat lighting, muted colors, boring composition, dull, washed out, low contrast, weak impact, amateur quality',
      lifestyle: 'artificial looking, overly staged, sterile, fake, obvious studio setup, stiff posed, unnatural lighting, synthetic atmosphere',
      promotional: 'amateur, unprofessional, low quality, blurry, pixelated, poor lighting, awkward composition, cheap looking',
    },
  },

  lifestyle: {
    base: `[SUBJECT] Lifestyle photography scene with {brand_style} aesthetic
[ACTION] Natural real-world usage moment, authentic candid interaction
[ENVIRONMENT] Genuine lifestyle setting, modern interior or outdoor location, organic styling
[ART STYLE] Documentary-style candid photography, shot on mirrorless camera, natural color grading
[LIGHTING] Natural available light, soft window light or golden hour outdoor lighting, authentic atmosphere
[DETAILS] Genuine emotional moment, relatable context, warm inviting mood, natural color palette`,

    withTalent: `[SUBJECT] {talent_description} in authentic everyday moment with {product_name}
[ACTION] Naturally interacting with product, genuine candid expression, unposed organic moment
[ENVIRONMENT] Real-life setting matching {brand_style} aesthetic, authentic home/office/outdoor location, lifestyle props
[ART STYLE] Documentary lifestyle photography, shot on Sony A7III with 35mm f/1.4 lens, natural color grading with slight warm lift
[LIGHTING] Natural window light creating soft shadows, golden hour warmth, authentic ambient lighting, no artificial flash
[DETAILS] Genuine skin texture, natural hair movement, authentic emotional connection, relatable lifestyle context, {brand_color} subtle accents`,

    withProduct: `[SUBJECT] {product_name} naturally integrated into lifestyle scene, {product_description}
[ACTION] Product in active use context, natural placement showing real-world application
[ENVIRONMENT] Authentic {brand_style} setting, complementary lifestyle elements, organic staging
[ART STYLE] Lifestyle product photography, shot on mirrorless camera with 50mm lens, documentary aesthetic
[LIGHTING] Soft natural daylight, window light with natural shadows, warm ambient glow
[DETAILS] Product as natural part of scene, genuine context, warm color grading, approachable premium feel`,

    modifiers: {
      minimal: 'clean simple Scandinavian-inspired setting, uncluttered background, soft diffused natural light, calm serene atmosphere, minimal props',
      bold: 'energetic dynamic scene, vibrant saturated colors, action moment frozen, bold lifestyle statement, high energy atmosphere',
      lifestyle: 'authentic everyday moment in real home setting, natural candid feel, warm inviting atmosphere, organic unposed interaction, genuine emotion',
      promotional: 'aspirational yet relatable lifestyle, polished influencer aesthetic, magazine-worthy composition, appealing aspirational setting',
    },
    negativePrompts: {
      minimal: 'clutter, chaos, harsh lighting, busy background, distraction, noise, overwhelming details',
      bold: 'boring, static, dull colors, low energy, flat composition, uninspiring, passive scene',
      lifestyle: 'staged, artificial, obviously posed, fake, studio look, commercial feel, unnatural, forced',
      promotional: 'amateur, unprofessional, messy, poorly lit, unflattering, awkward, low quality',
    },
  },

  product_only: {
    base: `[SUBJECT] Professional isolated product photography
[ACTION] Product positioned for optimal feature visibility, centered composition
[ENVIRONMENT] Clean seamless studio background, {brand_style} aesthetic presentation
[ART STYLE] Shot on medium format camera with 120mm macro lens, professional commercial photography
[LIGHTING] Multi-light studio setup, soft diffused main light, fill to eliminate harsh shadows
[DETAILS] Ultra-sharp product details, crisp edges, professional retouching quality`,

    withProduct: `[SUBJECT] {product_name} isolated product shot, {product_description}
[ACTION] Product positioned at optimal viewing angle, key features and branding prominently displayed
[ENVIRONMENT] Clean professional studio background, {brand_style} surface texture, minimal props if any
[ART STYLE] Shot on Hasselblad medium format with 120mm macro for maximum detail, commercial product photography
[LIGHTING] Professional three-point studio lighting, soft box main light, graduated background lighting
[DETAILS] Extreme detail on product textures and materials, visible quality craftsmanship, {brand_color} color accuracy, catalog-ready finish`,

    modifiers: {
      minimal: 'pure white (#FFFFFF) seamless background, perfectly even shadowless lighting, floating product effect, crisp clean edges, e-commerce ready',
      bold: 'bold {brand_color} colored backdrop, dramatic directional lighting with intentional shadows, high contrast presentation, eye-catching product hero',
      lifestyle: 'natural textured surface like marble or wood, soft natural-style lighting, organic background texture, subtle shadows adding depth, tactile premium feel',
      promotional: 'gradient background transitioning to {brand_color}, professional studio lighting, glossy reflective surface beneath, sale-ready polished presentation',
    },
    negativePrompts: {
      minimal: 'shadows, background elements, clutter, color cast, distortion, low quality, artifacts, reflections',
      bold: 'flat, boring, low contrast, dull colors, weak lighting, uninspired composition, amateur',
      lifestyle: 'artificial, sterile, clinical, fake texture, obviously staged, unnatural, overly processed',
      promotional: 'amateur, unprofessional, poor lighting, low quality, blurry, cheap appearance, messy background',
    },
  },

  ugc_style: {
    base: `[SUBJECT] Authentic user-generated content style product feature
[ACTION] Casual everyday interaction, spontaneous unposed moment
[ENVIRONMENT] Real home or outdoor setting, authentic lived-in background
[ART STYLE] Shot on iPhone 15 Pro, natural smartphone photography aesthetic, authentic UGC quality
[LIGHTING] Natural available lighting, genuine indoor/outdoor ambient light, no professional setup
[DETAILS] Authentic unfiltered aesthetic, relatable real-life context, genuine casual mood`,

    withTalent: `[SUBJECT] {talent_description} casually featuring {product_name}, authentic person not obvious model
[ACTION] Genuine candid moment, natural unposed selfie or partner-shot, authentic product interaction
[ENVIRONMENT] Real home, coffee shop, or outdoor location, genuine lived-in background, casual setting
[ART STYLE] Shot on iPhone 15 Pro, authentic smartphone photography, natural unedited aesthetic, influencer selfie style
[LIGHTING] Natural available light only, genuine indoor ambient or outdoor daylight, authentic lighting conditions
[DETAILS] Real skin texture with natural imperfections, genuine smile, relatable authentic moment, {brand_style} casual vibe`,

    withProduct: `[SUBJECT] {product_name} in authentic UGC context, {product_description}
[ACTION] Casual product feature, natural hand holding or placement, everyday usage moment
[ENVIRONMENT] Real-life setting, genuine background, authentic home or outdoor location
[ART STYLE] Smartphone photography aesthetic, shot on latest iPhone, authentic social media quality
[LIGHTING] Natural light only, window light or outdoor ambient, no professional lighting
[DETAILS] Authentic unfiltered look, relatable context, genuine everyday moment, {brand_color} natural integration`,

    modifiers: {
      minimal: 'simple clean home background, natural indoor lighting, casual but tidy setting, authentic minimalist aesthetic, Instagram-worthy but genuine',
      bold: 'vibrant colorful casual setting, energetic UGC vibe, bold personality expression, eye-catching but authentic, dynamic selfie composition',
      lifestyle: 'genuine everyday moment in natural home setting, authentic lighting, real-life casual atmosphere, unposed candid feel, highly relatable',
      promotional: 'polished influencer aesthetic, professional-looking UGC content, trending social media style, authentic but aspirational, viral potential',
    },
    negativePrompts: {
      minimal: 'clutter, mess, poor lighting, blurry, low quality, distraction, chaos, obviously professional',
      bold: 'boring, dull, flat, uninspired, low energy, muted colors, static, lifeless',
      lifestyle: 'staged, overly professional, obvious studio lighting, artificial, fake, posed, commercial production',
      promotional: 'amateur quality, sloppy, bad lighting, unflattering angles, awkward, messy, unpresentable',
    },
  },
};

// ============================================================================
// Video Generation Templates
// ============================================================================

export type VideoType = 'ugc' | 'product_demo' | 'testimonial' | 'dynamic';

export interface VideoTemplate {
  base: string;
  withTalent?: string;
  withProduct?: string;
  modifiers: Record<StylePreset, string>;
  negativePrompts: Record<StylePreset, string>;
}

export const VIDEO_TEMPLATES: Record<VideoType, VideoTemplate> = {
  ugc: {
    base: `[SUBJECT] User-generated content style video featuring product
[ACTION] Casual authentic presentation, natural unscripted delivery
[ENVIRONMENT] Real home or everyday location, genuine background
[ART STYLE] Smartphone video quality, handheld authentic movement, vertical format
[LIGHTING] Natural available lighting, genuine ambient conditions
[DETAILS] Authentic unfiltered aesthetic, relatable personality, genuine enthusiasm`,

    withTalent: `[SUBJECT] {talent_description} creating authentic UGC video with {product_name}
[ACTION] Natural casual product review or unboxing, genuine reactions, unscripted authentic delivery
[ENVIRONMENT] Real home setting, genuine lived-in background, personal space
[ART STYLE] iPhone video quality, slight natural handheld movement, selfie-style framing, vertical 9:16 format
[LIGHTING] Natural window light or ring light, authentic creator setup, genuine ambient conditions
[DETAILS] Real personality showing through, genuine enthusiasm, relatable authentic connection, {brand_style} casual energy`,

    withProduct: `[SUBJECT] {product_name} UGC style showcase, {product_description}
[ACTION] Casual product reveal, authentic handling and feature demonstration
[ENVIRONMENT] Genuine everyday setting, real background, authentic context
[ART STYLE] Smartphone video aesthetic, authentic creator quality, social media format
[LIGHTING] Natural lighting, genuine ambient conditions
[DETAILS] Authentic unfiltered presentation, relatable everyday context, genuine product interaction`,

    modifiers: {
      minimal: 'simple clean background, natural lighting, minimal movement, straightforward authentic presentation',
      bold: 'energetic enthusiastic delivery, vibrant setting, dynamic handheld energy, bold personality, eye-catching',
      lifestyle: 'genuine everyday home setting, natural environment, authentic casual atmosphere, real-life context, warm relatable feel',
      promotional: 'polished influencer quality, trending format, professional creator aesthetic, engaging delivery, viral potential',
    },
    negativePrompts: {
      minimal: 'shaky, chaotic, cluttered background, harsh lighting, distracting elements, poor framing',
      bold: 'boring, static, low energy, flat, dull, uninspired, passive, lifeless delivery',
      lifestyle: 'overly produced, obvious studio, artificial lighting, staged, fake, scripted feel, commercial production',
      promotional: 'amateur, sloppy, poor quality, unflattering lighting, awkward delivery, unprofessional',
    },
  },

  product_demo: {
    base: `[SUBJECT] Professional product demonstration video
[ACTION] Clear feature showcase, methodical demonstration of key benefits
[ENVIRONMENT] Clean professional setting, focused presentation space
[ART STYLE] Professional video production, smooth camera movement, commercial quality
[LIGHTING] Professional studio lighting, even illumination
[DETAILS] Clear visibility of all features, professional pacing, informative presentation`,

    withTalent: `[SUBJECT] {talent_description} demonstrating {product_name} features and benefits
[ACTION] Professional product walkthrough, clear feature explanations, hands-on demonstration
[ENVIRONMENT] Clean professional studio or lifestyle setting, {brand_style} aesthetic
[ART STYLE] Professional commercial video, smooth gimbal movement, multiple angles, 4K quality
[LIGHTING] Professional three-point lighting, soft key light, product well-illuminated
[DETAILS] Clear product visibility, professional presenter delivery, informative yet engaging, {brand_color} branded elements`,

    withProduct: `[SUBJECT] {product_name} detailed demonstration, {product_description}
[ACTION] Feature-by-feature showcase, key benefits highlighted, clear functional demonstration
[ENVIRONMENT] Professional presentation setting, clean background, {brand_style} styling
[ART STYLE] Commercial product video, professional production quality, smooth transitions
[LIGHTING] Studio lighting optimized for product visibility, no harsh shadows
[DETAILS] Crystal clear product details, professional pacing, informative engaging narrative`,

    modifiers: {
      minimal: 'clean white background, soft even lighting, smooth controlled movement, clear simple presentation, product-focused',
      bold: 'dynamic camera angles, dramatic reveals, high-energy presentation, bold visual transitions, exciting showcase',
      lifestyle: 'natural setting, warm lighting, organic camera movement, real-world demonstration, approachable style',
      promotional: 'professional commercial quality, polished presentation, smooth transitions, engaging storytelling, sales-focused',
    },
    negativePrompts: {
      minimal: 'cluttered, distracting, harsh shadows, shaky camera, complex background, confusing',
      bold: 'boring, static, slow, dull, flat lighting, uninspiring, passive demonstration',
      lifestyle: 'sterile, clinical, overly technical, impersonal, studio-bound, artificial, detached',
      promotional: 'amateur, unprofessional, poor production, bad transitions, confusing, unclear',
    },
  },

  testimonial: {
    base: `[SUBJECT] Customer testimonial video
[ACTION] Authentic personal story sharing, genuine product experience
[ENVIRONMENT] Natural setting, real location, authentic background
[ART STYLE] Documentary interview style, professional but authentic
[LIGHTING] Flattering soft lighting, natural feel
[DETAILS] Genuine emotional connection, credible authentic delivery, trustworthy presentation`,

    withTalent: `[SUBJECT] {talent_description} sharing authentic testimonial about {product_name}
[ACTION] Genuine personal story, authentic emotional delivery, real experience sharing
[ENVIRONMENT] Natural home or office setting, {brand_style} complementary background
[ART STYLE] Documentary interview style, professional camera on tripod, shallow depth of field
[LIGHTING] Soft flattering key light, natural fill, authentic but polished lighting
[DETAILS] Genuine emotion visible, authentic personality, credible trustworthy delivery, personal connection to product`,

    withProduct: `[SUBJECT] Real customer experience with {product_name}, {product_description}
[ACTION] Authentic testimonial delivery, genuine experience sharing, credible product endorsement
[ENVIRONMENT] Real-world setting, authentic background, genuine location
[ART STYLE] Documentary style, professional quality, authentic presentation
[LIGHTING] Flattering natural-style lighting, soft shadows
[DETAILS] Genuine authenticity, credible delivery, real experience, trustworthy presentation`,

    modifiers: {
      minimal: 'simple neutral background, soft flattering lighting, straightforward framing, clean professional look',
      bold: 'dynamic environment, confident delivery, strong emotional impact, bold visual presentation',
      lifestyle: 'natural home or office setting, warm inviting lighting, authentic casual atmosphere, genuine context',
      promotional: 'professional interview quality, polished but authentic, commercial-grade, credible trustworthy',
    },
    negativePrompts: {
      minimal: 'cluttered background, harsh lighting, distracting elements, unprofessional, poor audio',
      bold: 'boring, flat, unconvincing, weak delivery, dull, uninspiring, passive, lifeless',
      lifestyle: 'staged, scripted, fake, artificial, overly produced, insincere, commercial actor feel',
      promotional: 'amateur, low quality, poor lighting, awkward, untrustworthy, forced, fake',
    },
  },

  dynamic: {
    base: `[SUBJECT] Dynamic promotional video content
[ACTION] Energetic visual storytelling, fast-paced engaging presentation
[ENVIRONMENT] Varied dynamic locations, visually exciting settings
[ART STYLE] High-end commercial production, cinematic quality, professional editing
[LIGHTING] Dynamic lighting matching scene energy, professional production
[DETAILS] Exciting visual rhythm, engaging pacing, premium production value`,

    withTalent: `[SUBJECT] {talent_description} in high-energy promotional content with {product_name}
[ACTION] Dynamic movement, energetic product interaction, exciting visual moments
[ENVIRONMENT] Multiple dynamic locations, {brand_style} aesthetic throughout
[ART STYLE] Cinematic commercial production, drone shots, gimbal movement, professional editing
[LIGHTING] Dynamic professional lighting, dramatic when needed, always flattering
[DETAILS] High energy throughout, exciting visual rhythm, {brand_color} color grading, premium feel`,

    withProduct: `[SUBJECT] {product_name} dynamic showcase, {product_description}
[ACTION] Fast-paced feature highlights, dynamic product reveals, exciting presentation
[ENVIRONMENT] Varied exciting locations, visually dynamic settings
[ART STYLE] High-end commercial production, cinematic quality, professional post-production
[LIGHTING] Professional dynamic lighting, dramatic product moments
[DETAILS] Exciting pacing, visual energy, premium production value, engaging storytelling`,

    modifiers: {
      minimal: 'clean smooth transitions, controlled dynamic movement, minimalist visual flow, elegant simplicity',
      bold: 'rapid cuts, dramatic camera moves, high-contrast visuals, explosive energy, intense pacing',
      lifestyle: 'flowing organic movement, natural dynamic energy, authentic action moments, genuine excitement',
      promotional: 'professional commercial pacing, polished transitions, advertising-quality energy, sales momentum',
    },
    negativePrompts: {
      minimal: 'chaotic, jarring transitions, cluttered visuals, overwhelming, disorganized, messy',
      bold: 'boring, slow, static, flat, dull, low energy, uninspiring, passive, lifeless',
      lifestyle: 'artificial, overly produced, fake energy, staged action, scripted, insincere',
      promotional: 'amateur cuts, poor transitions, confusing pacing, low quality, sloppy editing',
    },
  },
};

// ============================================================================
// Common Modifiers
// ============================================================================

/**
 * Quality enhancers that can be appended to any prompt
 */
export const QUALITY_MODIFIERS = {
  high_quality: '8k resolution, highly detailed, sharp focus, professional quality',
  photorealistic: 'photorealistic, lifelike, ultra realistic, true to life, natural skin pores visible',
  commercial: 'commercial photography quality, advertising campaign grade, professional production value',
  cinematic: 'cinematic composition, film quality, professional cinematography, shallow depth of field',
  product_detail: 'macro lens sharp detail, visible texture and materials, crisp product focus',
};

/**
 * Lighting presets for different scenarios
 */
export const LIGHTING_PRESETS = {
  studio_soft: 'soft box lighting from above and 45-degree key light, fill light reducing shadows',
  natural_window: 'natural window light from left creating soft rim light, ambient fill',
  golden_hour: 'warm golden hour glow, natural outdoor lighting, soft long shadows',
  dramatic: 'dramatic side lighting with deep shadows, high contrast, chiaroscuro effect',
  flat_commercial: 'even flat lighting eliminating all shadows, commercial catalog style',
};

/**
 * Camera and technical specifications
 */
export const CAMERA_SPECS = {
  professional: 'shot on Canon 5D Mark IV with 85mm f/1.4 lens',
  product_macro: 'shot on Hasselblad medium format with 120mm macro lens',
  lifestyle: 'shot on Sony A7III with 35mm f/1.4 lens',
  smartphone: 'shot on iPhone 15 Pro',
  cinematic: 'shot on RED camera with anamorphic lens',
};

/**
 * Negative prompts that should always be included for quality
 */
export const UNIVERSAL_NEGATIVE_PROMPTS = [
  'low quality',
  'blurry',
  'pixelated',
  'distorted',
  'artifacts',
  'watermark',
  'text overlay',
  'poor composition',
  'amateur',
  'unprofessional',
  'bad anatomy',
  'disfigured',
  'poorly drawn',
  'mutation',
  'extra limbs',
  'ugly',
  'poorly rendered',
  'bad lighting',
].join(', ');
