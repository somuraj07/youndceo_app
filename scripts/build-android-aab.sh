#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SERVER_URL="${CAPACITOR_SERVER_URL:-${NEXT_PUBLIC_APP_URL:-https://youndceo11.vercel.app}}"
export CAPACITOR_SERVER_URL="$SERVER_URL"

echo "→ Syncing Capacitor (server: $SERVER_URL)"
npx cap sync android

KEYSTORE="$ROOT_DIR/android/young-ceo-release.keystore"
PROPS="$ROOT_DIR/android/keystore.properties"

if [[ ! -f "$PROPS" ]]; then
  echo ""
  echo "Missing android/keystore.properties"
  echo "1. Copy android/keystore.properties.example → android/keystore.properties"
  echo "2. Create a keystore if needed:"
  echo "   keytool -genkey -v -keystore android/young-ceo-release.keystore -alias youngceo -keyalg RSA -keysize 2048 -validity 10000"
  exit 1
fi

if [[ ! -f "$KEYSTORE" ]]; then
  echo "Missing keystore file: android/young-ceo-release.keystore"
  exit 1
fi

if [[ -z "${JAVA_HOME:-}" ]]; then
  if [[ -d "/Applications/Android Studio.app/Contents/jbr/Contents/Home" ]]; then
    export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
  elif command -v /usr/libexec/java_home >/dev/null 2>&1; then
    export JAVA_HOME="$(/usr/libexec/java_home 2>/dev/null || true)"
  fi
fi

if [[ -z "${JAVA_HOME:-}" ]]; then
  echo "Java (JDK 17+) is required. Install Android Studio or JDK, then rerun."
  exit 1
fi

echo "→ Building signed Android App Bundle (.aab)"
cd android
./gradlew bundleRelease

AAB="app/build/outputs/bundle/release/app-release.aab"
if [[ -f "$AAB" ]]; then
  echo ""
  echo "✓ AAB ready: android/$AAB"
  echo "Upload this file in Google Play Console → Release → Production."
else
  echo "Build finished but AAB not found at android/$AAB"
  exit 1
fi
