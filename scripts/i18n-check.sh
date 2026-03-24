#!/usr/bin/env bash
set -euo pipefail

echo "🌍 i18n TUTARLILIK KONTROLÜ"
echo "============================"

DICT_DIR="dictionaries"
REFERENCE="$DICT_DIR/tr.json"
LOCALES=("en" "de" "it" "ru" "uk" "sr" "me" "ar")
FAIL=0

echo ""
echo "📋 JSON geçerlilik kontrolü..."
for f in "$DICT_DIR"/*.json; do
  if node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" 2>/dev/null; then
    echo "  ✅ $f"
  else
    echo "  ❌ $f — GEÇERSİZ JSON"
    FAIL=1
  fi
done

echo ""
echo "🔑 Key tutarlılık kontrolü (referans: tr.json)..."
TR_KEYS=$(node -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync('$REFERENCE','utf8'))).sort().join('\n'))")
TR_COUNT=$(echo "$TR_KEYS" | wc -l | tr -d ' ')
echo "  TR key sayısı: $TR_COUNT"

for locale in "${LOCALES[@]}"; do
  FILE="$DICT_DIR/$locale.json"
  if [ ! -f "$FILE" ]; then
    echo "  ❌ $FILE — DOSYA YOK"
    FAIL=1
    continue
  fi

  LOCALE_KEYS=$(node -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync('$FILE','utf8'))).sort().join('\n'))")
  LOCALE_COUNT=$(echo "$LOCALE_KEYS" | wc -l | tr -d ' ')

  MISSING=$(comm -23 <(echo "$TR_KEYS") <(echo "$LOCALE_KEYS") | wc -l | tr -d ' ')
  EXTRA=$(comm -13 <(echo "$TR_KEYS") <(echo "$LOCALE_KEYS") | wc -l | tr -d ' ')

  if [ "$MISSING" -eq 0 ] && [ "$EXTRA" -eq 0 ]; then
    echo "  ✅ $locale.json — $LOCALE_COUNT keys (eşit)"
  else
    if [ "$MISSING" -gt 0 ]; then
      echo "  ❌ $locale.json — $MISSING key EKSİK"
      comm -23 <(echo "$TR_KEYS") <(echo "$LOCALE_KEYS") | head -5 | while read -r k; do echo "     eksik: $k"; done
    fi
    if [ "$EXTRA" -gt 0 ]; then
      echo "  ⚠️  $locale.json — $EXTRA key FAZLA"
    fi
    FAIL=1
  fi
done

echo ""
echo "📝 Boş değer kontrolü..."
for f in "$DICT_DIR"/*.json; do
  EMPTY=$(node -e "
    const d=JSON.parse(require('fs').readFileSync('$f','utf8'));
    const empty=Object.entries(d).filter(([,v])=>v==='');
    if(empty.length) console.log(empty.map(e=>e[0]).join(', '));
  " 2>/dev/null || true)
  if [ -n "${EMPTY:-}" ]; then
    echo "  ⚠️  $f — boş değerler: $EMPTY"
  fi
done

echo ""
echo "============================"
if [ "$FAIL" -eq 0 ]; then
  echo "✅ i18n TUTARLILIK KONTROLÜ GEÇTİ"
  exit 0
else
  echo "❌ i18n TUTARLILIK KONTROLÜ BAŞARISIZ"
  exit 1
fi
