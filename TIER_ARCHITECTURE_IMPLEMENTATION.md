# Třívrstevná architektura influencerů - Připravené změny

## Přehled architektury

**Vrstva 1: Základní scraping (Google Search)**
- Model: `InfluencerDatabase`
- Účel: Základní profily získané z hashtag vyhledávání
- Status: ✅ Už implementováno

**Vrstva 2: Obohacené profily (Instagram Scraping)**
- Model: `InfluencerProspect`
- Účel: Profily s detailními statistikami a engagement daty
- Status: ✅ Už implementováno

**Vrstva 3: Aktivní influenceři (Registrovaní)**
- Model: `Influencer`
- Účel: Plnohodnotní influenceři pro spolupráci
- Status: 🔄 Rozšířeno o propojovací pole

## Připravené změny v schema.prisma

### 1. Model Influencer
**Přidaná pole:**
```prisma
// Tracking původu influencera
originType        String?                // "manual", "prospect", "application"
originProspectId  String?                // ID z InfluencerProspect pokud povýšen
originApplicationId String?              // ID z InfluencerApplication pokud registrován

// Workflow status
onboardingStatus  String  @default("pending") // pending, in_progress, completed
verificationStatus String @default("unverified") // unverified, pending, verified
```

### 2. Model InfluencerDatabase
**Přidaná pole:**
```prisma
// Tracking procesu povýšení na vyšší vrstvy
promotionStatus   String  @default("none") // none, prospect_created, influencer_created
promotedToProspectIds String? // JSON array IDs prospects vytvořených z tohoto profilu
promotedToInfluencerId String? // ID influencera pokud byl povýšen
```

### 3. Model InfluencerProspect
**Přidaná pole:**
```prisma
// Odkaz na původní database záznam
originDatabaseId String?    // ID z InfluencerDatabase

// Tracking povýšení na influencera
promotionStatus String      @default("none") // none, promoted, converted_to_influencer
promotedToInfluencerId String? // ID influencera pokud byl povýšen
promotedAt      DateTime?   // kdy byl povýšen
```

## Implementační kroky

### Krok 1: Backup databáze
```bash
# Před implementací vytvořit backup
cp goozy-platform/prisma/dev.db goozy-platform/prisma/dev.db.backup
```

### Krok 2: Spustit migraci
```bash
cd goozy-platform
npx prisma migrate dev --name add_tier_connection_fields
```

### Krok 3: Regenerovat Prisma client
```bash
npx prisma generate
```

### Krok 4: Restartovat development server
```bash
npm run dev
```

## Workflow procesy k implementaci

### 1. Povýšení Database → Prospect
```typescript
// Když admin schválí profil z InfluencerDatabase
await prisma.influencerDatabase.update({
  where: { id: databaseId },
  data: {
    promotionStatus: "prospect_created",
    promotedToProspectIds: JSON.stringify([newProspectId])
  }
});

await prisma.influencerProspect.create({
  data: {
    ...prospectData,
    originDatabaseId: databaseId,
    promotionStatus: "none"
  }
});
```

### 2. Povýšení Prospect → Influencer
```typescript
// Když admin schválí prospect jako influencera
await prisma.influencer.create({
  data: {
    ...influencerData,
    originType: "prospect",
    originProspectId: prospectId,
    onboardingStatus: "pending",
    verificationStatus: "unverified"
  }
});

await prisma.influencerProspect.update({
  where: { id: prospectId },
  data: {
    promotionStatus: "converted_to_influencer",
    promotedToInfluencerId: newInfluencerId,
    promotedAt: new Date()
  }
});
```

### 3. Registrace Application → Influencer
```typescript
// Když se influencer registruje sám
await prisma.influencer.create({
  data: {
    ...influencerData,
    originType: "application",
    originApplicationId: applicationId,
    onboardingStatus: "pending",
    verificationStatus: "unverified"
  }
});
```

## Výhody této architektury

1. **Čistá separace** - každá vrstva má svou tabulku
2. **Trackování původu** - víme odkud každý influencer pochází
3. **Bezpečnost** - žádné existující data nejsou narušena
4. **Flexibilita** - můžeme snadno přidávat nové funkce
5. **Auditovatelnost** - kompletní historie povýšení

## Bezpečnostní opatření

- ✅ Všechna nová pole jsou volitelná (`String?`)
- ✅ Všechna pole mají výchozí hodnoty
- ✅ Žádné existující relace nejsou změněny
- ✅ Žádná existující data nejsou ztracena
- ✅ Migrace je reverzibilní

## Status
📋 **Připraveno k implementaci** - čeká na koordinaci s kolegou

---
**Datum přípravy:** 22.12.2024  
**Připravil:** Claude (AI asistent)  
**Kontakt pro dotazy:** Po domluvě s kolegou pokračovat v implementaci 