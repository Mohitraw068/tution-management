# 🚀 ETution Platform - Deployment Guide

This guide covers all deployment options for the ETution platform, from local development to production deployment.

## 📋 Pre-Deployment Checklist

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database (production)
- [ ] Domain name configured (production)
- [ ] SSL certificates (production)
- [ ] Environment variables prepared

### Required Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Generated secret key
- [ ] `NEXTAUTH_URL` - Your domain URL
- [ ] `NEXT_PUBLIC_APP_URL` - Public app URL

### Optional Environment Variables
- [ ] `OPENAI_API_KEY` - For AI homework generation
- [ ] `STRIPE_SECRET_KEY` - For payment processing
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- [ ] `SMTP_*` variables - For email notifications

## 🏠 Local Development

### Quick Start
```bash
# Clone and setup
git clone <repository-url>
cd etution-platform
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your values

# Database setup
npm run db:generate
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

### Environment Configuration
```env
# .env.local
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="development-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## ☁️ Vercel Deployment (Recommended)

### Step 1: Prepare Your Repository
```bash
# Ensure your code is committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Connect to Vercel
1. Visit [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Configure Environment Variables
In Vercel dashboard, add these environment variables:

```env
# Database (use a hosted PostgreSQL service)
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
NEXTAUTH_SECRET=your-generated-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Optional: AI Features
OPENAI_API_KEY=sk-your-openai-key

# Optional: Payments
STRIPE_SECRET_KEY=sk_live_your-stripe-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
```

### Step 4: Database Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Run migrations on production database
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed
```

### Step 5: Deploy
```bash
# Deploy to production
vercel --prod
```

### Step 6: Configure Custom Domain (Optional)
1. In Vercel dashboard, go to project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed
5. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` in environment variables

## 🐳 Docker Deployment

### Development with Docker
```bash
# Start supporting services
docker-compose up -d postgres redis

# Run application locally
npm run dev
```

### Production Docker Deployment
```bash
# 1. Prepare environment file
cp .env.example .env.production
# Edit .env.production with production values

# 2. Build and deploy
docker-compose --env-file .env.production up -d

# 3. Run database migrations
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed
```

### Custom Docker Build
```bash
# Build image
docker build -t etution-platform .

# Run container
docker run -d \
  --name etution-app \
  -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  etution-platform
```

## 🌊 Railway Deployment

### Step 1: Prepare Railway
1. Visit [railway.app](https://railway.app) and sign up
2. Create new project
3. Connect your GitHub repository

### Step 2: Add PostgreSQL
1. In Railway dashboard, click "New"
2. Add "PostgreSQL" service
3. Note the connection details

### Step 3: Configure Environment Variables
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-app-name.railway.app
NEXT_PUBLIC_APP_URL=https://your-app-name.railway.app
```

### Step 4: Deploy
```bash
# Railway will auto-deploy on git push
git push origin main
```

## 🦀 Self-Hosted VPS

### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Nginx
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Database Setup
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE etution_db;
CREATE USER etution_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE etution_db TO etution_user;
\q
```

### Step 3: Application Setup
```bash
# Clone repository
git clone <your-repo-url> /var/www/etution
cd /var/www/etution

# Install dependencies
npm ci --only=production

# Setup environment
cp .env.example .env.production
# Edit .env.production with production values

# Build application
npm run build

# Run database migrations
npm run db:migrate
npm run db:seed
```

### Step 4: Process Management
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'etution-platform',
    script: './node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/etution',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 5: Nginx Configuration
```bash
# Create Nginx configuration
sudo cat > /etc/nginx/sites-available/etution << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/etution /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔐 Database Hosting Options

### Supabase (Recommended)
1. Visit [supabase.com](https://supabase.com)
2. Create new project
3. Use the provided PostgreSQL connection string
4. Configure in your environment variables

### PlanetScale
1. Visit [planetscale.com](https://planetscale.com)
2. Create new database
3. Use the connection string provided
4. Note: May require Prisma configuration changes

### Railway PostgreSQL
1. Add PostgreSQL service in Railway
2. Use the generated `DATABASE_URL`
3. Automatic backups included

### Neon
1. Visit [neon.tech](https://neon.tech)
2. Create new project
3. Use the connection string
4. Serverless PostgreSQL with generous free tier

## 📊 Monitoring & Analytics

### Error Tracking with Sentry
```env
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### Analytics with Google Analytics
```env
NEXT_PUBLIC_GA_ID=GA-XXXXXXXXX
```

### Uptime Monitoring
- [UptimeRobot](https://uptimerobot.com) - Free uptime monitoring
- [Pingdom](https://pingdom.com) - Advanced monitoring
- [StatusPage](https://statuspage.io) - Status page for users

## 🔧 Performance Optimization

### CDN Setup
- **Vercel**: Automatic global CDN
- **Cloudflare**: Add your domain to Cloudflare
- **AWS CloudFront**: Configure distribution

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_user_institute_id ON "User"("instituteId");
CREATE INDEX idx_class_institute_id ON "Class"("instituteId");
CREATE INDEX idx_homework_class_id ON "Homework"("classId");
CREATE INDEX idx_attendance_date ON "Attendance"("date");
```

### Caching Strategy
```env
# Redis for session storage (optional)
REDIS_URL=redis://localhost:6379
```

## 🛡️ Security Considerations

### Environment Security
- Never commit `.env` files
- Use different secrets for each environment
- Rotate secrets regularly
- Use environment-specific databases

### Database Security
- Use strong passwords
- Enable SSL/TLS connections
- Regular backups
- Monitor for suspicious activity

### Application Security
- Keep dependencies updated
- Use HTTPS in production
- Configure proper CORS headers
- Enable rate limiting

## 🔄 CI/CD Pipeline

### GitHub Actions (Included)
The repository includes GitHub Actions workflow for:
- Automated testing
- Security scanning
- Docker image building
- Deployment to staging/production

### Manual Deployment Commands
```bash
# Build and test locally
npm run build
npm run test

# Deploy to staging
vercel --env=staging

# Deploy to production
vercel --prod
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### Database Connection Issues
```bash
# Test database connection
npx prisma db pull

# Reset database
npx prisma migrate reset
npx prisma db seed
```

#### Environment Variable Issues
```bash
# Check environment variables
printenv | grep NEXTAUTH
```

### Getting Help
- Check application logs
- Review deployment logs
- Test API endpoints
- Verify environment configuration

## 📞 Support

- 📧 Deployment Support: deploy@etution.com
- 💬 Community: [Discord Server](https://discord.gg/etution)
- 📖 Documentation: [docs.etution.com](https://docs.etution.com)

---

## 🎯 Quick Deployment Summary

### For Demo/Testing (5 minutes)
1. Fork repository
2. Deploy to Vercel
3. Add environment variables
4. Use SQLite: `DATABASE_URL="file:./dev.db"`

### For Production (30 minutes)
1. Set up PostgreSQL database (Supabase recommended)
2. Configure custom domain
3. Set up proper environment variables
4. Deploy to Vercel/Railway
5. Run database migrations
6. Configure monitoring

### For High-Traffic Production (2 hours)
1. Set up VPS with load balancer
2. Configure PostgreSQL with read replicas
3. Set up Redis for caching
4. Configure CDN
5. Set up monitoring and alerts
6. Implement backup strategy

Remember to test thoroughly in a staging environment before deploying to production!