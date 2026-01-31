# Troubleshooting Guide

## Common Issues After Installation

### 1. Metro Bundler Errors

**Error**: "Unable to resolve module" or "Cannot find module"

**Solution**:
```bash
# Clear Metro cache and restart
npm start -- --reset-cache
```

Then in a new terminal:
```bash
npm run ios
# or
npm run android
```

### 2. Native Module Linking Issues

**Error**: "Native module not found" or "Cannot read property of undefined"

**For iOS:**
```bash
cd ios
pod install
cd ..
npm run ios
```

**For Android:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### 3. TypeScript Errors

**Error**: Type errors in console

**Solution**:
```bash
# Check TypeScript compilation
npx tsc --noEmit
```

If there are errors, they'll be listed. Common fixes:
- Ensure all imports are correct
- Check that all dependencies are installed

### 4. Redux-Persist Errors

**Error**: "redux-persist failed to create sync storage"

**Solution**: This is usually a linking issue. Ensure AsyncStorage is properly linked:

```bash
# iOS
cd ios && pod install && cd ..

# Android - should auto-link, but if issues:
# Check android/settings.gradle includes AsyncStorage
```

### 5. Navigation Errors

**Error**: "Navigation container not found" or navigation type errors

**Solution**: Ensure React Navigation dependencies are installed:
```bash
npm install @react-navigation/native @react-navigation/native-stack react-native-screens
```

### 6. DateTimePicker Not Working

**Error**: DateTimePicker not showing or crashing

**Solution**: 
```bash
# iOS
cd ios && pod install && cd ..

# Android - ensure it's in android/settings.gradle
```

### 7. Build Fails on iOS

**Error**: Xcode build errors

**Solution**:
```bash
cd ios
xcodebuild clean
pod install
cd ..
npm run ios
```

### 8. Build Fails on Android

**Error**: Gradle build errors

**Solution**:
```bash
cd android
./gradlew clean
./gradlew --stop
cd ..
npm run android
```

## Step-by-Step Clean Install

If you're still having issues, try a clean install:

```bash
# 1. Clean node_modules
rm -rf node_modules
rm package-lock.json

# 2. Clean iOS
cd ios
rm -rf Pods Podfile.lock
rm -rf build
cd ..

# 3. Clean Android
cd android
./gradlew clean
rm -rf .gradle build
cd ..

# 4. Reinstall
npm install
cd ios && pod install && cd ..

# 5. Clear Metro cache
npm start -- --reset-cache
```

Then in a new terminal:
```bash
npm run ios
```

## Runtime Errors

### "Cannot read property 'dispatch' of undefined"

This means Redux Provider is missing. Check that `App.tsx` wraps everything in `<Provider>`.

### "Navigation container not found"

Ensure `RootNavigator` is wrapped in `<NavigationContainer>` (it should be in `RootNavigator.tsx`).

### "Module not found: Can't resolve '../store'"

Check file paths. All imports should be relative to the file location.

## Getting Help

If you encounter a specific error:

1. **Check the error message** - Copy the full error
2. **Check Metro bundler logs** - Look for red errors
3. **Check device/simulator logs** - iOS: Xcode console, Android: `adb logcat`
4. **Verify dependencies** - Run `npm list` to see installed packages

## Quick Verification

Run these to verify setup:

```bash
# Check TypeScript
npx tsc --noEmit

# Check dependencies
npm list --depth=0

# Check iOS pods
cd ios && pod list && cd ..

# Start Metro (should start without errors)
npm start
```
