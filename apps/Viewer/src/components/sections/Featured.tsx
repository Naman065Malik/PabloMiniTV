import { useEffect, useState } from "react";
import { fetchCatalogueShows, type CatalogueShow } from "../../api/catalog";

export default function Featured() {
  const [featuredShow, setFeaturedShow] = useState<CatalogueShow | null>(null);

  useEffect(() => {
    fetchCatalogueShows().then(shows => setFeaturedShow(shows[0] ?? null)).catch(() => setFeaturedShow(null));
  }, []);

  return (
    <section className="pb-[58px]">
      <div className="w-full max-w-[1400px] mx-auto px-0">
        <div className="flex items-center justify-between mb-[18px]">
          <h2 className="text-[30px] leading-none tracking-[-1px] font-black m-0">Featured Story</h2>
          <button className="bg-none text-[#4d27a8] font-black">See All <span aria-hidden="true">→</span></button>
        </div>
        <div className="grid grid-cols-[1.15fr_1fr] gap-[38px] items-center">
          <div className="min-h-[260px] rounded-[20px] bg-gradient-to-br from-[#18b9eb] to-[#1664c6] relative grid place-items-center overflow-hidden">
            {featuredShow?.artworks?.banner ? <img src={featuredShow.artworks.banner} alt={featuredShow.title} className="absolute inset-0 h-full w-full object-cover" /> : <><span className="text-[110px]">🐋</span><span className="text-[70px] absolute right-[24%] bottom-[35px]">🧒</span></>}
            <button className="w-[60px] h-[60px] rounded-full bg-white text-[#5230b2] grid place-items-center font-black absolute" aria-label={`Play ${featuredShow?.title ?? "The Brave Little Whale"}`}>▶</button>
            <span className="absolute right-2.5 bottom-2 px-1.5 py-[3px] rounded-[6px] bg-[#261557cc] text-white text-xs font-extrabold">08:24</span>
          </div>
          <div>
            <span className="text-[#8e68d7] text-xs font-black tracking-[1px]">FEATURED STORY</span>
            <h2 className="text-[30px] leading-none tracking-[-1px] font-black m-[8px_0_10px]">{featuredShow?.title ?? "The Brave Little Whale"}</h2>
            <p className="text-[#69627f] text-[17px] leading-[1.55] max-w-[400px]">{featuredShow?.description ?? "Pablo helps a little whale find its way home. A story about kindness, friendship and courage."}</p>
            <button className="mt-5 inline-flex items-center justify-center rounded-full bg-[#ffbf22] px-7 py-3.5 text-base font-black text-[#3a245f] shadow-[0_6px_14px_#d9951238] transition-all hover:-translate-y-0.5 hover:bg-[#ffc83f] hover:shadow-[0_8px_16px_#4323a329]">▶ &nbsp; Watch Now</button>
          </div>
        </div>
      </div>
    </section>
  );
}
