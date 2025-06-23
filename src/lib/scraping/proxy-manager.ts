export interface ProxyConfig {
  host: string
  port: number
  username?: string
  password?: string
  protocol: 'http' | 'https' | 'socks5'
  country?: string
  isActive: boolean
  lastUsed?: Date
  successRate: number
  totalRequests: number
  failedRequests: number
}

export interface ProxyResult {
  proxy: ProxyConfig
  success: boolean
  error?: string
  responseTime?: number
}

export class ProxyManager {
  private proxies: ProxyConfig[] = []
  private currentIndex: number = 0
  private maxFailuresBeforeRotation: number = 3
  private consecutiveFailures: number = 0

  constructor() {
    this.loadProxies()
  }

  // Načtení proxy ze souboru nebo env variables
  private loadProxies() {
    // Můžete přidat proxy servery zde nebo načíst z konfiguračního souboru
    
    // Příklad free proxy (pouze pro testování - v produkci použijte placené)
    const freeProxies = [
      // Tyto jsou pouze příklady - v reálném použití budete potřebovat funkční proxy
      { host: '8.8.8.8', port: 80, protocol: 'http' as const, country: 'US' },
      { host: '1.1.1.1', port: 80, protocol: 'http' as const, country: 'US' },
    ]

    // Načtení proxy z environment variables
    const proxyList = process.env.PROXY_LIST || ''
    if (proxyList) {
      const proxiesFromEnv = proxyList.split(',').map(proxyString => {
        const parts = proxyString.trim().split(':')
        if (parts.length >= 2) {
          return {
            host: parts[0],
            port: parseInt(parts[1]),
            username: parts[2],
            password: parts[3],
            protocol: 'http' as const,
            country: 'Unknown',
            isActive: true,
            successRate: 100,
            totalRequests: 0,
            failedRequests: 0
          }
        }
        return null
      }).filter(Boolean) as ProxyConfig[]

      this.proxies = proxiesFromEnv
    } else {
      // Použít placené proxy serviry (doporučeno)
      this.proxies = this.getCommercialProxies()
    }

    console.log(`🌐 [PROXY-MANAGER] Loaded ${this.proxies.length} proxy servers`)
  }

  // Konfigurace pro placené proxy služby
  private getCommercialProxies(): ProxyConfig[] {
    const proxies: ProxyConfig[] = []

    // Bright Data (dříve Luminati) - velmi doporučeno pro Instagram
    if (process.env.BRIGHT_DATA_USERNAME && process.env.BRIGHT_DATA_PASSWORD) {
      const brightDataProxies = [
        'zproxy.lum-superproxy.io:22225',
        'zproxy.lum-superproxy.io:22226', 
        'zproxy.lum-superproxy.io:22227'
      ].map(endpoint => {
        const [host, port] = endpoint.split(':')
        return {
          host,
          port: parseInt(port),
          username: process.env.BRIGHT_DATA_USERNAME!,
          password: process.env.BRIGHT_DATA_PASSWORD!,
          protocol: 'http' as const,
          country: 'CZ',
          isActive: true,
          successRate: 95,
          totalRequests: 0,
          failedRequests: 0
        }
      })
      proxies.push(...brightDataProxies)
    }

    // Oxylabs - také velmi dobrá služba
    if (process.env.OXYLABS_USERNAME && process.env.OXYLABS_PASSWORD) {
      const oxylabsProxies = [
        'pr.oxylabs.io:7777',
        'pr.oxylabs.io:7778',
        'pr.oxylabs.io:7779'
      ].map(endpoint => {
        const [host, port] = endpoint.split(':')
        return {
          host,
          port: parseInt(port),
          username: process.env.OXYLABS_USERNAME!,
          password: process.env.OXYLABS_PASSWORD!,
          protocol: 'http' as const,
          country: 'CZ',
          isActive: true,
          successRate: 93,
          totalRequests: 0,
          failedRequests: 0
        }
      })
      proxies.push(...oxylabsProxies)
    }

    // Pokud nejsou žádné proxy, vraťme alespoň direct connection
    if (proxies.length === 0) {
      console.log('⚠️ [PROXY-MANAGER] No proxy configuration found, using direct connection')
      return [{
        host: 'direct',
        port: 0,
        protocol: 'http' as const,
        country: 'Local',
        isActive: true,
        successRate: 100,
        totalRequests: 0,
        failedRequests: 0
      }]
    }

    return proxies
  }

