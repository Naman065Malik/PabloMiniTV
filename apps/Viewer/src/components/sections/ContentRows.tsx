import { useEffect, useState } from "react";
import { fetchCatalogueEpisodes, fetchCatalogueShows, type CatalogueEpisode, type CatalogueShow } from "../../api/catalog";
import { shows, episodes } from "../../data/mockCatalog";
import SectionHeading from "./SectionHeading";
import ShowCard from "../cards/ShowCard";
import EpisodeCard from "../cards/EpisodeCard";
export default function ContentRows() {
  const [catalogueShows, setCatalogueShows] = useState<CatalogueShow[] | null>(null);
  const [catalogueEpisodes, setCatalogueEpisodes] = useState<Array<CatalogueEpisode & { show: string; artworkUrl?: string }> | null>(null);

  useEffect(() => {
    fetchCatalogueShows().then(setCatalogueShows).catch(() => setCatalogueShows([]));
    fetchCatalogueEpisodes().then(episodes => setCatalogueEpisodes(episodes.slice(0, 3))).catch(() => setCatalogueEpisodes([]));
  }, []);

  const popularShows = catalogueShows?.length ? catalogueShows : shows;
  const continueWatching = catalogueEpisodes?.length ? catalogueEpisodes : episodes;

  return (
    <>
      <section className="pb-[58px]">
        <div className="w-full max-w-[1400px] mx-auto px-0">
          <SectionHeading title="Popular Shows" />
          <div className="flex gap-[18px] overflow-x-auto scrollbar-none px-0.5 pb-2 pt-[3px]">
            {popularShows.map((show) => <ShowCard show={show} key={show.id ?? show.title} />)}
          </div>
        </div>
      </section>
      <section className="pb-[58px]">
        <div className="w-full max-w-[1400px] mx-auto px-0">
          <SectionHeading title="Continue Watching" />
          <div className="flex gap-[18px] overflow-x-auto scrollbar-none px-0.5 pb-2 pt-[3px]">
            {continueWatching.map((ep) => <EpisodeCard episode={ep} key={ep.id ?? ep.title} />)}
          </div>
        </div>
      </section>
    </>
  );
}
