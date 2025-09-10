# 🚀 Deployment and CI/CD Guide

Comprehensive guide for deploying the Patient Management System and setting up continuous integration/continuous deployment.

## 📋 Table of Contents

1. [Deployment Overview](#-deployment-overview)
2. [Environment Setup](#-environment-setup)
3. [Local Deployment](#-local-deployment)
4. [Production Deployment](#-production-deployment)
5. [CI/CD Pipeline](#-cicd-pipeline)
6. [Docker Deployment](#-docker-deployment)
7. [Monitoring and Logging](#-monitoring-and-logging)
8. [Rollback Procedures](#-rollback-procedures)
9. [Security Considerations](#-security-considerations)

## 🎯 Deployment Overview

### Deployment Environments

| Environment | Purpose | URL | Branch | Auto-Deploy |
|-------------|---------|-----|--------|-------------|
| **Development** | Local development | localhost | feature/* | No |
| **Staging** | Testing and QA | staging.patient-mgmt.com | develop | Yes |
| **Production** | Live application | patient-mgmt.com | main | Manual |

### Deployment Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Application   │    │    Database     │
│    (Nginx)      │◄──►│    Servers      │◄──►│  (PostgreSQL)   │
│                 │    │   (Node.js)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Files  │    │     Logging     │    │     Backup      │
│     (CDN)       │    │   (Winston)     │    │   (Automated)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ⚙️ Environment Setup

### Environment Variables

#### Production Environment Variables
```env
# Application
NODE_ENV=production
PORT=5000
APP_NAME=Patient Management System

# Database
DATABASE_URL=postgresql://user:password@host:5432/patient_mgmt_prod
DATABASE_POOL_SIZE=20

# Authentication
JWT_SECRET=super-secure-production-secret-change-this
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://patient-mgmt.com,https://www.patient-mgmt.com

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# External Services
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# File Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=patient-mgmt-files
AWS_REGION=us-east-1
```

#### Staging Environment Variables
```env
# Application
NODE_ENV=staging
PORT=5000
APP_NAME=Patient Management System (Staging)

# Database
DATABASE_URL=postgresql://user:password@host:5432/patient_mgmt_staging

# Authentication
JWT_SECRET=staging-secret-different-from-prod
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://staging.patient-mgmt.com

# Monitoring
LOG_LEVEL=debug
```

### Environment Configuration Management

#### Using dotenv-vault (Recommended)
```bash
# Install dotenv-vault
npm install dotenv-vault

# Login and sync environments
npx dotenv-vault login
npx dotenv-vault push
npx dotenv-vault pull production
```

#### Manual Environment Setup
```bash
# Create environment-specific files
touch .env.production
touch .env.staging
touch .env.development

# Never commit these files
echo ".env.*" >> .gitignore
```

## 💻 Local Deployment

### Development Server
```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd frontend
npm run dev
```

### Production-like Local Setup
```bash
# Build frontend
cd frontend
npm run build

# Serve built files
cd backend
npm start
```

### Docker Local Development
```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 Production Deployment

### Prerequisites
- Node.js 18+ installed on server
- PostgreSQL database setup
- SSL certificate configured
- Domain name configured
- Firewall rules configured

### Manual Deployment Steps

#### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
```

#### 2. Application Deployment
```bash
# Clone repository
git clone https://github.com/your-org/patient-management-system.git
cd patient-management-system

# Install dependencies
cd backend && npm ci --production
cd ../frontend && npm ci && npm run build

# Setup environment variables
cp .env.example .env.production
# Edit .env.production with production values

# Setup database
cd backend
npx prisma generate
npx prisma migrate deploy

# Start application with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### 3. Nginx Configuration
```nginx
# /etc/nginx/sites-available/patient-mgmt
server {
    listen 80;
    server_name patient-mgmt.com www.patient-mgmt.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name patient-mgmt.com www.patient-mgmt.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Frontend (React app)
    location / {
        root /var/www/patient-mgmt/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }
}
```

#### 4. PM2 Ecosystem Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'patient-mgmt-api',
      script: './backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
    },
  ],
};
```

### Automated Deployment Script
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Install dependencies
cd backend
npm ci --production

cd ../frontend
npm ci
npm run build

# Run database migrations
cd ../backend
npx prisma migrate deploy

# Restart application
pm2 restart ecosystem.config.js --env production

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment completed successfully!"
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

#### Main Workflow (.github/workflows/main.yml)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: |
            backend/package-lock.json
            frontend/package-lock.json

      - name: Install backend dependencies
        run: |
          cd backend
          npm ci

      - name: Install frontend dependencies
        run: |
          cd frontend
          npm ci

      - name: Run backend tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          JWT_SECRET: test-secret
        run: |
          cd backend
          npm run test:ci

      - name: Run frontend tests
        run: |
          cd frontend
          npm test -- --coverage --watchAll=false

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          directory: ./backend/coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Build frontend
        run: |
          cd frontend
          npm ci
          npm run build

      - name: Build Docker image
        run: |
          docker build -t patient-mgmt:${{ github.sha }} .
          docker tag patient-mgmt:${{ github.sha }} patient-mgmt:latest

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push patient-mgmt:${{ github.sha }}
          docker push patient-mgmt:latest

  deploy-staging:
    needs: [test, build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'

    steps:
      - name: Deploy to staging
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /var/www/patient-mgmt
            git pull origin develop
            ./deploy-staging.sh

  deploy-production:
    needs: [test, build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /var/www/patient-mgmt
            git pull origin main
            ./deploy-production.sh
```

#### Security Scanning Workflow
```yaml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday at 2 AM
  push:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: |
          cd backend && npm audit --audit-level high
          cd ../frontend && npm audit --audit-level high

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run CodeQL analysis
        uses: github/codeql-action/analyze@v2
        with:
          languages: javascript
```

### Deployment Secrets

Required secrets in GitHub repository settings:
```
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
STAGING_HOST=staging.patient-mgmt.com
STAGING_USER=deploy
STAGING_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...
PRODUCTION_HOST=patient-mgmt.com
PRODUCTION_USER=deploy
PRODUCTION_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...
SNYK_TOKEN=your-snyk-token
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Build backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --production
COPY backend/ ./
RUN npx prisma generate

# Production image
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/backend ./backend
COPY --from=builder --chown=nodejs:nodejs /app/frontend/dist ./frontend/dist

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node backend/healthcheck.js

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/server.js"]
```

### Docker Compose (Production)
```yaml
version: '3.8'

services:
  app:
    image: patient-mgmt:latest
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/patient_mgmt
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
    networks:
      - app-network

  db:
    image: postgres:13-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_DB=patient_mgmt
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### Kubernetes Deployment (Advanced)
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: patient-mgmt-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: patient-mgmt-api
  template:
    metadata:
      labels:
        app: patient-mgmt-api
    spec:
      containers:
      - name: api
        image: patient-mgmt:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 📊 Monitoring and Logging

### Application Monitoring

#### Health Check Endpoint
```javascript
// backend/routes/health.js
const express = require('express');
const prisma = require('../prismaClient');

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    };

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: memUsageMB,
      version: process.env.npm_package_version,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

module.exports = router;
```

#### Logging Configuration
```javascript
// backend/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'patient-mgmt-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### External Monitoring Services

#### Sentry Integration
```javascript
// backend/utils/sentry.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

module.exports = Sentry;
```

#### Uptime Monitoring
- **Pingdom**: Website uptime monitoring
- **UptimeRobot**: Free uptime monitoring
- **StatusPage**: Status page for users

### Log Aggregation
```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.14.0
    environment:
      - discovery.type=single-node
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:7.14.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:7.14.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

## 🔄 Rollback Procedures

### Quick Rollback Steps
```bash
#!/bin/bash
# rollback.sh

echo "🔄 Starting rollback procedure..."

# Get previous version
PREVIOUS_VERSION=$(git log --oneline -n 2 | tail -1 | cut -d' ' -f1)

echo "Rolling back to: $PREVIOUS_VERSION"

# Checkout previous version
git checkout $PREVIOUS_VERSION

# Reinstall dependencies (if needed)
cd backend && npm ci --production
cd ../frontend && npm ci && npm run build

# Run database rollback (if needed)
cd ../backend
npx prisma migrate resolve --rolled-back migration_name

# Restart application
pm2 restart ecosystem.config.js --env production

echo "✅ Rollback completed!"
```

### Database Rollback
```bash
# List migrations
npx prisma migrate status

# Rollback specific migration
npx prisma migrate resolve --rolled-back 20231201000000_migration_name

# Reset to specific migration
npx prisma migrate reset --to 20231201000000_migration_name
```

### Blue-Green Deployment
```bash
#!/bin/bash
# blue-green-deploy.sh

CURRENT_ENV=$(pm2 list | grep "patient-mgmt" | awk '{print $2}')

if [ "$CURRENT_ENV" = "blue" ]; then
    NEW_ENV="green"
    OLD_ENV="blue"
else
    NEW_ENV="blue"
    OLD_ENV="green"
fi

echo "Deploying to $NEW_ENV environment..."

# Deploy to new environment
pm2 start ecosystem.config.js --name "patient-mgmt-$NEW_ENV" --env production

# Health check
sleep 10
curl -f http://localhost:5001/health || exit 1

# Switch traffic
sudo nginx -s reload

# Stop old environment
pm2 stop "patient-mgmt-$OLD_ENV"

echo "Deployment completed. Traffic switched to $NEW_ENV"
```

## 🔒 Security Considerations

### SSL/TLS Configuration
```nginx
# Strong SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### Environment Security
```bash
# Secure file permissions
chmod 600 .env.production
chown root:root .env.production

# Firewall rules
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 5000/tcp  # Block direct API access
ufw enable
```

### Secrets Management
```bash
# Using AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id prod/patient-mgmt/jwt-secret

# Using HashiCorp Vault
vault kv get -field=jwt_secret secret/patient-mgmt/prod
```

### Security Scanning
```bash
# Dependency scanning
npm audit --audit-level high

# Container scanning
docker scan patient-mgmt:latest

# SAST scanning
sonar-scanner -Dsonar.projectKey=patient-mgmt
```

## 📚 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Backup procedures tested

### Deployment
- [ ] Application deployed successfully
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Log aggregation working
- [ ] Performance metrics baseline established

### Post-Deployment
- [ ] Smoke tests completed
- [ ] User acceptance testing
- [ ] Performance monitoring active
- [ ] Error tracking configured
- [ ] Rollback procedure tested
- [ ] Documentation updated
- [ ] Team notified

---

**Deployment Success! 🎉**

Remember to monitor the application closely after deployment and be prepared to rollback if issues arise.

*Last updated: $(date)*