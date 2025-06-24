# 🚀 Produkční nasazení Goozy Platform

## ✅ Co je připraveno pro produkci

### 1. Campaign URL systém
- ✅ Unikátní slugy s garantovanou jedinečností
- ✅ Automatická detekce a řešení kolizí
- ✅ Validace formátu URL
- ✅ Fallback mechanismy
- ✅ Debug endpointy pro monitoring

### 2. Databázové změny
- ✅ Přidáno `slug` pole do Campaign modelu
- ✅ Unikátní constraint na slug
- ✅ Migrace hotova

### 3. API endpointy
- ✅ `/api/campaign/[slug]` - načítání podle slugu
- ✅ `/api/debug/campaigns-slugs` - monitoring slugů
- ✅ Všechny API jsou Next.js 15 kompatibilní

## 🔧 Nastavení pro externí server

### 1. Environment Variables
Vytvořte `.env.production`:
```bash
# Database
DATABASE_URL="postgresql://username:password@your-server:5432/goozy_production"

# Domain Configuration
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXTAUTH_URL="https://your-domain.com"

# Security
NODE_ENV="production"
NEXTAUTH_SECRET="your-super-secure-secret-key"
```

### 2. Databázová migrace na produkci
```bash
# Na produkčním serveru:
npx prisma migrate deploy
npx prisma generate
```

### 3. Build pro produkci
```bash
npm run build
npm start
```

## 🌐 Konfigurace domény

### 1. DNS nastavení
- Nasměrujte doménu na váš server IP
- Nastavte A record nebo CNAME

### 2. SSL certifikát
- Použijte Let's Encrypt nebo jiný SSL provider
- Ověřte HTTPS přístup

### 3. Reverse proxy (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔍 Testování po nasazení

### 1. Základní funkčnost
```bash
# Test API
curl https://your-domain.com/api/debug/campaigns-slugs

# Test campaign creation
# Přejděte na: https://your-domain.com/influencer/campaign/launch
```

### 2. URL slugy
- Vytvořte testovací kampaň
- Zkontrolujte, že má unikátní slug
- Otestujte přístup na campaign URL

### 3. Admin rozhraní
- Přístup: https://your-domain.com/admin
- Kontrola správy kampaní

## ⚠️ Důležité security nastavení

### 1. Databáze
- Změňte default password
- Omezit přístup pouze z aplikačního serveru
- Pravidelné zálohy

### 2. Application
- Nastavit silné `NEXTAUTH_SECRET`
- Omezit CORS nastavení
- Rate limiting

### 3. Server
- Firewall konfigurace
- Automatické security updates
- Monitoring

## 📊 Monitoring endpointy

### Debug informace
- `/api/debug/campaigns-slugs` - analýza slugů
- `/api/admin/campaigns` - admin přehled

### Health check
- `/api/health` (můžeme přidat později)

## 🚀 Deploy checklist

- [ ] Environment variables nastaveny
- [ ] Database migrace provedena
- [ ] DNS nasměrováno
- [ ] SSL certifikát aktivní
- [ ] Reverse proxy nakonfigurován
- [ ] Testovací kampaň vytvořena
- [ ] URL slugy fungují
- [ ] Admin rozhraní dostupné

## 🔄 Postupné nasazení

1. **Staging server** - nejprve otestovat
2. **Database backup** - před produkční migrací
3. **Monitoring** - sledovat logy a chyby
4. **Rollback plan** - připravit záložní řešení

Systém je **připraven pro produkci** s profesionálním řešením URL problematiky! 