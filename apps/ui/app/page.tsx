import { SimulationContainer } from "@/components/simulation/SimulationContainer";
import { SegmentsContainer } from "@/components/segments/SegmentsContainer";

export default function HomePage() {
  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
        {/* მარცხენა მხარე: სიმულაცია */}
        <section className="bg-white  rounded-2xl border border-slate-200 shadow-sm">
          <SimulationContainer />
        </section>

        {/* მარჯვენა მხარე: სეგმენტების მართვა */}
        <section className="bg-white  rounded-2xl border border-slate-200 shadow-sm">
          <SegmentsContainer />
        </section>
      </div>
    </>
  );
}
