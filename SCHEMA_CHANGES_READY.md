# Rychlý reference - Změny v schema.prisma

## Současný stav
✅ **Schema.prisma je už upraveno** - obsahuje všechny potřebné změny  
❌ **Migrace NENÍ spuštěna** - databáze zůstává nedotčená  
📋 **Připraveno k implementaci** po domluvě s kolegou

## Přesné změny v kódu

### V modelu Influencer (řádky ~45-50)
```prisma
// === NOVÁ POLE PRO TŘÍVRSTEVNOU ARCHITEKTURU ===
// Tracking původu influencera
originType        String?                // "manual", "prospect", "application" - odkud pochází
originProspectId  String?                // ID z InfluencerProspect pokud povýšen
originApplicationId String?              // ID z InfluencerApplication pokud registrován

// Workflow status
onboardingStatus  String                 @default("pending") // pending, in_progress, completed
verificationStatus String               @default("unverified") // unverified, pending, verified
```

### V modelu InfluencerDatabase (řádky ~440-445)
```prisma
// === NOVÁ POLE PRO PROPOJENÍ VRSTEV ===
// Tracking procesu povýšení na vyšší vrstvy
promotionStatus   String  @default("none") // none, prospect_created, influencer_created
promotedToProspectIds String? // JSON array IDs prospects vytvořených z tohoto profilu
promotedToInfluencerId String? // ID influencera pokud byl povýšen
```

### V modelu InfluencerProspect (řádky ~570-580)
```prisma
// === NOVÁ POLE PRO PROPOJENÍ VRSTEV ===
// Odkaz na původní database záznam (pokud pochází z vrstvy 1)
originDatabaseId String?    // ID z InfluencerDatabase

// Tracking povýšení na influencera
promotionStatus String      @default("none") // none, promoted, converted_to_influencer
promotedToInfluencerId String? // ID influencera pokud byl povýšen
promotedAt      DateTime?   // kdy byl povýšen
```

## Implementace po domluvě s kolegou

1. **Backup databáze**: `cp prisma/dev.db prisma/dev.db.backup`
2. **Spustit migraci**: `npx prisma migrate dev --name add_tier_connection_fields`
3. **Regenerovat client**: `npx prisma generate`
4. **Restart serveru**: `npm run dev`

## Bezpečnostní ujištění
- ✅ Žádná existující data nebudou ztracena
- ✅ Všechny změny jsou pouze aditivní
- ✅ Migrace je reverzibilní
- ✅ Žádné konflikty s existujícími funkcemi

---
**Status**: 🟡 Připraveno - čeká na merge s kolegou 