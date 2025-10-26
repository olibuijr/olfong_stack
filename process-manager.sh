#!/bin/bash

# Ölföng Stack Process Manager
# Comprehensive process management for backend and frontend services
# Usage: ./process-manager.sh [command] [service]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
BACKEND_DIR="$PROJECT_ROOT/backend"
WEB_DIR="$PROJECT_ROOT/web"
LOGS_DIR="$PROJECT_ROOT/logs"
PID_DIR="$PROJECT_ROOT/.pids"

# Service configurations
BACKEND_PORT=5000
FRONTEND_PORT=3001
BACKEND_CMD="npm run dev"
FRONTEND_CMD="npm run dev"

# Create necessary directories
mkdir -p "$LOGS_DIR" "$PID_DIR"

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1"
}

log_info() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ${NC} $1"
}

# Check if a port is in use
is_port_in_use() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check if a process is running
is_process_running() {
    local pid_file=$1
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$pid_file"
            return 1
        fi
    else
        return 1
    fi
}

# Get process info
get_process_info() {
    local pid_file=$1
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            local cmd=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
            local cpu=$(ps -p "$pid" -o %cpu= 2>/dev/null | tr -d ' ' || echo "0")
            local mem=$(ps -p "$pid" -o %mem= 2>/dev/null | tr -d ' ' || echo "0")
            echo "$pid|$cmd|$cpu|$mem"
        else
            rm -f "$pid_file"
            echo "not_running"
        fi
    else
        echo "not_running"
    fi
}

# Start backend service
start_backend() {
    log "Starting backend service..."
    
    if is_port_in_use $BACKEND_PORT; then
        log_warning "Port $BACKEND_PORT is in use. Attempting to kill the process..."
        lsof -t -i:$BACKEND_PORT | xargs kill -9
        sleep 2
    fi

    if is_process_running "$PID_DIR/backend.pid"; then
        log_warning "Backend service is already running"
        return 0
    fi
    
    if is_port_in_use $BACKEND_PORT; then
        log_error "Port $BACKEND_PORT is already in use"
        return 1
    fi
    
    cd "$BACKEND_DIR"
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        log_info "Installing backend dependencies..."
        npm install
    fi
    
    # Run linting before starting
    log_info "Running backend linting..."
    (npm run lint || true)
    
    # Start the service
    nohup npm run dev > "$LOGS_DIR/backend.log" 2>&1 &
    local pid=$!
    echo $pid > "$PID_DIR/backend.pid"
    
    # Wait for service to start
    local max_attempts=30
    local attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if is_port_in_use $BACKEND_PORT; then
            log_success "Backend service started successfully (PID: $pid, Port: $BACKEND_PORT)"
            return 0
        fi
        sleep 1
        ((attempt++))
    done
    
    log_error "Backend service failed to start within 30 seconds"
    return 1
}

# Start frontend service
start_frontend() {
    log "Starting frontend service..."

    if is_port_in_use $FRONTEND_PORT; then
        log_warning "Port $FRONTEND_PORT is in use. Attempting to kill the process..."
        lsof -t -i:$FRONTEND_PORT | xargs kill -9
        sleep 2
    fi

    if is_process_running "$PID_DIR/frontend.pid"; then
        log_warning "Frontend service is already running"
        return 0
    fi

    if is_port_in_use $FRONTEND_PORT; then
        log_error "Port $FRONTEND_PORT is already in use"
        return 1
    fi

    cd "$WEB_DIR"

    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        log_info "Installing frontend dependencies..."
        npm install
    fi

    # Run linting before starting
    log_info "Running frontend linting..."
    (npm run lint || true)

    # Start the service
    nohup npm run dev > "$LOGS_DIR/frontend.log" 2>&1 &
    local pid=$!
    echo $pid > "$PID_DIR/frontend.pid"

    # Wait for service to start
    local max_attempts=30
    local attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if is_port_in_use $FRONTEND_PORT; then
            log_success "Frontend service started successfully (PID: $pid, Port: $FRONTEND_PORT)"
            return 0
        fi
        sleep 1
        ((attempt++))
    done

    log_error "Frontend service failed to start within 30 seconds"
    return 1
}


# Stop backend service
stop_backend() {
    log "Stopping backend service..."
    
    if ! is_process_running "$PID_DIR/backend.pid"; then
        log_warning "Backend service is not running"
        return 0
    fi
    
    local pid=$(cat "$PID_DIR/backend.pid")
    if kill -TERM "$pid" 2>/dev/null; then
        # Wait for graceful shutdown
        local max_attempts=10
        local attempt=0
        while [ $attempt -lt $max_attempts ]; do
            if ! ps -p "$pid" > /dev/null 2>&1; then
                log_success "Backend service stopped gracefully"
                rm -f "$PID_DIR/backend.pid"
                return 0
            fi
            sleep 1
            ((attempt++))
        done
        
        # Force kill if graceful shutdown failed
        log_warning "Graceful shutdown failed, forcing termination..."
        kill -KILL "$pid" 2>/dev/null || true
        log_success "Backend service stopped forcefully"
    else
        log_error "Failed to stop backend service"
        return 1
    fi
    
    rm -f "$PID_DIR/backend.pid"
}

