export default function Bedtime() {
  return (
    <section className="relative mb-[62px] overflow-hidden rounded-[25px]">
      <img src="/assets/bedtime-component.webp" alt="A child and dog sleeping during bedtime stories" className="block h-auto w-full" />
      <button className="absolute left-[58%] top-[66%] inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 px-4 py-2 text-[10px] font-black text-[#39208b] shadow-[0_6px_14px_#4323a329] backdrop-blur-sm transition-all hover:-translate-y-[calc(50%+2px)] hover:bg-white/90 hover:shadow-[0_8px_16px_#4323a329] sm:px-6 sm:py-3 sm:text-sm md:px-7 md:py-3.5 md:text-base">▶&nbsp; Watch Now</button>
    </section>
  );
}
