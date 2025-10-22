# OpenCode MCP Configuration

This project is configured with OpenCode CLI and Model Context Protocol (MCP) servers running in Docker containers.

## 🎯 Overview

The MCP configuration provides:
- **Google Search**: Web search capabilities via Google Custom Search API
- **File System Access**: Secure file system operations (read-only)
- **Git Operations**: Version control and repository management
- **Database Access**: PostgreSQL database interactions (configured for project database)
- **GitHub Integration**: GitHub API access for repository operations
- **Web Automation**: Puppeteer-based browser automation
- **Code Search**: GitHub code search and documentation lookup
- **Specialized Agents**: Pre-configured agent profiles for different tasks

## 🚀 Quick Start

1. **Install OpenCode CLI**
   ```bash
   curl -fsSL https://opencode.ai/install | bash
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start Database**
   ```bash
   docker-compose up -d postgres
   ```

4. **Start OpenCode**
   ```bash
   cd /path/to/project
   opencode
   ```

## 📋 Available MCP Servers

### Enabled by Default:
- **filesystem**: File system access (read-only)
- **git**: Git operations
- **postgres**: PostgreSQL database access (project database)
- **playwright**: Web automation and browser control
- **gh_grep**: GitHub code search (remote)

### Available but Disabled:
- **github**: GitHub API access
- **context7**: Documentation search (requires API key)

## 💾 Database Configuration

The MCP PostgreSQL server is configured to connect to the project's database:

- **Database**: `olfong_db`
- **User**: `olfong_user`
- **Host**: `localhost:5432`
- **Schema**: `public`

The connection uses Docker's host networking to access the PostgreSQL container defined in `docker-compose.yml`.

### Database Schema Access

The MCP server can interact with all tables in the Ölföng e-commerce platform:

- **Users & Authentication**: `User`, `Address`, `Location`
- **Products**: `Product`, `Category`, `Subcategory`
- **Orders**: `Order`, `OrderItem`, `Transaction`
- **Cart**: `Cart`, `CartItem`
- **Subscriptions**: `Subscription`, `SubscriptionDelivery`
- **Shipping**: `ShippingOption`
- **Content**: `Banner`, `Setting`
- **Integrations**: `Integration`, `PaymentGateway`
- **Chat**: `Conversation`, `ConversationParticipant`, `ChatMessage`

## 🛠️ Usage Examples

### Database Operations
```
Use the postgres tool to query all users with role ADMIN
```

```
Show me the top 10 most expensive products using postgres
```

```
Find all orders with status PENDING using postgres
```

### File System Operations
```
Use the filesystem tool to read the package.json files
```

```
Search for all TypeScript files in the backend directory
```

### Git Operations
```
Use the git tool to show the recent commit history
```

```
Check the current git status and staged changes
```

### Web Search
```
Search for information about React hooks using google-search
```

```
Find documentation about Prisma migrations using google-search
```

### Code Search
```
Search GitHub for examples of Next.js authentication using gh_grep
```

## 🤖 Agent Profiles

### web-search Agent
Specialized for research and documentation:
- Google Search
- GitHub Code Search
- Context7 Documentation

### database Agent
Specialized for database operations:
- PostgreSQL access
- File system access

### fullstack Agent
Complete development toolkit with all tools enabled

## 🔧 Configuration

### Main Configuration (`opencode.jsonc`)

The configuration file defines:
- MCP server definitions with Docker commands
- Environment variable mappings
- Tool enable/disable flags
- Agent profiles with specialized toolsets

### Environment Variables (`.env`)

Required for full functionality:
- `GOOGLE_API_KEY`: Google Custom Search API key
- `GOOGLE_CSE_ID`: Google Custom Search Engine ID
- `GITHUB_TOKEN`: GitHub personal access token
- `CONTEXT7_API_KEY`: Context7 API key (optional)

### Database Connection

The PostgreSQL connection is pre-configured:
```bash
# Uses the project's PostgreSQL database from docker-compose.yml
# Connection string: postgresql://olfong_user:olfong_password@localhost:5432/olfong_db?schema=public
```

## 🐳 Docker Integration

All MCP servers run in isolated Docker containers using official images from `ghcr.io/modelcontextprotocol/servers/`. This ensures:

- **Isolation**: Containers are isolated from the host system
- **Consistency**: Consistent environments across different machines
- **Easy Updates**: Simple to update to newer versions
- **No Dependencies**: No need to install MCP servers locally

### PostgreSQL Container Access

The PostgreSQL MCP server uses `--network host` to access the database container directly, providing seamless integration with the project's existing database setup.

## 🔒 Security Considerations

- **Read-only Filesystem**: File system access is restricted to read-only operations
- **Container Isolation**: Each MCP server runs in its own isolated container
- **Environment Variables**: Sensitive data is stored in environment variables, not in configuration files
- **Network Access**: Containers have controlled network access based on their requirements

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL container is running
docker-compose ps

# Verify database connectivity
docker exec olfong_postgres psql -U olfong_user -d olfong_db -c "SELECT 1;"
```

### Docker Issues
```bash
# Test basic Docker functionality
docker run --rm hello-world

# Check Docker daemon status
sudo systemctl status docker
```

### OpenCode Integration
```bash
# Verify configuration syntax
cat opencode.jsonc | jq .

# Check OpenCode version
opencode --version
```

### MCP Server Issues
```bash
# Test PostgreSQL MCP server manually
docker run --rm -i \
  --network host \
  -e DATABASE_URL="postgresql://olfong_user:olfong_password@localhost:5432/olfong_db?schema=public" \
  ghcr.io/modelcontextprotocol/servers/postgres:latest
```

## 📈 Advanced Usage

### Custom Queries

You can perform complex database operations through the MCP interface:

```
Use postgres to find the total revenue per month for the current year
```

```
Show me the customer retention rate using postgres queries
```

### Integration with Development Workflow

The MCP servers integrate seamlessly with the development workflow:

1. **Database Schema Exploration**: Query the database structure
2. **Data Analysis**: Perform analytics on orders, users, products
3. **Code Research**: Search GitHub for implementation examples
4. **Documentation Lookup**: Find relevant documentation quickly

## 📚 Additional Resources

- [OpenCode Documentation](https://opencode.ai/docs)
- [MCP Server Documentation](https://opencode.ai/docs/mcp-servers)
- [Docker Documentation](https://docs.docker.com/)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## 🤝 Contributing

When adding new MCP servers or modifying configurations:

1. Test the configuration locally
2. Update this documentation
3. Verify Docker container functionality
4. Ensure environment variables are properly documented

The MCP configuration provides a powerful, extensible platform for AI-assisted development workflows in the Ölföng e-commerce project.