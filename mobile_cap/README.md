# Ölföng Mobile App (iOS & Android)

This folder contains the Capacitor configuration for building native iOS and Android apps from the Ölföng web application.

## What is Capacitor?

Capacitor wraps your existing React web app and turns it into native mobile apps for iOS and Android. Your web code stays exactly the same - Capacitor just provides a native container and access to native device features.

## Project Structure

```
mobile_cap/
├── android/          # Android Studio project (generated)
├── ios/             # Xcode project (generated)
├── capacitor.config.ts  # Capacitor configuration
├── package.json     # Mobile app dependencies
└── README.md        # This file
```

The actual app code lives in `../web/` and gets built to `../web/dist/`, which Capacitor then packages into the native apps.

## Prerequisites

### For Android Development
- [Android Studio](https://developer.android.com/studio)
- Java JDK 17 or higher
- Android SDK (installed via Android Studio)

### For iOS Development (macOS only)
- [Xcode](https://developer.apple.com/xcode/) 14 or higher
- CocoaPods: `sudo gem install cocoapods`
- Xcode Command Line Tools: `xcode-select --install`

## Quick Start

### 1. Initial Setup

```bash
# Install dependencies (if not already done)
npm install
```

### 2. Build and Run

**For Android:**
```bash
# Build web app and sync to Android
npm run sync

# Open in Android Studio
npm run open:android

# Or run directly on connected device/emulator
npm run run:android
```

**For iOS (macOS only):**
```bash
# Build web app and sync to iOS
npm run sync

# Open in Xcode
npm run open:ios

# Or run directly on connected device/simulator
npm run run:ios
```

## Development Workflow

### Making Changes to Your App

1. **Edit web app code** in `../web/src/`
2. **Test in browser** using the web dev server:
   ```bash
   cd ../web && npm run dev
   ```
3. **Build and sync** when ready to test on mobile:
   ```bash
   npm run sync
   ```
4. **Run on device/emulator** to test mobile-specific features

### Available Scripts

- `npm run build:web` - Build the web app (runs `npm run build` in ../web)
- `npm run sync` - Build web app and sync to all native platforms
- `npm run open:android` - Open Android project in Android Studio
- `npm run open:ios` - Open iOS project in Xcode
- `npm run run:android` - Build, sync, and run on Android device
- `npm run run:ios` - Build, sync, and run on iOS device

## Configuration

### App Identity

Edit `capacitor.config.ts` to configure:
- `appId`: Bundle identifier (e.g., `is.olfong.app`)
- `appName`: Display name shown to users
- `webDir`: Location of built web assets (currently `../web/dist`)

### Native Platform Settings

**Android:** Edit `android/app/build.gradle` and `android/app/src/main/AndroidManifest.xml`

**iOS:** Open `ios/App/App.xcworkspace` in Xcode to configure app settings, icons, splash screens, etc.

## Adding Native Features

Capacitor provides plugins for native device features:

```bash
# Install a plugin (e.g., Camera)
npm install @capacitor/camera

# Sync to native projects
npm run sync
```

Common plugins:
- `@capacitor/camera` - Camera and photo library access
- `@capacitor/geolocation` - GPS location
- `@capacitor/push-notifications` - Push notifications
- `@capacitor/app` - App lifecycle events
- `@capacitor/haptics` - Vibration/haptics
- `@capacitor/share` - Native share dialog
- `@capacitor/status-bar` - Status bar styling

Browse all plugins: https://capacitorjs.com/docs/plugins

## Environment-Specific Code

Detect if running in a native app:

```javascript
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  // Running in iOS or Android
  console.log('Platform:', Capacitor.getPlatform()); // 'ios' or 'android'
} else {
  // Running in web browser
}
```

## API Configuration

The web app is configured to use the backend API. Make sure to update API endpoints for production:

**For development:** The app currently uses `localhost:5000` which won't work on mobile devices.

**For production:** Update the API URL in `../web/src/` to use a public domain or your device's local IP:
- Use environment variables: `VITE_API_URL`
- Or configure in `capacitor.config.ts` server settings

### Testing with Local Backend

To test with your local backend on a physical device, use your computer's IP address:

```javascript
// In ../web/.env or config
VITE_API_URL=http://192.168.1.100:5000
```

Find your IP: `ip addr` (Linux) or `ipconfig` (Windows)

## Building for Production

### Android

1. Open in Android Studio: `npm run open:android`
2. Build → Generate Signed Bundle/APK
3. Follow the wizard to create a release build
4. Upload to Google Play Console

### iOS

1. Open in Xcode: `npm run open:ios`
2. Set development team in Signing & Capabilities
3. Archive the app: Product → Archive
4. Distribute to App Store or TestFlight

## Troubleshooting

### "Could not find installation of TypeScript"
```bash
npm install -D typescript
```

### Android build errors
- Open Android Studio and let it download missing SDK components
- Update Gradle if prompted
- Sync Gradle files

### iOS build errors (macOS)
- Run `pod install` in the `ios/App` folder
- Clean build folder in Xcode: Product → Clean Build Folder
- Restart Xcode

### Changes not appearing
```bash
# Make sure to sync after building the web app
npm run sync
```

### White screen on launch
- Check that `../web/dist` exists and has content
- Run `npm run build:web` to rebuild
- Check browser console in dev tools for errors

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor + React Guide](https://capacitorjs.com/solution/react)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Android Developer Guide](https://developer.android.com/)
- [iOS Developer Guide](https://developer.apple.com/documentation/)

## Notes

- The `android/` and `ios/` folders are generated by Capacitor and should be committed to Git
- Native platform code can be customized directly in Android Studio or Xcode
- Web code changes require a rebuild and sync to appear in mobile apps
- This is a wrapper around the existing web app - all business logic stays in `../web/src/`
