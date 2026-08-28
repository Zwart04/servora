#!/usr/bin/env bash
# validate-architecture.sh — gate-check that FEATURES.md meets the 4-tahap non-CRUD bar
# before any `npm run build` is allowed.
#
# Usage:
#   bash validate-architecture.sh <project_dir>
#
# Required content in <project_dir>/FEATURES.md:
#   - ≥7 feature bullets/headings (counts as - or * or ##/###)
#   - mentions WAHA / WhatsApp / wa.me
#   - mentions Pixel / gtag / Google Ads / Meta
#   - mentions Finance / journal / auto-journal / keuangan
#
# Exit codes:
#   0  ARCH_VALID_SUCCESS
#   1  ARCH_VALID_FAILED  (prints reason on stdout)
#
# Output written to ~/.hermes/logs/validate-arch.log for audit.

set -Eeuo pipefail

PROJECT_DIR="${1:-$PWD}"
LOG="$HOME/.hermes/logs/validate-arch.log"
mkdir -p "$(dirname "$LOG")"

echo "[$(date -u +%Y-%m-%dT%H:%M:%S%z)] Validasi Arsitektur: $PROJECT_DIR" >> "$LOG"

FEATURES_FILE="$PROJECT_DIR/FEATURES.md"

if [[ ! -f "$FEATURES_FILE" ]]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%S%z)] GAGAL: FEATURES.md tidak ada di $PROJECT_DIR" >> "$LOG"
  echo "ARCH_VALID_FAILED:NO_FEATURES_FILE"
  exit 1
fi

# Count feature lines: bullets, sub-bullets, h2/h3
FEATURE_LINES=$(grep -cE '^\s*[-*]\s+\*\*|^#{2,3}\s' "$FEATURES_FILE" 2>/dev/null || true)
if [[ $FEATURE_LINES -lt 7 ]]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%S%z)] GAGAL: fitur $FEATURE_LINES < 7" >> "$LOG"
  echo "ARCH_VALID_FAILED:FEATURES_${FEATURE_LINES}_OF_7"
  exit 1
fi

if ! grep -qiE 'waha|whatsapp|wa\.me' "$FEATURES_FILE"; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%S%z)] GAGAL: tidak ada entry WAHA/WhatsApp" >> "$LOG"
  echo "ARCH_VALID_FAILED:NO_WAHA"
  exit 1
fi

if ! grep -qiE 'pixel|gtag|google ads|meta' "$FEATURES_FILE"; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%S%z)] GAGAL: tidak ada entry Pixel/GA" >> "$LOG"
  echo "ARCH_VALID_FAILED:NO_PIXEL"
  exit 1
fi

if ! grep -qiE 'finance|journal|auto.*journal|keuangan' "$FEATURES_FILE"; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%S%z)] GAGAL: tidak ada entry Finance auto-journal" >> "$LOG"
  echo "ARCH_VALID_FAILED:NO_FINANCE"
  exit 1
fi

echo "[$(date -u +%Y-%m-%dT%H:%M:%S%z)] SUKSES: $PROJECT_DIR (fitur $FEATURE_LINES)" >> "$LOG"
echo "ARCH_VALID_SUCCESS"
exit 0
