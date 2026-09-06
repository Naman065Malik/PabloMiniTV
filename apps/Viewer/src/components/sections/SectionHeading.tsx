export default function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between mb-[18px]">
      <h2 className="text-[30px] leading-none tracking-[-1px] font-black m-0">{title}</h2>
      <button className="bg-none text-[#4d27a8] font-black">See All <span aria-hidden="true">→</span></button>
    </div>
  );
}
