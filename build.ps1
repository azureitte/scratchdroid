param(
    [switch]$Apk,
    [switch]$Dev
)

Write-Host "Running Expo prebuild..."
npx expo prebuild

if ($LASTEXITCODE -ne 0) {
    Write-Error "Prebuild failed. Exiting."
    Set-Location ..
    exit 1
}

# Navigate to android folder

Set-Location android

# Decide build type

if ($Dev) {
    Write-Host "Building APK (assembleDebug)..."
    ./gradlew.bat assembleDebug
} else if ($Apk) {
    Write-Host "Building APK (assembleRelease)..."
    ./gradlew.bat assembleRelease
} else {
    Write-Host "Building AAB (bundleRelease)..."
    ./gradlew.bat bundleRelease
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed."
    Set-Location ..
    exit 1
}

Write-Host "Build completed successfully!"

# Optional: print output path

if ($Dev) {
    Write-Host "APK location: android/app/build/outputs/apk/debug/"
} else if ($Apk) {
    Write-Host "APK location: android/app/build/outputs/apk/release/"
} else {
    Write-Host "AAB location: android/app/build/outputs/bundle/release/"
}

Set-Location ..
exit 0