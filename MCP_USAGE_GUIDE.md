# MCP Server Usage Guide for Ölföng E-commerce Platform

This guide provides practical examples of how to leverage Model Context Protocol (MCP) servers for enhanced AI-assisted development on the Ölföng e-commerce platform.

## 🚀 Quick Start

All MCP servers are configured in `opencode.jsonc` and become available when using OpenCode in this project directory.

## 📊 PostgreSQL DBHub MCP Server

**Purpose**: Direct database access for schema analysis, data validation, and query optimization.

### E-commerce Development Examples

#### 1. Database Schema Analysis
```
"Show me the complete structure of the orders table including all columns, types, and relationships"
"List all foreign key constraints in the database"
"Show me the subscription delivery schedule structure"
```

#### 2. Data Validation & Testing
```
"Check if all products have valid category assignments"
"Verify that all orders have associated addresses"
"Show me sample data from the transactions table"
```

#### 3. Query Optimization
```
"Analyze the most complex queries in the order management system"
"Suggest indexes for the products search functionality"
"Check query performance for the admin dashboard analytics"
```

#### 4. Migration Testing
```
"Validate the latest database migration changes"
"Check data integrity after running seed scripts"
"Verify foreign key relationships are properly maintained"
```

## 🌐 Playwright MCP Server

**Purpose**: Browser automation for UI testing, user flow validation, and accessibility testing.

### E-commerce Testing Examples

#### 1. Customer Journey Testing
```
"Test the complete purchase flow: browse products → add to cart → checkout → payment"
"Verify age verification modal appears for alcohol products"
"Test subscription creation and delivery scheduling"
```

#### 2. Admin Panel Testing
```
"Test product creation with image upload in the admin panel"
"Verify order status updates and delivery assignments"
"Test the analytics dashboard data accuracy"
```

#### 3. Mobile Responsiveness
```
"Test the web app on mobile screen sizes (iPhone, Android)"
"Verify navigation menus work properly on tablets"
"Check that product images are properly responsive"
```

#### 4. Cross-browser Testing
```
"Test payment flow in Chrome, Firefox, and Safari"
"Verify form validation works consistently across browsers"
"Check that real-time updates work in all browsers"
```

#### 5. Accessibility Testing
```
"Verify WCAG compliance for the checkout process"
"Test screen reader compatibility for product listings"
"Check keyboard navigation for the admin dashboard"
```

## 📱 GitHub MCP Server (Currently Disabled)

**Purpose**: Repository management, issue tracking, and CI/CD monitoring.

**Status**: Currently disabled. To enable, set `"enabled": true` in `opencode.jsonc` and configure a GitHub Personal Access Token in the `.env` file.

### Development Workflow Examples

#### 1. Issue Management
```
"Create an issue for implementing push notifications in React Native"
"Update the status of the delivery tracking bug fix"
"Search for open issues related to payment processing"
```

#### 2. Pull Request Management
```
"Review the latest changes to the subscription system"
"Check the status of the Flutter app deployment PR"
"Create a PR for the new admin analytics feature"
```

#### 3. CI/CD Monitoring
```
"Check the status of the latest build pipeline"
"Monitor deployment progress to staging environment"
"Review test results from the integration test suite"
```

#### 4. Repository Analytics
```
"Show me the most active contributors this month"
"Analyze code churn in the backend API"
"Check repository health metrics and recommendations"
```

## 📁 Filesystem MCP Server

**Purpose**: Advanced file operations, code search, and bulk refactoring.

### Code Management Examples

#### 1. Code Search & Analysis
```
"Find all places where the cart state is updated"
"Search for error handling patterns in the API routes"
"Locate all age verification logic across the codebase"
```

#### 2. Refactoring Support
```
"Rename the 'getUser' function to 'fetchUserProfile' across all files"
"Update all import statements for the moved components"
"Replace all instances of the old API endpoint URLs"
```

#### 3. File Organization
```
"Analyze the current component folder structure"
"Suggest improvements to the backend service organization"
"Check for unused files or duplicate code"
```

#### 4. Content Analysis
```
"Find all hardcoded strings that need internationalization"
"Search for security-sensitive patterns like API keys"
"Locate all database queries that might need optimization"
```

## 📚 Context7 MCP Server

**Purpose**: Access to latest documentation, API references, and best practices.

### Research & Documentation Examples

#### 1. Framework Documentation
```
"Get the latest React hooks documentation and best practices"
"Research Node.js performance optimization techniques"
"Find Flutter state management patterns for complex apps"
```

#### 2. Library Research
```
"Check the latest Prisma ORM documentation for query optimization"
"Research Socket.IO best practices for real-time features"
"Find Tailwind CSS responsive design patterns"
```

#### 3. Security Guidelines
```
"Get current best practices for JWT token handling"
"Research secure payment processing patterns"
"Find guidelines for input validation and sanitization"
```

#### 4. Performance Optimization
```
"Research database indexing strategies for e-commerce"
"Find React performance optimization techniques"
"Get mobile app performance best practices"
```

## 🎯 Combined MCP Workflows

### New Feature Development
1. **Context7**: Research best practices and documentation
2. **Filesystem**: Analyze existing code patterns
3. **PostgreSQL**: Design and validate database schema changes
4. **Playwright**: Create automated tests for the new feature
5. **GitHub**: Create issues and track development progress

### Bug Investigation
1. **Filesystem**: Search for related code and error patterns
2. **PostgreSQL**: Check database state and query performance
3. **Playwright**: Create reproduction test cases
4. **Context7**: Research similar issues and solutions
5. **GitHub**: Document findings and create fix tracking

### Performance Optimization
1. **PostgreSQL**: Analyze slow queries and suggest indexes
2. **Playwright**: Measure current performance baselines
3. **Context7**: Research optimization techniques
4. **Filesystem**: Implement and test performance improvements
5. **GitHub**: Track optimization results and metrics

### Security Audit
1. **Filesystem**: Search for security-sensitive patterns
2. **Context7**: Research current security best practices
3. **PostgreSQL**: Audit database access patterns
4. **Playwright**: Test for common security vulnerabilities
5. **GitHub**: Document security findings and remediation plans

## 🔧 Configuration & Setup

### Environment Variables
```bash
# Required for GitHub MCP
GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here
```

### Docker Requirements
- PostgreSQL database running via `docker-compose up -d`
- Docker daemon available for Playwright and GitHub MCP servers

### Testing MCP Integration
To verify MCP servers are working:
1. Use OpenCode in this project directory
2. Try queries like "Show me the database schema" (PostgreSQL)
3. Test "Take a screenshot of the web app" (Playwright)
4. Ask "Search for React components" (Filesystem)
5. Query "Get React documentation" (Context7)

## 📈 Benefits for E-commerce Development

- **Accelerated Development**: Direct database access speeds up debugging
- **Comprehensive Testing**: Automated UI testing ensures quality
- **Better Documentation**: Access to latest best practices and patterns
- **Efficient Code Management**: Advanced search and refactoring capabilities
- **Streamlined Workflows**: Integrated repository and CI/CD management

## 🚨 Best Practices

1. **Use Read-Only Mode**: PostgreSQL MCP runs in read-only for safety
2. **Test Thoroughly**: Always validate MCP-assisted changes
3. **Document Usage**: Keep track of successful MCP usage patterns
4. **Security First**: Never expose sensitive data through MCP queries
5. **Version Control**: Commit MCP-assisted changes with clear commit messages

---

*This guide is specific to the Ölföng e-commerce platform. MCP servers enhance AI-assisted development by providing direct access to databases, browsers, filesystems, documentation, and repository management.*