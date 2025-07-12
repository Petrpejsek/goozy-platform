# Environment Variables Setup

## Required Environment Variables

Vytvořte `.env.local` soubor v root adresáři s následujícími proměnnými:

### 🔷 **Database Configuration** (REQUIRED)
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/goozy_db"
```

### 🔷 **Next.js Configuration** (REQUIRED)
```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 🔷 **Stripe Configuration** (REQUIRED FOR CHECKOUT)
```bash
# Get these from https://dashboard.stripe.com/
STRIPE_SECRET_KEY="sk_test_..." 
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

**⚠️ CRITICAL:** Bez Stripe keys nebude fungovat checkout system!

### 🔷 **Email Configuration** (RECOMMENDED)
```bash
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-email-password"
SMTP_FROM="noreply@goozy.com"
```

### 🔷 **Security Configuration** (RECOMMENDED)
```bash
JWT_SECRET="your-jwt-secret-key-minimum-32-characters"
ENCRYPTION_KEY="your-encryption-key-exactly-32-chars"
```

### 🔶 **Optional Configuration**
```bash
# Development
NODE_ENV="development"
DEBUG_MODE="true"
LOG_LEVEL="info"

# File Upload
UPLOAD_PATH="/uploads"
MAX_FILE_SIZE="10485760"  # 10MB

# Rate Limiting
API_RATE_LIMIT="100"  # requests per minute
API_TIMEOUT="30000"   # 30 seconds

# Currency
DEFAULT_CURRENCY="EUR"
DEFAULT_LOCALE="en-EU"

# External Services
ANALYTICS_ID="your-analytics-id"
SENTRY_DSN="your-sentry-dsn"

# CDN (for production)
CDN_URL="https://your-cdn.com"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="eu-central-1"
AWS_S3_BUCKET="your-s3-bucket"
```

## 🚀 Quick Setup Guide

### 1. Vytvořte .env.local soubor:
```bash
cp .env.example .env.local  # Pokud máte .env.example
# nebo vytvořte nový .env.local soubor
```

### 2. Minimální konfigurace pro development:
```bash
# .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/goozy_dev"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_your_test_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_test_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

### 3. Stripe Setup:
1. Jděte na [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vytvořte nový účet nebo se přihlaste
3. V Developers > API keys zkopírujte:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`
4. V Developers > Webhooks vytvořte endpoint a zkopírujte:
   - **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 4. Database Setup:
```bash
# Spusťte PostgreSQL a vytvořte databázi
createdb goozy_dev

# Spusťte migrace
npx prisma migrate dev
npx prisma generate
```

## 🔍 Environment Variables Validation

Systém automaticky kontroluje kritické environment variables při spuštění:

- ✅ **DATABASE_URL** - Required for database connection
- ✅ **STRIPE_SECRET_KEY** - Required for payments
- ✅ **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** - Required for frontend
- ⚠️ **STRIPE_WEBHOOK_SECRET** - Warning if missing
- ⚠️ **SMTP_* variables** - Warning if missing (emails won't work)

## 🛠️ Troubleshooting

### Stripe Issues:
```bash
# Chyba: "No such customer"
# Řešení: Ujistěte se že používáte správné API keys (test vs live)

# Chyba: "Invalid API key"
# Řešení: Zkontrolujte že STRIPE_SECRET_KEY začína "sk_test_" nebo "sk_live_"
```

### Database Issues:
```bash
# Chyba: "Connection refused"
# Řešení: Zkontrolujte že PostgreSQL běží a DATABASE_URL je správná

# Chyba: "Migration failed"
# Řešení: Spusťte: npx prisma migrate reset --force
```

### Build Issues:
```bash
# Chyba: "NEXT_PUBLIC_* undefined"
# Řešení: Environment variables začínající NEXT_PUBLIC_ musí být v .env.local
```

## 🔐 Security Notes

1. **NIKDY** necommitujte .env soubory do gitu
2. V production použijte strong secrets (32+ characters)
3. Používejte Stripe live keys pouze v production
4. Rotujte secrets pravidelně
5. Použijte environment variable management (Vercel, Heroku, AWS Secrets Manager)

## 📋 Environment Checklist

**Development Ready:**
- [ ] DATABASE_URL configured
- [ ] Stripe test keys configured  
- [ ] NEXT_PUBLIC_APP_URL set to localhost:3000
- [ ] NEXTAUTH_SECRET set

**Production Ready:**
- [ ] All development variables
- [ ] Stripe live keys configured
- [ ] SMTP configuration for emails
- [ ] Strong JWT_SECRET and ENCRYPTION_KEY
- [ ] CDN configuration (if using)
- [ ] Analytics tracking IDs
- [ ] Error tracking (Sentry)

**🎯 Po správném nastavení bude systém připraven pro:**
- ✅ Kompletní checkout flow
- ✅ Stripe platby (card, Apple Pay)
- ✅ Email notifications
- ✅ Supplier shipping management
- ✅ Partner API integrations
- ✅ Security middleware 