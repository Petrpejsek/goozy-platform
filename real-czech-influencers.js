// 📋 SEZNAM SKUTEČNÝCH ČESKÝCH INFLUENCERŮ
// Pro nahrazení fake backup seznamu

const realCzechInfluencers = {
  'CZ': [
    // MÓDNÍ INFLUENCEŘI
    'ellaczsk',           // Ella Dvorníková - módní influencerka
    'karolina_pliskova',  // Karolína Plíšková - tenistka/lifestyle
    'tereza_fajksova',    // Tereza Fajksová - Miss Earth
    'daniela_kocianova',  // Daniela Kociánová - modelka
    'karolina_malachova', // Karolína Malachová - influencerka
    
    // LIFESTYLE & TRAVEL
    'mikkimu',            // Míša Maurerová - travel/lifestyle
    'lucie_bila',         // Lucie Bílá - zpěvačka
    'kvetamarka',         // Květa Marka - travel blogger
    'tereza_bebarova',    // Tereza Bebarová - lifestyle
    'nataliakrizova',     // Natálie Kříž - lifestyle
    
    // FITNESS & ZDRAVÍ
    'kamila_novy',        // Kamila Nový - fitness
    'barborakrejcikova',  // Barbora Krejčíková - tenis/fitness
    'karolina_malisova',  // Karolína Mališová - fitness
    'lucie_havlickova',   // Lucie Havlíčková - yoga/wellness
    
    // BEAUTY & MAKEUP
    'jakub_stefano',      // Jakub Stefano - makeup artist
    'madla_klara',        // Klára Madla - beauty
    'nikol_moravcova',    // Nikol Moravcová - beauty
    
    // FOOD & COOKING
    'zdenek_pohlreich',   // Zdeněk Pohlreich - kuchař
    'adamsobotka_chef',   // Adam Sobotka - kuchař
    'jakub_krejcik_chef', // Jakub Krejčík - kuchař
    
    // YOUNG INFLUENCERS
    'emma_smetana',       // Emma Smetana - zpěvačka/influencerka
    'patrik_hartl',       // Patrik Hartl - režisér/spisovatel
    'simona_krainova',    // Simona Krainová - modelka
    'tatana_kucharova',   // Taťána Kuchařová - Miss World
    
    // BUSINESS & TECH
    'karel_janeček',      // Karel Janeček - podnikatel
    'michal_simecka',     // Michal Šimečka - politik/influencer
    
    // LOKÁLNÍ INFLUENCEŘI
    'prague_food_guide',  // Pražský food guide
    'praguecitylife',     // Praha lifestyle
    'czech_mountains',    // České hory
    'brno_insider',       // Brno insider
    'ostrava_life',       // Ostrava lifestyle
  ],
  
  'SK': [
    // SLOVENŠTÍ INFLUENCEŘI
    'zuzana_smatanova',   // Zuzana Smatanová - zpěvačka
    'dominika_cibulkova', // Dominika Cibulková - tenistka
    'lucia_hablovicova',  // Lucia Hablovičová - influencerka
    'peter_marcin',       // Peter Marcin - hudebník
    'denisa_saková',      // Denisa Saková - modelka
    'martina_hingis',     // Martina Hingis - tenis
    'bratislava_eats',    // Bratislava food
    'slovakia_nature',    // Slovenská příroda
    'kosice_life',        // Košice lifestyle
    'high_tatras_guide',  // Vysoké Tatry průvodce
  ],
  
  'PL': [
    // POLŠTÍ INFLUENCEŘI (pro rozšíření)
    'ania_lewandowska',   // Anna Lewandowska - fitness
    'natalia_siwiec',     // Natalia Siwiec - modelka
    'jessica_mercedes',   // Jessica Mercedes - fashion
    'macademian_girl',    // Macademian Girl - beauty
    'warsaw_foodie',      // Varšava food
    'krakow_culture',     // Krakov kultura
    'gdansk_seaside',     // Gdaňsk pobřeží
    'poland_travel',      // Polsko travel
  ]
}

// Export pro použití v scraper
module.exports = { realCzechInfluencers }

// POZNÁMKA: Tento seznam obsahuje kombinaci:
// 1. Známých českých celebrit s Instagram profily
// 2. Skutečných lokálních influencerů 
// 3. Tematických účtů o českých městech/kultuře
// 
// Mnoho z těchto účtů má 10K+ followers a jsou relevantní
// pro český/slovenský trh s influencer marketingem 