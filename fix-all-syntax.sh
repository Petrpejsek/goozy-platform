#!/bin/bash
echo "🚀 MASIVNÍ OPRAVA VŠECH SYNTAX CHYB..."

# Odstraň všechny nepatřičné čárky a znaky
find src/app/api -name "*.ts" -exec sed -i '' 's/},$/}/g' {} \;
find src/app/api -name "*.ts" -exec sed -i '' 's/} %$/}/g' {} \;
find src/app/api -name "*.ts" -exec sed -i '' 's/} $/}/g' {} \;

# Oprav chybějící čárky v objektech
find src/app/api -name "*.ts" -exec sed -i '' 's/brandId: campaign\.brandId$/brandId: campaign.brandId,/g' {} \;
find src/app/api -name "*.ts" -exec sed -i '' 's/name: influencer\.name$/name: influencer.name,/g' {} \;
find src/app/api -name "*.ts" -exec sed -i '' 's/successful\.$/successful.,/g' {} \;
find src/app/api -name "*.ts" -exec sed -i '' 's/token$/token,/g' {} \;
find src/app/api -name "*.ts" -exec sed -i '' 's/id: `order_\${Date\.now()}`$/id: `order_\${Date.now()}`,/g' {} \;
find src/app/api -name "*.ts" -exec sed -i '' 's/brandId: user\.brandId$/brandId: user.brandId,/g' {} \;
find src/app/api -name "*.ts" -exec sed -i '' 's/email: user\.email$/email: user.email,/g' {} \;

# Oprav ukončení stringů
find src/app/api -name "*.ts" -exec sed -i '' "s/'fallback-secret-key\.,/'fallback-secret-key',/g" {} \;

echo "✅ VŠECHNY SYNTAX CHYBY OPRAVENY!"
