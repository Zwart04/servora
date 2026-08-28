#!/usr/bin/env bash
# validate-ide.sh — gate-check that an ide candidate meets the 4-tahap non-CRUD bar.
#
# Usage:
#   bash validate-ide.sh <path-to-ide.csv>
#
# CSV columns (header optional, single data line):
#   project_name,problem_statement,target_audience,
#   features_mvp,shareable_url,wa_integration,analytics,finance_tracking
#
# Exit codes:
#   0  IDE_VALID_SUCCESS  — passes 5/5 complexity + ≥7 features
#   1  IDE_VALID_FAILED   — prints reason on stdout
#
# Output written to ~/.hermes/logs/validate-ide.log for audit.
#
# Complexity scoring (5 points total):
#   +1  features_mvp mentions "public" (customer-facing surface)
#   +1  wa_integration not null
#   +1  analytics not null
#   +1  finance_tracking not null
#   +1  shareable_url not null
# Plus a separate check: features_mvp must have ≥7 semicolon/newline-separated items.

set -Eeuo pipefail

IDE_FILE="${1:-$HOME/daily-projects/.ide-candidates/ide.csv}"
LOG="$HOME/.hermes/logs/validate-ide.log"
mkdir -p "$(dirname "$LOG")"

echo "[$(date -u +%Y-%m-%dT%H:%M:%S%z)] Validasi Ide dimulai (file=$IDE_FILE)" >> "$LOG"

if [[ ! -f "$IDE_FILE" ]]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%S%z)] GAGAL: file ide tidak ada" >> "$LOG"
  echo "IDE_VALID_FAILED:NO_FILE"
  exit 1
fi

IDE_LINE=$(tail -n 1 "$IDE_FILE")
IFS=',' read -r PROJECT_NAME PROBLEM_STATEMENT TARGET_AUDIENCE \
     FEATURES_MVP SHAREABLE_URL WA_INTEGRATION ANALYTICS FINANCE_TRACKING <<< "$IDE_LINE"

SCORE=0
[[ "$FEATURES_MVP" == *"public"* ]] && SCORE=$((SCORE+1))
[[ "$WA_INTEGRATION"   != "null"   ]] && SCORE=$((SCORE+1))
[[ "$ANALYTICS"        != "null"   ]] && SCORE=$((SCORE+1))
[[ "$FINANCE_TRACKING" != "null"   ]] && SCORE=$((SCORE+1))
[[ "$SHAREABLE_URL"    != "null"   ]] && SCORE=$((SCORE+1))

echo "[$(date -u +%Y-%m-%dT%H:%M:%S%z)] Skor kompleksitas: $SCORE/5" >> "$LOG"

if [[ $SCORE -lt 5 ]]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%S%z)] GAGAL: skor $SCORE/5" >> "$LOG"
  echo "IDE_VALID_FAILED:SCORE_${SCORE}_OF_5"
  exit 1
fi

# Minimal 7 fitur
FEATURE_COUNT=$(echo "$FEATURES_MVP" | tr ';' '\n' | grep -c . || true)
if [[ $FEATURE_COUNT -lt 7 ]]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%S%z)] GAGAL: fitur $FEATURE_COUNT < 7" >> "$LOG"
  echo "IDE_VALID_FAILED:FEATURES_${FEATURE_COUNT}_OF_7"
  exit 1
fi

echo "[$(date -u +%Y-%m-%dT%H:%M:%S%z)] SUKSES: $PROJECT_NAME (skor $SCORE/5, fitur $FEATURE_COUNT)" >> "$LOG"
echo "IDE_VALID_SUCCESS"
exit 0
