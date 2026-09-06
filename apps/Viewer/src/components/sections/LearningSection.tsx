import { learningCategories } from "../../data/mockCatalog";
export default function LearningSection() {
  return (
    <section className="pb-[58px]">
      <div className="w-full max-w-[1400px] mx-auto px-0">
        <div className="mb-[14px] flex items-center justify-between">
          <h2 className="m-0 text-[26px] font-semibold leading-none tracking-[-0.8px]">Learn While You Watch</h2>
          <button className="bg-none text-[13px] font-bold text-[#4d27a8]">See All <span aria-hidden="true">→</span></button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-[14px]">
          {learningCategories.map((cat) => (
            <article key={cat.title} className={`flex min-h-[136px] flex-col items-center justify-center rounded-[17px] px-3 py-4 text-center ${cat.tone === "pink" ? "bg-[#ffe1ee] text-[#dc4892]" : cat.tone === "mint" ? "bg-[#d7f8ec] text-[#147f74]" : cat.tone === "yellow" ? "bg-[#fff4c8] text-[#c68608]" : "bg-[#e9e0ff] text-[#6741ba]"}`}>
              <span className="block text-[29px] font-black leading-none">{cat.icon}</span>
              <h3 className="mb-0.5 mt-3 text-[14px] font-semibold">{cat.title}</h3>
              <p className="m-0 text-[12px] text-[#6f6783]">{cat.subtitle}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
