#!/bin/bash

# Ölföng Development Server Stopper
# This script stops all background dev servers

set -e

echo "🛑 Stopping Ölföng Development Servers..."

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

# Function to kill process by PID file
kill_by_pid_file() {
    local pid_file=$1
    local service_name=$2

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            log "Stopping $service_name (PID: $pid)..."
            kill "$pid"
            # Wait for process to stop
            for i in {1..10}; do
                if ! kill -0 "$pid" 2>/dev/null; then
                    echo -e "${GREEN}✓ $service_name stopped${NC}"
                    rm -f "$pid_file"
                    return 0
                fi
                sleep 1
            done
            # Force kill if still running
            kill -9 "$pid" 2>/dev/null || true
            echo -e "${YELLOW}⚠ $service_name force stopped${NC}"
        else
            echo -e "${YELLOW}⚠ $service_name was not running${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}⚠ No PID file found for $service_name${NC}"
    fi
}

# Stop individual services
kill_by_pid_file "backend/.backend_pid" "Backend Server"
kill_by_pid_file "web/.web_pid" "Web Frontend"
kill_by_pid_file "olfong_mobile_flutter/.flutter_pid" "Flutter Web App"

# Stop Docker services
log "Stopping Docker services..."
docker-compose down

log "🎉 All development servers stopped successfully!"