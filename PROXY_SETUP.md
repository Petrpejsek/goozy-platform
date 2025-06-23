# 🌐 IP Rotation Setup Guide

## Přehled
Instagram scraping nyní podporuje automatickou IP rotaci pomocí proxy serverů. To výrazně snižuje riziko detekce a blokování.

## ⚡ Rychlé nastavení

### 1. Přidejte proxy do `.env` souboru:

```bash
# Pro vlastní proxy list
PROXY_LIST="proxy1.com:8080:user:pass,proxy2.com:8080:user:pass"

# Pro Bright Data (doporučeno)
BRIGHT_DATA_USERNAME="your_username"
BRIGHT_DATA_PASSWORD="your_password"

# Pro Oxylabs
OXYLABS_USERNAME="your_username"
OXYLABS_PASSWORD="your_password"
```

### 2. Restartujte server:
```bash
npm run dev
```

## 🏆 Doporučené Proxy služby

### **Bright Data** (nejlepší pro Instagram)
- **Cena**: $500+/měsíc
- **Výhody**: 99.9% uptime, geo-targeting, residential IPs
- **Registrace**: https://brightdata.com/
- **Konfigurace**: Residential proxy network

### **Oxylabs** (velmi dobrá alternativa)
- **Cena**: $300+/měsíc
- **Výhody**: High-quality IPs, dobrá podpora
- **Registrace**: https://oxylabs.io/
- **Konfigurace**: Residential proxy network

### **Smartproxy** (střední kategorie)
- **Cena**: $80+/měsíc
- **Výhody**: Cenově dostupné, slušná kvalita
- **Registrace**: https://smartproxy.com/

## ⚙️ Nastavení proxy

### Formát PROXY_LIST:
```
host:port:username:password,host2:port2:user2:pass2
```

### Příklad:
```bash
PROXY_LIST="pr.oxylabs.io:7777:customer-user:pass123,pr.oxylabs.io:7778:customer-user:pass123"
```

## 🔧 Pokročilé nastavení

### Environment variables:
```bash
# Základní nastavení
PROXY_ROTATION_ENABLED=true
PROXY_MAX_FAILURES=3           # Kolik chyb před rotací
PROXY_TIMEOUT_MS=10000         # Timeout v milisekundách

# Bright Data nastavení
BRIGHT_DATA_USERNAME="your_username"
BRIGHT_DATA_PASSWORD="your_password"

# Oxylabs nastavení  
OXYLABS_USERNAME="customer-username"
OXYLABS_PASSWORD="password123"
```

## 📊 Jak to funguje

1. **Automatická rotace**: Proxy se rotuje po 3 chybách
2. **Monitorování**: Sleduje se success rate každého proxy
3. **Inteligentní výběr**: Preferuje proxy s vyšší success rate
4. **Error recovery**: Automaticky přepne na jiný proxy při problémech

## 🚨 Bez proxy (pouze pro testování)

Pokud není nakonfigurovaný žádný proxy, systém bude fungovat s přímým připojením, ale riziko blokování je velmi vysoké.

## 🔍 Debugování

### Logy ukážou:
```
🌐 [PROXY-MANAGER] Using proxy: pr.oxylabs.io:7777 (CZ)
✅ [PROXY-MANAGER] Proxy pr.oxylabs.io:7777 success (1200ms)
🔄 [PROXY-MANAGER] Rotating to proxy 1 due to failures
```

### Kontrola proxy statistik:
- Aktuální proxy se zobrazuje v admin panelu
- Success rate každého proxy
- Počet aktivních proxy

## 💰 Náklady

### Pro 1000 profilů denně:
- **Bright Data**: ~$15-20/den
- **Oxylabs**: ~$10-15/den  
- **Smartproxy**: ~$3-5/den

### Doporučení:
- **Začátečníci**: Smartproxy (levnější)
- **Produkce**: Bright Data (nejspolehlivější)
- **Střední**: Oxylabs (dobrý poměr cena/výkon)

## ⚠️ Bezpečnostní tips

1. **Nikdy nepoužívejte free proxy** pro produkci
2. **Rotujte proxy pravidelně** (každých 50-100 requestů)
3. **Sledujte logy** pro detekci problémů
4. **Nastavte rozumné limity** (max 200 profilů/hodinu)
5. **Používejte residential proxy** (ne datacenter)

## 🚀 Spuštění

1. Nakonfigurujte proxy v `.env`
2. Restart serveru: `npm run dev`
3. Jděte na `/admin/instagram-scraping`
4. Spusťte scraping s IP rotací!

---

**Poznánka**: IP rotace je klíčová pro úspěšné Instagram scraping. Bez ní budete pravděpodobně blokováni během pár minut. 