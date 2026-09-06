import type { episodes } from "../../data/mockCatalog";
import type { CatalogueEpisode } from "../../api/catalog";

type EpisodeCardData = (typeof episodes)[number] | (CatalogueEpisode & { show: string; artworkUrl?: string });

export default function EpisodeCard({ episode }: { episode: EpisodeCardData }) {
  const artworkUrl = "artworkUrl" in episode ? episode.artworkUrl : undefined;
  const duration = "duration_seconds" in episode && episode.duration_seconds ? `${Math.floor(episode.duration_seconds / 60)}:${String(episode.duration_seconds % 60).padStart(2, "0")}` : episode.duration;
  return (
    <article className="flex-[0_0_300px] bg-white rounded-[18px] p-2.5 shadow-[0_5px_18px_#34206b14]">
      <div className={`h-[155px] rounded-xl relative grid place-items-center overflow-hidden ${artworkUrl ? "bg-[#ded3fb]" : episode.artwork === "park" ? "bg-gradient-to-br from-[#f8c75d] to-[#64d49c]" : episode.artwork === "jungle" ? "bg-gradient-to-br from-[#45b886] to-[#714cbd]" : "bg-gradient-to-br from-[#41c7ed] to-[#1869c4]"}`}>
        {artworkUrl && <img src={artworkUrl} alt={episode.title} className="absolute inset-0 h-full w-full object-cover" />}
        <span className="w-[42px] h-[42px] rounded-full bg-white text-[#5230b2] grid place-items-center font-black">▶</span>
        <span className="absolute right-[10px] bottom-[8px] px-1.5 py-[3px] rounded-[6px] bg-[#261557cc] text-white text-xs font-extrabold">{duration}</span>
      </div>
      <div className="px-1 py-[2px_4px_3px]">
        <h3 className="text-base font-bold mt-2.5 mb-0.5">{episode.title}</h3>
        <p className="text-[#746c8f] text-[13px] m-0">{episode.show}</p>
        {episode.progress && (
          <div className="h-[5px] bg-[#e8e3f4] rounded-full mt-2.5 overflow-hidden" aria-label={`${episode.progress}% watched`}>
            <span className="block h-full bg-[#ffbd1e] rounded-full" style={{ width: `${episode.progress}%` }} />
          </div>
        )}
      </div>
    </article>
  );
}
