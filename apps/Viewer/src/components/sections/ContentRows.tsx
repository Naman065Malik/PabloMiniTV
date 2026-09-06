import { shows, episodes } from "../../data/mockCatalog";
import SectionHeading from "./SectionHeading";
import ShowCard from "../cards/ShowCard";
import EpisodeCard from "../cards/EpisodeCard";
export default function ContentRows() {
  return (
    <>
      <section className="pb-[58px]">
        <div className="w-full max-w-[1400px] mx-auto px-0">
          <SectionHeading title="Popular Shows" />
          <div className="flex gap-[18px] overflow-x-auto scrollbar-none py-[3px_2px_8px]">
            {shows.map((show) => <ShowCard show={show} key={show.title} />)}
          </div>
        </div>
      </section>
      <section className="pb-[58px]">
        <div className="w-full max-w-[1400px] mx-auto px-0">
          <SectionHeading title="Continue Watching" />
          <div className="flex gap-[18px] overflow-x-auto scrollbar-none py-[3px_2px_8px]">
            {episodes.map((ep) => <EpisodeCard episode={ep} key={ep.title} />)}
          </div>
        </div>
      </section>
    </>
  );
}
