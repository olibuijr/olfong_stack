# Ölföng MCP Server Setup for Terminal Command Management

This guide explains how to set up and use MCP (Model Context Protocol) servers for managing terminal commands, dev servers, and background processes in the Ölföng e-commerce platform.

## 🎯 Overview

The MCP server setup provides:
- **Terminal Command Execution**: Run and monitor shell commands
- **Background Process Management**: Keep dev servers running until needed
- **Docker Integration**: Containerized MCP server for reliability
- **Process Monitoring**: Track running processes and their status
- **Predefined Commands**: Ready-to-use commands for common development tasks

## 🚀 Quick Start

### OpenCode Integration (Primary Method)

The MCP commands server is integrated into OpenCode via `opencode.jsonc`. Use natural language commands directly:

**Usage Examples:**
```
"Start the development stack"
"Run the test suite"
"Check if all services are healthy"
"Show me the backend logs"
"Build the web frontend"
"Stop all development servers"
```

The server runs automatically when you use OpenCode in this project directory.

### Manual Docker Setup

If you need to run the MCP server manually:

```bash
docker run --rm -i \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /home/olibuijr/Projects/olfong_stack:/workspace \
  -w /workspace/backend \
  node:18-alpine \
  sh -c "npm install && npx mcp-server-commands --config mcp-commands-config.json --commands mcp-dev-commands.json"
```

## 📋 Available Commands

### Development Stack Management
- `start-dev-stack`: Start all services (DB, backend, frontend, mobile)
- `stop-dev-stack`: Stop all development servers
- `start-backend`: Start Node.js backend server
- `start-web`: Start React web frontend
- `start-flutter`: Start Flutter mobile dev server

### Testing & Building
- `run-tests`: Run backend test suite
- `run-e2e-tests`: Run Playwright E2E tests
- `build-backend`: Build backend for production
- `build-web`: Build web frontend for production
- `build-flutter`: Build Flutter app for web

### Infrastructure
- `docker-build`: Build all Docker images
- `docker-up`: Start Docker services
- `docker-down`: Stop Docker services
- `db-migrate`: Run database migrations
- `db-seed`: Seed database with test data

### Monitoring
- `check-health`: Check all services health
- `logs-backend`: Show backend logs
- `logs-web`: Show web frontend logs

## 💬 Using MCP Commands

### With Claude Desktop

If using Claude Desktop directly, configure your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "olfong-commands": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-v", "/var/run/docker.sock:/var/run/docker.sock",
        "-v", "/home/olibuijr/Projects/olfong_stack:/workspace",
        "-w", "/workspace/backend",
        "node:18-alpine",
        "sh", "-c",
        "npm install && npx mcp-server-commands --config mcp-commands-config.json --commands mcp-dev-commands.json"
      ]
    }
  }
}
```

## 🔧 Configuration

### MCP Commands Configuration (`backend/mcp-dev-commands.json`)

```json
{
  "commands": {
    "start-backend": {
      "description": "Start the Node.js backend server",
      "command": "npm run dev",
      "workingDirectory": "backend",
      "background": true,
      "timeout": 300000,
      "healthCheck": {
        "url": "http://localhost:5000/health",
        "interval": 5000,
        "maxAttempts": 30
      }
    }
  },
  "processGroups": {
    "development": ["start-backend", "start-web", "start-flutter"],
    "testing": ["run-tests", "run-e2e-tests"],
    "building": ["build-backend", "build-web", "build-flutter"]
  }
}
```

### Server Configuration (`backend/mcp-commands-config.json`)

```json
{
  "server": {
    "port": 3001,
    "host": "0.0.0.0",
    "timeout": 300000,
    "maxConcurrentCommands": 5
  },
  "commands": {
    "allowedCommands": ["npm", "yarn", "docker", "git", "node", "python"],
    "blockedPatterns": ["rm -rf /", "sudo", "su"]
  },
  "backgroundProcesses": {
    "maxProcesses": 10,
    "processTimeout": 3600000,
    "cleanupInterval": 300000
  }
}
```

## 🐳 Docker Integration

### How It Works

The MCP commands server runs in a Docker container that's automatically started by OpenCode:

```bash
# This is what OpenCode runs automatically:
docker run --rm -i \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /home/olibuijr/Projects/olfong_stack:/workspace \
  -w /workspace/backend \
  node:18-alpine \
  sh -c "npm install && npx mcp-server-commands --config mcp-commands-config.json --commands mcp-dev-commands.json"
```

### Key Features
- **Isolated Environment**: MCP server runs in its own container
- **Volume Mounting**: Direct access to project files via `/workspace`
- **Docker Socket Access**: Can manage other Docker containers
- **STDIO Communication**: Uses standard input/output for MCP protocol
- **Ephemeral Containers**: Clean startup, no persistent state
- **Auto-start**: Launches automatically when using OpenCode

## 📊 Monitoring & Management

### Process Monitoring

The MCP server provides:
- **Real-time Status**: Check running processes
- **Resource Usage**: Monitor CPU/memory usage
- **Health Checks**: Automatic service health verification
- **Log Streaming**: Access to process logs
- **Process Groups**: Manage related processes together

### Background Process Management

```bash
# Start a background process
"Start the backend server in background"

