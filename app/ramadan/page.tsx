"use client";

import { useState } from "react";
import Link from "next/link";

interface RamadanDay {
  day: number;
  phase: "রহমত" | "মাগফিরাত" | "নাজাত";
  date: string;
  weekday: string;
  sehri: string;
  fajr: string;
  iftar: string;
}

// ৩০ দিনের স্ট্যান্ডার্ড ডেটা স্যাম্পল
const ramadanSchedule: RamadanDay[] = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1;
  const phase = day <= 10 ? "রহমত" : day <= 20 ? "মাগফিরাত" : "নাজাত";
  return {
    day,
    phase,
    date: `${day} রমজান`,
    weekday: ["শনিবার", "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার"][index % 7],
    sehri: `০৪:${String(55 - Math.floor(index / 3)).padStart(2, "0")} AM`,
    fajr: `০৫:০১ AM`,
    iftar: `০৬:${String(8 + Math.floor(index / 4)).padStart(2, "0")} PM`,
  };
});

export default function RamadanPage() {
  const [filter, setFilter] = useState<"all" | "রহমত" | "মাগফিরাত" | "নাজাত">("all");
  const [completedFast, setCompletedFast] = useState<number[]>([]);

  const toggleDay = (day: number) => {
    setCompletedFast((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const filteredDays = filter === "all" 
    ? ramadanSchedule 
    : ramadanSchedule.filter((item) => item.phase === filter);

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          href="/"
          className="text-xs text-zinc-400 hover:text-amber-400 inline-flex items-center gap-1 transition-colors"
        >
          ← হোমে ফিরে যান
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
          রমজান সময়সূচী ও ক্যালেন্ডার
        </h1>
        <p className="text-zinc-400 text-sm">
          প্রতিদিনের সেহরি, ফজর ও ইফতারের তালিকা (সম্পূর্ণ ৩০ দিন)
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        {(["all", "রহমত", "মাগফিরাত", "নাজাত"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === tab
                ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/10"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            {tab === "all" ? "সবগুলো (১-৩০)" : `${tab} (${tab === "রহমত" ? "১-১০" : tab === "মাগফিরাত" ? "১১-২০" : "২১-৩০"})`}
          </button>
        ))}
      </div>

      {/* Responsive Calendar Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-zinc-950/80 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">রোজা</th>
              <th className="py-3 px-4">পর্ব</th>
              <th className="py-3 px-4">বার</th>
              <th className="py-3 px-4 text-amber-400">সেহরির শেষ সময়</th>
              <th className="py-3 px-4 text-emerald-400">ইফতারের সময়</th>
              <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono text-xs sm:text-sm">
            {filteredDays.map((item) => {
              const isChecked = completedFast.includes(item.day);
              return (
                <tr
                  key={item.day}
                  className={`hover:bg-zinc-800/40 transition-colors ${
                    isChecked ? "bg-amber-400/[0.03]" : ""
                  }`}
                >
                  <td className="py-3.5 px-4 font-sans font-bold text-white">
                    {item.day} রমজান
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.phase === "রহমত"
                          ? "bg-blue-500/10 text-blue-400"
                          : item.phase === "মাগফিরাত"
                          ? "bg-purple-500/10 text-purple-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {item.phase}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-zinc-400">{item.weekday}</td>
                  <td className="py-3.5 px-4 text-amber-400/90 font-semibold">{item.sehri}</td>
                  <td className="py-3.5 px-4 text-emerald-400/90 font-semibold">{item.iftar}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toggleDay(item.day)}
                      className={`px-2.5 py-1 rounded text-xs font-sans transition-all ${
                        isChecked
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {isChecked ? "✓ সম্পন্ন" : "অসম্পূর্ণ"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}