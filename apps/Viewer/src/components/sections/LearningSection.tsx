import { learningCategories } from "../../data/mockCatalog";
import SectionHeading from "./SectionHeading";
export default function LearningSection() {
  return (
    <section className="pb-[58px]">
      <div className="w-full max-w-[1400px] mx-auto px-0">
        <SectionHeading title="Learn While You Watch" />
        <div className="grid grid-cols-4 gap-[18px]">
          {learningCategories.map((cat) => (
            <article key={cat.title} className={`min-h-[165px] rounded-[19px] px-5 pt-5 pb-5 text-center ${cat.tone === "pink" ? "bg-[#ffe1ee] text-[#dc4892]" : cat.tone === "mint" ? "bg-[#d7f8ec] text-[#147f74]" : cat.tone === "yellow" ? "bg-[#fff4c8] text-[#c68608]" : "bg-[#e9e0ff] text-[#6741ba]"}`}>
              <span className="text-[40px] font-black block">{cat.icon}</span>
              <h3 className="text-base font-bold mt-1.5 mb-0.5">{cat.title}</h3>
              <p className="text-[#6f6783] text-[13px] m-0">{cat.subtitle}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
