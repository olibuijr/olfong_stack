/**
 * AI Product Image Prompt Builder
 * Generates optimized prompts for FLUX.1 Kontext with watermark removal
 */

// Shadow style presets
const SHADOW_PRESETS = {
  minimal: 'subtle minimal drop shadow barely visible',
  soft: 'soft realistic drop shadow beneath the product for depth and dimension',
  dramatic: 'strong dramatic shadow with defined edges for visual impact'
};

// Background color descriptions
const BACKGROUND_COLORS = {
  '#FFFFFF': 'pure white',
  '#F3F4F6': 'light gray',
  '#FFF8F0': 'warm white with slight cream tone',
  '#F0F9FF': 'cool white with slight blue tone',
};

// Icelandic landscape themes based on product characteristics
const ICELANDIC_THEMES = {
  beer: {
    theme: 'rugged volcanic landscape with black sand beaches, dark basalt columns, and moody Nordic sky',
    lighting: 'dramatic overcast northern light with hints of midnight sun glow',
    atmosphere: 'raw, untamed Icelandic wilderness with glacial mists'
  },
  wine: {
    red: {
      theme: 'majestic red lava fields with moss-covered rocks, sunset golden hour light on glacier peaks',
      lighting: 'warm golden hour light with cool glacier highlights',
      atmosphere: 'dramatic contrast between warm earth tones and cool Nordic elements'
    },
    white: {
      theme: 'serene ice glacier with pristine white waterfalls, crystalline blue glacier lakes',
      lighting: 'cool bright Nordic light reflecting off ice and water',
      atmosphere: 'pure, pristine Icelandic ice landscape with fresh cold air'
    },
    rose: {
      theme: 'soft pink volcanic sand beaches with gentle northern lights aurora borealis dancing above',
      lighting: 'ethereal aurora borealis and soft twilight Nordic glow',
      atmosphere: 'magical mystical Icelandic night sky with geothermal warmth'
    }
  }
};

/**
 * Get Icelandic theme based on product type and color
 */
function getIcelandicTheme(productType = 'beer', productColor = 'default') {
  if (productType === 'wine') {
    if (productColor.toLowerCase().includes('red')) {
      return ICELANDIC_THEMES.wine.red;
    } else if (productColor.toLowerCase().includes('white')) {
      return ICELANDIC_THEMES.wine.white;
    } else if (productColor.toLowerCase().includes('rose')) {
      return ICELANDIC_THEMES.wine.rose;
    }
    return ICELANDIC_THEMES.wine.red; // Default to red theme
  }
  return ICELANDIC_THEMES.beer;
}

/**
 * Build FLUX Kontext prompt
 * FLUX Kontext understands spatial editing instructions
 * It preserves the main subject and modifies specified areas
 *
 * @param {Object} options - Generation options
 * @param {string} options.shadowStyle - Shadow style (minimal, soft, dramatic)
 * @param {string} options.backgroundColor - Background color hex
 * @param {string} options.customInstructions - Additional custom instructions
 * @param {string} options.productType - Product type (beer, wine, spirits)
 * @param {string} options.productColor - Product color (red, white, rose for wines)
 * @returns {Object} Complete prompt object for FLUX Kontext
 */
function buildPrompt(options = {}) {
  const {
    shadowStyle = 'soft',
    backgroundColor = '#FFFFFF',
    customInstructions = '',
    productType = 'beer',
    productColor = 'default'
  } = options;

  const shadowDescription = SHADOW_PRESETS[shadowStyle] || SHADOW_PRESETS.soft;
  const icelandicTheme = getIcelandicTheme(productType, productColor);

  // FLUX Kontext specific prompt structure
  // Uses imperative instructions that FLUX understands
  // Key: Explicit preserve instruction + explicit generation target
  const basePrompt = `
PRESERVE EXACTLY: The product in the center must remain completely unchanged - same exact shape, all labels perfectly readable, brand text crystal clear, colors identical, no modifications whatsoever. The bottle/can/product MUST be exactly as it appears in the input image.

GENERATE IN WHITE AREAS: Fill all white background areas surrounding the product with a stunning, photorealistic, premium Icelandic landscape. Specifically:
- ${icelandicTheme.theme}
- ${icelandicTheme.lighting}
- ${icelandicTheme.atmosphere}
- Deep depth and dimensionality with natural perspective and bokeh
- Seamless integration where landscape meets product without visible edges or borders

REMOVE WATERMARKS: Remove completely any "VÍNBÚÐIN", "vinbudin.is", "ÁTVR", or other watermarks, logos, or text if present. Clean seamless removal only - do not leave white spots.

ADD SHADOW: Add ${shadowDescription} beneath the product for depth and visual dimension.

OUTPUT REQUIREMENTS: Full perfect 1024x1024 image with absolutely no white borders, no cropping, perfect square composition, product perfectly centered. Professional product photography quality with premium styling.
`.trim();

  const negativePrompt = `
changing product, substituting different products, altering bottle to can, can to bottle, modifying any labels, changing brand names, different product colors, wrong material, recreating from memory, wrong container shape, low quality, blurry, distorted, white borders, cropped, portrait orientation, landscape orientation, aspect ratio wrong, product not centered, watermark visible, text unclear, double products, duplicate bottles, clones, repeating patterns, amateur quality, cartoon style, CGI obvious, computer generated obvious, unnatural lighting, plastic appearance, glossy unrealistic, oversaturated colors
  `.trim();

  // Add custom instructions if provided
  let finalPrompt = basePrompt;
  if (customInstructions && customInstructions.trim()) {
    finalPrompt = `${basePrompt}\n\nADDITIONAL INSTRUCTIONS: ${customInstructions}`;
  }

  return {
    prompt: finalPrompt,
    negativePrompt: negativePrompt
  };
}

/**
 * Build A/B testing prompts with variations for FLUX Kontext
 *
 * @returns {Array<{name: string, prompt: Object}>} Array of prompt variations
 */
function buildAbTestPrompts() {
  return [
    {
      name: 'Minimal Shadow',
      prompt: buildPrompt({ shadowStyle: 'minimal' })
    },
    {
      name: 'Soft Shadow (Recommended)',
      prompt: buildPrompt({ shadowStyle: 'soft' })
    },
    {
      name: 'Dramatic Shadow',
      prompt: buildPrompt({ shadowStyle: 'dramatic' })
    }
  ];
}

module.exports = {
  buildPrompt,
  buildAbTestPrompts,
  getIcelandicTheme,
  SHADOW_PRESETS,
  BACKGROUND_COLORS,
  ICELANDIC_THEMES
};
