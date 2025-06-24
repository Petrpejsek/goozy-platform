# 🔧 Produkční konfigurace

## Vytvořte `.env.production` s těmito nastaveními:

```bash
# 🚀 Production Environment Configuration
# Copy this to .env.production and update with your values

# ===================================
# DATABASE CONFIGURATION
# ===================================
DATABASE_URL="postgresql://username:password@your-database-server:5432/goozy_production"

# ===================================
# DOMAIN & URL CONFIGURATION
# ===================================
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXTAUTH_URL="https://your-domain.com"

# ===================================
# SECURITY CONFIGURATION
# ===================================
NODE_ENV="production"
NEXTAUTH_SECRET="your-super-secure-random-string-minimum-32-characters"

# ===================================
# OPTIONAL: PAYMENT INTEGRATION
# ===================================
# STRIPE_SECRET_KEY="sk_live_..."
# STRIPE_PUBLISHABLE_KEY="pk_live_..."

# ===================================
# OPTIONAL: EMAIL CONFIGURATION
# ===================================
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-app-password"
```

## 🚀 Rychlé nasazení

1. **Vytvořte konfiguraci:**
```bash
cp PRODUCTION-CONFIG.md .env.production
# Upravte hodnoty ve .env.production
```

2. **Spusťte deployment:**
```bash
./deploy-production.sh
```

## 🔐 Bezpečnostní klíč
Vygenerujte silný NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## ✅ Kontrola po nasazení
- Campaign URL systém: `https://your-domain.com/api/debug/campaigns-slugs`
- Admin rozhraní: `https://your-domain.com/admin`
- Nová kampaň: `https://your-domain.com/influencer/campaign/launch` 