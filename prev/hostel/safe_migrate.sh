#!/bin/bash

# Safe Migration Script for Production
# This script creates backups and runs migrations safely

set -e

# Configuration
PROJECT_DIR="/home/ubuntu/hostel"
DB_NAME="${DB_NAME:-hostel_db}"
DB_USER="${DB_USER:-hosteluser}"
BACKUP_DIR="${PROJECT_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
VENV_PATH="${PROJECT_DIR}/venv"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Safe Migration Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running as correct user
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Error: Do not run this script as root${NC}"
    exit 1
fi

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Error: Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# Check if virtual environment exists
if [ ! -d "$VENV_PATH" ]; then
    echo -e "${RED}Error: Virtual environment not found: $VENV_PATH${NC}"
    exit 1
fi

# Activate virtual environment
source "$VENV_PATH/bin/activate"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Step 1: Creating database backup...${NC}"
if pg_dump -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_DIR/db_backup_$TIMESTAMP.dump" 2>/dev/null; then
    echo -e "${GREEN}✓ Database backup created: $BACKUP_DIR/db_backup_$TIMESTAMP.dump${NC}"
else
    echo -e "${RED}✗ Failed to create database backup${NC}"
    echo -e "${YELLOW}Attempting with password prompt...${NC}"
    PGPASSWORD="${DB_PASS}" pg_dump -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_DIR/db_backup_$TIMESTAMP.dump" || {
        echo -e "${RED}✗ Database backup failed. Aborting migration.${NC}"
        exit 1
    }
    echo -e "${GREEN}✓ Database backup created: $BACKUP_DIR/db_backup_$TIMESTAMP.dump${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Creating Django data backup...${NC}"
if python manage.py dumpdata --exclude auth.permission --exclude contenttypes > "$BACKUP_DIR/data_backup_$TIMESTAMP.json" 2>/dev/null; then
    echo -e "${GREEN}✓ Data backup created: $BACKUP_DIR/data_backup_$TIMESTAMP.json${NC}"
else
    echo -e "${YELLOW}⚠ Data backup failed, but continuing...${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Checking migration status...${NC}"
python manage.py showmigrations

echo ""
echo -e "${YELLOW}Step 4: Previewing migrations to be applied...${NC}"
PENDING_MIGRATIONS=$(python manage.py showmigrations --plan | grep "\[ \]" | wc -l)
if [ "$PENDING_MIGRATIONS" -eq 0 ]; then
    echo -e "${GREEN}✓ No pending migrations${NC}"
    exit 0
fi

echo -e "${YELLOW}Found $PENDING_MIGRATIONS pending migration(s)${NC}"
echo ""

# Show SQL for each pending migration
echo -e "${YELLOW}Previewing SQL for pending migrations...${NC}"
python manage.py showmigrations --plan | grep "\[ \]" | while read -r line; do
    APP=$(echo "$line" | awk '{print $1}' | cut -d'.' -f1)
    MIGRATION=$(echo "$line" | awk '{print $1}' | cut -d'.' -f2)
    echo -e "${YELLOW}Previewing: $APP $MIGRATION${NC}"
    python manage.py sqlmigrate "$APP" "$MIGRATION" 2>/dev/null | head -20
    echo ""
done

echo ""
echo -e "${RED}========================================${NC}"
echo -e "${RED}WARNING: You are about to run migrations in production!${NC}"
echo -e "${RED}========================================${NC}"
echo ""
echo -e "${GREEN}Backup location:${NC} $BACKUP_DIR/db_backup_$TIMESTAMP.dump"
echo -e "${GREEN}Data backup:${NC} $BACKUP_DIR/data_backup_$TIMESTAMP.json"
echo ""
read -p "Review the migrations above. Continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${YELLOW}Migration cancelled by user.${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Step 5: Running migrations...${NC}"

# Check for issues first
if python manage.py migrate --check 2>/dev/null; then
    echo -e "${GREEN}✓ Migration check passed${NC}"
else
    echo -e "${YELLOW}⚠ Migration check found issues, but continuing...${NC}"
fi

# Run migrations
if python manage.py migrate; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ Migrations completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${GREEN}Backup saved at:${NC}"
    echo -e "  Database: $BACKUP_DIR/db_backup_$TIMESTAMP.dump"
    echo -e "  Data: $BACKUP_DIR/data_backup_$TIMESTAMP.json"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Verify application is working correctly"
    echo "  2. Monitor logs for any errors"
    echo "  3. Test critical functionality"
    echo ""
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}✗ Migration failed!${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${YELLOW}PostgreSQL migrations run in transactions, so the database should have rolled back automatically.${NC}"
    echo ""
    echo -e "${YELLOW}If you need to restore from backup:${NC}"
    echo "  pg_restore -U $DB_USER -d $DB_NAME $BACKUP_DIR/db_backup_$TIMESTAMP.dump"
    echo ""
    exit 1
fi

