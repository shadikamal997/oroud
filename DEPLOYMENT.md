# Oroud Backend - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `.env.production` and configure all variables
- [ ] Generate strong JWT secret: `openssl rand -base64 64`
- [ ] Set strong PostgreSQL credentials
- [ ] Configure production Cloudinary account
- [ ] Set correct CORS origins (your frontend domain)

### 2. Security Setup
- [ ] Change all default passwords
- [ ] Ensure `NODE_ENV=production`
- [ ] Configure firewall rules (allow ports 80, 443 only)
- [ ] Set up SSL certificates (Let's Encrypt recommended)
- [ ] Review and update NGINX configuration

### 3. Database Preparation
- [ ] Prepare production database
- [ ] Plan backup strategy
- [ ] Test database migrations

## 🚀 Deployment Steps

### Option 1: Docker Compose Deployment (Recommended)

#### Step 1: Clone Repository
```bash
git clone https://github.com/your-repo/oroud-backend.git
cd oroud-backend
```

#### Step 2: Configure Environment
```bash
# Copy production environment template
cp .env.production .env

# Edit .env with production values
nano .env
```

**Critical Variables to Update:**
- `JWT_SECRET` - Generate with: `openssl rand -base64 64`
- `DATABASE_URL` - Production database connection
- `POSTGRES_PASSWORD` - Strong password for database
- `CORS_ORIGINS` - Your frontend domain(s)
- `CLOUDINARY_*` - Production Cloudinary credentials

#### Step 3: Build and Deploy
```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f app
```

#### Step 4: Run Database Migrations
```bash
# Migrations run automatically on container start
# To run manually:
docker-compose exec app npx prisma migrate deploy
```

#### Step 5: Seed Database (Optional)
```bash
# Seed cities and areas
docker-compose exec app npm run seed
```

#### Step 6: Verify Deployment
```bash
# Check service status
docker-compose ps

# Test API health
curl http://localhost/health

# Test API endpoint
curl http://localhost/api/cities
```

### Option 2: Manual Deployment

#### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- NGINX

#### Step 1: Install Dependencies
```bash
npm ci --only=production
```

#### Step 2: Configure Environment
```bash
cp .env.production .env
# Edit .env with your production values
```

#### Step 3: Database Setup
```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

#### Step 4: Build Application
```bash
npm run build
```

#### Step 5: Configure NGINX
```bash
# Copy NGINX configuration
sudo cp nginx.conf /etc/nginx/sites-available/oroud
sudo ln -s /etc/nginx/sites-available/oroud /etc/nginx/sites-enabled/

# Test NGINX configuration
sudo nginx -t

# Restart NGINX
sudo systemctl restart nginx
```

#### Step 6: Start Application
```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start dist/main.js --name oroud-backend

# Or use systemd service
sudo systemctl start oroud
```

## 🔒 SSL/HTTPS Setup (Let's Encrypt)

### Step 1: Install Certbot
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### Step 2: Obtain Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Step 3: Update NGINX Configuration
Uncomment the HTTPS server block in `nginx.conf` and update:
- `server_name` to your domain
- Certificate paths if different

### Step 4: Restart Services
```bash
docker-compose restart nginx
# or
sudo systemctl restart nginx
```

### Step 5: Test Auto-Renewal
```bash
sudo certbot renew --dry-run
```

## 🗄️ Database Backup Strategy

### Automated Backups with Cron

Create backup script:
```bash
#!/bin/bash
# /usr/local/bin/backup-oroud-db.sh

BACKUP_DIR="/var/backups/oroud"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="oroud_prod"

mkdir -p $BACKUP_DIR

docker-compose exec -T db pg_dump -U oroud_prod $DB_NAME | gzip > $BACKUP_DIR/oroud_backup_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "oroud_backup_*.sql.gz" -mtime +7 -delete
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-oroud-db.sh
```

## 📊 Monitoring

### Check Service Status
```bash
# Docker services
docker-compose ps
docker-compose logs -f

# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f db

# NGINX logs
docker-compose logs -f nginx
```

### Health Checks
```bash
# API health
curl http://your-domain.com/health

# Database connection
docker-compose exec app npx prisma db pull
```

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build app
docker-compose up -d app

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

### Database Migrations
```bash
# In development, create migration
npx prisma migrate dev --name migration_name

# In production, apply migrations
docker-compose exec app npx prisma migrate deploy
```

## 🚨 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose exec app env | grep DATABASE_URL

# Verify database connection
docker-compose exec app npx prisma db pull
```

### Database Connection Issues
```bash
# Check database is running
docker-compose ps db

# Test connection
docker-compose exec db psql -U oroud_prod -d oroud_prod
```

### NGINX Issues
```bash
# Test configuration
docker-compose exec nginx nginx -t

# Check logs
docker-compose logs nginx

# Reload configuration
docker-compose exec nginx nginx -s reload
```

## 📞 Support

For issues and questions:
- Check logs: `docker-compose logs -f`
- Review environment configuration
- Verify all services are running: `docker-compose ps`

## 🔐 Security Best Practices

1. **Never commit `.env` files to git**
2. **Use strong, unique passwords** for all services
3. **Enable SSL/HTTPS** in production
4. **Configure firewall** to allow only necessary ports
5. **Regular backups** of database
6. **Keep dependencies updated**: `npm audit fix`
7. **Monitor logs** for suspicious activity
8. **Use rate limiting** (already configured)
9. **Implement proper CORS** settings
10. **Regular security audits**

## 📈 Performance Optimization

- Database indexes are already optimized
- Rate limiting configured (100 req/min)
- NGINX caching and gzip enabled
- Image optimization via Cloudinary
- Health checks configured

## 🎯 Production Checklist

Before going live:
- [ ] All environment variables configured
- [ ] SSL certificates installed and auto-renewal configured
- [ ] Database backups automated
- [ ] Monitoring and alerting set up
- [ ] CORS configured for production domains
- [ ] Firewall rules configured
- [ ] All default passwords changed
- [ ] Application tested in production environment
- [ ] Error logging configured
- [ ] Documentation reviewed
