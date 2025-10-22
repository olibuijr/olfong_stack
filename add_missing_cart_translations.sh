#!/bin/bash

API_BASE_URL="http://localhost:5000/api"

echo "Getting authentication token..."

# Try to login using dummy login with test phone number
TOKEN=$(curl -s -X POST "$API_BASE_URL/auth/dummy/login" \
  -H "Content-Type: application/json" \
  -d '{"phone":"8430854"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get authentication token"
  exit 1
fi

echo "Got authentication token"

# Function to add a translation
add_translation() {
  local data="$1"
  local response=$(curl -s -X POST "$API_BASE_URL/translations" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$data")

  if echo "$response" | grep -q '"success":true'; then
    echo "✓ Added translation successfully"
  elif echo "$response" | grep -q '"success":false.*already exists'; then
    echo "- Translation already exists (skipped)"
  else
    echo "✗ Failed to add translation: $response"
  fi
}

# Add missing cartPage translations
echo "Adding missing cartPage translations..."

# English
add_translation '{"key":"cartPage.cartDescription","section":"cartPage","language":"en","value":"Review your items and proceed to checkout"}'
add_translation '{"key":"cartPage.cartItems","section":"cartPage","language":"en","value":"Cart Items"}'
add_translation '{"key":"cartPage.each","section":"cartPage","language":"en","value":"each"}'
add_translation '{"key":"cartPage.noImage","section":"cartPage","language":"en","value":"No image"}'

# Icelandic
add_translation '{"key":"cartPage.cartDescription","section":"cartPage","language":"is","value":"Skoðaðu vörurnar þínar og haltu áfram að greiðslu"}'
add_translation '{"key":"cartPage.cartItems","section":"cartPage","language":"is","value":"Karfavörur"}'
add_translation '{"key":"cartPage.each","section":"cartPage","language":"is","value":"hver"}'
add_translation '{"key":"cartPage.noImage","section":"cartPage","language":"is","value":"Engin mynd"}'

echo "Finished adding missing cartPage translations."