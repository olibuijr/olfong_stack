#!/bin/bash

# Ölföng Stack Development Tools
# Master script for development efficiency tools

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

show_help() {
    echo -e "${PURPLE}Ölföng Stack Development Tools${NC}"
    echo
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  health      Run comprehensive health check"
    echo "  test        Run tests for all services"
    echo "  translations Check translation status and missing translations"
    echo "  update      Update dependencies for all services"
    echo "  migrations  Fix database migration issues"
    echo "  all         Run all checks (health, test, translations)"
    echo "  help        Show this help"
    echo
    echo "Examples:"
    echo "  $0 health          # Check service health"
    echo "  $0 test           # Run all tests"
    echo "  $0 translations   # Check translation status"
    echo "  $0 all            # Run comprehensive checks"
}

run_health_check() {
    echo -e "${BLUE}Running Health Check...${NC}"
    "$SCRIPT_DIR/health-check.sh"
}

run_tests() {
    echo -e "${BLUE}Running Tests...${NC}"
    "$SCRIPT_DIR/run-tests.sh"
}

check_translations() {
    echo -e "${BLUE}Checking Translations...${NC}"
    "$SCRIPT_DIR/check-translations.sh"
}

update_deps() {
    echo -e "${BLUE}Updating Dependencies...${NC}"
    "$SCRIPT_DIR/update-deps.sh"
}

fix_migrations() {
    echo -e "${BLUE}Fixing Migrations...${NC}"
    "$SCRIPT_DIR/fix-migrations.sh"
}

run_all() {
    echo -e "${PURPLE}=== Running All Development Checks ===${NC}"
    echo
    run_health_check
    echo
    run_tests
    echo
    check_translations
    echo
    echo -e "${PURPLE}=== All Checks Complete ===${NC}"
}

main() {
    local command=$1

    case $command in
        health)
            run_health_check
            ;;
        test)
            run_tests
            ;;
        translations)
            check_translations
            ;;
        update)
            update_deps
            ;;
        migrations)
            fix_migrations
            ;;
        all)
            run_all
            ;;
        help|--help|-h|"")
            show_help
            ;;
        *)
            echo -e "${RED}Unknown command: $command${NC}"
            echo
            show_help
            exit 1
            ;;
    esac
}

main "$@"