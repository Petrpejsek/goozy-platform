import Image from "next/image";
import Link from "next/link";
import MultiStepInfluencerForm from "@/components/MultiStepInfluencerForm";
import BrandForm from "@/components/BrandForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-black">GOOZY</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-600 hover:text-black">
              Produkty
            </Link>
            <Link href="#pro-influencery" className="text-gray-600 hover:text-black">
              Pro influencery
            </Link>
            <Link href="#pro-znacky" className="text-gray-600 hover:text-black">
              Pro značky
            </Link>
            <Link href="/influencer/login" className="text-gray-600 hover:text-black">
              Influencer login
            </Link>
            <Link href="/admin" className="text-gray-600 hover:text-black">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero sekce */}
      <section className="px-6 py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
            Monetizuj svůj<br />
            <span className="text-gray-600">fashion obsah</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Připoj se k platformě, kde influenceři vydělávají na prodeji oblečení 
            svým sledujícím s exkluzivními slevami a provizemi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#formular-influencer"
              className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Začít vydělávat
            </Link>
            <Link
              href="#formular-znacka"
              className="border border-black text-black px-8 py-4 rounded-lg hover:bg-black hover:text-white transition-colors font-medium"
            >
              Jsem značka
            </Link>
          </div>
        </div>
      </section>

      {/* Pro influencery sekce */}
      <section id="pro-influencery" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">
              Pro influencery
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Vytvoř si svou osobní stránku s produkty a začni vydělávat na každém prodeji
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">👤</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Osobní stránka</h3>
              <p className="text-gray-600">
                Vlastní URL s tvým profilem a vybranými produkty pro tvé sledující
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Provize z prodejů</h3>
              <p className="text-gray-600">
                Získej provizi z každého prodeje pomocí tvého osobního kupónu
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Statistiky</h3>
              <p className="text-gray-600">
                Sleduj své výnosy, počty prodejů a využití kupónů v reálném čase
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulář pro influencery */}
      <section id="formular-influencer" className="px-6 py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">
              Připoj se k nám
            </h2>
            <p className="text-gray-600">
              Vyplň formulář a my se ti ozveme s dalšími informacemi
            </p>
          </div>
          
          <MultiStepInfluencerForm />
        </div>
      </section>

      {/* Pro značky sekce */}
      <section id="pro-znacky" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">
              Pro značky
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Rozšiř svůj dosah prostřednictvím autentických influencerů
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">
                Proč spolupracovat s Goozy?
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  <span>Ověření influenceři s kvalitní komunitou</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  <span>Automatická integrace s vaším skladem</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  <span>Detailní analytika a reporting</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  <span>Řízení expedice a vratek</span>
                </li>
              </ul>
            </div>
            
            <div id="formular-znacka" className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Chci spolupracovat</h3>
              <BrandForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">
            © 2024 Goozy. Všechna práva vyhrazena.
          </p>
        </div>
      </footer>
    </div>
  );
}
