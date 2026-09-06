import Logo from "./Logo";
export default function Footer() {
  return (
    <footer className="bg-[#f0f3ff] px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-8">
        <div>
          <Logo />
          <p className="mt-2 text-[13px] text-[#746d8b]">Play. Learn. Grow. Together!</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6" aria-label="Footer navigation">
          {["About", "Privacy", "Parents", "Help"].map((label) => (
            <button key={label} className="bg-none text-[13px] text-[#524b69] font-inherit">{label}</button>
          ))}
        </nav>
        <div className="flex justify-center gap-3 md:justify-end">
          {[['▶', 'bg-[#e62117]', 'https://www.youtube.com/channel/UCCfJteGKIRMpGYlIV2yftqQ'], ['◎', 'bg-[#e44073]', undefined], ['f', 'bg-[#1877f2]', undefined]].map(([symbol, color, href]) => (
            href ? <a key={symbol} href={href} target="_blank" rel="noreferrer" aria-label="PabloMiniTV on YouTube" className={`grid h-8 w-8 place-items-center rounded-full ${color} text-sm font-black text-white transition-transform hover:scale-110`}><span aria-hidden="true">{symbol}</span></a> : <span key={symbol} className={`grid h-8 w-8 place-items-center rounded-full ${color} text-sm font-black text-white`} aria-hidden="true">{symbol}</span>
          ))}
        </div>
        <small className="text-center text-[11px] text-[#8d879c] md:col-[2/4] md:text-right">© 2026 PabloMiniTV. All rights reserved.</small>
      </div>
    </footer>
  );
}