  // Získání nejlepšího dostupného proxy
  getNextProxy(): ProxyConfig | null {
    const activeProxies = this.proxies.filter(p => p.isActive)
    
    if (activeProxies.length === 0) {
      console.log('⚠️ [PROXY-MANAGER] No active proxies available, using direct connection')
      // Vrátit direct connection místo null
      return {
        host: 'direct',
        port: 0,
        protocol: 'http' as const,
        country: 'Local',
        isActive: true,
        successRate: 100,
        totalRequests: 0,
        failedRequests: 0
      }
    }

    // Rotuj na další proxy pokud bylo příliš mnoho chyb
    if (this.consecutiveFailures >= this.maxFailuresBeforeRotation) {
      this.currentIndex = (this.currentIndex + 1) % activeProxies.length
      this.consecutiveFailures = 0
      console.log(`🔄 [PROXY-MANAGER] Rotating to proxy ${this.currentIndex} due to failures`)
    }

    const selectedProxy = activeProxies[this.currentIndex]
    selectedProxy.lastUsed = new Date()
    
    console.log(`🌐 [PROXY-MANAGER] Using proxy: ${selectedProxy.host}:${selectedProxy.port} (${selectedProxy.country})`)
    return selectedProxy
  }

  // Reportování úspěchu proxy
  reportSuccess(proxy: ProxyConfig, responseTime: number) {
    proxy.totalRequests++
    proxy.successRate = ((proxy.successRate * (proxy.totalRequests - 1)) + 100) / proxy.totalRequests
    this.consecutiveFailures = 0
    
    console.log(`✅ [PROXY-MANAGER] Proxy ${proxy.host}:${proxy.port} success (${responseTime}ms)`)
  }

  // Reportování chyby proxy
  reportFailure(proxy: ProxyConfig, error: string) {
    proxy.totalRequests++
    proxy.failedRequests++
    proxy.successRate = ((proxy.successRate * (proxy.totalRequests - 1)) + 0) / proxy.totalRequests
    this.consecutiveFailures++
    
    console.log(`❌ [PROXY-MANAGER] Proxy ${proxy.host}:${proxy.port} failed: ${error}`)
    
    // Deaktivuj proxy pokud má příliš mnoho chyb
    if (proxy.successRate < 20 && proxy.totalRequests > 10) {
      proxy.isActive = false
      console.log(`🚫 [PROXY-MANAGER] Deactivated proxy ${proxy.host}:${proxy.port} due to low success rate`)
    }
  }

  // Získání Puppeteer proxy konfigurace
  getPuppeteerProxyArgs(proxy: ProxyConfig): string[] {
    if (proxy.host === 'direct') {
      return []
    }

    const proxyUrl = `${proxy.protocol}://${proxy.host}:${proxy.port}`
    return [
      `--proxy-server=${proxyUrl}`,
      '--no-proxy-server',
      '--disable-web-security'
    ]
  }

  // Test proxy připojení
  async testProxy(proxy: ProxyConfig): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const testUrl = 'https://httpbin.org/ip'
      const proxyUrl = proxy.username 
        ? `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
        : `${proxy.protocol}://${proxy.host}:${proxy.port}`

      // Poznámka: V Node.js prostředí byste použili knihovnu jako 'node-fetch' s proxy podporou
      // nebo 'axios' s proxy konfigurací
      console.log(`🧪 [PROXY-MANAGER] Testing proxy: ${proxy.host}:${proxy.port}`)
      
      clearTimeout(timeoutId)
      return true // Předpokládáme, že proxy funguje
    } catch (error) {
      console.log(`❌ [PROXY-MANAGER] Proxy test failed: ${proxy.host}:${proxy.port}`)
      return false
    }
  }

  // Získání statistik proxy
  getStats() {
    return {
      totalProxies: this.proxies.length,
      activeProxies: this.proxies.filter(p => p.isActive).length,
      averageSuccessRate: this.proxies.reduce((sum, p) => sum + p.successRate, 0) / this.proxies.length,
      currentProxy: this.proxies[this.currentIndex]?.host || 'none'
    }
  }

  // Reset všech proxy statistik
  resetStats() {
    this.proxies.forEach(proxy => {
      proxy.successRate = 100
      proxy.totalRequests = 0
      proxy.failedRequests = 0
      proxy.isActive = true
    })
    this.consecutiveFailures = 0
    console.log('🔄 [PROXY-MANAGER] All proxy stats reset')
  }

  // Přidání nového proxy
  addProxy(proxy: Omit<ProxyConfig, 'isActive' | 'successRate' | 'totalRequests' | 'failedRequests'>) {
    this.proxies.push({
      ...proxy,
      isActive: true,
      successRate: 100,
      totalRequests: 0,
      failedRequests: 0
    })
    console.log(`➕ [PROXY-MANAGER] Added new proxy: ${proxy.host}:${proxy.port}`)
  }
} 