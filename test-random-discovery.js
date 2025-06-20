// 🚀 TESTOVACÍ SCRIPT PRO POKROČILÉ HLEDÁNÍ INFLUENCERŮ
// Spusť: node test-random-discovery.js

const { InstagramScraper } = require('./src/lib/scraping/instagram-scraper.js')

async function testRandomDiscovery() {
  console.log('🚀 Starting Instagram Random Discovery Test...')
  
  const scraper = new InstagramScraper()
  
  try {
    // Test 1: Základní hashtag search
    console.log('\n1️⃣ Testing hashtag search...')
    const hashtagResults = await scraper.searchHashtag('prague', 5)
    console.log(`✅ Hashtag results:`, hashtagResults)
    
    // Test 2: Advanced random discovery
    console.log('\n2️⃣ Testing advanced random discovery...')
    const advancedResults = await scraper.advancedRandomDiscovery('CZ', 10)
    console.log(`✅ Advanced discovery results:`, advancedResults)
    
    // Test 3: Explore page scraping
    console.log('\n3️⃣ Testing explore page scraping...')
    const exploreResults = await scraper.scrapeExplorePage(5)
    console.log(`✅ Explore results:`, exploreResults)
    
    // Test 4: Followers scraping (použij známého influencera)
    if (advancedResults.length > 0) {
      console.log('\n4️⃣ Testing followers scraping...')
      const firstUser = advancedResults[0]
      const followersResults = await scraper.scrapeFollowers(firstUser, 5)
      console.log(`✅ Followers of @${firstUser}:`, followersResults)
    }
    
    console.log('\n🎉 All tests completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await scraper.close()
  }
}

// Spustit test
testRandomDiscovery().then(() => {
  console.log('🏁 Test finished')
  process.exit(0)
}).catch(error => {
  console.error('💥 Test crashed:', error)
  process.exit(1)
}) 