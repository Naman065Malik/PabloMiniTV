import { useState } from "react";

const icon = (name: string) => <span aria-hidden="true">{name}</span>;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-[rgba(251,251,255,0.92)] backdrop-blur-[16px] w-full">
      <div className="h-[68px] w-full max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 xl:px-20 flex items-center gap-6 justify-between">
        <img
          src="/assets/brand-logo.webp"
          alt="Pablo and his dog companion in a playful lavender world"
          className="block w-[175px] h-auto shrink-0"
        />
        <nav aria-label="Main" className="hidden md:flex items-center gap-5 text-sm font-bold text-[#4d27a8]">
          {["Home","Shows","Learn","Bedtime","Parents"].map((item) => (
            <a key={item} href="#" className="hover:text-[#aa3bff] transition-colors">{item}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,1)] flex items-center justify-center text-[18px] shadow-sm"
            aria-label="Open search"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            {icon("⌕")}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.7)] text-sm font-bold hover:bg-[rgba(255,255,255,1)] shadow-sm" aria-label="Open kids profile">
            🧒 <span>Kids</span>⌄
          </button>
          <button
            className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,1)] flex items-center justify-center text-[18px] shadow-sm"
            aria-label="Open menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {icon("☰")}
          </button>
        </div>
      </div>
      {searchOpen && (
        <div className="bg-white/90 backdrop-blur-md border-t border-[#e8e6ff] px-6 py-4 shadow-lg">
          <label htmlFor="site-search" className="block text-sm font-bold text-[#4d27a8] mb-2">What shall we discover?</label>
          <input
            id="site-search"
            placeholder="Search shows and stories"
            autoFocus
            className="w-full max-w-[600px] px-4 py-2 rounded-full border border-[#ddd8ff] bg-[#f9f7ff] focus:outline-none focus:ring-2 focus:ring-[#ffbd25] focus:ring-offset-1 text-sm"
          />
        </div>
      )}
      {menuOpen && (
        <div className="bg-white/95 backdrop-blur-md border-t border-[#e8e6ff] px-6 py-4 shadow-xl flex flex-col gap-2 max-w-[1400px] mx-auto">
          <strong className="text-[#4d27a8] text-sm mb-1">Explore PabloMiniTV</strong>
          {["Home","Shows","Learn","Bedtime Stories","Parents"].map((b) => (
            <button key={b} className="text-left text-[#69627f] font-bold px-3 py-2 rounded-xl hover:bg-[#f2efff] hover:text-[#4d27a8] transition-colors">{b}</button>
          ))}
        </div>
      )}
    </header>
  );
}
