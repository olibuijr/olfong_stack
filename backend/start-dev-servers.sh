#!/bin/bash

# Ölföng Development Server Manager
# This script manages background dev servers using MCP commands

set -e

echo "🚀 Starting Ölföng Development Servers..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}Port $port is already in use${NC}"
        return 0
    else
        return 1
    fi
}

# Function to wait for service
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    log "Waiting for $service_name to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ $service_name is ready${NC}"
            return 0
        fi

        echo -n "."
        sleep 2
        ((attempt++))
    done

    echo -e "${RED}✗ $service_name failed to start${NC}"
    return 1
}

# Start PostgreSQL database
log "Starting PostgreSQL database..."
if check_port 5432; then
    log "PostgreSQL already running on port 5432"
else
    docker-compose up -d postgres
    wait_for_service "http://localhost:5432" "PostgreSQL"
fi

# Start Redis (for caching and background jobs)
log "Starting Redis..."
if check_port 6379; then
    log "Redis already running on port 6379"
else
    docker-compose up -d redis
    wait_for_service "http://localhost:6379" "Redis"
fi

# Start backend server
log "Starting backend server..."
cd backend
if check_port 5000; then
    log "Backend server already running on port 5000"
else
    npm run dev &
    echo $! > .backend_pid
    wait_for_service "http://localhost:5000/health" "Backend Server"
fi

# Start web frontend
log "Starting web frontend..."
cd ../web
if check_port 5173; then
    log "Web frontend already running on port 5173"
else
    npm run dev &
    echo $! > .web_pid
    wait_for_service "http://localhost:5173" "Web Frontend"
fi

# Start Flutter mobile app (if available)
log "Checking Flutter mobile app..."
cd ../olfong_mobile_flutter
if [ -f "pubspec.yaml" ]; then
    log "Starting Flutter development server..."
    if check_port 8080; then
        log "Flutter dev server already running on port 8080"
    else
        flutter run --web-port 8080 &
        echo $! > .flutter_pid
        # Flutter web takes longer to start
        sleep 10
        wait_for_service "http://localhost:8080" "Flutter Web App" || true
    fi
else
    log "Flutter app not found, skipping..."
fi

cd ..
log "🎉 All development servers started successfully!"
log "📊 Services running:"
echo "  - PostgreSQL: http://localhost:5432"
echo "  - Redis: http://localhost:6379"
echo "  - Backend API: http://localhost:5000"
echo "  - Web Frontend: http://localhost:5173"
echo "  - Flutter Web: http://localhost:8080 (if available)"

log "💡 Use 'stop-dev-servers.sh' to stop all services"
log "🔍 Use MCP commands to monitor and manage processes"