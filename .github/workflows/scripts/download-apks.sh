#!/usr/bin/env bash
set -euo pipefail

RELEASE_REPO="${RELEASE_REPO:-ijuzv/apiCompareGithubRunner}"
RELEASE_TAG="${RELEASE_TAG:-v1}"
ARTIFACTS_DIR="${ARTIFACTS_DIR:-appium-mobile-compare/artifacts}"

mkdir -p "$ARTIFACTS_DIR"

for name in base.apk split_config.en.apk split_config.x86_64.apk split_config.xxhdpi.apk; do
  echo "Downloading ${name}..."
  curl -fsSL -o "${ARTIFACTS_DIR}/${name}" \
    "https://github.com/${RELEASE_REPO}/releases/download/${RELEASE_TAG}/${name}"
done

echo "APKs ready in ${ARTIFACTS_DIR}"
ls -la "$ARTIFACTS_DIR"