# Check status
"Show me running background processes"

# Stop specific process
"Stop the backend server"

# Stop all processes in a group
"Stop all development servers"
```

## 🔒 Security Considerations

### Command Allowlisting
- Only predefined commands are allowed
- Dangerous patterns are blocked (rm -rf /, sudo, etc.)
- Working directory restrictions

### Process Isolation
- Docker containerization for security
- Resource limits and timeouts
- Process monitoring and cleanup

## 🐛 Troubleshooting

### Common Issues

1. **Permission Issues**
```bash
chmod +x start-dev-servers.sh stop-dev-servers.sh
```

2. **Docker Socket Access**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again for group changes to take effect
```

3. **OpenCode Not Recognizing MCP Server**
```bash
# Verify opencode.jsonc syntax
cat opencode.jsonc | jq .
# Restart OpenCode
# Check that Docker is running
docker --version
```

4. **Container Fails to Start**
```bash
# Test basic Docker functionality
docker run --rm hello-world

# Test our specific setup
docker run --rm -i \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /home/olibuijr/Projects/olfong_stack:/workspace \
  -w /workspace/backend \
  node:18-alpine \
  sh -c "ls -la && echo 'Container working'"
```

5. **MCP Commands Not Working**
```bash
# Check if config files exist
ls -la backend/mcp-*.json

# Test MCP server directly
cd backend
npm install
npx mcp-server-commands --help
```

### Logs and Debugging

```bash
# Check running Docker containers
docker ps

# View container logs (if running manually)
docker run --rm -i \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /home/olibuijr/Projects/olfong_stack:/workspace \
  -w /workspace/backend \
  node:18-alpine \
  sh -c "npm install && npx mcp-server-commands --help"

# Check OpenCode integration
# OpenCode should show MCP server status in its interface
# Look for "commands" in the MCP servers list

# Debug MCP protocol
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0"}}}' | \
docker run --rm -i \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /home/olibuijr/Projects/olfong_stack:/workspace \
  -w /workspace/backend \
  node:18-alpine \
  sh -c "npm install && npx mcp-server-commands --config mcp-commands-config.json --commands mcp-dev-commands.json"
```

## 🚀 Advanced Usage

### Custom Command Definition

Add new commands to `mcp-dev-commands.json`:

```json
{
  "custom-command": {
    "description": "My custom development command",
    "command": "npm run custom-script",
    "workingDirectory": "backend",
    "background": false,
    "timeout": 120000,
    "env": {
      "NODE_ENV": "development"
    }
  }
}
```

### Process Groups

Organize commands into logical groups:

```json
{
  "processGroups": {
    "full-stack": ["start-backend", "start-web", "start-mobile"],
    "testing": ["unit-tests", "integration-tests", "e2e-tests"],
    "deployment": ["build-all", "docker-deploy", "health-check"]
  }
}
```

### Integration with CI/CD

Use MCP commands in automated pipelines:

```yaml
# .github/workflows/deploy.yml
- name: Run tests via MCP
  run: |
    docker run --rm -i \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v $PWD:/workspace \
      -w /workspace/backend \
      node:18-alpine \
      sh -c "npm install && npx mcp-server-commands --config mcp-commands-config.json --commands mcp-dev-commands.json" \
      --command run-tests
```

### Manual Testing

Test the MCP server manually:

```bash
# Test Docker command
docker run --rm -i \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /home/olibuijr/Projects/olfong_stack:/workspace \
  -w /workspace/backend \
  node:18-alpine \
  sh -c "npm install && echo 'MCP server ready'"

# Test with actual MCP server
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}}' | \
docker run --rm -i \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /home/olibuijr/Projects/olfong_stack:/workspace \
  -w /workspace/backend \
  node:18-alpine \
  sh -c "npm install && npx mcp-server-commands --config mcp-commands-config.json --commands mcp-dev-commands.json"
```

## 📈 Performance & Architecture

### Container Architecture
- **Ephemeral Design**: Clean container startup/shutdown
- **Volume Mounting**: Direct filesystem access via `/workspace`
- **Docker Socket**: Full Docker API access for container management
- **STDIO Protocol**: Efficient MCP communication

### Resource Management
- **Process Limits**: Max 5 concurrent background processes
- **Timeouts**: Configurable command timeouts (5min default)
- **Cleanup**: Automatic process cleanup every 5 minutes

### Security
- **Isolated Execution**: Commands run in separate containers
- **Allowlist**: Only predefined commands permitted
- **Path Restrictions**: Working directories controlled
- **No Root Access**: Non-privileged container execution

## 🤝 Contributing

### Adding New Commands
1. Define command in `mcp-dev-commands.json`
2. Test locally with `npm run mcp`
3. Update documentation
4. Test in Docker environment

### Improving Performance
1. Profile command execution times
2. Optimize health check intervals
3. Implement command result caching
4. Add resource usage monitoring

---

## 📞 Support

For issues with MCP server setup:
1. Check the troubleshooting section
2. Review Docker and npm logs
3. Verify configuration files
4. Test with minimal setup

The MCP server provides a powerful way to manage development workflows through natural language commands, making it easier to handle complex multi-service applications like Ölföng.