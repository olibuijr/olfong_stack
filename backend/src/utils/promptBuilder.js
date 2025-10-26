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

/**
 * Get background color description
 */
function getBackgroundDescription(hexColor) {
  return BACKGROUND_COLORS[hexColor] || `custom color ${hexColor}`;
}

/**
 * Build FLUX Kontext prompt with watermark removal
 *
 * @param {Object} options - Generation options
 * @param {string} options.shadowStyle - Shadow style (minimal, soft, dramatic)
 * @param {string} options.backgroundColor - Background color hex
 * @param {string} options.customInstructions - Additional custom instructions
 * @returns {string} Complete prompt for FLUX Kontext
 */
function buildPrompt(options = {}) {
  const {
    shadowStyle = 'soft',
    backgroundColor = '#FFFFFF',
    customInstructions = ''
  } = options;

  const shadowDescription = SHADOW_PRESETS[shadowStyle] || SHADOW_PRESETS.soft;
  const backgroundDescription = getBackgroundDescription(backgroundColor);

  const basePrompt = `Replace the background with a clean professional ${backgroundDescription} studio background.
Add a ${shadowDescription}.
Keep the product in the exact same position, scale, and orientation.
Preserve all original product details, textures, colors, labels, and text that are printed on the product packaging itself.
Remove watermarks, website logos, brand overlays, and any text/logos that are NOT part of the original product packaging (such as photographer watermarks, retail site logos).
Enhance clarity and visibility of the product's own labels and text while removing external overlays.
Professional commercial product photography style with even studio lighting.
High quality, sharp focus, commercial e-commerce standard.`;

  // Add custom instructions if provided
  if (customInstructions.trim()) {
    return `${basePrompt}\n${customInstructions}`;
  }

  return basePrompt;
}

/**
 * Build A/B testing prompts with variations
 *
 * @returns {Array<{name: string, prompt: string}>} Array of prompt variations
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
  SHADOW_PRESETS,
  BACKGROUND_COLORS
};
