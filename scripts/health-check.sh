#!/bin/bash

# Ölföng Stack Health Check Script
# Comprehensive health check for all services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKEND_PORT=5000
FRONTEND_PORT=3001
BACKEND_URL="http://localhost:$BACKEND_PORT"
FRONTEND_URL="http://localhost:$FRONTEND_PORT"

echo -e "${BLUE}=== Ölföng Stack Health Check ===${NC}"
echo

# Check if services are running
echo -e "${BLUE}Service Status:${NC}"
if pgrep -f "node.*server.js" > /dev/null; then
    echo -e "  Backend:  ${GREEN}● Running${NC}"
else
    echo -e "  Backend:  ${RED}● Not Running${NC}"
fi

if pgrep -f "vite" > /dev/null; then
    echo -e "  Frontend: ${GREEN}● Running${NC}"
else
    echo -e "  Frontend: ${RED}● Not Running${NC}"
fi

echo

# Check ports
echo -e "${BLUE}Port Status:${NC}"
if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "  Port $BACKEND_PORT: ${GREEN}● In Use${NC}"
else
    echo -e "  Port $BACKEND_PORT: ${RED}● Available${NC}"
fi

if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "  Port $FRONTEND_PORT: ${GREEN}● In Use${NC}"
else
    echo -e "  Port $FRONTEND_PORT: ${RED}● Available${NC}"
fi

echo

# Check API endpoints
echo -e "${BLUE}API Health:${NC}"

# Backend health
if curl -s "$BACKEND_URL/api/health" > /dev/null 2>&1; then
    echo -e "  Backend API: ${GREEN}● Healthy${NC}"
else
    echo -e "  Backend API: ${RED}● Unhealthy${NC}"
fi

# Translation API
if curl -s "$BACKEND_URL/api/translations/language/en" > /dev/null 2>&1; then
    echo -e "  Translation API: ${GREEN}● Healthy${NC}"
else
    echo -e "  Translation API: ${RED}● Unhealthy${NC}"
fi

echo

# Check frontend
echo -e "${BLUE}Frontend Status:${NC}"
if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "  Frontend App: ${GREEN}● Accessible${NC}"
else
    echo -e "  Frontend App: ${RED}● Not Accessible${NC}"
fi

echo

# Database check
echo -e "${BLUE}Database Status:${NC}"
cd "$PROJECT_ROOT/backend"
if npx prisma db execute --file <(echo "SELECT 1 as test;") > /dev/null 2>&1; then
    echo -e "  Database: ${GREEN}● Connected${NC}"

    # Check migration status
    if npx prisma migrate status 2>&1 | grep -q "Database schema is up to date"; then
        echo -e "  Migrations: ${GREEN}● Up to date${NC}"
    else
        echo -e "  Migrations: ${YELLOW}● Pending migrations${NC}"
    fi
else
    echo -e "  Database: ${RED}● Connection Issue${NC}"
fi

echo
echo -e "${BLUE}=== Health Check Complete ===${NC}"