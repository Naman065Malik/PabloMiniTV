export default function TrustStrip() {
  const items = [
    ["▣","Safe","for Kids","pink"],
    ["◆","Educational","Content","mint"],
    ["♥","No Ads","for Kids","yellow"],
    ["♣","Parent","Approved","lavender"],
  ] as const;
  return (
    <section className="grid grid-cols-4 gap-[18px] py-[30px_0_54px]" aria-label="Our promise">
      {items.map(([symbol,line1,line2,tone]) => (
        <div key={line1} className={`flex items-center gap-4 px-[22px] py-5 rounded-[20px] font-black ${tone === "pink" ? "bg-[#ffe1ee] text-[#dc4892]" : tone === "mint" ? "bg-[#d7f8ec] text-[#147f74]" : tone === "yellow" ? "bg-[#fff4c8] text-[#c68608]" : "bg-[#e9e0ff] text-[#6741ba]"}`}>
          <b className="text-[31px]">{symbol}</b>
          <span className="text-sm leading-tight">{line1}<br/>{line2}</span>
        </div>
      ))}
    </section>
  );
}
