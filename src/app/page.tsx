"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Car, Preferences, AiAnalysis } from "@/lib/supabase";
import {
  MODEL_INTEL, SOURCE_TRUST, SCOUT_STAGES, CHECKLIST_TEMPLATE,
  findModelIntel, calcDepreciation, scoreCar, generateInsights,
  BASE_LOCATIONS, getDistance, getDistanceLabel, getDisplacement,
  isDieselHunterMatch, isPickupHunterMatch, is4x4HunterMatch, isPickup, is4x4Capable,
} from "@/lib/car-intel";
import { SEED_CARS } from "@/lib/seed-data";

// ─── Model images (curated CDN URLs) ───
const MODEL_IMAGES: Record<string, string[]> = {
  "Toyota Fortuner": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/44709/fortuner-exterior-right-front-three-quarter-19.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/44709/fortuner-exterior-right-side-view.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/44709/fortuner-interior-dashboard.jpeg"],
  "Mahindra Thar": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/40087/thar-exterior-right-front-three-quarter-11.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/40087/thar-exterior-right-side-view-2.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/40087/thar-interior-dashboard.jpeg"],
  "Maruti Jimny": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/112839/jimny-exterior-right-front-three-quarter-3.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/112839/jimny-exterior-right-side-view.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/112839/jimny-interior-dashboard.jpeg"],
  "Skoda Octavia": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/32942/octavia-exterior-right-front-three-quarter-5.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/32942/octavia-exterior-right-side-view.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/32942/octavia-interior-dashboard.jpeg"],
  "Hyundai Creta": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/106815/creta-exterior-right-front-three-quarter-5.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/106815/creta-exterior-right-side-view.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/106815/creta-interior-dashboard.jpeg"],
  "Volkswagen Taigun": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/44919/taigun-exterior-right-front-three-quarter-19.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/44919/taigun-exterior-right-side-view.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/44919/taigun-interior-dashboard.jpeg"],
  "Toyota Innova": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/51435/innova-crysta-exterior-right-front-three-quarter-2.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/51435/innova-crysta-exterior-right-side-view.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/51435/innova-crysta-interior-dashboard.jpeg"],
  "Tata Harrier": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/139139/harrier-exterior-right-front-three-quarter.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/139139/harrier-exterior-right-side-view.jpeg"],
  "Renault Duster": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/178797/duster-exterior-right-front-three-quarter-6.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/178797/duster-exterior-right-side-view-2.jpeg"],
  "Mahindra XUV700": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/42355/xuv700-exterior-right-front-three-quarter-3.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/42355/xuv700-exterior-right-side-view.jpeg"],
  "Honda City": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/134287/city-exterior-right-front-three-quarter-2.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/134287/city-exterior-right-side-view.jpeg"],
  "Maruti Grand Vitara": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/106867/grand-vitara-exterior-right-front-three-quarter.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/106867/grand-vitara-exterior-right-side-view.jpeg"],
  "Jeep Compass": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/112641/compass-exterior-right-front-three-quarter-7.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/112641/compass-exterior-right-side-view.jpeg"],
  "Ford Ecosport": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/33453/ecosport-exterior-right-front-three-quarter-35.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/33453/ecosport-exterior-right-side-view.jpeg"],
  "Kia Seltos": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/174323/seltos-exterior-right-front-three-quarter.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/174323/seltos-exterior-right-side-view.jpeg"],
  "Skoda Kushaq": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/174131/kushaq-exterior-right-front-three-quarter-3.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/174131/kushaq-exterior-right-side-view.jpeg"],
  "Tata Nexon": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/141867/nexon-exterior-right-front-three-quarter-48.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/141867/nexon-exterior-right-side-view.jpeg"],
  "Mahindra Scorpio": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/130583/scorpio-n-exterior-right-front-three-quarter-75.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/130583/scorpio-n-exterior-right-side-view.jpeg"],
  "Toyota Hyryder": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/107541/hyryder-exterior-right-front-three-quarter.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/107541/hyryder-exterior-right-side-view.jpeg"],
  "Tata Safari": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/139139/safari-exterior-right-front-three-quarter.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/139139/safari-exterior-right-side-view.jpeg"],
  "Volkswagen Virtus": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/132427/virtus-exterior-right-front-three-quarter-2.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/132427/virtus-exterior-right-side-view.jpeg"],
  "Kia Sonet": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/141115/sonet-exterior-right-front-three-quarter-2.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/141115/sonet-exterior-right-side-view.jpeg"],
  "Hyundai Venue": ["https://imgd.aeplcdn.com/664x374/n/cw/ec/136301/venue-exterior-right-front-three-quarter-2.jpeg","https://imgd.aeplcdn.com/664x374/n/cw/ec/136301/venue-exterior-right-side-view.jpeg"],
};

function getModelImages(model: string): string[] {
  const key = Object.keys(MODEL_IMAGES).find(k => model?.includes(k));
  return key ? MODEL_IMAGES[key] : [];
}

const DEFAULT_PREFS: Preferences = {
  id: "default", budget_min: 800000, budget_max: 1600000,
  fuel_pref: ["Diesel", "Petrol"], body_types: ["SUV"],
  transmission: "Any", max_km: 120000, max_age: 9, max_owners: 2,
  wants_mods: true, wants_4x4: true,
  base_city: "Chennai", search_radius: 600,
  diesel_hunter: true, min_displacement: 2000,
  pickup_hunter: true, fourx4_hunter: true,
};

// Score color helper
const scoreCol = (s: number) => s >= 80 ? "text-pw-green" : s >= 60 ? "text-pw-accent" : s >= 40 ? "text-amber-400" : "text-pw-red";
const scoreBorder = (s: number) => s >= 80 ? "border-pw-green" : s >= 60 ? "border-pw-accent" : s >= 40 ? "border-amber-400" : "border-pw-red";
const verdCol = (v: string) => v === "BUY" ? "text-pw-green border-pw-green" : v === "CONSIDER" ? "text-pw-accent border-pw-accent" : "text-pw-red border-pw-red";

