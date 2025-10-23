# Project Rules

## Process Management

Always use the process management script for all process operations. Never use `npm start`, `npm run dev`, or manual process commands.

### Basic Operations

**Start all services:**
```bash
./process-manager.sh start
```

**Stop all services:**
```bash
./process-manager.sh stop
```

**Restart all services:**
```bash
./process-manager.sh restart
```

**View logs:**
```bash
./process-manager.sh logs
```

The process manager handles both frontend and backend services automatically.

## Browser Automation

Always attempt to use Playwright for browser automation tasks, but **never run it in non-headless mode**. Always use headless mode (`headless: true`) and 2K resolution (2560x1440). If Playwright encounters an error, report it clearly and suggest alternatives if applicable.

## Translation Strings

Always create translation strings via the API when creating new strings not already available. Do not hardcode text strings in the application - they must be registered in the translation system to support multi-language functionality.

## Frontend Development

The frontend has hot reload enabled. You do NOT need to restart the frontend service when making CSS or component changes - the changes will be automatically reflected in the browser when you save files. Only restart if you encounter issues or if changes don't appear after saving.
