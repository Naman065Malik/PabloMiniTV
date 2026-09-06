import type { shows } from "../../data/mockCatalog";
export default function ShowCard({ show }: { show: (typeof shows)[number] }) {
  return (
    <article className={`flex-[0_0_210px] ${show.tone}`}>
      <div className={`aspect-[1.05] rounded-[17px] grid place-items-center overflow-hidden shadow-[0_6px_15px_#34206b1c] transition-transform hover:scale-[1.03] hover:-rotate-1 ${show.artwork === "numbers" ? "bg-gradient-to-br from-[#7756dd] to-[#bd9cff]" : show.artwork === "abc" ? "bg-gradient-to-br from-[#4ebba9] to-[#b0ecd3]" : show.artwork === "animals" ? "bg-gradient-to-br from-[#369cdf] to-[#85d5f6]" : show.artwork === "nature" ? "bg-gradient-to-br from-[#e77aa9] to-[#ffcae0]" : "bg-gradient-to-br from-[#ffc642] to-[#ffe6a0]"}`}>
        <span className="text-[39px] font-black text-white text-center drop-shadow-[0_3px_5px_#25126b66]">{show.artwork === "numbers" ? "1 2 3" : show.artwork === "abc" ? "A B C" : show.artwork === "animals" ? "🐱 🐶 🦊" : show.artwork === "nature" ? "🌿" : "🧒🐶"}</span>
      </div>
      <h3 className="text-base font-bold mt-2.5 mb-0.5">{show.title}</h3>
      <p className="text-[#746c8f] text-[13px] m-0">{show.description}</p>
    </article>
  );
}
