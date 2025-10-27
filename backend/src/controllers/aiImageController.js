const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { buildPrompt, buildAbTestPrompts } = require('../utils/promptBuilder');

const prisma = new PrismaClient();

// In-memory job mappings (use Redis in production)
const jobMappings = new Map();

/**
 * Get settings from database
 */
async function getSettings() {
  const settings = await prisma.setting.findMany({
    where: {
      OR: [
        { category: 'API_KEYS' },
        { category: 'AI_IMAGE' }
      ]
    }
  });

  const config = {};
  settings.forEach(s => {
    config[s.key] = s.value;
  });

  return config;
}

/**
 * Call RunPod FLUX Kontext Dev API
 * FLUX Kontext is designed for instruction-based image editing
 * Perfect for filling white backgrounds with generated scenery while preserving the product
 */
async function callFluxKontextAPI(imageUrl, promptData) {
  const settings = await getSettings();
  const apiKey = settings.runpodApiKey;

  if (!apiKey) {
    throw new Error('RunPod API key not configured');
  }

  // FLUX Kontext Dev endpoint - correct RunPod domain and format
  const endpoint = 'https://api.runpod.ai/v2/black-forest-labs-flux-1-kontext-dev/run';

  // Extract prompt from promptData
  const prompt = typeof promptData === 'string' ? promptData : promptData.prompt;

  // FLUX Kontext request format - based on RunPod API documentation
  // FLUX Kontext understands spatial editing instructions
  // It preserves the main subject and modifies only the areas specified
  const requestBody = {
    input: {
      image: imageUrl,
      prompt: prompt,
      negative_prompt: '',
      size: '1024*1024',  // Format: "WxH" or "W*H"
      guidance: 3.5,  // Guidance scale 2-5 for Kontext Dev (lower = more creative, higher = more prompt-following)
      num_inference_steps: 28,  // Optimal range 20-40
      seed: -1,  // Random seed
      output_format: 'png',
      enable_safety_checker: false
    }
  };

  console.log('DEBUG: Calling FLUX Kontext Dev API');
  console.log('DEBUG: Endpoint:', endpoint);
  console.log('DEBUG: Request body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody),
    timeout: 300000  // 5 minute timeout for FLUX
  });

  console.log('DEBUG: FLUX response status:', response.status);

  if (!response.ok) {
    const error = await response.text();
    console.error('DEBUG: FLUX API error response:', error);
    throw new Error(`FLUX Kontext API error: ${error}`);
  }

  const result = await response.json();
  console.log('DEBUG: FLUX API response:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * Poll RunPod for job status
 */
async function pollRunPodStatus(jobId) {
  const settings = await getSettings();
  const apiKey = settings.runpodApiKey;

  const endpoint = `https://api.runpod.ai/v2/black-forest-labs-flux-1-kontext-dev/status/${jobId}`;

  console.log('DEBUG: Polling RunPod FLUX Kontext Dev status for job:', jobId);

  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  console.log('DEBUG: RunPod status response code:', response.status);

  if (!response.ok) {
    const error = await response.text();
    console.error('DEBUG: RunPod status error:', error);
    throw new Error('Failed to get job status: ' + error);
  }

  const result = await response.json();
  console.log('DEBUG: RunPod status response:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * Pre-process ATVR image to 1024x1024 with white background
 * This creates the canvas that AI will fill with Icelandic landscape
 */
async function preprocessImageToSquare(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download image for preprocessing: ${response.statusText}`);
  }

  const buffer = await response.buffer();
  const uploadDir = path.join(__dirname, '../../uploads/products');
  await fs.mkdir(uploadDir, { recursive: true });

  // Resize to 1024x1024 with WHITE background padding
  // The product will be centered with white space around it
  // AI will then fill the white space with Icelandic landscape
  const preprocessedBuffer = await sharp(buffer)
    .resize(1024, 1024, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255 } // WHITE background
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } }) // Flatten any transparency
    .toFormat('jpeg', { quality: 95 }) // Use JPEG for better compatibility with RunPod
    .toBuffer();

  const filename = `preprocessed-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.jpg`;
  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, preprocessedBuffer);

  return `products/${filename}`;
}

/**
 * Validate image is exactly 1024x1024 with no cropping or distortion
 * FLUX Kontext should output perfect squares - this validates that
 */
async function validateImageDimensions(filePath, expectedSize = 1024) {
  try {
    const metadata = await sharp(filePath).metadata();

    console.log(`DEBUG: Validating image dimensions - ${metadata.width}x${metadata.height}`);

    // Must be exactly 1024x1024
    if (metadata.width !== expectedSize || metadata.height !== expectedSize) {
      throw new Error(
        `Image dimensions invalid: got ${metadata.width}x${metadata.height}, ` +
        `expected ${expectedSize}x${expectedSize}. FLUX may have cropped or distorted the image.`
      );
    }

    // Check if image is square (aspect ratio must be 1:1)
    const aspectRatio = metadata.width / metadata.height;
    if (Math.abs(aspectRatio - 1.0) > 0.01) {
      throw new Error(
        `Image aspect ratio invalid: ${aspectRatio.toFixed(2)}:1, ` +
        `expected 1:1 square. Image is distorted.`
      );
    }

    console.log('DEBUG: Image validation passed - perfect 1024x1024 square');
    return true;
  } catch (error) {
    console.error('DEBUG: Image validation failed:', error.message);
    throw error;
  }
}

/**
 * Download AI-generated image and validate it's 1024x1024
 */
async function downloadImage(url, filename) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const buffer = await response.buffer();
  const uploadDir = path.join(__dirname, '../../uploads/products');

  // Ensure directory exists
  await fs.mkdir(uploadDir, { recursive: true });

  // FLUX Kontext should return 1024x1024 directly
  // Flatten and convert to PNG format for consistency
  const processedBuffer = await sharp(buffer)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png({ quality: 95 })
    .toBuffer();

  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, processedBuffer);

  // ✅ CRITICAL: Validate image dimensions before returning
  // This ensures FLUX generated a perfect 1024x1024 square with no cropping
  await validateImageDimensions(filepath, 1024);

  // Return relative path (not starting with /) so imageServeController can resolve it correctly
  return `products/${filename}`;
}

/**
 * Generate single product image
 * POST /api/ai-image/generate/:mediaId
 */
exports.generateProductImage = async (req, res) => {
  try {
    console.log('DEBUG: generateProductImage called with params:', req.params);
    const { mediaId } = req.params;
    const options = req.body || {};

    // Fetch media record
    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      console.error('DEBUG: Media not found for ID:', mediaId);
      return res.status(404).json({ error: 'Media not found' });
    }

    if (!media.mimeType.startsWith('image/')) {
      return res.status(400).json({ error: 'Media must be an image' });
    }

    // CRITICAL FIX: Always use original ATVR image as source, not AI-generated images
    // Check if this media is linked to a product with an atvrImageUrl
    const linkedProduct = await prisma.product.findFirst({
      where: { mediaId: mediaId }
    });

    let sourceImageUrl = media.url;
    if (linkedProduct && linkedProduct.atvrImageUrl) {
      console.log('DEBUG: Using original ATVR image URL instead of current media URL');
      sourceImageUrl = linkedProduct.atvrImageUrl;
    }

    console.log('DEBUG: Found media:', { id: media.id, url: media.url, sourceImageUrl });

    // Build prompt with watermark removal
    const prompt = buildPrompt({
      shadowStyle: options.shadowStyle,
      backgroundColor: options.backgroundColor,
      customInstructions: options.customInstructions
    });

    // PRE-PROCESS: Create 1024x1024 white-background image for AI to fill
    // qwen-image-edit maintains source dimensions, so we need to give it 1024x1024 input
    console.log('DEBUG: Pre-processing image to 1024x1024 with white background...');
    const preprocessedPath = await preprocessImageToSquare(sourceImageUrl);
    console.log('DEBUG: Preprocessed image saved to:', preprocessedPath);

    // Construct full image URL for the preprocessed image
    // Use publicly accessible hostname or fallback to request host
    // RunPod needs an externally accessible URL, not a local IP
    const hostname = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${hostname}/${preprocessedPath}`;

    console.log('DEBUG: PUBLIC_URL env:', process.env.PUBLIC_URL);
    console.log('DEBUG: Constructed hostname:', hostname);
    console.log('DEBUG: Preprocessed image URL sent to RunPod:', imageUrl);

    // Call FLUX Kontext API with the preprocessed 1024x1024 white-background image
    console.log('DEBUG: About to call FLUX Kontext API...');
    const result = await callFluxKontextAPI(imageUrl, prompt);
    console.log('DEBUG: FLUX Kontext API returned successfully, jobId:', result.id);

    // Store job mapping in memory
    jobMappings.set(result.id, {
      mediaId,
      userId: req.user?.id,
      options,
      createdAt: Date.now()
    });

    // Store jobId in database for progress persistence across page refreshes
    await prisma.media.update({
      where: { id: mediaId },
      data: { jobId: result.id }
    });

    console.log('DEBUG: Returning response with jobId:', result.id);
    res.json({
      success: true,
      jobId: result.id,
      status: result.status,
      message: 'Generation started'
    });

  } catch (error) {
    console.error('Generate product image error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get generation status
 * GET /api/ai-image/status/:jobId
 */
exports.getGenerationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    const status = await pollRunPodStatus(jobId);

    // Log the full status response for debugging
    console.log(`Job ${jobId} status:`, JSON.stringify(status, null, 2));

    // Handle FAILED status
    if (status.status === 'FAILED') {
      const errorMsg = status.error || status.errors?.join(', ') || 'Unknown error occurred';
      console.error(`Generation failed for job ${jobId}: ${errorMsg}`);
      return res.json({
        success: false,
        status: 'FAILED',
        error: errorMsg
      });
    }

    // If completed, download and replace image
    if (status.status === 'COMPLETED' && status.output) {
      let mapping = jobMappings.get(jobId);

      // If mapping not in memory, look it up in database by jobId
      if (!mapping) {
        console.log(`Mapping not in memory for job ${jobId}, looking up in database...`);
        const mediaRecord = await prisma.media.findFirst({
          where: { jobId: jobId }
        });

        if (mediaRecord) {
          mapping = { mediaId: mediaRecord.id };
          console.log(`Found mediaId ${mediaRecord.id} in database for job ${jobId}`);
        }
      }

      if (mapping) {
        const { mediaId } = mapping;

        // Download generated image (PNG from RunPod)
        const filename = `ai-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.png`;
        const imageUrl = status.output.image_url || status.output.result;  // Kontext returns image_url
        if (!imageUrl) {
          throw new Error('No image URL in RunPod response: ' + JSON.stringify(status.output));
        }
        const localPath = await downloadImage(imageUrl, filename);

        // Get settings for MEDIA_BASE_URL
        const settings = await getSettings();
        const mediaBaseUrl = settings.mediaBaseUrl || process.env.MEDIA_BASE_URL || process.env.PUBLIC_URL || 'https://olfong.olibuijr.com';

        // Images are served through /api/images/:id endpoint, not direct file paths
        // Add cache-busting timestamp to force browser reload
        const timestamp = Date.now();
        const apiUrl = `${mediaBaseUrl}/api/images/${mediaId}?v=${timestamp}`;

        // Update media record with API URL, local path, and clear jobId
        const updatedMedia = await prisma.media.update({
          where: { id: mediaId },
          data: {
            url: apiUrl,
            thumbnailUrl: apiUrl,
            path: localPath, // Store local filesystem path for serving
            jobId: null, // Clear jobId since generation is complete
            updatedAt: new Date()
          }
        });

        // Update any products linked to this media via mediaId
        const linkedProducts = await prisma.product.findMany({
          where: { mediaId: mediaId }
        });

        if (linkedProducts.length > 0) {
          await prisma.product.updateMany({
            where: { mediaId: mediaId },
            data: {
              imageUrl: apiUrl,
              updatedAt: new Date()
            }
          });
          console.log(`Updated ${linkedProducts.length} products linked to media ${mediaId}`);
        }

        // Clean up job mapping
        jobMappings.delete(jobId);

        return res.json({
          success: true,
          status: 'COMPLETED',
          media: updatedMedia,
          generationTime: status.output.generation_time || status.executionTime
        });
      }
    }

    res.json({
      success: true,
      status: status.status,
      ...(status.output && { output: status.output })
    });

  } catch (error) {
    console.error('Get generation status error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Batch generate images
 * POST /api/ai-image/batch
 */
exports.batchGenerateImages = async (req, res) => {
  try {
    const { mediaIds, options = {} } = req.body;

    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({ error: 'mediaIds array is required' });
    }

    const settings = await getSettings();
    const maxConcurrent = parseInt(settings.aiImageMaxConcurrent) || 3;

    // Validate all media exist
    const mediaRecords = await prisma.media.findMany({
      where: {
        id: { in: mediaIds }
      }
    });

    if (mediaRecords.length !== mediaIds.length) {
      return res.status(400).json({ error: 'Some media records not found' });
    }

    // Start initial batch
    const jobs = [];
    const queue = [...mediaIds];
    const hostname = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;

    // Get all linked products for these media to access original ATVR images
    const linkedProducts = await prisma.product.findMany({
      where: { mediaId: { in: mediaIds } }
    });

    for (let i = 0; i < Math.min(maxConcurrent, queue.length); i++) {
      const mediaId = queue.shift();
      const media = mediaRecords.find(m => m.id === mediaId);

      // CRITICAL FIX: Always use original ATVR image as source
      const linkedProduct = linkedProducts.find(p => p.mediaId === mediaId);
      let sourceImageUrl = media.url;
      if (linkedProduct && linkedProduct.atvrImageUrl) {
        sourceImageUrl = linkedProduct.atvrImageUrl;
      }

      // PRE-PROCESS: Create 1024x1024 white-background image for AI to fill
      const preprocessedPath = await preprocessImageToSquare(sourceImageUrl);
      const imageUrl = `${hostname}/${preprocessedPath}`;

      const prompt = buildPrompt(options);
      const result = await callFluxKontextAPI(imageUrl, prompt);

      jobMappings.set(result.id, {
        mediaId,
        userId: req.user.id,
        options,
        createdAt: Date.now()
      });

      jobs.push({
        mediaId,
        jobId: result.id,
        status: result.status
      });
    }

    res.json({
      success: true,
      jobs,
      remainingInQueue: queue.length,
      message: `Started ${jobs.length} generations, ${queue.length} in queue`
    });

  } catch (error) {
    console.error('Batch generate error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate A/B test variations
 * POST /api/ai-image/variations/:mediaId
 */
exports.generateVariations = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { customPrompts = [] } = req.body;

    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Get base prompts + custom prompts
    const basePrompts = buildAbTestPrompts();
    const allPrompts = [...basePrompts, ...customPrompts.map((p, i) => ({
      name: `Custom ${i + 1}`,
      prompt: p
    }))];

    const hostname = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
    let imageUrl;
    if (media.url.startsWith('http')) {
      // Replace the host in the full URL with the public URL
      try {
        const url = new URL(media.url);
        const pathAndQuery = url.pathname + url.search;
        imageUrl = `${hostname}${pathAndQuery}`;
      } catch (e) {
        // Fallback if URL parsing fails
        imageUrl = media.url;
      }
    } else {
      imageUrl = `${hostname}${media.url}`;
    }

    // Start all variations
    const variations = [];

    for (const { name, prompt } of allPrompts) {
      const result = await callFluxKontextAPI(imageUrl, prompt);

      jobMappings.set(result.id, {
        mediaId,
        userId: req.user.id,
        variationName: name,
        createdAt: Date.now()
      });

      variations.push({
        name,
        jobId: result.id,
        status: result.status
      });
    }

    res.json({
      success: true,
      variations,
      message: `Started ${variations.length} A/B test variations`
    });

  } catch (error) {
    console.error('Generate variations error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get AI image settings
 * GET /api/ai-image/settings
 */
exports.getAISettings = async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get AI settings error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update AI image settings
 * PUT /api/ai-image/settings
 */
exports.updateAISettings = async (req, res) => {
  try {
    const updates = req.body;

    const updatePromises = Object.entries(updates).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: {
          key,
          value: String(value),
          category: 'AI_IMAGE',
          description: `AI Image setting: ${key}`
        }
      });
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Settings updated'
    });

  } catch (error) {
    console.error('Update AI settings error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Webhook handler (future enhancement)
 * POST /api/ai-image/webhook
 */
exports.handleWebhook = async (req, res) => {
  try {
    const { id, status, output } = req.body;

    if (status === 'COMPLETED') {
      const mapping = jobMappings.get(id);

      if (mapping) {
        const { mediaId } = mapping;

        // Download and save (PNG from RunPod)
        const filename = `ai-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.png`;
        const imageUrl = output.result || output.image_url;
        const localPath = await downloadImage(imageUrl, filename);

        // Get settings for MEDIA_BASE_URL
        const settings = await getSettings();
        const mediaBaseUrl = settings.mediaBaseUrl || process.env.MEDIA_BASE_URL || process.env.PUBLIC_URL || 'https://olfong.olibuijr.com';
        // Add cache-busting timestamp to force browser reload
        const timestamp = Date.now();
        const absoluteUrl = `${mediaBaseUrl}${localPath}?v=${timestamp}`;

        // Update media with absolute URL
        await prisma.media.update({
          where: { id: mediaId },
          data: {
            url: absoluteUrl,
            thumbnailUrl: absoluteUrl
          }
        });

        // Update any products linked to this media via mediaId
        const linkedProducts = await prisma.product.findMany({
          where: { mediaId: mediaId }
        });

        if (linkedProducts.length > 0) {
          await prisma.product.updateMany({
            where: { mediaId: mediaId },
            data: {
              imageUrl: absoluteUrl,
              updatedAt: new Date()
            }
          });
          console.log(`Webhook: Updated ${linkedProducts.length} products linked to media ${mediaId}`);
        }

        // Clean up
        jobMappings.delete(id);
      }
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Link a product to a media record
 * PUT /api/ai-image/link-product
 */
exports.linkProductToMedia = async (req, res) => {
  try {
    const { productId, mediaId } = req.body;

    if (!productId || !mediaId) {
      return res.status(400).json({
        error: 'productId and mediaId are required'
      });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Verify media exists
    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Link product to media and sync imageUrl
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: {
        mediaId: mediaId,
        imageUrl: media.url,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: `Product ${productId} linked to media ${mediaId}`,
      product: updatedProduct
    });

  } catch (error) {
    console.error('Link product to media error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all ongoing AI generation jobs
 * GET /api/ai-image/ongoing-jobs
 */
exports.getOngoingJobs = async (req, res) => {
  try {
    // Find all media records with non-null jobId
    const ongoingJobs = await prisma.media.findMany({
      where: {
        jobId: { not: null }
      },
      select: {
        id: true,
        jobId: true,
        products: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Build response with job mappings
    const jobMappings = {};
    ongoingJobs.forEach(media => {
      jobMappings[media.id] = media.jobId;
    });

    res.json({
      success: true,
      ongoingJobs: ongoingJobs,
      jobMappings: jobMappings
    });

  } catch (error) {
    console.error('Get ongoing jobs error:', error);
    res.status(500).json({ error: error.message });
  }
};
