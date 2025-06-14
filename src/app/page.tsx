import Image from "next/image";
import Link from "next/link";
import MultiStepInfluencerForm from "@/components/MultiStepInfluencerForm";
import BrandForm from "@/components/BrandForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 lg:px-8 py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-black tracking-tight">GOOZY</h1>
          </div>
          <nav className="hidden lg:flex items-center space-x-10">
            <Link href="/products" className="text-gray-700 hover:text-black transition-colors text-sm font-medium">
              Produkty
            </Link>
            <Link href="#pro-influencery" className="text-gray-700 hover:text-black transition-colors text-sm font-medium">
              Pro influencery
            </Link>
            <Link href="#pro-znacky" className="text-gray-700 hover:text-black transition-colors text-sm font-medium">
              Pro značky
            </Link>
            <Link href="/influencer/login" className="text-gray-700 hover:text-black transition-colors text-sm font-medium">
              Přihlášení
            </Link>
            <Link href="/admin" className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero sekce */}
      <section className="px-6 lg:px-8 pt-24 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl lg:text-8xl font-bold text-black mb-8 tracking-tight leading-none">
            Your taste, made<br />
            <span className="text-gray-400">effortlessly</span><br />
            <span className="italic font-light">shoppable.</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Připoj se k platformě, kde influenceři vydělávají na prodeji oblečení 
            svým sledujícím s exkluzivními slevami a provizemi.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="#formular-influencer"
              className="bg-black text-white px-10 py-4 rounded-full hover:bg-gray-800 transition-all duration-300 font-medium text-lg hover:scale-105"
            >
              Začít vydělávat
            </Link>
            <Link
              href="#formular-znacka"
              className="text-black px-10 py-4 rounded-full border-2 border-gray-200 hover:border-black transition-all duration-300 font-medium text-lg hover:scale-105"
            >
              Jsem značka
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Trust indicators */}
      <section className="px-6 lg:px-8 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-black mb-2">1000+</div>
              <div className="text-gray-600 font-medium">Aktivních influencerů</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-black mb-2">50+</div>
              <div className="text-gray-600 font-medium">Partnerských značek</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-black mb-2">€2M+</div>
              <div className="text-gray-600 font-medium">Celkový obrat</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-black mb-2">95%</div>
              <div className="text-gray-600 font-medium">Spokojenost</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features pro influencery */}
      <section id="pro-influencery" className="px-6 lg:px-8 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold text-black mb-6 tracking-tight">
              Some of our amazing brand<br />
              <span className="italic font-light text-gray-400">partners</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              Vytvoř si svou osobní stránku s produkty a začni vydělávat na každém prodeji
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="text-center group">
              <div className="w-20 h-20 bg-black rounded-2xl mx-auto mb-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <span className="text-white text-3xl">👤</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Osobní stránka</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Vlastní URL s tvým profilem a vybranými produkty pro tvé sledující
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-black rounded-2xl mx-auto mb-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <span className="text-white text-3xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Provize z prodejů</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Získej provizi z každého prodeje pomocí tvého osobního kupónu
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-black rounded-2xl mx-auto mb-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <span className="text-white text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Statistiky</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Sleduj svoje výnosy, počty prodejů a využití kupónů v reálném čase
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Suite Section */}
      <section className="px-6 lg:px-8 py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl lg:text-6xl font-bold text-black mb-6 tracking-tight">
            A full product suite to monetize<br />
            <span className="italic font-light text-gray-400">wherever you are</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16 font-light leading-relaxed">
            Naše platforma poskytuje všechno, co potřebuješ pro úspěšnou monetizaci tvého obsahu
          </p>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-blue-600 text-2xl">🌐</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Web</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Kompletní webová platforma pro správu produktů a sledování výnosů
              </p>
              <Link href="/products" className="inline-block bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                Explore
              </Link>
            </div>
            
            <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-green-600 text-2xl">📱</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">App</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Mobilní aplikace pro správu obsahu a komunikaci s komunitou
              </p>
              <Link href="#" className="inline-block bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                Explore
              </Link>
            </div>
            
            <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-purple-600 text-2xl">🔗</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Browser Extension</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Rozšíření pro prohlížeč pro snadné sdílení produktů ze sociálních sítí
              </p>
              <Link href="#" className="inline-block bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                Explore
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="px-6 lg:px-8 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-3xl lg:text-4xl font-light text-black mb-8 leading-relaxed italic">
            "Díky Goozy jsem si vytvořila stabilní příjem z mého fashion obsahu. 
            Platforma je intuitivní a podpora skvělá."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="text-left">
              <div className="font-bold text-black">Anna Svobodová</div>
              <div className="text-gray-600">@anna_style, 250K followers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulář pro influencery */}
      <section id="formular-influencer" className="px-6 lg:px-8 py-32 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Join the ultimate platform to monetize<br />
            <span className="italic font-light text-gray-400">your influence</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Připoj se k tisícům influencerů, kteří už vydělávají s Goozy
          </p>
          
          <div className="bg-white p-8 lg:p-12 rounded-3xl">
            <MultiStepInfluencerForm />
          </div>
        </div>
      </section>

      {/* Pro značky sekce */}
      <section id="pro-znacky" className="px-6 lg:px-8 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold text-black mb-8 tracking-tight leading-tight">
                Grow your brand with<br />
                <span className="italic font-light text-gray-400">authentic</span><br />
                partnerships
              </h2>
              <p className="text-xl text-gray-600 mb-12 font-light leading-relaxed">
                Rozšiř svůj dosah prostřednictvím ověřených influencerů s kvalitní komunitou
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Ověření influenceři</h4>
                    <p className="text-gray-600">S kvalitní komunitou a autentickým obsahem</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Automatická integrace</h4>
                    <p className="text-gray-600">Propojení s vaším skladem a systémy</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Detailní analytika</h4>
                    <p className="text-gray-600">Kompletní reporting a sledování výkonu</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 lg:p-12 rounded-3xl">
              <h3 className="text-2xl font-bold mb-6">Začněte spolupracovat</h3>
              <BrandForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-8 py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-black tracking-tight">GOOZY</h2>
            </div>
            <div className="flex flex-wrap gap-8 text-sm">
              <Link href="/products" className="text-gray-600 hover:text-black transition-colors">
                Produkty
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black transition-colors">
                O nás
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black transition-colors">
                Kontakt
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black transition-colors">
                Podmínky
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Goozy. Všechna práva vyhrazena.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
