# Cursor MCP Configuration Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Open Cursor Settings
- Press `Cmd + ,` (macOS) or `Ctrl + ,` (Windows/Linux) to open Cursor settings
- Or go to `Cursor` > `Settings` (macOS) or `File` > `Preferences` > `Settings` (Windows/Linux)

### Step 2: Navigate to MCP Configuration
- In the settings sidebar, click on **"Features"**
- Then click on **"MCP"** (Model Context Protocol)

### Step 3: Add MCP Configuration
- Click on **"+ Add New MCP Server"** or **"New MCP Server"**
- Copy the entire JSON configuration from `cursor-mcp-config.json` in your project root
- Paste it into the MCP configuration field

### Step 4: Verify Configuration
- Ensure all MCP servers show **green status indicators**
- If any server shows red/yellow, check the command paths and dependencies

## 📋 MCP Servers Included

| Server | Purpose | Status Check |
|--------|---------|-------------|
| **playwright** | Automated web/mobile testing | `docker --version` |
| **filesystem** | File system access & analysis | `npx --version` |
| **context7** | Latest documentation & APIs | API key configured |
| **everything** | Comprehensive MCP features | `npx --version` |
| **git** | Version control operations | `git --version` |
| **brave-search** | Web search capabilities | API key configured |
| **memory** | Persistent memory storage | `npx --version` |
| **postgres** | Database querying | PostgreSQL connection |

## 🔧 Prerequisites

### Required Software
```bash
# Check if these are installed:
docker --version
npx --version
git --version
persistproc --version
```

### Docker Setup (for Playwright)
```bash
# Ensure Docker is running
sudo systemctl start docker  # Linux
# or start Docker Desktop on macOS/Windows
```

### PostgreSQL Connection
- Ensure PostgreSQL is running on `localhost:5432`
- Database `olfong_db` exists with user `olfong_user`
- Connection string: `postgresql://olfong_user:olfong_password@localhost:5432/olfong_db`

## 🧪 Testing MCP Integration

### Test Commands
Once configured, you can use these natural language commands in Cursor's chat:

```
"Use the postgres tool to query all users"
"Use the playwright tool to test the login flow"
"Use the filesystem tool to analyze the backend code"
"Use the git tool to check commit history"
"Use the brave-search tool to find React best practices"
```

### Verification Steps
1. Open Cursor's chat panel
2. Ensure you're in **"Agent"** mode (not "Chat")
3. Try a command like: "Use the postgres tool to show me the database schema"
4. Cursor should prompt you to approve the tool usage
5. The tool should execute and return results

## 🚨 Troubleshooting

### Common Issues

#### MCP Servers Not Starting
- **Check command paths**: Ensure `npx`, `docker`, `git` are in PATH
- **Verify permissions**: Some commands may need sudo access
- **Check dependencies**: Run `npm install -g` for global packages

#### Docker Issues
```bash
# Test Docker access
docker run hello-world

# If permission denied:
sudo usermod -aG docker $USER
# Then logout and login again
```

#### PostgreSQL Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U olfong_user -d olfong_db
```

#### API Key Issues
- **Context7**: Verify `CONTEXT7_API_KEY` is valid
- **Brave Search**: Verify `BRAVE_API_KEY` is valid
- Check API quotas and limits

### Debug Mode
Enable debug logging in Cursor:
1. Go to `Settings` > `Developer`
2. Enable **"Show MCP Debug Logs"**
3. Check the console for detailed error messages

## 📚 Usage Examples

### Database Operations
```
"Query the database to find all orders from last week"
"Show me the user table schema"
"Find products with low stock"
```

### Testing Operations
```
"Test the checkout flow with Playwright"
"Take a screenshot of the homepage"
"Test mobile responsiveness"
```

### File Analysis
```
"Analyze the backend authentication code"
"Find all TODO comments in the codebase"
"Check for security vulnerabilities"
```

### Git Operations
```
"Show me recent commits"
"Check the current branch status"
"Find files changed in the last commit"
```

## 🔄 Maintenance

### Regular Updates
- Update MCP server packages: `npx -y @modelcontextprotocol/server-*@latest`
- Update Docker images: `docker pull mcr.microsoft.com/playwright/mcp`
- Rotate API keys periodically

### Configuration Backup
- Keep `cursor-mcp-config.json` in version control
- Document any custom modifications
- Test configuration after updates

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Cursor's MCP documentation
3. Check MCP server-specific documentation
4. Verify all prerequisites are met

---

**Note**: This configuration is optimized for the Ölföng Wine & Beer Shop Platform development environment. Adjust paths and credentials as needed for your specific setup.