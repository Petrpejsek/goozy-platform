#!/bin/bash

# Deploy script pro Goozy aplikaci na produkční server
# Použití: ./deploy.sh

echo "🚀 Spouštím deploy na Hetzner server..."

# Kontrola, zda jsme v správném adresáři
if [ ! -f "package.json" ]; then
    echo "❌ Chyba: Nejste v adresáři s aplikací (nenalezen package.json)"
    exit 1
fi

# Kontrola current branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "production-deploy" ]; then
    echo "❌ Chyba: Nejste na production-deploy branch (aktuálně: $current_branch)"
    echo "Přepněte na production-deploy branch: git checkout production-deploy"
    exit 1
fi

# 1. Push změn (commit už byl udělán)
echo "📤 Pushování změn na GitHub..."
git push origin production-deploy

# 2. Deploy na server
echo "🔄 Aktualizace na serveru..."
ssh root@91.99.101.179 << 'EOF'
cd /opt/goozy-platform
echo "📥 Stahování aktualizací z GitHub..."
git pull origin production-deploy
echo "📦 Instalace závislostí..."
npm install
echo "🏗️ Building aplikace..."
npm run build
echo "🔄 Restart aplikace..."
pm2 restart goozy-platform
echo "✅ Deploy dokončen!"
pm2 status
EOF

echo "🎉 Aplikace je aktualizována na http://91.99.101.179:3000" 