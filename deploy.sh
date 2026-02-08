#!/bin/bash

# Oroud Backend - Production Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Oroud Production Deployment"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create .env file from .env.production template:"
    echo "  cp .env.production .env"
    echo "  nano .env  # Edit with your production values"
    exit 1
fi

# Check if NODE_ENV is set to production
if ! grep -q "NODE_ENV=production" .env; then
    echo -e "${YELLOW}⚠️  Warning: NODE_ENV is not set to 'production' in .env${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if critical variables are set
echo "🔍 Checking environment configuration..."

if grep -q "CHANGE_THIS" .env; then
    echo -e "${RED}❌ Error: Found default values in .env file${NC}"
    echo "Please update all CHANGE_THIS placeholders with actual values"
    exit 1
fi

echo -e "${GREEN}✅ Environment configuration looks good${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Error: Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"

# Build images
echo ""
echo "📦 Building Docker images..."
docker-compose build --no-cache

echo -e "${GREEN}✅ Docker images built successfully${NC}"

# Stop existing containers
echo ""
echo "🛑 Stopping existing containers..."
docker-compose down

# Start services
echo ""
echo "🚀 Starting services..."
docker-compose up -d

# Wait for database to be ready
echo ""
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if services are running
echo ""
echo "🔍 Checking service status..."
docker-compose ps

# Check application health
echo ""
echo "🏥 Checking application health..."
sleep 5

if curl -f http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed - checking logs...${NC}"
    docker-compose logs --tail=20 app
fi

# Show logs
echo ""
echo "📋 Recent logs:"
docker-compose logs --tail=20

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📊 Service Status:"
docker-compose ps
echo ""
echo "📝 Useful Commands:"
echo "  View logs:           docker-compose logs -f"
echo "  View app logs:       docker-compose logs -f app"
echo "  Restart services:    docker-compose restart"
echo "  Stop services:       docker-compose down"
echo "  Database backup:     docker-compose exec db pg_dump -U oroud_prod oroud_prod > backup.sql"
echo ""
echo "🌐 Access Points:"
echo "  HTTP:  http://localhost"
echo "  API:   http://localhost/api"
echo "  Health: http://localhost/health"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo "  1. Configure SSL certificates (see ssl/README.md)"
echo "  2. Set up domain DNS records"
echo "  3. Enable HTTPS in nginx.conf"
echo "  4. Set up database backups"
echo "  5. Configure monitoring"
