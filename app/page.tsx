"use client";

import { useState, useEffect } from "react";

// জেলা তালিকা ও সময় অফসেট (মিনিট)
const DISTRICTS = [
  { name: "কক্সবাজার", offset: -6, rawOffset: -6 },
  { name: "ঢাকা", offset: 0, rawOffset: 0 },
  { name: "বরিশাল", offset: 1, rawOffset: 1 },
  { name: "চট্টগ্রাম", offset: -5, rawOffset: -5 },
  { name: "সিলেট", offset: -6, rawOffset: -6 },
  { name: "রাজশাহী", offset: 7, rawOffset: 7 },
  { name: "খুলনা", offset: 5, rawOffset: 5 },
  { name: "রংপুর", offset: 6, rawOffset: 6 },
];

export default function RamadanPortal() {
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0]);
  const [activeTab, setActiveTab] = useState<"calendar" | "dua" | "tasbeeh" | "tracker">("calendar");
  const [filterPhase, setFilterPhase] = useState<"all" | "রহমত" | "মাগফিরাত" | "নাজাত">("নাজাত");
  const [searchQuery, setSearchQuery] = useState("");
  const [tasbeehCount, setTasbeehCount] = useState(0);

  // লাইভ ক্লক ও কাউন্টডাউন স্টেট
  const [nowDate, setNowDate] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState({ hours: "০২", minutes: "৪৬", seconds: "৫২" });
  const [completedDays, setCompletedDays] = useState<number[]>([21, 22]);
  const [dailyTrack, setDailyTrack] = useState({
    fasting: true,
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: false,
    isha: false,
    taraweeh: false,
    quran: true,
  });

  // রিয়েলটাইম ঘড়ি
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setNowDate(now);

      // সিম্পল ডায়নামিক কাউন্টডাউন লজিক (ইফতারের সময় ধরে ৫:৫৫ PM)
      const target = new Date();
      target.setHours(17, 55 + selectedDistrict.rawOffset, 0);
      let diff = Math.floor((target.getTime() - now.getTime()) / 1000);
      if (diff < 0) diff += 24 * 3600;

      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;

      const toBn = (n: number) =>
        String(n)
          .padStart(2, "0")
          .replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

      setCountdown({ hours: toBn(h), minutes: toBn(m), seconds: toBn(s) });
    };

    const initialUpdate = setTimeout(updateClock, 0);
    const timer = setInterval(updateClock, 1000);

    return () => {
      clearTimeout(initialUpdate);
      clearInterval(timer);
    };
  }, [selectedDistrict]);

  const toggleDayCheck = (day: number) => {
    setCompletedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // ৩০ দিনের ক্যালেন্ডার ডেটা
  const calendarData = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const phase = day <= 10 ? "রহমত" : day <= 20 ? "মাগফিরাত" : "নাজাত";
    return {
      roza: day,
      dateBangla: `${day + 1} মার্চ`,
      dayName: ["শনিবার", "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার"][i % 7],
      phase,
      sehri: "০৪:৩৭ AM",
      fajr: "০৪:৪১ AM",
      sunrise: "০৫:৫৬ AM",
      dhuhr: "১১:৫৯ AM",
      asr: "০৪:২৯ PM",
      iftar: "০৬:০৪ PM",
      isha: "০৭:২১ PM",
    };
  });

  const filteredCalendar = calendarData.filter((item) => {
    const matchesPhase = filterPhase === "all" ? true : item.phase === filterPhase;
    const matchesSearch =
      searchQuery === "" ||
      item.roza.toString().includes(searchQuery) ||
      item.dateBangla.includes(searchQuery) ||
      item.dayName.includes(searchQuery);
    return matchesPhase && matchesSearch;
  });

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip bg-[#020d0b] text-[#e6f4f1] p-3 pb-28 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1360px] mx-auto">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-30 -mx-3 -mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/15 bg-[#061a16]/95 px-3 pb-3 pt-3 backdrop-blur-xl sm:static sm:mx-0 sm:mt-0 sm:gap-4 sm:border-emerald-950/60 sm:bg-transparent sm:px-0 sm:pb-4 sm:pt-0 sm:backdrop-blur-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-yellow-300 text-xl shadow-lg shadow-emerald-900/30">
            🌙
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wide text-yellow-400">নূরে রমজান</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                ১৪৪৭ হিজরি
              </span>
            </div>
            <p className="text-xs text-emerald-300/70">রমজান ও দৈনিক সালাত সার্ভিস</p>
          </div>
        </div>

        {/* District Selector & Notification */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#051c17] border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs text-yellow-400 font-semibold shadow-inner">
            <span>📍</span>
            <select
              aria-label="জেলা নির্বাচন করুন"
              value={selectedDistrict.name}
              onChange={(e) => {
                const found = DISTRICTS.find((d) => d.name === e.target.value);
                if (found) setSelectedDistrict(found);
              }}
              className="bg-transparent text-yellow-400 focus:outline-none cursor-pointer pr-1"
            >
              {DISTRICTS.map((d) => (
                <option key={d.name} value={d.name} className="bg-[#041512] text-white">
                  {d.name} ({d.rawOffset >= 0 ? `+${d.rawOffset}` : d.rawOffset} মি.)
                </option>
              ))}
            </select>
          </div>

          <button aria-label="বিজ্ঞপ্তি" className="w-8 h-8 rounded-full bg-[#051c17] border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:text-yellow-400 transition-colors">
            🔔
          </button>
        </div>
      </header>

      {/* ─── Top Main Grid: Live Clock + Prayer Times ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Countdown Hero (7 Cols) */}
        <div className="lg:col-span-7 emerald-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none text-[220px] select-none leading-none">
            ☪
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                  লাইভ ইফতার
                </span>
                <span className="text-xs text-emerald-300/80">পবিত্র মাহে রমজান ২০২৬</span>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-digital font-bold text-emerald-400 tracking-wider">
                  {nowDate
                    ? nowDate.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })
                    : "03:08:07 PM"}
                </div>
                <div className="text-[10px] text-emerald-400/60 font-medium">বাংলাদেশ প্রমাণ সময়</div>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              শুক্রবার, ৩০ অক্টোবর, ২০২৬
            </h2>
            <p className="text-xs text-emerald-300/60 font-mono mt-0.5">Friday, Oct 30, 2026</p>
          </div>

          {/* Countdown Display Box */}
          <div className="emerald-card-inner rounded-xl p-4 sm:p-5 border border-yellow-400/25">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                🕒 ইফতারের বাকি সময়
              </span>
              <span className="bg-yellow-400/10 text-yellow-300 px-2 py-0.5 rounded text-[11px] font-mono border border-yellow-400/30">
                সন্ধ্যা: ০৫:৫৫ PM
              </span>
            </div>

            {/* 3 Digital Counters */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#02140f] border border-emerald-500/25 rounded-xl py-3 px-2 text-center">
                <div className="text-3xl sm:text-4xl font-digital font-bold text-yellow-400">
                  {countdown.hours}
                </div>
                <div className="text-[11px] text-emerald-300/70 font-medium mt-1">ঘণ্টা</div>
              </div>
              <div className="bg-[#02140f] border border-emerald-500/25 rounded-xl py-3 px-2 text-center">
                <div className="text-3xl sm:text-4xl font-digital font-bold text-yellow-400">
                  {countdown.minutes}
                </div>
                <div className="text-[11px] text-emerald-300/70 font-medium mt-1">মিনিট</div>
              </div>
              <div className="bg-[#02140f] border border-emerald-500/25 rounded-xl py-3 px-2 text-center">
                <div className="text-3xl sm:text-4xl font-digital font-bold text-yellow-400">
                  {countdown.seconds}
                </div>
                <div className="text-[11px] text-emerald-300/70 font-medium mt-1">সেকেন্ড</div>
              </div>
            </div>
          </div>

          {/* Today's Sehri & Iftar mini cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#041a14] border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm">
                🕌
              </div>
              <div>
                <div className="text-[10px] text-emerald-300/70">আজকের সেহরি শেষ</div>
                <div className="text-base font-digital font-bold text-white">০৪:৪৮ AM</div>
              </div>
            </div>

            <div className="bg-[#041a14] border border-yellow-400/20 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 text-sm">
                🌅
              </div>
              <div>
                <div className="text-[10px] text-yellow-400/80">আজকের ইফতার</div>
                <div className="text-base font-digital font-bold text-yellow-400">০৫:৫৫ PM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Five Daily Prayers (5 Cols) */}
        <div className="lg:col-span-5 emerald-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-yellow-400">☀️</span> পাঁচ ওয়াক্ত নামাজের সময়সূচি
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                আজকের ওয়াক্ত
              </span>
            </div>

            {/* Prayer List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#041b15]/60 hover:bg-[#072920] transition-colors border border-emerald-500/10">
                <span className="text-xs text-emerald-200 flex items-center gap-2">
                  <span className="text-emerald-400">🌙</span> ফজর
                </span>
                <span className="font-digital text-xs text-white">০৫:০২ AM</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#041b15]/60 hover:bg-[#072920] transition-colors border border-emerald-500/10">
                <span className="text-xs text-emerald-200 flex items-center gap-2">
                  <span className="text-emerald-400">☀️</span> যোহর
                </span>
                <span className="font-digital text-xs text-white">১২:০৪ PM</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#041b15]/60 hover:bg-[#072920] transition-colors border border-emerald-500/10">
                <span className="text-xs text-emerald-200 flex items-center gap-2">
                  <span className="text-emerald-400">⛅</span> আসর
                </span>
                <span className="font-digital text-xs text-white">০৪:২১ PM</span>
              </div>

              {/* Active Prayer highlight */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/15 to-transparent border border-yellow-400/40">
                <span className="text-xs text-yellow-300 font-bold flex items-center gap-2">
                  <span className="text-yellow-400">✨</span> মাগরিব (ইফতার)
                </span>
                <span className="font-digital text-sm font-bold text-yellow-400">০৫:৫৫ PM</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#041b15]/60 hover:bg-[#072920] transition-colors border border-emerald-500/10">
                <span className="text-xs text-emerald-200 flex items-center gap-2">
                  <span className="text-emerald-400">🌌</span> এশা ও তারাবীহ
                </span>
                <span className="font-digital text-xs text-white">০৭:১১ PM</span>
              </div>
            </div>
          </div>

          {/* Tahajjud & Ishraq footer info */}
          <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-400/80">
            <span>✨ তাহাজ্জুদ: রাত ০১:০০ - ০৪:৩০</span>
            <span>☀️ ইশরাক: ০৬:২৫ AM</span>
          </div>
        </div>
      </section>

      {/* ─── Bottom Navigation Tabs (Yellow Pill Design) ─── */}
      <nav
        aria-label="রমজান সেবা"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-emerald-500/20 bg-[#061a16]/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl sm:static sm:flex sm:flex-wrap sm:gap-2 sm:border-0 sm:bg-transparent sm:p-0 sm:pt-2 sm:backdrop-blur-none"
      >
        <button
          onClick={() => setActiveTab("calendar")}
          aria-pressed={activeTab === "calendar"}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-all sm:flex-row sm:gap-2 sm:px-4 sm:py-2 sm:text-xs ${
            activeTab === "calendar"
              ? "text-yellow-400 sm:bg-yellow-400 sm:text-[#020d0b] sm:shadow-lg sm:shadow-yellow-400/10"
              : "text-emerald-300 hover:text-white sm:border sm:border-emerald-500/20 sm:bg-[#051c17]"
          }`}
        >
          <span aria-hidden="true" className="text-lg leading-none sm:text-sm">📅</span>
          <span className="sm:hidden">ক্যালেন্ডার</span>
          <span className="hidden sm:inline">রমজান ক্যালেন্ডার</span>
        </button>

        <button
          onClick={() => setActiveTab("dua")}
          aria-pressed={activeTab === "dua"}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-all sm:flex-row sm:gap-2 sm:px-4 sm:py-2 sm:text-xs ${
            activeTab === "dua"
              ? "text-yellow-400 sm:bg-yellow-400 sm:text-[#020d0b] sm:shadow-lg sm:shadow-yellow-400/10"
              : "text-emerald-300 hover:text-white sm:border sm:border-emerald-500/20 sm:bg-[#051c17]"
          }`}
        >
          <span aria-hidden="true" className="text-lg leading-none sm:text-sm">📖</span>
          <span className="sm:hidden">দোয়া</span>
          <span className="hidden sm:inline">দোয়া ও নিয়ত</span>
        </button>

        <button
          onClick={() => setActiveTab("tasbeeh")}
          aria-pressed={activeTab === "tasbeeh"}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-all sm:flex-row sm:gap-2 sm:px-4 sm:py-2 sm:text-xs ${
            activeTab === "tasbeeh"
              ? "text-yellow-400 sm:bg-yellow-400 sm:text-[#020d0b] sm:shadow-lg sm:shadow-yellow-400/10"
              : "text-emerald-300 hover:text-white sm:border sm:border-emerald-500/20 sm:bg-[#051c17]"
          }`}
        >
          <span aria-hidden="true" className="text-lg leading-none sm:text-sm">📿</span>
          <span className="sm:hidden">তাসবীহ</span>
          <span className="hidden sm:inline">ডিজিটাল তাসবীহ</span>
        </button>

        <button
          onClick={() => setActiveTab("tracker")}
          aria-pressed={activeTab === "tracker"}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-all sm:flex-row sm:gap-2 sm:px-4 sm:py-2 sm:text-xs ${
            activeTab === "tracker"
              ? "text-yellow-400 sm:bg-yellow-400 sm:text-[#020d0b] sm:shadow-lg sm:shadow-yellow-400/10"
              : "text-emerald-300 hover:text-white sm:border sm:border-emerald-500/20 sm:bg-[#051c17]"
          }`}
        >
          <span aria-hidden="true" className="text-lg leading-none sm:text-sm">✔️</span>
          <span className="sm:hidden">আমল</span>
          <span className="hidden sm:inline">আমল ট্র্যাকার</span>
        </button>
      </nav>

      {/* ─── TAB 1: Ramadan Calendar View ─── */}
      {activeTab === "calendar" && (
        <section className="emerald-card rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
          {/* Calendar Filter Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setFilterPhase("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterPhase === "all"
                    ? "bg-yellow-400 text-[#020d0b] font-bold"
                    : "bg-[#041c16] text-emerald-300 border border-emerald-500/20 hover:bg-[#072e25]"
                }`}
              >
                ৩০ দিন সম্পূর্ণ
              </button>
              <button
                onClick={() => setFilterPhase("রহমত")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterPhase === "রহমত"
                    ? "bg-yellow-400 text-[#020d0b] font-bold"
                    : "bg-[#041c16] text-emerald-300 border border-emerald-500/20 hover:bg-[#072e25]"
                }`}
              >
                রহমত (১-১০)
              </button>
              <button
                onClick={() => setFilterPhase("মাগফিরাত")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterPhase === "মাগফিরাত"
                    ? "bg-yellow-400 text-[#020d0b] font-bold"
                    : "bg-[#041c16] text-emerald-300 border border-emerald-500/20 hover:bg-[#072e25]"
                }`}
              >
                মাগফিরাত (১১-২০)
              </button>
              <button
                onClick={() => setFilterPhase("নাজাত")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterPhase === "নাজাত"
                    ? "bg-yellow-400 text-[#020d0b] font-bold"
                    : "bg-[#041c16] text-emerald-300 border border-emerald-500/20 hover:bg-[#072e25]"
                }`}
              >
                নাজাত (২১-৩০)
              </button>
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-64 relative">
              <span className="absolute left-3 top-2.5 text-xs text-emerald-500">🔍</span>
              <input
                type="text"
                placeholder="তারিখ বা রোজার দিন খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#02130f] border border-emerald-500/30 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-emerald-400/40 focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-emerald-500/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#031c16] text-emerald-300 uppercase tracking-wider font-semibold border-b border-emerald-500/25">
                <tr>
                  <th className="py-3 px-4">রোজা</th>
                  <th className="py-3 px-4">তারিখ ও বার</th>
                  <th className="py-3 px-4 text-emerald-400">সেহরি শেষ</th>
                  <th className="py-3 px-4">ফজর</th>
                  <th className="py-3 px-4 text-yellow-400">সূর্যোদয়</th>
                  <th className="py-3 px-4">যোহর</th>
                  <th className="py-3 px-4">আসর</th>
                  <th className="py-3 px-4 text-yellow-400 font-bold">ইফতার</th>
                  <th className="py-3 px-4">এশা</th>
                  <th className="py-3 px-4 text-center">আমল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10 font-digital bg-[#02110d]/70">
                {filteredCalendar.map((row) => {
                  const isChecked = completedDays.includes(row.roza);
                  return (
                    <tr
                      key={row.roza}
                      className={`hover:bg-[#062820]/60 transition-colors ${
                        isChecked ? "bg-emerald-950/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-sans font-bold text-white">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[11px] text-emerald-300">
                          {row.roza}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-semibold text-white">{row.dateBangla}</div>
                        <div className="text-[10px] text-emerald-400/60">{row.dayName}</div>
                      </td>
                      <td className="py-3 px-4 text-emerald-300 font-bold">{row.sehri}</td>
                      <td className="py-3 px-4 text-emerald-400/80">{row.fajr}</td>
                      <td className="py-3 px-4 text-yellow-400/90">{row.sunrise}</td>
                      <td className="py-3 px-4 text-emerald-400/80">{row.dhuhr}</td>
                      <td className="py-3 px-4 text-emerald-400/80">{row.asr}</td>
                      <td className="py-3 px-4 text-yellow-400 font-bold">{row.iftar}</td>
                      <td className="py-3 px-4 text-emerald-400/80">{row.isha}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        <button
                          onClick={() => toggleDayCheck(row.roza)}
                          className={`w-6 h-6 rounded border flex items-center justify-center text-xs transition-colors mx-auto ${
                            isChecked
                              ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                              : "border-emerald-500/30 text-transparent hover:border-yellow-400"
                          }`}
                        >
                          ✓
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ─── TAB 2: Dua & Niyyat View ─── */}
      {activeTab === "dua" && (
        <section className="emerald-card rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-bold text-yellow-400 flex items-center gap-2">
            <span>📖</span> রমজানের প্রয়োজনীয় দোয়া ও নিয়ত
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="emerald-card-inner rounded-xl p-4 space-y-2 border border-emerald-500/20">
              <span className="text-xs font-semibold text-yellow-400">রোজার নিয়ত (সেহরি)</span>
              <p className="text-right text-lg text-emerald-100 font-serif leading-loose">
                نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ لِلَّهِ تَعَالَى
              </p>
              <p className="text-xs text-emerald-300/80">
                <strong>বাংলা উচ্চারণ:</strong> নাওয়াইতু আন আসুমা গাদাম মিন শাহরি রামাদানাল মুবারাকি ফারদাল্লাকা ইয়া আল্লাহু ফাতাকাব্বাল মিন্নি।
              </p>
            </div>

            <div className="emerald-card-inner rounded-xl p-4 space-y-2 border border-emerald-500/20">
              <span className="text-xs font-semibold text-yellow-400">ইফতারের দোয়া</span>
              <p className="text-right text-lg text-emerald-100 font-serif leading-loose">
                ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ
              </p>
              <p className="text-xs text-emerald-300/80">
                <strong>অর্থ:</strong> পিপাসা দূর হলো, শিরা-উপশিরা সতেজ হলো এবং ইনশাআল্লাহ সওয়াব নির্ধারিত হলো।
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ─── TAB 3: Digital Tasbeeh Counter ─── */}
      {activeTab === "tasbeeh" && (
        <section className="emerald-card rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-5">
          <div>
            <h3 className="text-lg font-bold text-yellow-400">ডিজিটাল তাসবীহ</h3>
            <p className="text-xs text-emerald-300/70">পবিত্র রমজানে জিকির করে সময় অতিবাহিত করুন</p>
          </div>

          <div className="w-36 h-36 rounded-full border-4 border-yellow-400/30 flex items-center justify-center bg-[#02130f] shadow-inner shadow-emerald-950">
            <span className="text-5xl font-digital font-bold text-yellow-400">{tasbeehCount}</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setTasbeehCount((c) => c + 1)}
              className="px-6 py-2.5 rounded-xl bg-yellow-400 text-[#020d0b] font-bold text-sm hover:bg-yellow-300 active:scale-95 transition-all shadow-lg shadow-yellow-400/20"
            >
              গণনা করুন (+১)
            </button>
            <button
              onClick={() => setTasbeehCount(0)}
              className="px-4 py-2.5 rounded-xl bg-[#041a14] border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/40 transition-colors"
            >
              রিসেট
            </button>
          </div>
        </section>
      )}

      {/* ─── TAB 4: Daily Amol Tracker ─── */}
      {activeTab === "tracker" && (
        <section className="emerald-card rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-yellow-400 flex items-center gap-2">
              <span>✔️</span> প্রতিদিনের আমল ও ইবাদত ট্র্যাকার
            </h3>
            <span className="text-xs text-emerald-300 font-mono">
              সম্পন্ন: {Object.values(dailyTrack).filter(Boolean).length} / ৮টি
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {Object.entries({
              fasting: "আজকের রোজা",
              fajr: "ফজর নামাজ",
              dhuhr: "যোহর নামাজ",
              asr: "আসর নামাজ",
              maghrib: "মাগরিব নামাজ",
              isha: "এশা নামাজ",
              taraweeh: "তারাবীহ সালাত",
              quran: "কুরআন তিলাওয়াত",
            }).map(([key, label]) => {
              const active = dailyTrack[key as keyof typeof dailyTrack];
              return (
                <button
                  key={key}
                  onClick={() =>
                    setDailyTrack((prev) => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof dailyTrack],
                    }))
                  }
                  className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                    active
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-200"
                      : "bg-[#041a14] border-emerald-500/15 text-emerald-400/60 hover:border-emerald-500/40"
                  }`}
                >
                  <span className="font-medium">{label}</span>
                  <span className="font-bold">{active ? "✓" : "○"}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}