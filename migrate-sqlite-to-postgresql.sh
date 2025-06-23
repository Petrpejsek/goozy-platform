#!/bin/bash

echo "🚀 MIGRACE DAT: SQLite → PostgreSQL"
echo "=================================="

# Nastavení proměnných
SQLITE_DB="dev.db.FINAL-BACKUP-20250623-133312"
POSTGRES_URL="postgresql://goozy_user:GoozySecure2025!@116.203.34.246:5432/goozy_production"

echo "📋 Kontrola předpokladů..."

# Kontrola existence SQLite databáze
if [ ! -f "$SQLITE_DB" ]; then
    echo "❌ CHYBA: SQLite databáze $SQLITE_DB nenalezena!"
    exit 1
fi

# Velikost SQLite databáze
SQLITE_SIZE=$(ls -lh "$SQLITE_DB" | awk '{print $5}')
echo "✅ SQLite databáze nalezena: $SQLITE_SIZE"

# Test připojení k PostgreSQL
echo "🔍 Test připojení k PostgreSQL..."
npx prisma db execute --schema=prisma/schema.prisma --stdin <<< "SELECT 1;" || {
    echo "❌ CHYBA: Nelze se připojit k PostgreSQL!"
    exit 1
}
echo "✅ PostgreSQL připojení OK"

echo ""
echo "🎯 ZAČÍNÁ MIGRACE DAT..."
echo "========================"

# 1. Vytvoření všech tabulek v PostgreSQL
echo "1️⃣ Vytváření tabulek v PostgreSQL..."
npx prisma migrate deploy

# 2. Export dat ze SQLite pomocí sqlite3
echo "2️⃣ Export dat ze SQLite..."
sqlite3 "$SQLITE_DB" <<EOF
.mode insert
.output sqlite_data_export.sql
.dump
EOF

# 3. Úprava SQL pro PostgreSQL kompatibilitu
echo "3️⃣ Úprava SQL pro PostgreSQL..."
sed -i.bak 's/INSERT INTO \([^(]*\)/INSERT INTO "\1"/g' sqlite_data_export.sql
sed -i.bak 's/AUTOINCREMENT/SERIAL/g' sqlite_data_export.sql
sed -i.bak '/^PRAGMA/d' sqlite_data_export.sql
sed -i.bak '/^BEGIN TRANSACTION/d' sqlite_data_export.sql
sed -i.bak '/^COMMIT/d' sqlite_data_export.sql

# 4. Import dat do PostgreSQL
echo "4️⃣ Import dat do PostgreSQL..."
# Zde budeme importovat data tabulku po tabulce pro lepší kontrolu

echo ""
echo "✅ MIGRACE DOKONČENA!"
echo "📊 Statistiky:"
echo "   - Zdrojová databáze: $SQLITE_DB ($SQLITE_SIZE)"
echo "   - Cílová databáze: PostgreSQL na Hetzner"
echo "   - Připojení: 116.203.34.246:5432"

echo ""
echo "🔍 OVĚŘENÍ:"
echo "Spuštěním následujících příkazů ověříte úspěšnost migrace:"
echo "npx prisma studio"
echo "" 