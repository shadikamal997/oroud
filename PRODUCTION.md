# Oroud Backend - Production Deployment Files

This directory contains all necessary files for production deployment of the Oroud backend.

## 📁 Key Files

### Docker Configuration
- **`Dockerfile`** - Multi-stage production build for NestJS app
- **`docker-compose.yml`** - Production orchestration (app + db + nginx)
- **`docker-compose.dev.yml`** - Development database only
- **`.dockerignore`** - Optimizes Docker build size

### NGINX Configuration
- **`nginx.conf`** - Reverse proxy with SSL support
- **`ssl/`** - SSL certificates directory (see ssl/README.md)

### Environment Configuration
- **`.env.example`** - Template with all required variables
- **`.env.development`** - Development environment template
- **`.env.production`** - Production environment template (configure before deployment)
- **`src/config/config-validation.service.ts`** - Environment validation at startup

### Deployment Tools
- **`deploy.sh`** - Automated deployment script
- **`DEPLOYMENT.md`** - Comprehensive deployment guide

## 🚀 Quick Start - Production Deployment

### 1. Configure Environment
```bash
# Copy production template
cp .env.production .env

# Edit with your production values
nano .env
```

**Critical Variables:**
- `JWT_SECRET` - Generate: `openssl rand -base64 64`
- `DATABASE_URL` - Production database connection
- `POSTGRES_PASSWORD` - Strong database password
- `CORS_ORIGINS` - Your frontend domain(s)
- `CLOUDINARY_*` - Production Cloudinary credentials

### 2. Deploy with Script
```bash
# Run automated deployment
./deploy.sh
```

### 3. Manual Deployment
```bash
# Build and start services
docker-compose build
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

## 🔒 SSL/HTTPS Setup

### Option 1: Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/
```

### Option 2: Self-Signed (Development Only)
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./ssl/privkey.pem \
  -out ./ssl/fullchain.pem
```

Then uncomment HTTPS block in `nginx.conf` and restart:
```bash
docker-compose restart nginx
```

## 🗄️ Database Management

### Backup
```bash
# Manual backup
docker-compose exec db pg_dump -U oroud_prod oroud_prod > backup.sql

# Automated backups (see DEPLOYMENT.md)
```

### Restore
```bash
cat backup.sql | docker-compose exec -T db psql -U oroud_prod oroud_prod
```

### Migrations
```bash
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npm run seed
```

## 📊 Monitoring

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f nginx
```

### Health Check
```bash
curl http://localhost/health
```

### Service Status
```bash
docker-compose ps
```

## 🔄 Updates

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build app
docker-compose up -d app

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

## 🐛 Troubleshooting

### App won't start
```bash
# Check logs
docker-compose logs app

# Verify environment
docker-compose exec app env | grep DATABASE_URL

# Test database connection
docker-compose exec app npx prisma db pull
```

### Database issues
```bash
# Check database status
docker-compose ps db

# Test connection
docker-compose exec db psql -U oroud_prod -d oroud_prod
```

### NGINX issues
```bash
# Test configuration
docker-compose exec nginx nginx -t

# Reload configuration
docker-compose exec nginx nginx -s reload
```

## 📁 Architecture

```
Internet
    ↓
NGINX (Port 80/443)
    ↓
NestJS App (Port 3000)
    ↓
PostgreSQL (Internal)
```

**Security Features:**
- Database not exposed publicly
- Rate limiting (100 req/min)
- SSL/HTTPS ready
- Security headers (helmet)
- Input validation
- JWT authentication

## 📚 Documentation

- **`DEPLOYMENT.md`** - Full deployment guide
- **`ssl/README.md`** - SSL certificate setup
- **`README.md`** - Project overview

## 🔐 Security Checklist

Before going live:
- [ ] Strong JWT secret generated
- [ ] Strong database password set
- [ ] CORS origins configured for production
- [ ] SSL certificates installed
- [ ] Firewall configured (ports 80, 443 only)
- [ ] Database backups automated
- [ ] All default passwords changed
- [ ] `.env` files not in git
- [ ] Monitoring set up
- [ ] Rate limiting tested

## 🎯 Production URLs

After deployment with domain:
- **API:** `https://your-domain.com/api`
- **Health:** `https://your-domain.com/health`
- **Upload:** `https://your-domain.com/api/upload/image`

## 💡 Tips

1. **Always test in staging first** before deploying to production
2. **Keep backups** - automate daily database backups
3. **Monitor logs** regularly for errors or suspicious activity
4. **Update dependencies** regularly: `npm audit fix`
5. **Use strong passwords** for all services
6. **Enable SSL** as soon as possible
7. **Configure domain DNS** to point to your server
8. **Set up monitoring** (Prometheus, Grafana, etc.)
9. **Document changes** in CHANGELOG.md
10. **Review security** regularly

## 📞 Support

For detailed deployment instructions, see `DEPLOYMENT.md`.

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify configuration: `.env` file
3. Test services: `docker-compose ps`
4. Review documentation: `DEPLOYMENT.md`
