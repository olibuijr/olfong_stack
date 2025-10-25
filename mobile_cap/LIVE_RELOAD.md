# 🔥 Live Reload Development

Use live reload to see changes instantly on your device without rebuilding!

## Quick Start

### 1. Start Web Dev Server
```bash
cd ../web
npm run dev
```

The dev server will start on `http://192.168.8.62:3001`

### 2. Run with Live Reload

**In a new terminal:**

```bash
cd mobile_cap

# For Android
npm run dev:android

# For iOS (macOS only)
npm run dev:ios
```

The app will:
- 🚀 Launch on your device
- 🔌 Connect to the dev server
- ⚡ Hot reload on every code change
- 🎯 Show errors in real-time

## How It Works

```
┌─────────────────┐         ┌──────────────┐         ┌────────────┐
│  Your Editor    │────────▶│  Vite Dev    │────────▶│   Mobile   │
│  (VSCode, etc)  │  Save   │  Server      │  WiFi   │   Device   │
└─────────────────┘         │  :3001       │         └────────────┘
                            └──────────────┘
                                   ↓
                            Auto Reload ⚡
```

## Development Workflow

1. **Make changes** in `../web/src/`
2. **Save the file**
3. **Watch the device** - changes appear instantly! ⚡

No more:
- ❌ Running `npm run build`
- ❌ Running `npx cap sync`
- ❌ Waiting for Gradle build
- ❌ Redeploying APK

## Troubleshooting

### App shows white screen or won't connect

1. **Check both devices are on same WiFi**
2. **Verify dev server is running:**
   ```bash
   curl http://192.168.8.62:3001
   ```
3. **Check your IP hasn't changed:**
   ```bash
   ip addr | grep "192.168"
   ```
4. **If IP changed, update:**
   - `mobile_cap/package.json` (dev scripts)
   - `web/.env` (VITE_API_URL)

### Changes not appearing

1. **Hard refresh:** Close and reopen the app
2. **Check dev server console** for errors
3. **Check device console:** `chrome://inspect` (Android)

### Port 3001 already in use

```bash
# Kill existing process
killall node
# Or change port in web/vite.config.js
```

## Tips

- 💡 **Keep dev server running** - Leave it in a terminal tab
- 💡 **Use VSCode terminal split** - Dev server + mobile_cap side by side
- 💡 **Chrome DevTools** - `chrome://inspect` for debugging
- 💡 **Network errors?** Check `web/.env` has correct backend IP

## Switch Back to Production Build

When you want to test the actual built app:

```bash
npm run sync        # Build web + sync
npm run run:android # Deploy production build
```

## Performance

**Live Reload (Development):**
- First launch: ~5 seconds
- Code change: Instant ⚡
- Full reload: ~1 second

**Production Build:**
- Full build: ~30 seconds
- Gradle build: ~2 seconds
- Deploy: ~3 seconds
- **Total: ~35 seconds** 😴

**Live reload is ~35x faster!** 🚀