export default function Dashboard() {
  const [cars, setCars] = useState<any[]>([]);
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [view, setView] = useState<"board" | "detail" | "prefs">("board");
  const [sel, setSel] = useState<any>(null);
  const [ai, setAi] = useState<Record<string, any>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("score");
  const [fFuel, setFFuel] = useState("All");
  const [fStage, setFStage] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [checklists, setChecklists] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeResults, setScrapeResults] = useState<any>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Theme effect
  useEffect(() => {
    const saved = localStorage.getItem("pw-theme") as "dark" | "light" | null;
    if (saved) { setTheme(saved); document.documentElement.classList.toggle("light", saved === "light"); }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
    localStorage.setItem("pw-theme", next);
  };

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  // ─── Load data from Supabase ───
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Load cars
      const { data: carsData } = await supabase.from("cars").select("*").order("created_at", { ascending: false });
      if (carsData && carsData.length > 0) {
        setCars(carsData);
      } else {
        // If DB is empty, use seed data locally
        setCars(SEED_CARS as any[]);
      }

      // Load prefs
      const { data: prefsData } = await supabase.from("preferences").select("*").eq("id", "default").single();
      if (prefsData) setPrefs(prefsData as Preferences);

      // Load AI analyses
      const { data: aiData } = await supabase.from("ai_analysis").select("*");
      if (aiData) {
        const aiMap: Record<string, any> = {};
        aiData.forEach((a: any) => { aiMap[a.car_id] = a; });
        setAi(aiMap);
      }

      // Load checklists
      const { data: checkData } = await supabase.from("checklist").select("*");
      if (checkData) {
        const checkMap: Record<string, boolean> = {};
        checkData.forEach((c: any) => { checkMap[c.id] = c.checked; });
        setChecklists(checkMap);
      }
    } catch (e) {
      // If Supabase not configured, fall back to seed data
      setCars(SEED_CARS as any[]);
    }
    setLoading(false);
  }

  // ─── Seed database ───
  async function seedDB() {
    setSeeding(true);
    try {
      const resp = await fetch("/api/seed", { method: "POST" });
      const data = await resp.json();
      if (data.success) {
        flash(`Seeded ${data.count} cars!`);
        await loadData();
      } else {
        flash(`Error: ${data.error}`);
      }
    } catch {
      flash("Failed to seed — is Supabase configured?");
    }
    setSeeding(false);
  }

  // ─── Run scraper ───
  async function runScrape(sources?: string[]) {
    setScraping(true);
    flash("🕷 Scraping started...");
    try {
      const resp = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: sources || [],
          city: prefs.base_city?.toLowerCase() || "chennai",
          budgetMax: prefs.budget_max || 2500000,
        }),
      });
      const data = await resp.json();
      setScrapeResults(data);
      if (data.success) {
        flash(`🕷 Found ${data.total_found} cars from ${data.results?.length || 0} sources`);
        await loadData(); // Reload from DB
      } else {
        flash(`Scrape error: ${data.error}`);
      }
    } catch (e: any) {
      flash(`Scrape failed: ${e.message}`);
    }
    setScraping(false);
  }

  // ─── Save preferences ───
  async function savePrefs(p: Preferences) {
    setPrefs(p);
    try {
      await supabase.from("preferences").upsert({ ...p, updated_at: new Date().toISOString() }, { onConflict: "id" });
    } catch {}
  }

  // ─── Update car stage ───
  async function updateStage(id: string, stage: string) {
    setCars(prev => prev.map(c => c.id === id ? { ...c, stage } : c));
    if (sel?.id === id) setSel({ ...sel, stage });
    try {
      await supabase.from("cars").update({ stage, updated_at: new Date().toISOString() }).eq("id", id);
    } catch {}
    flash(`→ ${stage}`);
  }

  // ─── Checklist ───
  function isChecked(carId: string, cat: string, item: string) { return !!checklists[`${carId}-${cat}-${item}`]; }

  async function toggleCheck(carId: string, cat: string, item: string) {
    const key = `${carId}-${cat}-${item}`;
    const newVal = !checklists[key];
    setChecklists(prev => ({ ...prev, [key]: newVal }));
    try {
      await supabase.from("checklist").upsert({ id: key, car_id: carId, category: cat, item, checked: newVal, updated_at: new Date().toISOString() }, { onConflict: "id" });
    } catch {}
  }

  function checkProgress(carId: string) {
    let total = 0, done = 0;
    CHECKLIST_TEMPLATE.forEach(c => c.items.forEach(i => { total++; if (isChecked(carId, c.cat, i)) done++; }));
    return { total, done, pct: total ? Math.round(done / total * 100) : 0 };
  }

  // ─── AI Analysis (via server API route) ───
  async function runAi(car: any) {
    setAiLoading(p => ({ ...p, [car.id]: true }));
    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ car, prefs }),
      });
      const data = await resp.json();
      if (data.success) {
        setAi(prev => ({ ...prev, [car.id]: data.analysis }));
        flash("AI analysis complete");
      } else {
        flash(`AI error: ${data.error}`);
      }
    } catch {
      flash("AI analysis failed");
    }
    setAiLoading(p => ({ ...p, [car.id]: false }));
  }

  // ─── Add car ───
  const emptyNew = { model: "", variant: "", year: 2023, km: 0, price: 0, fuel: "Diesel", transmission: "Manual", body_type: "SUV", drivetrain: "2WD", owners: 1, reg_state: "TN", city: "Chennai", color: "", source: "Cars24", certified: false, link: "", notes: "", stage: "discovered", seller_name: "", seller_phone: "", seller_type: "unknown" };
  const [nc, setNc] = useState<any>(emptyNew);

  async function addCar() {
    if (!nc.model) { flash("Model required"); return; }
    const car = { ...nc, id: `m${Date.now()}`, price: +nc.price, km: +nc.km, year: +nc.year, owners: +nc.owners, images: [], scraped_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setCars(prev => [car, ...prev]);
    try { await supabase.from("cars").upsert(car, { onConflict: "id" }); } catch {}
    setNc(emptyNew);
    setShowAdd(false);
    flash("Car added");
  }

  async function deleteCar(id: string) {
    setCars(prev => prev.filter(c => c.id !== id));
    try { await supabase.from("cars").delete().eq("id", id); } catch {}
    flash("Removed");
  }

  // ─── Process & sort ───
  const processed = cars
    .map(c => ({ ...c, score: scoreCar(c, prefs), insights: generateInsights(c, prefs) }))
    .filter(c => {
      if (search && !c.model.toLowerCase().includes(search.toLowerCase())) return false;
      if (fFuel !== "All" && c.fuel !== fFuel) return false;
      if (fStage !== "All" && (c.stage || "discovered") !== fStage) return false;
      return true;
    })
    .sort((a, b) => sort === "score" ? b.score - a.score : sort === "price_low" ? a.price - b.price : sort === "price_high" ? b.price - a.price : sort === "km" ? a.km - b.km : b.year - a.year);

  // ─── LOADING STATE ───
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🚗</div>
          <div className="text-pw-accent text-lg font-bold">Loading Pre-Worshipped...</div>
        </div>
      </div>
    );
  }

  // ─── BOARD VIEW ───
  const renderBoard = () => {
    const dieselHunterCount = prefs.diesel_hunter ? processed.filter(c => isDieselHunterMatch(c, prefs)).length : 0;
    const pickupHunterCount = prefs.pickup_hunter ? processed.filter(c => isPickupHunterMatch(c, prefs)).length : 0;
    const fourx4HunterCount = prefs.fourx4_hunter ? processed.filter(c => is4x4HunterMatch(c, prefs)).length : 0;

    return (
    <div>
      {/* Hunters + Location Bar */}
      <div className="bg-pw-card rounded-xl border border-pw-border p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-pw-muted">📍</span>
            <select className="bg-pw-deep border border-pw-border rounded-lg px-3 py-1.5 text-xs outline-none cursor-pointer text-pw-text"
              value={prefs.base_city} onChange={e => savePrefs({ ...prefs, base_city: e.target.value })}>
              {BASE_LOCATIONS.map(l => <option key={l.id} value={l.city}>{l.label}</option>)}
            </select>
            <select className="bg-pw-deep border border-pw-border rounded-lg px-2 py-1.5 text-xs outline-none cursor-pointer text-pw-muted"
              value={prefs.search_radius} onChange={e => savePrefs({ ...prefs, search_radius: +e.target.value })}>
              <option value={200}>200km</option>
              <option value={400}>400km</option>
              <option value={600}>600km</option>
              <option value={1000}>1000km</option>
              <option value={9999}>All India</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Diesel Hunter */}
            <button className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${prefs.diesel_hunter ? "border-amber-600 bg-amber-900/30 text-amber-400" : "border-pw-border text-pw-muted"}`}
              onClick={() => savePrefs({ ...prefs, diesel_hunter: !prefs.diesel_hunter })}>
              🏴 Diesel{prefs.diesel_hunter ? ` (${dieselHunterCount})` : ""}
            </button>
            {/* Pickup Hunter */}
            <button className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${prefs.pickup_hunter ? "border-orange-600 bg-orange-900/30 text-orange-400" : "border-pw-border text-pw-muted"}`}
              onClick={() => savePrefs({ ...prefs, pickup_hunter: !prefs.pickup_hunter })}>
              🛻 Pickup{prefs.pickup_hunter ? ` (${pickupHunterCount})` : ""}
            </button>
            {/* 4x4 Hunter */}
            <button className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${prefs.fourx4_hunter ? "border-emerald-600 bg-emerald-900/30 text-emerald-400" : "border-pw-border text-pw-muted"}`}
              onClick={() => savePrefs({ ...prefs, fourx4_hunter: !prefs.fourx4_hunter })}>
              🏔 4x4{prefs.fourx4_hunter ? ` (${fourx4HunterCount})` : ""}
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {SCOUT_STAGES.map(s => {
          const count = processed.filter(c => (c.stage || "discovered") === s.id).length;
          return (
            <button key={s.id}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${fStage === s.id ? "bg-opacity-20 border-current" : "border-pw-border text-pw-muted hover:border-pw-accent"}`}
              style={{ color: fStage === s.id ? s.color : undefined, borderColor: fStage === s.id ? s.color : undefined, backgroundColor: fStage === s.id ? s.color + "20" : undefined }}
              onClick={() => setFStage(fStage === s.id ? "All" : s.id)}>
              {s.icon} {s.label} ({count})
            </button>
          );
        })}
        <button className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${fStage === "All" ? "border-pw-accent text-pw-accent bg-pw-accent/10" : "border-pw-border text-pw-muted"}`}
          onClick={() => setFStage("All")}>All ({processed.length})</button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input className="bg-pw-deep border border-pw-border rounded-lg px-3 py-2 text-sm flex-1 min-w-[160px] outline-none focus:border-pw-accent"
          placeholder="Search model..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="bg-pw-deep border border-pw-border rounded-lg px-3 py-2 text-xs outline-none cursor-pointer"
          value={fFuel} onChange={e => setFFuel(e.target.value)}>
          <option value="All">All Fuels</option>
          {[...new Set(cars.map(c => c.fuel))].map(f => <option key={f}>{f}</option>)}
        </select>
        <select className="bg-pw-deep border border-pw-border rounded-lg px-3 py-2 text-xs outline-none cursor-pointer"
          value={sort} onChange={e => setSort(e.target.value)}>
          <option value="score">Best Match</option>
          <option value="price_low">Price ↑</option>
          <option value="price_high">Price ↓</option>
          <option value="km">Lowest KM</option>
          <option value="year">Newest</option>
        </select>
        <button className="bg-pw-accent text-pw-bg px-4 py-2 rounded-lg text-xs font-bold hover:brightness-110"
          onClick={() => setShowAdd(true)}>+ Add</button>
        <button className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${scraping ? "border-pw-green text-pw-green animate-pulse" : "border-pw-purple text-pw-purple hover:bg-pw-purple/10"}`}
          onClick={() => runScrape()} disabled={scraping}>
          {scraping ? "🕷 Scraping..." : "🕷 Scrape"}
        </button>
      </div>

      {/* Car list */}
      {processed.map(car => {
        const dep = calcDepreciation(car);
        const trust = SOURCE_TRUST[car.source];
        const stage = SCOUT_STAGES.find(s => s.id === (car.stage || "discovered"));
        const cp = checkProgress(car.id);
        const dist = getDistance(prefs.base_city || "Chennai", car.city);
        const distInfo = getDistanceLabel(dist);
        const disp = getDisplacement(car.model);
        const isDH = isDieselHunterMatch(car, prefs);
        const isPH = isPickupHunterMatch(car, prefs);
        const is4H = is4x4HunterMatch(car, prefs);

        return (
          <div key={car.id}
            className="bg-pw-card rounded-xl border border-pw-border p-4 mb-2.5 cursor-pointer transition-all hover:border-pw-accent"
            onClick={() => { setSel(car); setView("detail"); }}>
            <div className="flex gap-3.5 items-start">
              <div className={`w-12 h-12 rounded-full border-[3px] flex items-center justify-center text-[15px] font-bold shrink-0 ${scoreBorder(car.score)} ${scoreCol(car.score)}`}>
                {car.score}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between flex-wrap gap-1.5">
                  <div>
                    <div className="text-[15px] font-bold text-pw-text font-extrabold">{car.model}</div>
                    <div className="text-[11px] text-pw-muted mt-0.5">{car.year} · {car.city} · {car.source}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-pw-accent">₹{(car.price / 100000).toFixed(1)}L</div>
                    {dep && <div className={`text-[10px] ${dep.depPct >= 35 ? "text-pw-green" : "text-pw-muted"}`}>{dep.depPct}% off new</div>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {[car.fuel, car.transmission, `${(car.km / 1000).toFixed(0)}k km`, `${car.owners}own`, car.reg_state].map((t, i) => (
                    <span key={i} className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pw-border/50 text-pw-text">{t}</span>
                  ))}
                  {car.drivetrain === "4WD" && <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-900/30 text-pw-text">4x4</span>}
                  {car.certified && <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pw-green/10 text-pw-green">✓</span>}
                  {dist < 9999 && <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ color: distInfo.color, backgroundColor: distInfo.color + "15" }}>{dist}km</span>}
                  {isDH && <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-900/40 text-amber-400">🏴 {(disp/1000).toFixed(1)}L</span>}
                  {isPH && <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-900/40 text-orange-400">🛻 Pickup</span>}
                  {is4H && <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-900/40 text-emerald-400">🏔 4x4</span>}
                </div>
                <div className="flex gap-2.5 mt-2 text-[11px] items-center flex-wrap">
                  <span style={{ color: stage?.color }}>{stage?.icon} {stage?.label}</span>
                  <span className="text-pw-green">↑{car.insights.whyBuy.length}</span>
                  <span className="text-pw-red">↓{car.insights.whyNot.length}</span>
                  {ai[car.id] && <span className={`font-bold ${ai[car.id].verdict === "BUY" ? "text-pw-green" : ai[car.id].verdict === "CONSIDER" ? "text-pw-accent" : "text-pw-red"}`}>AI:{ai[car.id].verdict}</span>}
                  {cp.done > 0 && <span className="text-pw-muted">☑{cp.pct}%</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {processed.length === 0 && (
        <div className="text-center py-16 text-pw-muted">
          <div className="text-5xl mb-4">🚗</div>
          <p className="text-lg mb-4">No cars found</p>
          {cars.length === 0 && (
            <button className="bg-pw-accent text-pw-bg px-6 py-3 rounded-lg font-bold" onClick={seedDB} disabled={seeding}>
              {seeding ? "Seeding..." : "Seed Database with 75 Cars"}
            </button>
          )}
        </div>
      )}
    </div>
  );
  };

  // ─── DETAIL VIEW ───
  const renderDetail = () => {
    if (!sel) return null;
    const car = { ...sel, score: scoreCar(sel, prefs), insights: generateInsights(sel, prefs) };
    const intel = findModelIntel(car.model);
    const dep = calcDepreciation(car);
    const trust = SOURCE_TRUST[car.source];
    const a = ai[car.id];
    const imgs = car.images?.length ? car.images : getModelImages(car.model);
    const cp = checkProgress(car.id);
    const stage = SCOUT_STAGES.find(s => s.id === (car.stage || "discovered"));

    return (
      <div>
        <button className="text-pw-muted border border-pw-border rounded-lg px-4 py-2 text-xs font-semibold mb-4 hover:border-pw-accent"
          onClick={() => setView("board")}>← Back</button>

        {/* Header */}
        <div className="bg-pw-card rounded-xl border border-pw-border p-5 mb-3.5">
          <div className="flex justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-[22px] font-bold text-pw-text font-extrabold">{car.model}</h2>
              <div className="text-pw-muted text-xs mt-1">{car.variant} · {car.year} · {car.city}</div>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {SCOUT_STAGES.map(s => (
                  <button key={s.id}
                    className="px-2.5 py-1 rounded text-[11px] font-semibold border transition-all"
                    style={{ color: (car.stage || "discovered") === s.id ? s.color : "#5e6278", borderColor: (car.stage || "discovered") === s.id ? s.color : "#1a1d2b", backgroundColor: (car.stage || "discovered") === s.id ? s.color + "20" : "transparent" }}
                    onClick={() => updateStage(car.id, s.id)}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-pw-accent">₹{(car.price / 100000).toFixed(1)}L</div>
              <div className={`w-[52px] h-[52px] rounded-full border-[3px] inline-flex items-center justify-center text-lg font-bold mt-2 ${scoreBorder(car.score)} ${scoreCol(car.score)}`}>{car.score}</div>
            </div>
          </div>

          {/* Images */}
          {imgs.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {imgs.map((url: string, i: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt="" className="h-40 rounded-lg object-cover border border-pw-border" onError={(e) => (e.currentTarget.style.display = "none")} />
              ))}
            </div>
          )}

          {/* Specs grid */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mt-4">
            {[["Year", car.year], ["KM", car.km?.toLocaleString()], ["Fuel", car.fuel], ["Trans", car.transmission], ["Drive", car.drivetrain], ["Owners", car.owners], ["Reg", car.reg_state], ["Color", car.color]].map(([l, v]) => (
              <div key={String(l)}><div className="text-[10px] text-pw-muted uppercase tracking-wider">{l}</div><div className="text-sm font-semibold">{v}</div></div>
            ))}
          </div>
          {car.notes && <div className="mt-3 p-3 bg-pw-deep rounded-lg text-xs text-pw-muted leading-relaxed">📝 {car.notes}</div>}

          {/* Seller + Listing Actions */}
          <div className="flex flex-wrap gap-3 mt-3 items-center">
            {car.link && (
              <a href={car.link} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-pw-accent text-pw-bg text-xs font-bold hover:brightness-110 transition-all">
                🔗 View Original Listing
              </a>
            )}
            {car.seller_name && (
              <div className="flex items-center gap-2 px-3 py-2 bg-pw-deep rounded-lg border border-pw-border">
                <span className="text-xs text-pw-muted">👤</span>
                <span className="text-xs font-semibold">{car.seller_name}</span>
                {car.seller_type && <span className="text-[10px] text-pw-muted">({car.seller_type})</span>}
              </div>
            )}
            {car.seller_phone && (
              <a href={`tel:${car.seller_phone}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pw-green/10 border border-pw-green/30 text-pw-green text-xs font-bold">
                📞 {car.seller_phone}
              </a>
            )}
            {!car.seller_phone && !car.seller_name && car.source && (
              <span className="text-[11px] text-pw-muted">No seller contact — check original listing on {car.source}</span>
            )}
          </div>
        </div>

        {/* Depreciation + Trust */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {dep && (
            <div className="bg-pw-card rounded-xl border border-pw-border p-5">
              <h3 className="text-pw-accent text-xs uppercase tracking-wider font-bold mb-3">📉 Depreciation</h3>
              <div className={`text-3xl font-bold ${dep.depPct >= 35 ? "text-pw-green" : "text-pw-accent"}`}>{dep.depPct}%</div>
              <div className="text-[11px] text-pw-muted">off new (avg ₹{(dep.avgNew / 100000).toFixed(0)}L)</div>
              <div className="text-sm mt-2">Save <span className="text-pw-green font-bold">₹{(dep.savedAmt / 100000).toFixed(1)}L</span></div>
              <div className="text-[11px] text-pw-muted mt-1">{dep.perYear}%/yr avg</div>
            </div>
          )}
          {trust && (
            <div className="bg-pw-card rounded-xl border border-pw-border p-5">
              <h3 className="text-pw-accent text-xs uppercase tracking-wider font-bold mb-3">🏪 Source Trust</h3>
              <div className="text-lg font-bold">{trust.label}</div>
              <div className="text-xs text-pw-muted mt-1">{trust.desc}</div>
              <div className={`text-xs mt-2 ${trust.premiumPct > 0 ? "text-pw-red" : "text-pw-green"}`}>
                {trust.premiumPct > 0 ? `~${trust.premiumPct}% premium` : trust.premiumPct < 0 ? `~${Math.abs(trust.premiumPct)}% below platforms` : "Market rate"}
              </div>
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
          <div className="bg-pw-card rounded-xl border border-pw-border p-5">
            <h3 className="text-pw-green text-xs uppercase tracking-wider font-bold mb-3">✦ Why Buy ({car.insights.whyBuy.length})</h3>
            {car.insights.whyBuy.map((x: string, i: number) => (
              <div key={i} className="p-2 rounded-lg bg-pw-green/5 border-l-[3px] border-pw-green mb-1.5 text-xs leading-relaxed">{x}</div>
            ))}
          </div>
          <div className="bg-pw-card rounded-xl border border-pw-border p-5">
            <h3 className="text-pw-red text-xs uppercase tracking-wider font-bold mb-3">✦ Why Not ({car.insights.whyNot.length})</h3>
            {car.insights.whyNot.map((x: string, i: number) => (
              <div key={i} className="p-2 rounded-lg bg-pw-red/5 border-l-[3px] border-pw-red mb-1.5 text-xs leading-relaxed">{x}</div>
            ))}
          </div>
        </div>

        {/* Model Intel */}
        {intel && (
          <div className="bg-pw-card rounded-xl border border-pw-border p-5 mt-3.5">
            <h3 className="text-pw-accent text-xs uppercase tracking-wider font-bold mb-3">Model Intel</h3>
            <div className="grid grid-cols-5 gap-3 mb-3">
              {[["Reliability", intel.intel.reliability], ["Resale", intel.intel.resale], ["Parts", intel.intel.parts], ["Community", intel.intel.community], ["Mods", intel.intel.modPotential]].map(([l, v]) => (
                <div key={String(l)} className="text-center">
                  <div className={`text-xl font-bold ${Number(v) >= 7 ? "text-pw-green" : Number(v) >= 5 ? "text-pw-accent" : "text-pw-red"}`}>{v}</div>
                  <div className="text-[10px] text-pw-muted">{l}</div>
                </div>
              ))}
            </div>
            <div className="text-xs text-pw-muted">Service: <span className="text-pw-text font-semibold">{intel.intel.avgServiceCost}</span></div>
            {intel.intel.inspectSpecial && (
              <div className="mt-3">
                <div className="text-[10px] text-pw-accent uppercase tracking-wider mb-1">Model-specific checks</div>
                {intel.intel.inspectSpecial.map((x, i) => <div key={i} className="text-xs text-pw-muted py-1 border-b border-pw-border last:border-0">🔧 {x}</div>)}
              </div>
            )}
          </div>
        )}

        {/* Checklist */}
        <div className="bg-pw-card rounded-xl border border-pw-border p-5 mt-3.5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-pw-accent text-xs uppercase tracking-wider font-bold">☑ Pre-Purchase Checklist</h3>
            <span className={`text-xs font-bold ${cp.pct >= 80 ? "text-pw-green" : cp.pct >= 40 ? "text-pw-accent" : "text-pw-muted"}`}>{cp.pct}% ({cp.done}/{cp.total})</span>
          </div>
          <div className="w-full h-1.5 bg-pw-border rounded-full mb-4">
            <div className={`h-full rounded-full transition-all ${cp.pct >= 80 ? "bg-pw-green" : "bg-pw-accent"}`} style={{ width: `${cp.pct}%` }} />
          </div>
          {CHECKLIST_TEMPLATE.map(cat => (
            <div key={cat.cat} className="mb-3">
              <div className="text-[11px] font-bold uppercase tracking-wider mb-1.5">{cat.cat}</div>
              {cat.items.map(item => (
                <label key={item} className={`flex gap-2 py-1 cursor-pointer text-xs ${isChecked(car.id, cat.cat, item) ? "text-pw-green line-through" : "text-pw-muted"}`}>
                  <input type="checkbox" checked={isChecked(car.id, cat.cat, item)} onChange={() => toggleCheck(car.id, cat.cat, item)} />
                  {item}
                </label>
              ))}
            </div>
          ))}
        </div>

        {/* AI Analysis */}
        <div className="bg-pw-card rounded-xl border border-pw-border p-5 mt-3.5">
          <div className="flex justify-between items-center">
            <h3 className="text-pw-purple text-xs uppercase tracking-wider font-bold">🤖 AI Deep Analysis</h3>
            <button className="bg-pw-accent text-pw-bg px-4 py-1.5 rounded-lg text-xs font-bold"
              onClick={() => runAi(car)} disabled={aiLoading[car.id]}>
              {aiLoading[car.id] ? "Analyzing..." : a ? "Re-analyze" : "Run AI"}
            </button>
          </div>
          {a && a.verdict !== "ERROR" ? (
            <div className="mt-3">
              <div className="flex gap-3 items-center mb-3">
                <span className={`px-4 py-1.5 rounded-lg border-2 text-base font-extrabold ${verdCol(a.verdict)} bg-opacity-10`}
                  style={{ backgroundColor: a.verdict === "BUY" ? "#34d39918" : a.verdict === "CONSIDER" ? "#d4a84318" : "#f8717118" }}>
                  {a.verdict}
                </span>
                <span className="text-xs text-pw-muted">Confidence: <strong className="text-pw-text">{a.confidence}/10</strong></span>
                {a.fair_price && <span className="text-xs text-pw-accent">Fair: {a.fair_price}</span>}
              </div>
              <div className="text-sm leading-relaxed mb-3">{a.summary}</div>
              {[["Hidden Year-1 Costs", a.hidden_costs], ["Negotiation Tip", a.negotiation_tip], ["Inspect These", a.check_these], ["3-5 Year Outlook", a.long_term]].map(([l, v]) => v ? (
                <div key={String(l)} className="mb-2.5">
                  <div className="text-[10px] text-pw-accent uppercase tracking-wider">{l}</div>
                  <div className="text-xs text-pw-muted p-2.5 bg-pw-deep rounded-lg mt-1 leading-relaxed">{v}</div>
                </div>
              ) : null)}
            </div>
          ) : a?.verdict === "ERROR" ? <div className="text-pw-red text-xs mt-3">{a.summary}</div>
            : <div className="text-pw-muted text-xs mt-3">Click Run AI for Claude-powered analysis</div>}
        </div>

        <button className="text-pw-red border border-pw-red/30 rounded-lg px-4 py-2 text-xs font-semibold mt-3.5 hover:bg-pw-red/10"
          onClick={() => { deleteCar(car.id); setView("board"); }}>Remove car</button>
      </div>
    );
  };

  // ─── PREFS VIEW ───
  const renderPrefs = () => (
    <div>
      <div className="bg-pw-card rounded-xl border border-pw-border p-5 mb-3.5">
        <h3 className="text-pw-accent font-bold mb-3">Budget (₹)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-pw-muted uppercase tracking-wider block mb-1">Min</label>
            <input className="bg-pw-deep border border-pw-border rounded-lg px-3 py-2 text-sm w-full outline-none" type="number" value={prefs.budget_min} onChange={e => savePrefs({ ...prefs, budget_min: +e.target.value })} />
            <div className="text-[10px] text-pw-muted mt-1">₹{(prefs.budget_min / 100000).toFixed(1)}L</div>
          </div>
          <div>
            <label className="text-[10px] text-pw-muted uppercase tracking-wider block mb-1">Max</label>
            <input className="bg-pw-deep border border-pw-border rounded-lg px-3 py-2 text-sm w-full outline-none" type="number" value={prefs.budget_max} onChange={e => savePrefs({ ...prefs, budget_max: +e.target.value })} />
            <div className="text-[10px] text-pw-muted mt-1">₹{(prefs.budget_max / 100000).toFixed(1)}L</div>
          </div>
        </div>
      </div>

      <div className="bg-pw-card rounded-xl border border-pw-border p-5 mb-3.5">
        <h3 className="text-pw-accent font-bold mb-3">Fuel</h3>
        <div className="flex gap-2 flex-wrap">
          {["Diesel", "Petrol", "Hybrid", "Electric"].map(f => (
            <button key={f} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border ${prefs.fuel_pref?.includes(f) ? "border-pw-accent text-pw-accent bg-pw-accent/10" : "border-pw-border text-pw-muted"}`}
              onClick={() => savePrefs({ ...prefs, fuel_pref: prefs.fuel_pref?.includes(f) ? prefs.fuel_pref.filter(x => x !== f) : [...(prefs.fuel_pref || []), f] })}>{f}</button>
          ))}
        </div>
      </div>

      <div className="bg-pw-card rounded-xl border border-pw-border p-5 mb-3.5">
        <h3 className="text-pw-accent font-bold mb-3">Body Type</h3>
        <div className="flex gap-2 flex-wrap">
          {["SUV", "Sedan", "MUV", "Hatchback"].map(b => (
            <button key={b} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border ${prefs.body_types?.includes(b) ? "border-pw-accent text-pw-accent bg-pw-accent/10" : "border-pw-border text-pw-muted"}`}
              onClick={() => savePrefs({ ...prefs, body_types: prefs.body_types?.includes(b) ? prefs.body_types.filter(x => x !== b) : [...(prefs.body_types || []), b] })}>{b}</button>
          ))}
        </div>
      </div>

      <div className="bg-pw-card rounded-xl border border-pw-border p-5 mb-3.5">
        <h3 className="text-pw-accent font-bold mb-3">Transmission</h3>
        <div className="flex gap-2">
          {["Any", "Manual", "Automatic"].map(t => (
            <button key={t} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border ${prefs.transmission === t ? "border-pw-accent text-pw-accent bg-pw-accent/10" : "border-pw-border text-pw-muted"}`}
              onClick={() => savePrefs({ ...prefs, transmission: t })}>{t}</button>
          ))}
        </div>
      </div>

      <div className="bg-pw-card rounded-xl border border-pw-border p-5 mb-3.5">
        <h3 className="text-pw-accent font-bold mb-3">Driver Profile</h3>
        <div className="flex gap-4">
          <label className="flex gap-2 cursor-pointer text-xs text-pw-muted items-center">
            <input type="checkbox" checked={prefs.wants_mods} onChange={e => savePrefs({ ...prefs, wants_mods: e.target.checked })} /> I mod cars
          </label>
          <label className="flex gap-2 cursor-pointer text-xs text-pw-muted items-center">
            <input type="checkbox" checked={prefs.wants_4x4} onChange={e => savePrefs({ ...prefs, wants_4x4: e.target.checked })} /> Prefer 4x4
          </label>
        </div>
      </div>

      {/* Location */}
      <div className="bg-pw-card rounded-xl border border-pw-border p-5 mb-3.5">
        <h3 className="text-pw-accent font-bold mb-3">📍 My Location</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-pw-muted uppercase tracking-wider block mb-1">Base City</label>
            <select className="bg-pw-deep border border-pw-border rounded-lg px-3 py-2 text-sm w-full outline-none cursor-pointer"
              value={prefs.base_city} onChange={e => savePrefs({ ...prefs, base_city: e.target.value })}>
              {BASE_LOCATIONS.map(l => <option key={l.id} value={l.city}>{l.label}</option>)}
            </select>
            <div className="text-[10px] text-pw-muted mt-1">Scores adjust based on distance from here</div>
          </div>
          <div>
            <label className="text-[10px] text-pw-muted uppercase tracking-wider block mb-1">Search Radius</label>
            <select className="bg-pw-deep border border-pw-border rounded-lg px-3 py-2 text-sm w-full outline-none cursor-pointer"
              value={prefs.search_radius} onChange={e => savePrefs({ ...prefs, search_radius: +e.target.value })}>
              <option value={200}>200 km</option>
              <option value={400}>400 km</option>
              <option value={600}>600 km</option>
              <option value={1000}>1000 km</option>
              <option value={9999}>All India</option>
            </select>
            <div className="text-[10px] text-pw-muted mt-1">Cars beyond this get penalized in score</div>
          </div>
        </div>
      </div>

      {/* Diesel Hunter */}
      <div className={`rounded-xl border p-5 mb-3.5 ${prefs.diesel_hunter ? "bg-amber-950/20 border-amber-800/50" : "bg-pw-card border-pw-border"}`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className={`font-bold ${prefs.diesel_hunter ? "text-amber-400" : "text-pw-accent"}`}>🏴 Diesel Hunter Mode</h3>
          <button
            className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${prefs.diesel_hunter ? "border-amber-600 bg-amber-900/50 text-amber-400" : "border-pw-border text-pw-muted"}`}
            onClick={() => savePrefs({ ...prefs, diesel_hunter: !prefs.diesel_hunter })}>
            {prefs.diesel_hunter ? "ON" : "OFF"}
          </button>
        </div>
        {prefs.diesel_hunter && (
          <div>
            <div className="text-xs text-pw-muted mb-3">Automatically highlights diesel cars with 2.0L+ engines within your search radius. These get a +15 score bonus.</div>
            <div>
              <label className="text-[10px] text-pw-muted uppercase tracking-wider block mb-1">Minimum Displacement</label>
              <div className="flex gap-2">
                {[1500, 2000, 2500].map(d => (
                  <button key={d} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border ${prefs.min_displacement === d ? "border-amber-600 text-amber-400 bg-amber-900/30" : "border-pw-border text-pw-muted"}`}
                    onClick={() => savePrefs({ ...prefs, min_displacement: d })}>{(d/1000).toFixed(1)}L+</button>
                ))}
              </div>
            </div>
            <div className="mt-3 p-3 bg-pw-deep rounded-lg text-[11px] text-pw-muted leading-relaxed">
              <strong className="text-amber-400">What this does:</strong> Scans all listings for diesel engines ≥{(prefs.min_displacement/1000).toFixed(1)}L within {prefs.search_radius}km of {prefs.base_city}. Matching cars get flagged with 🏴 and scored +15 points. Models tracked: Fortuner 2.8, Thar 2.2, XUV700 2.2, Scorpio N 2.0, Harrier/Safari 2.0, Compass 2.0, Octavia 2.0 TDI, and more.
            </div>
          </div>
        )}
      </div>

      <button className="border border-pw-border text-pw-muted rounded-lg px-4 py-2 text-xs font-semibold hover:border-pw-accent" onClick={seedDB} disabled={seeding}>
        {seeding ? "Seeding..." : "Re-seed database (75 cars)"}
      </button>
    </div>
  );

  // ─── ADD MODAL ───
  const renderAddModal = () => !showAdd ? null : (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
      <div className="bg-pw-card rounded-2xl p-6 max-w-xl w-full max-h-[85vh] overflow-auto border border-pw-border" onClick={e => e.stopPropagation()}>
        <h3 className="text-pw-accent font-bold text-lg mb-4">Add a Car</h3>
        <div className="grid grid-cols-2 gap-3">
          {[["model", "Model *", "text", "Toyota Fortuner 2.8 AT"], ["variant", "Variant", "text", "2.8L Diesel AT 4x4"], ["year", "Year", "number", ""], ["km", "KM", "number", ""], ["price", "Price ₹", "number", ""], ["color", "Color", "text", ""], ["city", "City", "text", "Chennai"], ["link", "Listing URL", "text", "https://..."], ["seller_name", "Seller Name", "text", ""], ["seller_phone", "Seller Phone", "text", "+91..."]].map(([k, l, t, p]) => (
            <div key={k}>
              <label className="text-[10px] text-pw-muted uppercase tracking-wider block mb-1">{l}</label>
              <input className="bg-pw-deep border border-pw-border rounded-lg px-3 py-2 text-sm w-full outline-none" type={t} placeholder={p} value={nc[k]} onChange={e => setNc({ ...nc, [k]: e.target.value })} />
            </div>
          ))}
          {([["fuel", ["Diesel", "Petrol", "Hybrid", "Electric"]], ["transmission", ["Manual", "Automatic"]], ["body_type", ["SUV", "Sedan", "MUV", "Hatchback"]], ["drivetrain", ["2WD", "4WD", "AWD"]], ["reg_state", ["TN", "KA", "KL", "AP", "TS", "MH", "DL", "PY", "GA"]], ["source", ["Cars24", "Spinny", "OLX", "Toyota U Trust", "Mahindra First Choice", "Das WeltAuto", "Hyundai H Promise", "Maruti True Value", "Honda Auto Terrace", "Team-BHP", "Facebook", "Personal Network", "Direct Seller"]]] as [string, string[]][]).map(([k, opts]) => (
            <div key={k}>
              <label className="text-[10px] text-pw-muted uppercase tracking-wider block mb-1">{k}</label>
              <select className="bg-pw-deep border border-pw-border rounded-lg px-3 py-2 text-xs w-full outline-none cursor-pointer" value={nc[k]} onChange={e => setNc({ ...nc, [k]: e.target.value })}>
                {(opts as string[]).map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="text-[10px] text-pw-muted uppercase tracking-wider block mb-1">Owners</label>
            <input className="bg-pw-deep border border-pw-border rounded-lg px-3 py-2 text-sm w-full outline-none" type="number" min={0} value={nc.owners} onChange={e => setNc({ ...nc, owners: e.target.value })} />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex gap-2 cursor-pointer text-xs text-pw-muted items-center">
              <input type="checkbox" checked={nc.certified} onChange={e => setNc({ ...nc, certified: e.target.checked })} /> Certified
            </label>
          </div>
        </div>
        <div className="mt-2">
          <label className="text-[10px] text-pw-muted uppercase tracking-wider block mb-1">Notes</label>
          <textarea className="bg-pw-deep border border-pw-border rounded-lg px-3 py-2 text-sm w-full min-h-[50px] resize-y outline-none" value={nc.notes} onChange={e => setNc({ ...nc, notes: e.target.value })} />
        </div>
        <div className="flex gap-3 mt-4">
          <button className="bg-pw-accent text-pw-bg px-5 py-2 rounded-lg text-sm font-bold" onClick={addCar}>Add</button>
          <button className="border border-pw-border text-pw-muted px-5 py-2 rounded-lg text-sm" onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );

  // ─── MAIN RENDER ───
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-5 py-4 border-b border-pw-border sticky top-0 z-50" style={{ background: "var(--deep)" }}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-extrabold text-pw-accent tracking-tight">Pre-Worshipped</h1>
            <div className="text-[10px] text-pw-muted uppercase tracking-[2px] mt-0.5">Car Intelligence · {cars.length} tracked</div>
          </div>
          <div className="flex gap-1.5 items-center">
            {[["board", "🏠 Scout"], ["prefs", "⚙️ Prefs"]].map(([v, l]) => (
              <button key={v} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${(view === v || (v === "board" && view === "detail")) ? "border-pw-accent text-pw-accent bg-pw-accent/10" : "border-pw-border text-pw-muted"}`}
                onClick={() => setView(v as any)}>{l}</button>
            ))}
            <button onClick={toggleTheme}
              className="px-2.5 py-1.5 rounded-lg text-sm border border-pw-border hover:border-pw-accent transition-all ml-1"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-5">
        {view === "board" && renderBoard()}
        {view === "detail" && renderDetail()}
        {view === "prefs" && renderPrefs()}
      </div>

      {renderAddModal()}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-pw-green text-pw-bg px-5 py-2.5 rounded-lg text-sm font-bold z-50 shadow-lg animate-pulse">
          {toast}
        </div>
      )}
    </div>
  );
}
