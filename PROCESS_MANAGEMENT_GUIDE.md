# Ölföng Stack Process Management Guide

## Overview

This project uses a comprehensive process management script (`process-manager.sh`) to handle all service operations including starting, stopping, monitoring, and logging for both backend and frontend services.

## Quick Start

```bash
# Start all services
./process-manager.sh start all

# Check status
./process-manager.sh status

# View logs
./process-manager.sh logs backend
./process-manager.sh logs frontend

# Stop all services
./process-manager.sh stop all
```

## Available Commands

### Service Management
- `start [backend|frontend|all]` - Start service(s)
- `stop [backend|frontend|all]` - Stop service(s)
- `restart [backend|frontend|all]` - Restart service(s)
- `status` - Show service status
- `cleanup` - Stop all services and clean up

### Monitoring & Logs
- `logs [backend|frontend]` - Show service logs (last 50 lines)
- `follow [backend|frontend]` - Follow service logs in real-time
- `health` - Perform health check on all services

### Code Validation
- `lint [backend|frontend|all]` - Run ESLint on service(s)
- `test [backend|frontend|all]` - Run TypeScript checks and tests

## Service Configuration

### Backend Service
- **Port**: 5000
- **Command**: `npm run dev`
- **Directory**: `./backend/`
- **Log File**: `./logs/backend.log`
- **PID File**: `./.pids/backend.pid`

### Frontend Service
- **Port**: 3001
- **Command**: `npm run dev`
- **Directory**: `./web/`
- **Log File**: `./logs/frontend.log`
- **PID File**: `./.pids/frontend.pid`

## Features

### Automatic Validation
- **Pre-start Linting**: Runs ESLint before starting services
- **TypeScript Checking**: Validates TypeScript compilation
- **Dependency Installation**: Automatically installs dependencies if missing
- **Health Monitoring**: Built-in health checks and monitoring

### Process Management
- **PID Tracking**: Manages process IDs for reliable control
- **Graceful Shutdown**: Proper service termination with fallback to force kill
- **Port Conflict Detection**: Checks for port availability before starting
- **Process Monitoring**: Real-time process status and resource usage

### Logging System
- **Centralized Logs**: All service logs in `./logs/` directory
- **Real-time Following**: Live log monitoring with `follow` command
- **Log Rotation**: Automatic log management
- **Error Detection**: Comprehensive error logging and reporting

## Usage Examples

### Development Workflow
```bash
# 1. Start all services
./process-manager.sh start all

# 2. Check everything is running
./process-manager.sh status

# 3. Follow backend logs for debugging
./process-manager.sh follow backend

# 4. Run linting after code changes
./process-manager.sh lint all

# 5. Run type checking
./process-manager.sh test all

# 6. Check service health
./process-manager.sh health

# 7. Stop services when done
./process-manager.sh stop all
```

### Debugging
```bash
# Check service status
./process-manager.sh status

# View recent logs
./process-manager.sh logs backend
./process-manager.sh logs frontend

# Follow logs in real-time
./process-manager.sh follow backend

# Restart problematic service
./process-manager.sh restart backend

# Health check
./process-manager.sh health
```

### Code Validation
```bash
# Run linting for all services
./process-manager.sh lint all

# Run linting for specific service
./process-manager.sh lint backend

# Run type checking and tests
./process-manager.sh test all

# Run tests for specific service
./process-manager.sh test frontend
```

## Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check if port is in use
./process-manager.sh status

# Check logs for errors
./process-manager.sh logs backend

# Try restarting
./process-manager.sh restart backend
```

#### Linting Failures
```bash
# Run linting to see errors
./process-manager.sh lint all

# Fix errors in code
# Re-run linting
./process-manager.sh lint all
```

#### TypeScript Errors
```bash
# Run type checking
./process-manager.sh test all

# Fix type errors in code
# Re-run type checking
./process-manager.sh test all
```

#### Service Not Responding
```bash
# Check health
./process-manager.sh health

# Check logs
./process-manager.sh logs backend

# Restart service
./process-manager.sh restart backend
```

### Cleanup
```bash
# Stop all services and clean up
./process-manager.sh cleanup

# This will:
# - Stop all running services
# - Remove PID files
# - Clean up process state
```

## Integration with Cursor Rules

The process management script is integrated with the project's Cursor rules:

- **Mandatory Usage**: All process operations must use the script
- **Automatic Validation**: Linting and type checking run before service startup
- **Health Monitoring**: Built-in health checks ensure services are working
- **Log Management**: Centralized logging for debugging and monitoring

## Best Practices

1. **Always use the script**: Never run npm commands directly
2. **Check status first**: Use `status` command before operations
3. **Validate code**: Run linting and type checking after changes
4. **Monitor logs**: Use `follow` command for real-time debugging
5. **Health checks**: Use `health` command to verify service status
6. **Clean shutdown**: Use `stop` or `cleanup` when finished

## File Structure

```
olfong_stack/
├── process-manager.sh          # Main process management script
├── logs/                       # Service log files
│   ├── backend.log
│   └── frontend.log
├── .pids/                      # Process ID files
│   ├── backend.pid
│   └── frontend.pid
├── backend/                    # Backend service directory
└── web/                        # Frontend service directory
```

## Support

For issues with the process management system:

1. Check service status: `./process-manager.sh status`
2. View logs: `./process-manager.sh logs [service]`
3. Run health check: `./process-manager.sh health`
4. Clean up and restart: `./process-manager.sh cleanup && ./process-manager.sh start all`