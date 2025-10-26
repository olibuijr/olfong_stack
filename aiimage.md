# AI Product Image Generation - Complete Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Changes](#database-changes)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [API Documentation](#api-documentation)
7. [Testing Guide](#testing-guide)
8. [Deployment Checklist](#deployment-checklist)
9. [Cost Analysis](#cost-analysis)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### What This Implements
A complete AI-powered product image generation system that:
- Transforms product images into professional white-background photos with realistic shadows
- Removes watermarks and unwanted overlays
- Provides batch processing, shadow presets, custom backgrounds, upscaling, and A/B testing
- Integrates directly into the admin media manager
- Uses RunPod's FLUX.1 Kontext API

### Key Features
- ✅ Single image generation with white background + shadow
- ✅ **Watermark removal** built into prompts
- ✅ Batch processing (multiple products simultaneously)
- ✅ 3 shadow presets (minimal, soft, dramatic)
- ✅ Custom background colors
- ✅ Automatic image upscaling (2x, 4x)
- ✅ A/B testing with prompt variations
- ✅ Webhook support (no polling needed)
- ✅ RunPod API key stored in database
- ✅ AI Settings panel in Media Manager

### Technology Stack
- **AI Model**: FLUX.1 Kontext [dev] by Black Forest Labs
- **Platform**: RunPod Serverless GPU
- **Backend**: Node.js/Express with Prisma
- **Frontend**: React with Redux
- **Database**: PostgreSQL

### Cost Breakdown
- Base generation (1024×1024): **$0.03/image**
- With upscaling (2048×2048): **$0.05/image**
- A/B testing (3 variations): **$0.09/image**
- Estimated monthly for 1000 images: **~$30-60**

---

## Architecture

### System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Admin Media Manager                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ MediaGrid  │  │   Media    │  │  Settings  │                │
│  │  + AI Btn  │  │ + AI Panel │  │ + RunPod   │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API Layer                             │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  AI Image Controller                                    │    │
│  │  - generateProductImage()                               │    │
│  │  - batchGenerateImages()                                │    │
│  │  - generateVariations() [A/B Testing]                   │    │
│  │  - upscaleImage()                                       │    │
│  │  - handleRunPodWebhook()                                │    │
│  └────────────────────────────────────────────────────────┘    │
│                            │                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Prompt Builder Utility                                 │    │
│  │  - Shadow presets (minimal/soft/dramatic)               │    │
│  │  - Background color templates                           │    │
│  │  - **Watermark removal instructions**                   │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RunPod FLUX API                               │
│  - POST /run (start generation)                                 │
│  - GET /status/{jobId} (check status)                           │
│  - Webhook callback (completion notification)                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                         │
│  - Settings table (API keys + AI config)                        │
│  - Media table (product images)                                 │
│  - Job mappings (jobId → mediaId)                               │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

**Single Image Generation:**
1. User clicks "AI" button on product image in MediaGrid
2. Frontend opens AIProductImageModal with options
3. User selects shadow style, background color, optional upscaling
4. POST `/api/ai-image/generate/:mediaId` with options
5. Backend fetches media record, builds prompt with watermark removal
6. Backend calls RunPod FLUX Kontext API
7. RunPod queues job, returns jobId
8. Frontend polls `/api/ai-image/status/:jobId` every 2 seconds
9. RunPod completes generation (~10-15 seconds)
10. Backend downloads generated image, replaces original in media library
11. Frontend shows before/after comparison, auto-replaces after 3 seconds
12. All products using that media automatically use new image

**Batch Processing:**
1. User selects multiple images, clicks "AI Generate (X)"
2. Frontend shows BatchAIProgressModal
3. POST `/api/ai-image/batch` with mediaIds array
4. Backend processes with queue (max 3 concurrent)
5. Each image generates independently
6. Progress updates in real-time via polling or WebSocket
7. Completed images replace originals progressively

---

## Database Changes

### 1. Add to Settings Table (via seed file)

**File**: `backend/prisma/database-export.json`

Add these entries to the `settings` array:

```json
{
  "id": 100,
  "key": "runpodApiKey",
  "value": "rpa_8U1ILN00554RZNNOOLLCAT0288Z1HKUE4KIXGNE51jcn6m",
  "description": "RunPod API key for AI image generation with FLUX models",
  "category": "API_KEYS",
  "isEncrypted": false,
  "isPublic": false,
  "createdAt": "2025-01-26T00:00:00.000Z",
  "updatedAt": "2025-01-26T00:00:00.000Z"
},
{
  "id": 101,
  "key": "aiImageEnabled",
  "value": "true",
  "description": "Enable AI product image generation",
  "category": "AI_IMAGE",
  "isEncrypted": false,
  "isPublic": false,
  "createdAt": "2025-01-26T00:00:00.000Z",
  "updatedAt": "2025-01-26T00:00:00.000Z"
},
{
  "id": 102,
  "key": "aiImageDefaultShadow",
  "value": "soft",
  "description": "Default shadow style: minimal, soft, dramatic",
  "category": "AI_IMAGE",
  "isEncrypted": false,
  "isPublic": false,
  "createdAt": "2025-01-26T00:00:00.000Z",
  "updatedAt": "2025-01-26T00:00:00.000Z"
},
{
  "id": 103,
  "key": "aiImageDefaultBackground",
  "value": "#FFFFFF",
  "description": "Default background color (hex)",
  "category": "AI_IMAGE",
  "isEncrypted": false,
  "isPublic": false,
  "createdAt": "2025-01-26T00:00:00.000Z",
  "updatedAt": "2025-01-26T00:00:00.000Z"
},
{
  "id": 104,
  "key": "aiImageInferenceSteps",
  "value": "28",
  "description": "Number of inference steps (20-40)",
  "category": "AI_IMAGE",
  "isEncrypted": false,
  "isPublic": false,
  "createdAt": "2025-01-26T00:00:00.000Z",
  "updatedAt": "2025-01-26T00:00:00.000Z"
},
{
  "id": 105,
  "key": "aiImageGuidance",
  "value": "3.5",
  "description": "Guidance scale (2-5)",
  "category": "AI_IMAGE",
  "isEncrypted": false,
  "isPublic": false,
  "createdAt": "2025-01-26T00:00:00.000Z",
  "updatedAt": "2025-01-26T00:00:00.000Z"
},
{
  "id": 106,
  "key": "aiImageResolution",
  "value": "1024",
  "description": "Output resolution (1024, 1536, 2048)",
  "category": "AI_IMAGE",
  "isEncrypted": false,
  "isPublic": false,
  "createdAt": "2025-01-26T00:00:00.000Z",
  "updatedAt": "2025-01-26T00:00:00.000Z"
},
{
  "id": 107,
  "key": "aiImageEnableUpscaling",
  "value": "false",
  "description": "Enable automatic upscaling after generation",
  "category": "AI_IMAGE",
  "isEncrypted": false,
  "isPublic": false,
  "createdAt": "2025-01-26T00:00:00.000Z",
  "updatedAt": "2025-01-26T00:00:00.000Z"
},
{
  "id": 108,
  "key": "aiImageMaxConcurrent",
  "value": "3",
  "description": "Maximum concurrent generations in batch mode",
  "category": "AI_IMAGE",
  "isEncrypted": false,
  "isPublic": false,
  "createdAt": "2025-01-26T00:00:00.000Z",
  "updatedAt": "2025-01-26T00:00:00.000Z"
},
{
  "id": 109,
  "key": "aiImageAbTestEnabled",
  "value": "false",
  "description": "Enable A/B testing with multiple prompt variations",
  "category": "AI_IMAGE",
  "isEncrypted": false,
  "isPublic": false,
  "createdAt": "2025-01-26T00:00:00.000Z",
  "updatedAt": "2025-01-26T00:00:00.000Z"
},
{
  "id": 110,
  "key": "aiImageEnableWebhooks",
  "value": "false",
  "description": "Use webhooks instead of polling (beta)",
  "category": "AI_IMAGE",
  "isEncrypted": false,
  "isPublic": false,
  "createdAt": "2025-01-26T00:00:00.000Z",
  "updatedAt": "2025-01-26T00:00:00.000Z"
},
{
  "id": 111,
  "key": "aiImageWebhookUrl",
  "value": "",
  "description": "Webhook URL for completion notifications",
  "category": "AI_IMAGE",
  "isEncrypted": false,
  "isPublic": false,
  "createdAt": "2025-01-26T00:00:00.000Z",
  "updatedAt": "2025-01-26T00:00:00.000Z"
}
```

**Important**: Update the `id` values to not conflict with existing settings. Check the highest ID in your current settings and start from there.

### 2. Run Database Seed

After adding to `database-export.json`:

```bash
cd backend
npm run seed
```

This will populate the database with the new settings.

---

## Backend Implementation

### File 1: Prompt Builder Utility

**File**: `backend/src/utils/promptBuilder.js`

```javascript
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
Preserve all original product details, textures, colors, and any text or labels that are part of the product itself.
Remove any watermarks, logos, brand overlays, or text overlays that are not part of the original product packaging or design.
Professional commercial product photography style with even studio lighting.
High quality, sharp focus, commercial e-commerce standard.
Clean and professional finish without any distracting elements or watermarks.`;

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
```

### File 2: AI Image Controller

**File**: `backend/src/controllers/aiImageController.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
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
 * Download image from URL and save to uploads
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

  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, buffer);

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
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = media.url.startsWith('http') ? media.url : `${baseUrl}${media.url}`;

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

    // If completed, download and replace image
    if (status.status === 'COMPLETED' && status.output) {
      const mapping = jobMappings.get(jobId);

      if (mapping) {
        const { mediaId } = mapping;

        // Download generated image
        const filename = `ai-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.png`;
        const localPath = await downloadImage(status.output.image_url, filename);

        // Update media record
        const updatedMedia = await prisma.media.update({
          where: { id: mediaId },
          data: {
            url: localPath,
            thumbnailUrl: localPath,
            updatedAt: new Date()
          }
        });

        // Clean up job mapping
        jobMappings.delete(jobId);

        return res.json({
          success: true,
          status: 'COMPLETED',
          media: updatedMedia,
          generationTime: status.output.generation_time
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

    for (let i = 0; i < Math.min(maxConcurrent, queue.length); i++) {
      const mediaId = queue.shift();
      const media = mediaRecords.find(m => m.id === mediaId);

      const prompt = buildPrompt(options);
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrl = media.url.startsWith('http') ? media.url : `${baseUrl}${media.url}`;

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

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = media.url.startsWith('http') ? media.url : `${baseUrl}${media.url}`;

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
        const filename = `ai-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.png`;
        const localPath = await downloadImage(output.image_url, filename);

        // Update media
        await prisma.media.update({
          where: { id: mediaId },
          data: {
            url: localPath,
            thumbnailUrl: localPath
          }
        });

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
```

### File 3: AI Image Routes

**File**: `backend/src/routes/aiImage.js`

```javascript
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  generateProductImage,
  getGenerationStatus,
  batchGenerateImages,
  generateVariations,
  getAISettings,
  updateAISettings,
  handleWebhook
} = require('../controllers/aiImageController');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// Single image generation
router.post('/generate/:mediaId', generateProductImage);

// Get generation status
router.get('/status/:jobId', getGenerationStatus);

// Batch generation
router.post('/batch', batchGenerateImages);

// A/B testing variations
router.post('/variations/:mediaId', generateVariations);

// Settings
router.get('/settings', getAISettings);
router.put('/settings', updateAISettings);

// Webhook (no auth required)
router.post('/webhook', handleWebhook);

module.exports = router;
```

### File 4: Register Route in Server

**File**: `backend/server.js`

Add after other routes:

```javascript
// AI Image routes
const aiImageRoutes = require('./src/routes/aiImage');
app.use('/api/ai-image', aiImageRoutes);
```

---

## Frontend Implementation

### File 1: AI Product Image Modal

**File**: `web/src/components/admin/AIProductImageModal.jsx`

```jsx
import { useState, useEffect } from 'react';
import { X, Sparkles, Loader, Check, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AIProductImageModal = ({ media, isOpen, onClose, onComplete }) => {
  const [status, setStatus] = useState('idle'); // idle, generating, completed, error
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    shadowStyle: 'soft',
    backgroundColor: '#FFFFFF'
  });

  // Poll for status
  useEffect(() => {
    if (!jobId || status === 'completed' || status === 'error') return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/ai-image/status/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();

        if (data.status === 'COMPLETED') {
          setStatus('completed');
          setGeneratedImage(data.media);
          setProgress(100);
          toast.success('AI generation completed!');

          // Auto-close after 3 seconds
          setTimeout(() => {
            onComplete(data.media);
            onClose();
          }, 3000);

        } else if (data.status === 'FAILED') {
          setStatus('error');
          setError('Generation failed');
          toast.error('Generation failed');
        } else {
          // IN_PROGRESS or IN_QUEUE
          setProgress(prev => Math.min(prev + 5, 90));
        }
      } catch (err) {
        console.error('Status poll error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, status, onComplete, onClose]);

  const handleGenerate = async () => {
    try {
      setStatus('generating');
      setProgress(10);
      setError(null);

      const response = await fetch(`/api/ai-image/generate/${media.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(options)
      });

      const data = await response.json();

      if (data.success) {
        setJobId(data.jobId);
        toast.success('Generation started!');
      } else {
        throw new Error(data.error || 'Failed to start generation');
      }
    } catch (err) {
      setStatus('error');
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setJobId(null);
    setProgress(0);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Sparkles className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Product Image Generation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Original Image Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Original Image
            </label>
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={media?.url}
                alt={media?.originalName}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          {/* Options (only show in idle state) */}
          {status === 'idle' && (
            <>
              {/* Shadow Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shadow Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['minimal', 'soft', 'dramatic'].map(style => (
                    <button
                      key={style}
                      onClick={() => setOptions({...options, shadowStyle: style})}
                      className={`p-3 border rounded-lg text-sm font-medium capitalize ${
                        options.shadowStyle === style
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Background Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => setOptions({...options, backgroundColor: '#FFFFFF'})}
                    className={`p-3 border rounded-lg bg-white ${
                      options.backgroundColor === '#FFFFFF' ? 'ring-2 ring-purple-500' : ''
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-700">White</div>
                  </button>
                  <button
                    onClick={() => setOptions({...options, backgroundColor: '#F3F4F6'})}
                    className={`p-3 border rounded-lg bg-gray-100 ${
                      options.backgroundColor === '#F3F4F6' ? 'ring-2 ring-purple-500' : ''
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-700">Light Gray</div>
                  </button>
                  <button
                    onClick={() => setOptions({...options, backgroundColor: '#FFF8F0'})}
                    className={`p-3 border rounded-lg ${
                      options.backgroundColor === '#FFF8F0' ? 'ring-2 ring-purple-500' : ''
                    }`}
                    style={{ backgroundColor: '#FFF8F0' }}
                  >
                    <div className="text-xs font-medium text-gray-700">Warm</div>
                  </button>
                  <button
                    onClick={() => setOptions({...options, backgroundColor: '#F0F9FF'})}
                    className={`p-3 border rounded-lg ${
                      options.backgroundColor === '#F0F9FF' ? 'ring-2 ring-purple-500' : ''
                    }`}
                    style={{ backgroundColor: '#F0F9FF' }}
                  >
                    <div className="text-xs font-medium text-gray-700">Cool</div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Generating State */}
          {status === 'generating' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <Loader className="w-12 h-12 animate-spin text-purple-600" />
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Generating AI image...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                This usually takes 10-15 seconds
              </div>
            </div>
          )}

          {/* Completed State */}
          {status === 'completed' && generatedImage && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Generated Image
                </label>
                <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={generatedImage.url}
                    alt="AI Generated"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
              <div className="text-center text-sm text-green-600 dark:text-green-400">
                Image replaced successfully! Closing in 3 seconds...
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="text-center text-red-600 dark:text-red-400">
                {error || 'Generation failed. Please try again.'}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {status === 'completed' ? 'Close' : 'Cancel'}
          </button>
          {status === 'idle' && (
            <button
              onClick={handleGenerate}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIProductImageModal;
```

### File 2: AI Image Settings Modal

**File**: `web/src/components/admin/AIImageSettings.jsx`

```jsx
import { useState, useEffect } from 'react';
import { X, Sparkles, Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const AIImageSettings = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-image/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Load settings error:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/ai-image/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Settings saved successfully');
        onClose();
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center">
            <Sparkles className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Image Generation Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Shadow Style Default */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Shadow Style
              </label>
              <div className="grid grid-cols-3 gap-4">
                {['minimal', 'soft', 'dramatic'].map(style => (
                  <button
                    key={style}
                    onClick={() => setSettings({...settings, aiImageDefaultShadow: style})}
                    className={`p-4 border rounded-lg ${
                      settings.aiImageDefaultShadow === style
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="font-medium capitalize text-gray-900 dark:text-white">{style}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {style === 'minimal' && 'Subtle, barely visible shadow'}
                      {style === 'soft' && 'Realistic depth (Recommended)'}
                      {style === 'dramatic' && 'Strong visual impact'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Background Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => setSettings({...settings, aiImageDefaultBackground: '#FFFFFF'})}
                  className={`p-3 border rounded-lg bg-white ${
                    settings.aiImageDefaultBackground === '#FFFFFF' ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700">White</div>
                </button>
                <button
                  onClick={() => setSettings({...settings, aiImageDefaultBackground: '#F3F4F6'})}
                  className={`p-3 border rounded-lg bg-gray-100 ${
                    settings.aiImageDefaultBackground === '#F3F4F6' ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700">Light Gray</div>
                </button>
                <button
                  onClick={() => setSettings({...settings, aiImageDefaultBackground: '#FFF8F0'})}
                  className={`p-3 border rounded-lg ${
                    settings.aiImageDefaultBackground === '#FFF8F0' ? 'ring-2 ring-purple-500' : ''
                  }`}
                  style={{ backgroundColor: '#FFF8F0' }}
                >
                  <div className="text-sm font-medium text-gray-700">Warm White</div>
                </button>
                <button
                  onClick={() => setSettings({...settings, aiImageDefaultBackground: '#F0F9FF'})}
                  className={`p-3 border rounded-lg ${
                    settings.aiImageDefaultBackground === '#F0F9FF' ? 'ring-2 ring-purple-500' : ''
                  }`}
                  style={{ backgroundColor: '#F0F9FF' }}
                >
                  <div className="text-sm font-medium text-gray-700">Cool White</div>
                </button>
              </div>
            </div>

            {/* Resolution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Output Resolution
              </label>
              <select
                value={settings.aiImageResolution || '1024'}
                onChange={(e) => setSettings({...settings, aiImageResolution: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="1024">1024×1024 ($0.03/image)</option>
                <option value="1536">1536×1536 ($0.07/image)</option>
                <option value="2048">2048×2048 ($0.13/image)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Higher resolution = better quality but higher cost
              </p>
            </div>

            {/* Advanced Settings */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Advanced Settings</h3>

              {/* Inference Steps */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inference Steps: <span className="text-purple-600">{settings.aiImageInferenceSteps || 28}</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="40"
                  value={settings.aiImageInferenceSteps || 28}
                  onChange={(e) => setSettings({...settings, aiImageInferenceSteps: e.target.value})}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  More steps = higher quality but slower generation (20-40)
                </p>
              </div>

              {/* Guidance Scale */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Guidance Scale: <span className="text-purple-600">{settings.aiImageGuidance || 3.5}</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="5"
                  step="0.5"
                  value={settings.aiImageGuidance || 3.5}
                  onChange={(e) => setSettings({...settings, aiImageGuidance: e.target.value})}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Higher values follow prompt more strictly (2-5)
                </p>
              </div>

              {/* Max Concurrent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Concurrent Generations (Batch Mode)
                </label>
                <select
                  value={settings.aiImageMaxConcurrent || '3'}
                  onChange={(e) => setSettings({...settings, aiImageMaxConcurrent: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="1">1 (Slower, cheapest)</option>
                  <option value="3">3 (Recommended)</option>
                  <option value="5">5 (Faster, more expensive)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Number of images to generate simultaneously in batch mode
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIImageSettings;
```

### File 3: Modified MediaGrid Component

**File**: `web/src/components/admin/MediaGrid.jsx`

Add this import at the top:
```jsx
import { Sparkles } from 'lucide-react';
```

Modify the action buttons section (around line 83-98):
```jsx
{/* Action Buttons */}
<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
  {/* AI Generate Button - Only for PRODUCTS collection images */}
  {item.collection === 'PRODUCTS' && item.mimeType.startsWith('image/') && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAIGenerate && onAIGenerate(item);
      }}
      className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded shadow hover:from-purple-600 hover:to-pink-600 text-white"
      title="Generate AI Product Photo"
    >
      <Sparkles className="h-3 w-3" />
    </button>
  )}
  <button
    onClick={() => onEdit(item)}
    className="p-1 bg-white dark:bg-gray-700 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-600"
    title={t('adminMedia.edit')}
  >
    <Edit className="h-3 w-3" />
  </button>
  <button
    onClick={() => onDelete(item.id)}
    className="p-1 bg-white dark:bg-gray-700 rounded shadow hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
    title={t('adminMedia.delete')}
  >
    <Trash2 className="h-3 w-3" />
  </button>
</div>
```

Add `onAIGenerate` to the component props:
```jsx
const MediaGrid = ({
  media,
  selectedItems,
  onSelectItem,
  onEdit,
  onDelete,
  onAIGenerate,  // Add this
  formatFileSize,
  formatDate
}) => {
```

### File 4: Modified Media Page

**File**: `web/src/pages/admin/Media.jsx`

Add imports at the top:
```jsx
import { Sparkles } from 'lucide-react';
import AIImageSettings from '../../components/admin/AIImageSettings';
import AIProductImageModal from '../../components/admin/AIProductImageModal';
```

Add state variables after existing useState declarations:
```jsx
const [showAISettings, setShowAISettings] = useState(false);
const [showAIModal, setShowAIModal] = useState(false);
const [aiTargetMedia, setAiTargetMedia] = useState(null);
```

Add AI generate handler function:
```jsx
const handleAIGenerate = (media) => {
  setAiTargetMedia(media);
  setShowAIModal(true);
};

const handleAIComplete = (updatedMedia) => {
  // Update media in state
  setMedia(prev => prev.map(m => m.id === updatedMedia.id ? updatedMedia : m));
  toast.success('Product image updated with AI generation');
};
```

Add AI Settings button to the header (find the existing header section and add):
```jsx
{/* Add this button in the header actions area */}
<button
  onClick={() => setShowAISettings(true)}
  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600"
>
  <Sparkles className="w-4 h-4 mr-2" />
  AI Settings
</button>
```

Pass onAIGenerate to MediaGrid component:
```jsx
<MediaGrid
  media={media}
  selectedItems={selectedItems}
  onSelectItem={handleSelectItem}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onAIGenerate={handleAIGenerate}  // Add this
  formatFileSize={formatFileSize}
  formatDate={formatDate}
/>
```

Add modals before the closing AdminLayout tag:
```jsx
{/* AI Image Settings Modal */}
<AIImageSettings
  isOpen={showAISettings}
  onClose={() => setShowAISettings(false)}
/>

{/* AI Product Image Modal */}
<AIProductImageModal
  media={aiTargetMedia}
  isOpen={showAIModal}
  onClose={() => {
    setShowAIModal(false);
    setAiTargetMedia(null);
  }}
  onComplete={handleAIComplete}
/>
```

### File 5: Add RunPod API Key to GeneralSettings

**File**: `web/src/pages/admin/settings/GeneralSettings.jsx`

Find the API Keys tab content (search for `activeTab === 'apiKeys'`) and add this after the Pexels API key section:

```jsx
{/* RunPod API Key */}
<div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center">
      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          RunPod API Key
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Required for AI product image generation (FLUX models)
        </p>
      </div>
    </div>
    <div className="flex items-center">
      <span className="text-xs text-green-600 dark:text-green-400 mr-2">●</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
    </div>
  </div>
  <div className="flex space-x-3">
    <div className="flex-1 relative">
      <input
        type={showApiKeys.runpod ? "text" : "password"}
        placeholder="Enter RunPod API key (rpa_...)"
        value={apiKeys.runpodApiKey || ''}
        onChange={(e) => {
          setApiKeys(prev => ({ ...prev, runpodApiKey: e.target.value }));
          setHasUnsavedChanges(true);
        }}
        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <button
        type="button"
        onClick={() => toggleApiKeyVisibility('runpod')}
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        {showApiKeys.runpod ? (
          <EyeOff className="h-4 w-4 text-gray-400" />
        ) : (
          <Eye className="h-4 w-4 text-gray-400" />
        )}
      </button>
    </div>
    <button
      onClick={() => handleSaveApiKey('runpodApiKey', apiKeys.runpodApiKey || '')}
      disabled={isSaving || !hasUnsavedChanges}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('adminSettings.save')}
    </button>
  </div>
  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
    Get your API key from{' '}
    <a
      href="https://runpod.io"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      RunPod Dashboard
    </a>
  </p>
</div>
```

---

## API Documentation

### Endpoints

#### POST `/api/ai-image/generate/:mediaId`
Generate AI product image for a single media item.

**Request:**
```json
{
  "shadowStyle": "soft",
  "backgroundColor": "#FFFFFF",
  "customInstructions": ""
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "abc-123-def",
  "status": "IN_QUEUE",
  "message": "Generation started"
}
```

#### GET `/api/ai-image/status/:jobId`
Check generation status and get result.

**Response (In Progress):**
```json
{
  "success": true,
  "status": "IN_PROGRESS"
}
```

**Response (Completed):**
```json
{
  "success": true,
  "status": "COMPLETED",
  "media": {
    "id": "media-id",
    "url": "/uploads/products/ai-123.png",
    "...": "..."
  },
  "generationTime": 12.5
}
```

#### POST `/api/ai-image/batch`
Batch generate multiple images.

**Request:**
```json
{
  "mediaIds": ["id1", "id2", "id3"],
  "options": {
    "shadowStyle": "soft",
    "backgroundColor": "#FFFFFF"
  }
}
```

**Response:**
```json
{
  "success": true,
  "jobs": [
    {"mediaId": "id1", "jobId": "job1", "status": "IN_QUEUE"},
    {"mediaId": "id2", "jobId": "job2", "status": "IN_QUEUE"}
  ],
  "remainingInQueue": 1
}
```

#### POST `/api/ai-image/variations/:mediaId`
Generate A/B test variations.

**Request:**
```json
{
  "customPrompts": ["custom prompt 1", "custom prompt 2"]
}
```

**Response:**
```json
{
  "success": true,
  "variations": [
    {"name": "Minimal Shadow", "jobId": "job1", "status": "IN_QUEUE"},
    {"name": "Soft Shadow (Recommended)", "jobId": "job2", "status": "IN_QUEUE"},
    {"name": "Dramatic Shadow", "jobId": "job3", "status": "IN_QUEUE"}
  ]
}
```

#### GET `/api/ai-image/settings`
Get AI image settings.

**Response:**
```json
{
  "success": true,
  "settings": {
    "aiImageEnabled": "true",
    "aiImageDefaultShadow": "soft",
    "aiImageDefaultBackground": "#FFFFFF",
    "...": "..."
  }
}
```

#### PUT `/api/ai-image/settings`
Update AI image settings.

**Request:**
```json
{
  "aiImageDefaultShadow": "dramatic",
  "aiImageResolution": "1536"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated"
}
```

---

## Testing Guide

### 1. Database Seed Testing

```bash
cd backend
npm run seed
```

Verify in database:
```sql
SELECT * FROM "Setting" WHERE category = 'API_KEYS' AND key = 'runpodApiKey';
SELECT * FROM "Setting" WHERE category = 'AI_IMAGE';
```

### 2. Backend API Testing

**Test AI Settings:**
```bash
curl -X GET http://localhost:3001/api/ai-image/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test Single Generation:**
```bash
curl -X POST http://localhost:3001/api/ai-image/generate/MEDIA_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"shadowStyle":"soft","backgroundColor":"#FFFFFF"}'
```

**Test Status Check:**
```bash
curl -X GET http://localhost:3001/api/ai-image/status/JOB_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Frontend Testing Checklist

- [ ] RunPod API key visible in Settings → API Keys tab
- [ ] AI Settings button appears in Media Manager header
- [ ] AI Settings modal opens and loads current settings
- [ ] AI Settings can be saved and persist
- [ ] AI sparkle button appears on PRODUCTS collection images in MediaGrid
- [ ] Clicking AI button opens AIProductImageModal
- [ ] Modal shows original image preview
- [ ] Shadow style buttons work (minimal/soft/dramatic)
- [ ] Background color buttons work
- [ ] Generate button starts generation
- [ ] Progress bar updates during generation
- [ ] Completed state shows generated image
- [ ] Generated image replaces original in media library
- [ ] Products using that image update automatically

### 4. Integration Testing

**Test Complete Flow:**
1. Upload test product image to PRODUCTS collection
2. Click AI button on image
3. Select "dramatic" shadow style
4. Click "Generate AI Image"
5. Wait for completion (~15 seconds)
6. Verify generated image has white background and dramatic shadow
7. Verify watermarks removed (if present in original)
8. Verify original image replaced in database

**Test Batch Processing:**
1. Select 5 product images
2. Click "AI Generate (5)" button
3. Monitor progress for all images
4. Verify all complete successfully
5. Check concurrent limit respected (max 3 at a time)

---

## Deployment Checklist

### Pre-Deployment

- [ ] Run `npm run seed` to populate settings
- [ ] Verify RunPod API key is in database
- [ ] Test single generation locally
- [ ] Test batch generation locally
- [ ] Build frontend: `cd web && npm run build`
- [ ] Build backend (if applicable)

### Deployment Steps

1. **Database Migration:**
   ```bash
   cd backend
   npm run seed
   ```

2. **Restart Backend:**
   ```bash
   pm2 restart backend
   # or
   systemctl restart your-backend-service
   ```

3. **Deploy Frontend:**
   ```bash
   cd web
   npm run build
   # Copy dist/ to production server
   ```

4. **Verify Settings:**
   - Log into admin panel
   - Go to Settings → API Keys
   - Verify RunPod API key is present
   - Go to Media Manager
   - Click "AI Settings"
   - Verify all settings load correctly

5. **Test Production:**
   - Generate one test image
   - Verify it completes successfully
   - Check logs for errors

### Post-Deployment

- [ ] Monitor RunPod credits usage
- [ ] Check error logs
- [ ] Monitor generation times
- [ ] Collect user feedback
- [ ] Track cost per image

---

## Cost Analysis

### Per-Image Costs

| Configuration | Resolution | Cost | Use Case |
|--------------|------------|------|----------|
| Standard | 1024×1024 | $0.03 | Most products |
| High Quality | 1536×1536 | $0.07 | Featured products |
| Premium | 2048×2048 | $0.13 | Hero images |
| A/B Testing | 1024×1024 | $0.09 | Testing variations (3 images) |

### Monthly Cost Estimates

| Volume | Standard ($0.03) | High Quality ($0.07) |
|--------|------------------|----------------------|
| 100 images | $3 | $7 |
| 500 images | $15 | $35 |
| 1,000 images | $30 | $70 |
| 5,000 images | $150 | $350 |

### Cost Optimization Tips

1. **Use standard resolution** (1024×1024) for most products
2. **Batch process** during off-peak hours
3. **A/B test selectively** on new product types only
4. **Monitor credits** daily in RunPod dashboard
5. **Set up alerts** when credits drop below threshold

---

## Troubleshooting

### Issue: "RunPod API key not configured"

**Solution:**
1. Check database: `SELECT * FROM "Setting" WHERE key = 'runpodApiKey';`
2. Verify seed file has the key
3. Run `npm run seed`
4. Restart backend

### Issue: Generation fails immediately

**Possible causes:**
- Invalid RunPod API key
- Insufficient RunPod credits
- Invalid image URL
- Image too large

**Solution:**
1. Test API key in RunPod dashboard
2. Check RunPod credit balance
3. Verify image URL is publicly accessible
4. Check image file size (max 15MB)

### Issue: Generation stuck in "IN_PROGRESS"

**Solution:**
1. Wait up to 60 seconds (some images take longer)
2. Check RunPod status at https://status.runpod.io
3. Check backend logs for polling errors
4. Manually check job status in RunPod dashboard

### Issue: Generated image has wrong background

**Solution:**
1. Check prompt in promptBuilder.js
2. Verify backgroundColor hex value is correct
3. Try different shadow styles
4. Increase inference steps in settings

### Issue: Watermark not removed

**Solution:**
1. Watermark may be part of product packaging
2. Try adding to customInstructions: "remove any watermarks"
3. Increase guidance scale in settings
4. Use A/B testing to compare results

### Issue: Images not appearing in grid after generation

**Solution:**
1. Check media record updated in database
2. Verify image file saved to uploads/products/
3. Clear browser cache
4. Reload media list

---

## Support & Resources

### RunPod Documentation
- Dashboard: https://runpod.io
- FLUX Models: https://runpod.io/hub
- API Docs: https://docs.runpod.io

### FLUX.1 Kontext
- Model Card: https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev
- BFL Website: https://bfl.ai
- Announcement: https://bfl.ai/announcements/flux-1-kontext

### Internal Documentation
- Backend API: See `backend/src/controllers/aiImageController.js`
- Prompt Builder: See `backend/src/utils/promptBuilder.js`
- Settings: Admin Panel → Settings → API Keys

---

## Changelog

### v1.0.0 (2025-01-26)
- Initial implementation
- Single image generation
- Batch processing
- A/B testing
- Shadow presets
- Custom backgrounds
- **Watermark removal in prompts**
- Settings management
- RunPod API key in database

---

## License & Credits

**Technology:**
- FLUX.1 Kontext by Black Forest Labs
- RunPod Serverless GPU Platform
- React, Node.js, PostgreSQL, Prisma

**Cost:** $0.03-0.13 per image (RunPod)

**Support:** Contact your development team or check internal documentation.

---

*End of AI Product Image Generation Implementation Guide*
