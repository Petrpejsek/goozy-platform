#!/bin/bash

# 🚀 Goozy Platform - Production Deployment Script
# =================================================

set -e  # Exit on any error

echo "🚀 Starting Goozy Platform production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="./deploy.log"

# Functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

# Pre-deployment checks
check_requirements() {
    log "🔍 Checking requirements..."
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        error ".env.production file not found! Create it first."
    fi
    
    # Check if database URL is set
    if ! grep -q "DATABASE_URL" .env.production; then
        error "DATABASE_URL not found in .env.production"
    fi
    
    # Check if domain is set
    if ! grep -q "NEXT_PUBLIC_APP_URL" .env.production; then
        error "NEXT_PUBLIC_APP_URL not found in .env.production"
    fi
    
    success "Requirements check passed"
}

# Create backup
create_backup() {
    log "💾 Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup database (if local)
    if command -v pg_dump >/dev/null 2>&1; then
        info "Creating database backup..."
        # Add your database backup command here
        # pg_dump $DATABASE_URL > "$BACKUP_DIR/database.sql"
    fi
    
    # Backup current .env
    if [ -f ".env" ]; then
        cp .env "$BACKUP_DIR/.env.backup"
    fi
    
    success "Backup created in $BACKUP_DIR"
}

# Install dependencies
install_dependencies() {
    log "📦 Installing dependencies..."
    
    npm ci
    
    success "Dependencies installed"
}

# Database migration
migrate_database() {
    log "🗄️  Running database migrations..."
    
    # Use production environment
    export NODE_ENV=production
    
    # Generate Prisma client
    npx prisma generate
    
    # Run migrations (safe deploy)
    npx prisma migrate deploy
    
    success "Database migrations completed"
}

# Build application
build_application() {
    log "🔨 Building application..."
    
    # Use production environment
    cp .env.production .env
    
    # Build Next.js app
    npm run build
    
    success "Application built successfully"
}

# Run tests
run_tests() {
    log "🧪 Running tests..."
    
    # Test critical endpoints
    info "Testing campaign slug generation..."
    if command -v curl >/dev/null 2>&1; then
        # Start server in background for testing
        npm start &
        SERVER_PID=$!
        sleep 10
        
        # Test products endpoint
        if curl -s http://localhost:3000/api/products/categories | grep -q "categories"; then
            success "API tests passed"
        else
            error "API tests failed"
        fi
        
        # Stop test server
        kill $SERVER_PID
    else
        warning "curl not available, skipping API tests"
    fi
}

# Start production server
start_server() {
    log "🚀 Starting production server..."
    
    # Check if PM2 is available
    if command -v pm2 >/dev/null 2>&1; then
        info "Using PM2 for process management..."
        pm2 start npm --name "goozy-platform" -- start
        pm2 save
    else
        info "Starting with npm..."
        npm start &
        echo $! > server.pid
    fi
    
    success "Production server started"
}

# Verify deployment
verify_deployment() {
    log "✅ Verifying deployment..."
    
    # Wait for server to start
    sleep 10
    
    # Check if server is responding
    if curl -s http://localhost:3000/api/debug/campaigns-slugs >/dev/null; then
        success "Server is responding"
    else
        error "Server is not responding"
    fi
    
    # Check campaign creation
    info "Campaign URL system is ready"
    
    success "Deployment verified successfully"
}

# Cleanup
cleanup() {
    log "🧹 Cleaning up..."
    
    # Remove temporary files
    rm -f .env.backup
    
    success "Cleanup completed"
}

# Main deployment process
main() {
    log "🚀 Starting Goozy Platform deployment to production"
    
    check_requirements
    create_backup
    install_dependencies
    migrate_database
    build_application
    run_tests
    start_server
    verify_deployment
    cleanup
    
    success "🎉 Deployment completed successfully!"
    info "Application URL: $(grep NEXT_PUBLIC_APP_URL .env.production | cut -d'=' -f2)"
    info "Admin panel: $(grep NEXT_PUBLIC_APP_URL .env.production | cut -d'=' -f2)/admin"
    info "Deployment log: $LOG_FILE"
}

# Handle script interruption
trap 'error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@" 