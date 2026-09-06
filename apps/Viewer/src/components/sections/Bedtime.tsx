export default function Bedtime() {
  return (
    <section className="min-h-[270px] rounded-[25px] bg-gradient-to-r from-[#4a238e] to-[#7650d5] text-white flex items-center relative overflow-hidden mb-[62px]">
      <span className="absolute top-[25px] left-[44%] text-[75px] text-[#ffe88b] z-0">☾</span>
      <div className="text-[115px] ml-[12%] filter drop-shadow-[0_8px_8px_#1d0a4a66]">🧒 🐶</div>
      <div className="ml-auto mr-[11%] relative z-10">
        <p className="text-[#8e68d7] font-extrabold text-[12px] uppercase tracking-[1.5px] mb-4">A gentle goodnight</p>
        <h2 className="text-[36px] font-black m-[8px_0]">Bedtime Stories</h2>
        <p className="text-[#eee6ff] leading-relaxed">Calm, positive and magical stories<br/>for a happy sleep.</p>
        <button className="button-light inline-flex items-center justify-center rounded-full px-7 py-3.5 text-base font-black transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_16px_#4323a329]">▶ &nbsp; Watch Now</button>
      </div>
    </section>
  );
}
