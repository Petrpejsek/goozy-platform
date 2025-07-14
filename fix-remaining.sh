#!/bin/bash
echo "🔧 OPRAVUJI ZBÝVAJÍCÍ CHYBY..."

# Oprav NextResponse.json chybějící čárky
find src/app/api -name "*.ts" -exec sed -i '' 's/{ error: \(.*\) }$/{ error: \1 },/g' {} \;
find src/app/api -name "*.ts" -exec sed -i '' 's/{ status: \([0-9]*\) }$/{ status: \1 }/g' {} \;

# Konkrétní opravy
find src/app/api -name "*.ts" -exec sed -i '' "s/{ error: 'Application not found' }$/{ error: 'Application not found' },/g" {} \;
find src/app/api -name "*.ts" -exec sed -i '' "s/{ error: 'Filename is required' }$/{ error: 'Filename is required' },/g" {} \;
find src/app/api -name "*.ts" -exec sed -i '' "s/{ error: 'Failed to fetch brand images' }$/{ error: 'Failed to fetch brand images' },/g" {} \;

# Oprav include/orderBy čárky
find src/app/api -name "*.ts" -exec sed -i '' 's/brand: true$/brand: true,/g' {} \;
find src/app/api -name "*.ts" -exec sed -i '' 's/}$/},/g' {} \;

echo "✅ OPRAVENO!"
