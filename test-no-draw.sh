#!/bin/bash

# Test script to remove current year's draw and test the "no draw" message

YEAR=$(date +%Y)

echo "🧪 Removing $YEAR draw to test 'no draw' message..."

if [ -d "families/$YEAR" ]; then
    rm -rf "families/$YEAR"
    echo "✅ Removed families/$YEAR/"
    echo "📱 Now open lookup.html to see the 'no draw' message"
    echo "🔄 Run ./generate-draw.sh to recreate the draw"
else
    echo "ℹ️  No draw found for $YEAR"
fi