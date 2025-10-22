#!/bin/bash

# Ölföng Stack Migration Fixer
# Help resolve common migration issues

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Ölföng Stack Migration Fixer ===${NC}"
echo

cd "$PROJECT_ROOT/backend"

echo -e "${BLUE}Checking migration status...${NC}"
MIGRATION_STATUS=$(npx prisma migrate status 2>&1)

if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
    echo -e "${GREEN}✓ Migrations are up to date${NC}"
    exit 0
fi

echo "$MIGRATION_STATUS"
echo

echo -e "${YELLOW}Attempting to resolve migration issues...${NC}"

# Try to deploy migrations
echo "Deploying migrations..."
if npx prisma migrate deploy; then
    echo -e "${GREEN}✓ Migrations deployed successfully${NC}"
else
    echo -e "${RED}✗ Migration deployment failed${NC}"
    echo
    echo -e "${YELLOW}You may need to manually resolve migration conflicts.${NC}"
    echo "Common solutions:"
    echo "1. Check if database changes were made outside of Prisma"
    echo "2. Use 'npx prisma migrate resolve --applied <migration_name>' for already applied migrations"
    echo "3. Use 'npx prisma migrate reset' to reset (WARNING: This will delete data)"
    echo "4. Manually edit the migration file if needed"
fi

echo
echo -e "${BLUE}=== Migration Fix Complete ===${NC}"