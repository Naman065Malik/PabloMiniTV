export default function Hero() {
  return (
    <section className="min-h-[420px] max-h-[440px] rounded-[28px] bg-[#ded3fb] flex items-stretch overflow-hidden relative mt-[14px] mb-[58px]" id="top">
      <div className="w-[45%] p-[58px_16px_50px_56px] relative z-10 flex flex-col justify-center">
        <p className="text-[#8e68d7] font-extrabold text-[12px] uppercase tracking-[1.5px] mb-4">Welcome to a world of wonder ✨</p>
        <h1 className="text-[clamp(46px,5vw,60px)] leading-[1.05] m-0 tracking-[-2px] font-black">
          Small Stories<br /><em className="text-[#ffae12] not-italic">Big Learning!</em>
        </h1>
        <p className="text-[18px] leading-[1.6] max-w-[380px] text-[#5f5877] mb-2.5">Fun, safe and educational videos for curious little minds.</p>
        <button className="button-yellow inline-flex items-center justify-center rounded-full bg-[#ffbf22] px-7 py-3.5 text-base font-black text-[#3a245f] shadow-[0_6px_14px_#d9951238] transition-all hover:-translate-y-0.5 hover:bg-[#ffc83f] hover:shadow-[0_8px_16px_#4323a329]">▶ &nbsp; Start Watching</button>
      </div>
      <div className="w-[55%] relative flex items-end justify-center overflow-hidden z-[1]">
        <img src="/assets/pablo-dog-hero-banner.webp" alt="Pablo and his dog companion in a playful lavender world" className="w-full h-full object-contain object-bottom block" />
      </div>
    </section>
  );
}
