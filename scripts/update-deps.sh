#!/bin/bash

# Ölföng Stack Dependency Updater
# Update dependencies for all services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Ölföng Stack Dependency Update ===${NC}"
echo

# Backend dependencies
echo -e "${BLUE}Updating Backend Dependencies...${NC}"
cd "$PROJECT_ROOT/backend"
if [ -f "package.json" ]; then
    echo "Running npm update..."
    npm update
    echo -e "  Backend: ${GREEN}● Updated${NC}"
else
    echo -e "  Backend: ${YELLOW}● No package.json found${NC}"
fi

echo

# Frontend dependencies
echo -e "${BLUE}Updating Frontend Dependencies...${NC}"
cd "$PROJECT_ROOT/web"
if [ -f "package.json" ]; then
    echo "Running npm update..."
    npm update
    echo -e "  Frontend: ${GREEN}● Updated${NC}"
else
    echo -e "  Frontend: ${YELLOW}● No package.json found${NC}"
fi

echo

# Web tests dependencies
echo -e "${BLUE}Updating Web Tests Dependencies...${NC}"
cd "$PROJECT_ROOT/web-tests"
if [ -f "package.json" ]; then
    echo "Running npm update..."
    npm update
    echo -e "  Web Tests: ${GREEN}● Updated${NC}"
else
    echo -e "  Web Tests: ${YELLOW}● No package.json found${NC}"
fi

echo

# Mobile app dependencies (Flutter)
echo -e "${BLUE}Updating Mobile App Dependencies...${NC}"
cd "$PROJECT_ROOT/olfong_mobile_flutter"
if [ -f "pubspec.yaml" ]; then
    echo "Running flutter pub get..."
    flutter pub get
    echo -e "  Mobile App: ${GREEN}● Updated${NC}"
else
    echo -e "  Mobile App: ${YELLOW}● No pubspec.yaml found${NC}"
fi

echo
echo -e "${BLUE}=== Dependency Update Complete ===${NC}"
echo -e "${YELLOW}Note: Run tests to ensure everything still works after updates${NC}"