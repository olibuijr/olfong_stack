# Cursor MCP Quick Reference

## 🚀 Setup (One-time)
1. Open Cursor Settings (`Cmd/Ctrl + ,`)
2. Go to `Features` > `MCP`
3. Copy JSON from `cursor-mcp-config.json`
4. Paste into MCP configuration
5. Verify green status indicators

## 🛠️ Available Tools

| Tool | Command | Example Usage |
|------|---------|---------------|
| **PostgreSQL** | `postgres` | "Query all users" |
| **Playwright** | `playwright` | "Test login flow" |
| **Filesystem** | `filesystem` | "Analyze backend code" |
| **Git** | `git` | "Show commit history" |
| **Brave Search** | `brave-search` | "Find React patterns" |
| **Context7** | `context7` | "Get latest docs" |
| **Memory** | `memory` | "Store project context" |
| **Everything** | `everything` | "Use MCP features" |

## 💬 Natural Language Commands

```
"Use the postgres tool to find all orders"
"Use the playwright tool to test the checkout"
"Use the filesystem tool to read the server.js file"
"Use the git tool to show recent commits"
"Use the brave-search tool to find Node.js best practices"
```

## 🔧 Prerequisites Check
```bash
docker --version    # For Playwright
npx --version       # For most tools
git --version       # For Git operations
psql --version      # For PostgreSQL
```

## 🚨 Quick Fixes
- **Red indicators**: Check command paths and dependencies
- **Docker issues**: `sudo systemctl start docker`
- **PostgreSQL**: Ensure running on localhost:5432
- **API keys**: Verify in configuration

## 📁 Files
- `cursor-mcp-config.json` - MCP configuration
- `MCP_SETUP_GUIDE.md` - Detailed setup guide
- `.cursorrules` - Project rules with MCP info
