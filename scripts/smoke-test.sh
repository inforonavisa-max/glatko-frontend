#!/usr/bin/env bash
set -euo pipefail

echo "🔥 GLATKO SMOKE TEST"
echo "===================="

FAILED=0
SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ]; then
    echo ""
    echo "🛑 Stopping server (pid $SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo ""
echo "📦 Building..."
if ! npm run build; then
  echo "❌ BUILD FAILED"
  exit 1
fi
echo "✅ Build passed"

echo ""
echo "🚀 Starting production server..."
lsof -ti tcp:3001 | xargs kill -9 2>/dev/null || true
sleep 1
npm run start -- --port 3001 &
SERVER_PID=$!

echo "⏳ Waiting for server to be ready..."
READY=0
for i in $(seq 1 30); do
  if curl -sf -o /dev/null "http://localhost:3001/tr" 2>/dev/null; then
    READY=1
    break
  fi
  sleep 1
done

if [ "$READY" -eq 0 ]; then
  echo "❌ Server did not start within 30 seconds"
  exit 1
fi
echo "✅ Server is up"

echo ""
echo "🔍 Checking critical pages..."

check_page() {
  local url="$1"
  local name="$2"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  if [ "$status" = "200" ]; then
    echo "  ✅ $name — HTTP $status"
  else
    echo "  ❌ $name — expected 200, got $status  ($url)"
    FAILED=1
  fi
}

check_page "http://localhost:3001/tr" "Homepage TR"
check_page "http://localhost:3001/en" "Homepage EN"
check_page "http://localhost:3001/de" "Homepage DE"
check_page "http://localhost:3001/ru" "Homepage RU"
check_page "http://localhost:3001/ar" "Homepage AR"

echo ""
echo "===================="
if [ "$FAILED" -eq 0 ]; then
  echo "✅ ALL SMOKE TESTS PASSED"
  exit 0
else
  echo "❌ SOME TESTS FAILED"
  exit 1
fi
