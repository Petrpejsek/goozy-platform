#!/bin/bash
# BRUTÁLNÍ OPRAVA VŠECH SYNTAX CHYB

echo "🔥 BRUTÁLNÍ OPRAVA - RYCHLÉ A EFEKTIVNÍ!"

# Najdu a opravím VŠECHNY NextResponse.json syntax chyby
find src/app/api -name "*.ts" -print0 | xargs -0 sed -i '' '
s/{ error: \([^}]*\) }$/{ error: \1 },/g
s/{ success: false, error: \([^}]*\) }$/{ success: false, error: \1 },/g
s/where: { id: applicationId }$/where: { id: applicationId },/g
s/{ error: \([^}]*\) }$/{ error: \1 },/g
'

echo "✅ HOTOVO - VŠECHNY SYNTAX CHYBY OPRAVENY!"
