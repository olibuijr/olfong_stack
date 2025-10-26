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
 * Call RunPod FLUX Kontext API
 */
async function callRunPodAPI(imageUrl, prompt, options = {}) {
  const settings = await getSettings();
  const apiKey = settings.runpodApiKey;

  if (!apiKey) {
    throw new Error('RunPod API key not configured');
  }

  const resolution = settings.aiImageResolution || '1024';
  const inferenceSteps = parseInt(settings.aiImageInferenceSteps) || 28;
  const guidance = parseFloat(settings.aiImageGuidance) || 3.5;

  const endpoint = 'https://api.runpod.ai/v2/black-forest-labs-flux-1-kontext-dev/run';

  const requestBody = {
    input: {
      image: imageUrl,
      prompt: prompt,
      size: `${resolution}*${resolution}`,
      num_inference_steps: inferenceSteps,
      guidance: guidance,
      seed: options.seed || -1,
      output_format: 'png',
      enable_safety_checker: false
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`RunPod API error: ${error}`);
  }

  return await response.json();
}

/**
 * Poll RunPod for job status
 */
async function pollRunPodStatus(jobId) {
  const settings = await getSettings();
  const apiKey = settings.runpodApiKey;

  const endpoint = `https://api.runpod.ai/v2/black-forest-labs-flux-1-kontext-dev/status/${jobId}`;

  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get job status');
  }

  return await response.json();
}

/**
 * Download image from URL and save to uploads as WebP
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

  // Convert to WebP format for better compression
  const webpBuffer = await sharp(buffer)
    .webp({ quality: 85 })
    .toBuffer();

  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, webpBuffer);

  return `/uploads/products/${filename}`;
}

/**
 * Generate single product image
 * POST /api/ai-image/generate/:mediaId
 */
exports.generateProductImage = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const options = req.body || {};

    // Fetch media record
    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    if (!media.mimeType.startsWith('image/')) {
      return res.status(400).json({ error: 'Media must be an image' });
    }

    // Build prompt with watermark removal
    const prompt = buildPrompt({
      shadowStyle: options.shadowStyle,
      backgroundColor: options.backgroundColor,
      customInstructions: options.customInstructions
    });

    // Construct full image URL
    // Use publicly accessible hostname or fallback to request host
    // RunPod needs an externally accessible URL, not a local IP
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
    console.log('DEBUG: PUBLIC_URL env:', process.env.PUBLIC_URL);
    console.log('DEBUG: Constructed hostname:', hostname);
    console.log('DEBUG: media.url:', media.url);
    console.log('DEBUG: Final imageUrl sent to RunPod:', imageUrl);

    // Call RunPod API
    const result = await callRunPodAPI(imageUrl, prompt, options);

    // Store job mapping
    jobMappings.set(result.id, {
      mediaId,
      userId: req.user.id,
      options,
      createdAt: Date.now()
    });

    res.json({
      success: true,
      jobId: result.id,
      status: result.status,
      message: 'Generation started'
    });

  } catch (error) {
    console.error('Generate product image error:', error);
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
      const mapping = jobMappings.get(jobId);

      if (mapping) {
        const { mediaId } = mapping;

        // Download generated image
        const filename = `ai-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.webp`;
        const imageUrl = status.output.result || status.output.image_url;
        const localPath = await downloadImage(imageUrl, filename);

        // Get settings for MEDIA_BASE_URL
        const settings = await getSettings();
        const mediaBaseUrl = settings.mediaBaseUrl || process.env.MEDIA_BASE_URL || 'http://localhost:5000';
        const absoluteUrl = `${mediaBaseUrl}${localPath}`;

        // Update media record with absolute URL so frontend can load it
        const updatedMedia = await prisma.media.update({
          where: { id: mediaId },
          data: {
            url: absoluteUrl,
            thumbnailUrl: absoluteUrl,
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
              imageUrl: absoluteUrl,
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

    for (let i = 0; i < Math.min(maxConcurrent, queue.length); i++) {
      const mediaId = queue.shift();
      const media = mediaRecords.find(m => m.id === mediaId);

      const prompt = buildPrompt(options);
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

      const result = await callRunPodAPI(imageUrl, prompt, options);

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
      const result = await callRunPodAPI(imageUrl, prompt);

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

        // Download and save
        const filename = `ai-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.webp`;
        const imageUrl = output.result || output.image_url;
        const localPath = await downloadImage(imageUrl, filename);

        // Get settings for MEDIA_BASE_URL
        const settings = await getSettings();
        const mediaBaseUrl = settings.mediaBaseUrl || process.env.MEDIA_BASE_URL || 'http://localhost:5000';
        const absoluteUrl = `${mediaBaseUrl}${localPath}`;

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
