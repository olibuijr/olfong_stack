#!/bin/bash

# Ölföng Stack Translation Checker
# Check for missing translations

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Ölföng Stack Translation Check ===${NC}"
echo

# Check backend translation scripts
echo -e "${BLUE}Checking Backend Translation Scripts...${NC}"
cd "$PROJECT_ROOT/backend"

if [ -f "scripts/check-missing-translations.js" ]; then
    echo "Running check-missing-translations.js..."
    node scripts/check-missing-translations.js
else
    echo -e "  ${YELLOW}● check-missing-translations.js not found${NC}"
fi

echo

# Check translation statistics from the report file
echo -e "${BLUE}Translation Statistics:${NC}"
if [ -f "$PROJECT_ROOT/logs/missing-keys-report.json" ]; then
    REPORT=$(cat "$PROJECT_ROOT/logs/missing-keys-report.json")
    TOTAL=$(echo "$REPORT" | jq -r '.totalUsedKeys')
    DATABASE=$(echo "$REPORT" | jq -r '.totalDatabaseKeys')
    MISSING=$(echo "$REPORT" | jq -r '.totalMissingKeys')
    COVERAGE=$(echo "$REPORT" | jq -r '.percentageCoverage')

    echo "  Total Keys: $TOTAL"
    echo "  Database Keys: $DATABASE"
    echo "  Missing Translations: $MISSING"
    echo -e "  Coverage: ${COVERAGE}%"

    if [ "$(echo "$COVERAGE < 100" | bc -l 2>/dev/null)" = "1" ]; then
        echo -e "  ${YELLOW}● Incomplete translation coverage${NC}"
    else
        echo -e "  ${GREEN}● Full translation coverage${NC}"
    fi
else
    echo -e "  ${RED}● Unable to read translation report${NC}"
fi

echo

# Check missing translations log
echo -e "${BLUE}Missing Translations Log:${NC}"
if [ -f "logs/missing-translations.log" ] && [ -s "logs/missing-translations.log" ]; then
    LINES=$(wc -l < logs/missing-translations.log)
    echo -e "  Found $LINES missing translation entries"
    echo -e "  ${YELLOW}● Check logs/missing-translations.log for details${NC}"
else
    echo -e "  ${GREEN}● No missing translations logged${NC}"
fi

echo
echo -e "${BLUE}=== Translation Check Complete ===${NC}"