# Stop frontend service
stop_frontend() {
    log "Stopping frontend service..."

    if ! is_process_running "$PID_DIR/frontend.pid"; then
        log_warning "Frontend service is not running"
        return 0
    fi

    local pid=$(cat "$PID_DIR/frontend.pid")
    if kill -TERM "$pid" 2>/dev/null; then
        # Wait for graceful shutdown
        local max_attempts=10
        local attempt=0
        while [ $attempt -lt $max_attempts ]; do
            if ! ps -p "$pid" > /dev/null 2>&1; then
                log_success "Frontend service stopped gracefully"
                rm -f "$PID_DIR/frontend.pid"
                return 0
            fi
            sleep 1
            ((attempt++))
        done
        
        # Force kill if graceful shutdown failed
        log_warning "Graceful shutdown failed, forcing termination..."
        kill -KILL "$pid" 2>/dev/null || true
        log_success "Frontend service stopped forcefully"
    else
        log_error "Failed to stop frontend service"
        return 1
    fi
    
    rm -f "$PID_DIR/frontend.pid"
}


# Restart service
restart_service() {
    local service=$1
    log "Restarting $service service..."
    stop_$service
    sleep 2
    start_$service
}

# Show service status
show_status() {
    echo -e "${PURPLE}=== Ölföng Stack Service Status ===${NC}"
    echo
    
    # Backend status
    local backend_info=$(get_process_info "$PID_DIR/backend.pid")
    if [ "$backend_info" = "not_running" ]; then
        echo -e "Backend:  ${RED}● Not Running${NC}"
    else
        IFS='|' read -r pid cmd cpu mem <<< "$backend_info"
        echo -e "Backend:  ${GREEN}● Running${NC} (PID: $pid, CPU: $cpu%, Memory: $mem%)"
    fi
    
    # Frontend status
    local frontend_info=$(get_process_info "$PID_DIR/frontend.pid")
    if [ "$frontend_info" = "not_running" ]; then
        echo -e "Frontend: ${RED}● Not Running${NC}"
    else
        IFS='|' read -r pid cmd cpu mem <<< "$frontend_info"
        echo -e "Frontend: ${GREEN}● Running${NC} (PID: $pid, CPU: $cpu%, Memory: $mem%)"
    fi
    
    echo
    echo -e "${PURPLE}=== Port Status ===${NC}"
    if is_port_in_use $BACKEND_PORT; then
        echo -e "Port $BACKEND_PORT: ${GREEN}● In Use${NC}"
    else
        echo -e "Port $BACKEND_PORT: ${RED}● Available${NC}"
    fi
    
    if is_port_in_use $FRONTEND_PORT; then
        echo -e "Port $FRONTEND_PORT: ${GREEN}● In Use${NC}"
    else
        echo -e "Port $FRONTEND_PORT: ${RED}● Available${NC}"
    fi

    echo
    echo -e "${PURPLE}=== URLs ===${NC}"
    echo "Backend API:     http://localhost:$BACKEND_PORT/api"
    echo "Frontend App:    http://localhost:$FRONTEND_PORT"
}

