// @ts-ignore
import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';

// --- 1) otevřeme SQLite read-only ---
const sqlite = new Database('prisma/dev.db', { readonly: true });

// --- 2) připojíme se na PostgreSQL přes Prisma ---
const prisma = new PrismaClient();

// Přehled tabulek = co chceme přenášet (přidejte / ubírejte podle potřeby)
const tables = [
  {
    sqliteName: 'influencerDatabase',     // název tabulky v SQLite
    prismaName: 'influencerDatabase',      // název modelu v Prisma
    cols: [
      'id','name','username','email','bio','avatar','country','location',
      'instagramUsername','instagramUrl','instagramData',
      'tiktokUsername','tiktokUrl','tiktokData',
      'youtubeChannel','youtubeUrl','youtubeData',
      'totalFollowers','engagementRate','avgLikes','avgComments',
      'sourceHashtags','sourceCountry','foundBy','isValidated',
      'hasEmail','isActive','lastScrapedAt','notes',
      'promotionStatus','promotedToProspectIds','promotedToInfluencerId',
      'createdAt','updatedAt'
    ]
  },

  /* Příklad, kdybyste chtěli přenést i tabulku suppliers
  {
    sqliteName: 'suppliers',
    prismaName: 'supplier',
    cols: ['id','brandId','name','email','phone','website','description',
           'isActive','createdAt','updatedAt']
  }
  */
];

async function migrate() {
  for (const t of tables) {
    const rows = sqlite.prepare(
      `SELECT ${t.cols.join(', ')} FROM ${t.sqliteName}`
    ).all();

    console.log(`▶️ ${t.sqliteName}: našel jsem ${rows.length} řádků`);

    // @ts-ignore – dynamický přístup k modelu
    const model = prisma[t.prismaName];

    for (const row of rows) {
      // Převeď SQLite hodnoty na PostgreSQL formát
      const convertedRow = { ...row };
      
      // Boolean hodnoty (0/1) → (false/true)
      if (convertedRow.isValidated !== undefined) convertedRow.isValidated = Boolean(convertedRow.isValidated);
      if (convertedRow.hasEmail !== undefined) convertedRow.hasEmail = Boolean(convertedRow.hasEmail);
      if (convertedRow.isActive !== undefined) convertedRow.isActive = Boolean(convertedRow.isActive);
      
      // Datum hodnoty (timestamp) → Date objekt
      if (convertedRow.lastScrapedAt !== undefined && convertedRow.lastScrapedAt !== null) {
        convertedRow.lastScrapedAt = new Date(convertedRow.lastScrapedAt);
      }
      if (convertedRow.createdAt !== undefined && convertedRow.createdAt !== null) {
        convertedRow.createdAt = new Date(convertedRow.createdAt);
      }
      if (convertedRow.updatedAt !== undefined && convertedRow.updatedAt !== null) {
        convertedRow.updatedAt = new Date(convertedRow.updatedAt);
      }

      await model.upsert({
        where: { id: convertedRow.id },
        update: {},
        create: convertedRow,
      });
    }
    console.log(`✅ ${t.sqliteName}: zapsáno ${rows.length} řádků`);
  }
}

migrate()
  .then(() => console.log('🎉 Migrace hotová – všechno v PostgreSQL!'))
  .catch((e) => console.error('❌ Chyba migrace:', e))
  .finally(async () => {
    await prisma.$disconnect();
    sqlite.close();
  }); 