#!/usr/bin/env bash
set -euo pipefail

echo "🛡️  GLATKO PRE-COMMIT CHECK"
echo "============================"

# ── 1. Security files ─────────────────────────────────────────────────────────
echo ""
echo "📁 Security files..."
SECURITY_FILES=(
  "lib/rateLimit.ts"
  "lib/botDefense.ts"
  "lib/utils/maskPII.ts"
)

SEC_FAIL=0
for f in "${SECURITY_FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "  ✅ $f"
  else
    echo "  ❌ MISSING: $f"
    SEC_FAIL=1
  fi
done

if [ "$SEC_FAIL" -eq 1 ]; then
  echo ""
  echo "❌ SECURITY FILES MISSING — ABORTING"
  exit 1
fi
echo "✅ Security files OK"

# ── 2. TypeScript ─────────────────────────────────────────────────────────────
echo ""
echo "🔧 TypeScript check..."
if ! npx tsc --noEmit 2>&1; then
  echo ""
  echo "❌ TypeScript errors — fix before committing"
  exit 1
fi
echo "✅ TypeScript clean"

# ── 3. Build + warning baseline ───────────────────────────────────────────────
echo ""
echo "📦 Build check..."
BUILD_OUTPUT=$(npm run build 2>&1)
BUILD_EXIT=$?

echo "$BUILD_OUTPUT" | tail -8

if [ "$BUILD_EXIT" -ne 0 ]; then
  echo ""
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Build passed"

echo ""
echo "⚠️  Warning check..."
WARNING_COUNT=0
WARNING_COUNT=$(echo "$BUILD_OUTPUT" | grep -c "[Ww]arning" 2>/dev/null) || WARNING_COUNT=0
echo "  Build warnings: $WARNING_COUNT"

BASELINE_FILE=".warning-baseline"
if [ -f "$BASELINE_FILE" ]; then
  BASELINE=$(cat "$BASELINE_FILE")
  if [ "$WARNING_COUNT" -gt "$BASELINE" ]; then
    echo "  ❌ Warning count increased: $BASELINE → $WARNING_COUNT"
    exit 1
  fi
  echo "  ✅ No new warnings (baseline: $BASELINE, current: $WARNING_COUNT)"
else
  echo "  ℹ️  No baseline file — writing $WARNING_COUNT to $BASELINE_FILE"
  echo "$WARNING_COUNT" > "$BASELINE_FILE"
fi

# ── 4. i18n tutarlılık ────────────────────────────────────────────────────────
echo ""
echo "🌍 i18n check..."
if ! bash scripts/i18n-check.sh; then
  echo ""
  echo "❌ i18n check failed"
  exit 1
fi

# ── 5. Staged files summary ───────────────────────────────────────────────────
echo ""
echo "📋 Staged files (review before commit):"
STAGED=$(git diff --cached --name-only 2>/dev/null || true)
if [ -z "$STAGED" ]; then
  echo "  (nothing staged)"
else
  echo "$STAGED" | sed 's/^/  /'
fi

echo ""
echo "============================"
echo "✅ PRE-COMMIT CHECK PASSED"
echo "============================"
