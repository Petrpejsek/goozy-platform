// 🚀 MASIVNÍ TEST PRO TISÍCE ČESKÝCH INFLUENCERŮ
// Spusť: cd goozy-platform && node ../massive-test.js

const { InstagramScraper } = require('./src/lib/scraping/instagram-scraper.js')

async function testMassiveDiscovery() {
  console.log('🚀 Starting MASSIVE Instagram Discovery Test for Czech Influencers...')
  console.log('🎯 Target: 2000+ unique Czech influencer accounts')
  
  const scraper = new InstagramScraper()
  const startTime = Date.now()
  
  try {
    console.log('\n📊 Testing massive discovery system...')
    
    // Test na menším vzorku nejdřív (100 účtů)
    console.log('🧪 Phase 1: Small test (100 accounts)')
    const smallTest = await scraper.advancedRandomDiscovery('CZ', 100)
    console.log(`✅ Small test results: ${smallTest.length} accounts`)
    console.log(`📝 Sample accounts:`, smallTest.slice(0, 10))
    
    if (smallTest.length > 50) {
      console.log('\n🚀 Phase 2: Medium test (500 accounts)')
      const mediumTest = await scraper.advancedRandomDiscovery('CZ', 500)
      console.log(`✅ Medium test results: ${mediumTest.length} accounts`)
      
      if (mediumTest.length > 200) {
        console.log('\n🔥 Phase 3: MASSIVE test (2000 accounts)')
        const massiveTest = await scraper.advancedRandomDiscovery('CZ', 2000)
        console.log(`🎉 MASSIVE test results: ${massiveTest.length} accounts`)
        
        // Analýza výsledků
        console.log('\n📊 ANALYSIS:')
        console.log(`- Total discovered: ${massiveTest.length}`)
        console.log(`- Success rate: ${Math.round((massiveTest.length / 2000) * 100)}%`)
        console.log(`- Unique accounts: ${new Set(massiveTest).size}`)
        console.log(`- Duplicates: ${massiveTest.length - new Set(massiveTest).size}`)
        
        // Sample výsledků
        console.log('\n🎯 Sample discovered accounts:')
        massiveTest.slice(0, 20).forEach((account, i) => {
          console.log(`${i + 1}. @${account}`)
        })
        
        // Uložit do souboru pro další analýzu
        const fs = require('fs')
        const resultData = {
          timestamp: new Date().toISOString(),
          country: 'CZ',
          targetCount: 2000,
          discoveredCount: massiveTest.length,
          successRate: Math.round((massiveTest.length / 2000) * 100),
          accounts: massiveTest,
          executionTime: Date.now() - startTime
        }
        
        fs.writeFileSync('massive-discovery-results.json', JSON.stringify(resultData, null, 2))
        console.log('\n💾 Results saved to massive-discovery-results.json')
      }
    }
    
    const totalTime = Math.round((Date.now() - startTime) / 1000)
    console.log(`\n⏱️  Total execution time: ${totalTime} seconds`)
    console.log('🎉 Massive discovery test completed!')
    
  } catch (error) {
    console.error('❌ Massive test failed:', error)
  } finally {
    await scraper.close()
  }
}

// DALŠÍ TESTY
async function testSpecificHashtags() {
  console.log('\n🏷️ Testing specific hashtag deep mining...')
  
  const scraper = new InstagramScraper()
  
  try {
    // Test deep hashtag scraping
    const hashtags = ['prague', 'czechgirl', 'czechfashion', 'praguelife']
    
    for (const hashtag of hashtags) {
      console.log(`\n🔍 Deep mining #${hashtag}...`)
      const results = await scraper.deepHashtagScraping(hashtag, 200)
      console.log(`✅ #${hashtag}: found ${results.length} accounts`)
      console.log(`📝 Sample:`, results.slice(0, 5))
    }
    
  } catch (error) {
    console.error('❌ Hashtag test failed:', error)
  } finally {
    await scraper.close()
  }
}

async function testChainDiscovery() {
  console.log('\n🔗 Testing chain discovery...')
  
  const scraper = new InstagramScraper()
  
  try {
    // Test na známém českém influencerovi
    const seedAccount = 'ellaczsk' // Známá česká influencerka
    
    console.log(`🔗 Chain discovery from @${seedAccount}...`)
    const results = await scraper.chainDiscovery(seedAccount, 2, 100)
    console.log(`✅ Chain discovery: found ${results.length} accounts`)
    console.log(`📝 Sample followers network:`, results.slice(0, 10))
    
  } catch (error) {
    console.error('❌ Chain discovery test failed:', error)
  } finally {
    await scraper.close()
  }
}

// SPUŠTĚNÍ TESTŮ
async function runAllTests() {
  console.log('🚀 STARTING COMPREHENSIVE MASSIVE DISCOVERY TESTS\n')
  
  // 1. Hlavní masivní test
  await testMassiveDiscovery()
  
  // 2. Pokud máme čas, spusť další testy
  console.log('\n🔬 Running additional specialized tests...')
  await testSpecificHashtags()
  await testChainDiscovery()
  
  console.log('\n🏁 ALL TESTS COMPLETED!')
  console.log('📊 Check massive-discovery-results.json for detailed results')
}

// Spustit testy
runAllTests().then(() => {
  console.log('✅ Test suite finished')
  process.exit(0)
}).catch(error => {
  console.error('💥 Test suite crashed:', error)
  process.exit(1)
}) 