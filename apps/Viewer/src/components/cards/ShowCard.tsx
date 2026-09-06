import type { CatalogueShow } from "../../api/catalog";
import type { Show } from "../../data/mockCatalog";

type ShowCardData = Pick<Show, "title" | "description" | "artwork" | "tone"> & { imageUrl?: string };

export default function ShowCard({ show }: { show: ShowCardData | CatalogueShow }) {
  const imageUrl = "imageUrl" in show ? show.imageUrl : show.artworks?.banner ?? show.artworks?.thumbnail ?? show.artworks?.poster;
  return (
    <article className={`flex-[0_0_300px] ${"tone" in show ? show.tone : ""}`}>
      <div className="aspect-video rounded-[17px] bg-[#ded3fb] overflow-hidden shadow-[0_6px_15px_#34206b1c] transition-transform hover:scale-[1.03] hover:-rotate-1">
        {imageUrl ? <img src={imageUrl} alt={show.title} className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-[39px] font-black text-white">{("artwork" in show && show.artwork === "numbers") ? "1 2 3" : "🧒🐶"}</span>}
      </div>
      <h3 className="text-base font-bold mt-2.5 mb-0.5">{show.title}</h3>
      <p className="text-[#746c8f] text-[13px] m-0">{show.description}</p>
    </article>
  );
}