# Show logs
show_logs() {
    local service=$1
    local lines=${2:-50}
    
    if [ -z "$service" ]; then
        echo -e "${PURPLE}=== Available Log Files ===${NC}"
        ls -la "$LOGS_DIR"/*.log 2>/dev/null || echo "No log files found"
        return 0
    fi
    
    local log_file="$LOGS_DIR/${service}.log"
    if [ ! -f "$log_file" ]; then
        log_error "Log file for $service not found: $log_file"
        return 1
    fi
    
    echo -e "${PURPLE}=== $service Logs (last $lines lines) ===${NC}"
    tail -n "$lines" "$log_file"
}

# Follow logs
follow_logs() {
    local service=$1
    
    if [ -z "$service" ]; then
        log_error "Please specify a service (backend or frontend)"
        return 1
    fi
    
    local log_file="$LOGS_DIR/${service}.log"
    if [ ! -f "$log_file" ]; then
        log_error "Log file for $service not found: $log_file"
        return 1
    fi
    
    log_info "Following $service logs (Ctrl+C to stop)..."
    tail -f "$log_file"
}

# Health check
health_check() {
    log "Performing health check..."
    
    local backend_healthy=false
    local frontend_healthy=false
    
    # Check backend
    if is_process_running "$PID_DIR/backend.pid" && is_port_in_use $BACKEND_PORT; then
        if curl -s "http://localhost:$BACKEND_PORT/api/health" > /dev/null 2>&1; then
            backend_healthy=true
            log_success "Backend health check passed"
        else
            log_warning "Backend is running but health endpoint is not responding"
        fi
    else
        log_warning "Backend is not running"
    fi
    
    # Check frontend
    if is_process_running "$PID_DIR/frontend.pid" && is_port_in_use $FRONTEND_PORT; then
        if curl -s "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
            frontend_healthy=true
            log_success "Frontend health check passed"
        else
            log_warning "Frontend is running but not responding"
        fi
    else
        log_warning "Frontend is not running"
    fi
    
    if [ "$backend_healthy" = true ] && [ "$frontend_healthy" = true ]; then
        log_success "All services are healthy"
        return 0
    else
        log_error "Some services are not healthy"
        return 1
    fi
}

# Run linting
run_lint() {
    local service=$1
    
    if [ -z "$service" ]; then
        log "Running linting for all services..."
        run_lint backend
        run_lint frontend
        return $?
    fi
    
    log "Running linting for $service..."
    
    case $service in
        backend)
            cd "$BACKEND_DIR"
            if [ ! -d "node_modules" ]; then
                log_info "Installing backend dependencies..."
                npm install
            fi
            npm run lint
            ;;
        frontend)
            cd "$WEB_DIR"
            if [ ! -d "node_modules" ]; then
                log_info "Installing frontend dependencies..."
                npm install
            fi
            npm run lint
            ;;
        all)
            run_lint backend
            run_lint frontend
            ;;
        *)
            log_error "Unknown service: $service"
            return 1
            ;;
    esac
}

# Run tests
run_tests() {
    local service=$1
    
    if [ -z "$service" ]; then
        log "Running tests for all services..."
        run_tests backend
        run_tests frontend
        return $?
    fi
    
    log "Running tests for $service..."
    
    case $service in
        backend)
            cd "$BACKEND_DIR"
            if [ ! -d "node_modules" ]; then
                log_info "Installing backend dependencies..."
                npm install
            fi
            npm test
            ;;
        frontend)
            cd "$WEB_DIR"
            if [ ! -d "node_modules" ]; then
                log_info "Installing frontend dependencies..."
                npm install
            fi
            # Frontend doesn't have tests configured yet
            log_warning "No tests configured for frontend"
            ;;
        all)
            run_tests backend
            run_tests frontend
            ;;
        *)
            log_error "Unknown service: $service"
            return 1
            ;;
    esac
}

# Clean up
cleanup() {
    log "Cleaning up..."
    stop_backend
    stop_frontend
    rm -rf "$PID_DIR"
    log_success "Cleanup completed"
}

# Show help
show_help() {
    echo -e "${PURPLE}Ölföng Stack Process Manager${NC}"
    echo
    echo "Usage: $0 [command] [service]"
    echo
    echo "Commands:"
    echo "  start [backend|frontend|all]    Start service(s)"
    echo "  stop [backend|frontend|all]     Stop service(s)"
    echo "  restart [backend|frontend|all]  Restart service(s)"
    echo "  status                          Show service status"
    echo "  logs [backend|frontend]         Show service logs"
    echo "  follow [backend|frontend]       Follow service logs"
    echo "  health                          Perform health check"
    echo "  lint [backend|frontend|all]     Run linting"
    echo "  test [backend|frontend|all]     Run tests"
    echo "  cleanup                         Stop all services and clean up"
    echo "  help                            Show this help"
    echo
    echo "Examples:"
    echo "  $0 start all                   Start all services"
    echo "  $0 stop backend                Stop backend service"
    echo "  $0 logs frontend               Show frontend logs"
    echo "  $0 follow backend              Follow backend logs"
    echo "  $0 lint all                    Run linting for all services"
    echo "  $0 health                      Check service health"
}

# Main script logic
main() {
    local command=$1
    local service=$2
    
    case $command in
        start)
            case $service in
                backend) start_backend ;;
                frontend) start_frontend ;;
                all|"")
                    start_backend
                    start_frontend
                    ;;
                *) log_error "Unknown service: $service"; exit 1 ;;
            esac
            ;;
        stop)
            case $service in
                backend) stop_backend ;;
                frontend) stop_frontend ;;
                all|"")
                    stop_backend
                    stop_frontend
                    ;;
                *) log_error "Unknown service: $service"; exit 1 ;;
            esac
            ;;
        restart)
            case $service in
                backend) restart_service backend ;;
                frontend) restart_service frontend ;;
                all|"")
                    restart_service backend
                    restart_service frontend
                    ;;
                *) log_error "Unknown service: $service"; exit 1 ;;
            esac
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$service"
            ;;
        follow)
            follow_logs "$service"
            ;;
        health)
            health_check
            ;;
        lint)
            run_lint "$service"
            ;;
        test)
            run_tests "$service"
            ;;
        cleanup)
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"