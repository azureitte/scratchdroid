#!/usr/bin/env bash

set -e

APK=false
DEV=false

# Parse arguments
for arg in "$@"; do
  case $arg in
    --dev)
      DEV=true
      ;;
    --apk)
      APK=true;
done

echo "Running Expo prebuild..."
npx expo prebuild

if [ $? -ne 0 ]; then
  echo "Prebuild failed. Exiting." >&2
  cd ..
  exit 1
fi

# Navigate to android folder
cd android || exit 1

# Decide build type
if [ "$DEV" = true ]; then
  echo "Building APK (assembleDebug)..."
  ./gradlew assembleDebug
elif [ "$APK" = true ]; then
  echo "Building APK (assembleRelease)..."
  ./gradlew assembleRelease
else
  echo "Building AAB (bundleRelease)..."
  ./gradlew bundleRelease
fi

if [ $? -ne 0 ]; then
  echo "Build failed." >&2
  cd ..
  exit 1
fi

echo "Build completed successfully!"

# Optional: print output path
if [ "$DEV" = true ]; then
  echo "APK location: android/app/build/outputs/apk/debug/"
elif [ "$APK" = true ]; then
  echo "APK location: android/app/build/outputs/apk/release/"
else
  echo "AAB location: android/app/build/outputs/bundle/release/"
fi

cd ..
exit 0