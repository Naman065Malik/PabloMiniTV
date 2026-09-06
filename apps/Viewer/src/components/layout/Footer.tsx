import Logo from "./Logo";
export default function Footer() {
  return (
    <footer className="bg-[#f0f3ff] py-[38px]">
      <div className="w-[min(1160px,calc(100%-48px))] mx-auto grid grid-cols-[1fr_1fr_auto] items-center gap-7">
        <div>
          <Logo />
          <p className="text-[#746d8b] text-[13px] mt-1">Play. Learn. Grow. Together!</p>
        </div>
        <div className="flex gap-[22px]">
          {["About","Privacy","Parents","Help"].map((b) => (
            <button key={b} className="bg-none text-[#524b69] text-[13px] font-inherit">{b}</button>
          ))}
        </div>
        <div className="flex gap-2.5">
          {["▶","◎","f"].map((s) => (
            <span key={s} className="w-8 h-8 grid place-items-center rounded-full bg-white text-[#5935bd] font-black text-sm">{s}</span>
          ))}
        </div>
        <small className="col-[2/4] text-right text-[#8d879c] text-[11px]">© 2026 PabloMiniTV. All rights reserved.</small>
      </div>
    </footer>
  );
}
