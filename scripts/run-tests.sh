#!/bin/bash

# Ölföng Stack Test Runner
# Run tests for all services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Ölföng Stack Test Runner ===${NC}"
echo

# Backend tests
echo -e "${BLUE}Running Backend Tests...${NC}"
cd "$PROJECT_ROOT/backend"
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    if npm test; then
        echo -e "  Backend tests: ${GREEN}● Passed${NC}"
    else
        echo -e "  Backend tests: ${RED}● Failed${NC}"
    fi
else
    echo -e "  Backend tests: ${YELLOW}● No tests configured${NC}"
fi

echo

# Frontend tests
echo -e "${BLUE}Running Frontend Tests...${NC}"
cd "$PROJECT_ROOT/web"
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    if npm test; then
        echo -e "  Frontend tests: ${GREEN}● Passed${NC}"
    else
        echo -e "  Frontend tests: ${RED}● Failed${NC}"
    fi
else
    echo -e "  Frontend tests: ${YELLOW}● No tests configured${NC}"
fi

echo

# E2E tests
echo -e "${BLUE}Running E2E Tests...${NC}"
cd "$PROJECT_ROOT/web-tests"
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    if npx playwright test; then
        echo -e "  E2E tests: ${GREEN}● Passed${NC}"
    else
        echo -e "  E2E tests: ${RED}● Failed${NC}"
    fi
else
    echo -e "  E2E tests: ${YELLOW}● No E2E tests configured${NC}"
fi

echo
echo -e "${BLUE}=== Test Run Complete ===${NC}"