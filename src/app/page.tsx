"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Preferences } from "@/lib/supabase";
import {
  SOURCE_TRUST, SCOUT_STAGES, CHECKLIST_TEMPLATE,
  findModelIntel, calcDepreciation, scoreCar, generateInsights,
  BASE_LOCATIONS, getDistance, getDistanceLabel, getDisplacement,
  isDieselHunterMatch, isPickupHunterMatch, is4x4HunterMatch, isPickup, is4x4Capable,
} from "@/lib/car-intel";
import { SEED_CARS } from "@/lib/seed-data";

// ─── Color-aware car image system ───
// Uses a reliable approach: data URI SVG with color swatch + model name
// This ALWAYS renders — no broken images ever

const COLOR_HEX: Record<string, string> = {
  white: "#f0ede8", pearl: "#f0ede8", arctic: "#f0ede8", ivory: "#fffff0", platinum: "#e5e4e2", super: "#f0ede8", candy: "#f0ede8", glacier: "#f0ede8", cafe: "#f5f0e8", everest: "#f0ede8", diamond: "#f0ede8", calgary: "#f5f0e8", vocal: "#f0ede8",
  black: "#1a1a1a", absolute: "#1a1a1a", phantom: "#1a1a1a", abyss: "#1a1a1a", napoli: "#1a1a1a", stealth: "#1a1a1a", midnight: "#1a1a1a", atlas: "#1a1a1a", oberon: "#1a1a1a", magic: "#1a1a1a", attitude: "#1a1a1a",
  grey: "#6b6b6b", silver: "#a0a0a0", titan: "#6b6b6b", granite: "#5a5a5a", reflex: "#8a8a8a", meteoroid: "#5a5a5a", telesto: "#6b6b6b", smoke: "#6b6b6b", dazzling: "#a0a0a0", minimal: "#8a8a8a", carbon: "#4a4a4a", galaxy: "#5a5a5a", modern: "#6b6b6b", steel: "#6b6b6b", mercury: "#a0a0a0", titanium: "#7a7a7a", brilliant: "#a0a0a0", tropical: "#6b7b6b",
  red: "#c0392b", sizzling: "#e74c3c", intense: "#c0392b", calypso: "#c0392b", flame: "#e74c3c", emotional: "#c0392b", exotica: "#c0392b", tango: "#e74c3c", tornado: "#c0392b", venetian: "#8b0000", cherry: "#8b0000",
  blue: "#2471a3", nexa: "#1a5276", sapphire: "#1a3c6e", rising: "#2e86c1", electric: "#2e86c1", celestial: "#1a5276", royal: "#1a3c6e", lava: "#d35400",
  green: "#1e7a1e", jade: "#2d8c4e", deep: "#1a5a2a", matt: "#3a6b3a",
  brown: "#6b4226", bronze: "#7a5c3a", mocha: "#4a3628",
  yellow: "#d4a843", kinetic: "#d4a843", curcuma: "#c9a634",
  orange: "#d35400",
  aquamarine: "#48c9b0", aqua: "#48c9b0",
  beige: "#c9b99a", rocky: "#b8a88a",
};

function getColorHex(color: string): string {
  if (!color) return "#4a4a4a";
  const words = color.toLowerCase().split(/[\s,/()-]+/);
  for (const word of words) {
    if (COLOR_HEX[word]) return COLOR_HEX[word];
  }
  return "#4a4a4a";
}

// Short model name for display
function shortModel(model: string): string {
  // "Toyota Fortuner 2.8 4x4 AT" → "Fortuner"
  const parts = model.split(" ");
  // Skip brand names
  const brands = ["Toyota", "Mahindra", "Maruti", "Hyundai", "Tata", "Kia", "Volkswagen", "Skoda", "Jeep", "Ford", "Honda", "Renault", "Isuzu", "Force"];
  const filtered = parts.filter(p => !brands.includes(p));
  return filtered.slice(0, 2).join(" ") || parts[1] || parts[0];
}

// Generate SVG data URI — clean car-card placeholder with color
function carImg(model: string, color?: string): string {
  const hex = getColorHex(color || "");
  const name = shortModel(model);
  const isLight = ["#f0ede8", "#f5f0e8", "#e5e4e2", "#fffff0", "#a0a0a0", "#c9b99a", "#b8a88a", "#d4a843", "#c9a634", "#48c9b0"].includes(hex);
  const textColor = isLight ? "#333" : "#fff";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="664" height="374" viewBox="0 0 664 374">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${hex};stop-opacity:0.9"/>
        <stop offset="100%" style="stop-color:${hex};stop-opacity:0.7"/>
      </linearGradient>
    </defs>
    <rect width="664" height="374" fill="url(#bg)"/>
    <rect x="0" y="0" width="664" height="374" fill="#000" opacity="0.15"/>
    <!-- Car silhouette -->
    <g transform="translate(182,120) scale(0.6)" fill="${textColor}" opacity="0.15">
      <path d="M480,240 L460,180 C450,150 420,120 380,110 L300,100 C260,95 200,100 160,110 L100,130 C70,140 50,160 40,180 L20,240 C10,260 10,280 20,280 L480,280 C490,280 490,260 480,240 Z"/>
      <circle cx="130" cy="280" r="40"/>
      <circle cx="380" cy="280" r="40"/>
    </g>
    <!-- Model name -->
    <text x="332" y="200" font-family="system-ui,sans-serif" font-size="32" font-weight="800" fill="${textColor}" text-anchor="middle" opacity="0.9">${name.replace(/&/g,"&amp;").replace(/[<>]/g,"")}</text>
    <!-- Color label -->
    <text x="332" y="240" font-family="system-ui,sans-serif" font-size="16" fill="${textColor}" text-anchor="middle" opacity="0.5">${(color || "").replace(/&/g,"&amp;").replace(/[<>]/g,"")}</text>
    <!-- Color swatch -->
    <rect x="292" y="260" width="80" height="8" rx="4" fill="${hex}" opacity="0.8"/>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ─── Time helpers ───
function timeAgo(date: string): string {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}
function isNew(date: string): boolean {
  if (!date) return false;
  return (new Date().getTime() - new Date(date).getTime()) < 48 * 3600 * 1000;
}

const DP: Preferences = {
  id: "default", budget_min: 800000, budget_max: 1600000,
  fuel_pref: ["Diesel", "Petrol"], body_types: ["SUV", "Pickup"],
  transmission: "Any", max_km: 120000, max_age: 9, max_owners: 2,
  wants_mods: true, wants_4x4: true,
  base_city: "Chennai", search_radius: 600,
  diesel_hunter: true, min_displacement: 2000,
  pickup_hunter: true, fourx4_hunter: true,
};

export default function Dashboard() {
  const [cars, setCars] = useState<any[]>([]);
  const [prefs, setPrefs] = useState<Preferences>(DP);
  const [view, setView] = useState<"grid" | "detail" | "prefs">("grid");
  const [sel, setSel] = useState<any>(null);
  const [tab, setTab] = useState<"info" | "insights" | "checklist" | "ai">("info");
  const [ai, setAi] = useState<Record<string, any>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("score");
  const [fFuel, setFFuel] = useState("All");
  const [fStage, setFStage] = useState("All");
  const [fHunter, setFHunter] = useState("All"); // All | diesel | pickup | 4x4
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    const t = localStorage.getItem("pw-theme") as "dark" | "light" | null;
    if (t) { setTheme(t); document.documentElement.classList.toggle("light", t === "light"); }
    else { setTheme("light"); document.documentElement.classList.add("light"); }
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const { data: cd } = await supabase.from("cars").select("*").order("created_at", { ascending: false });
      setCars(cd && cd.length > 0 ? cd : SEED_CARS as any[]);
      const { data: pd } = await supabase.from("preferences").select("*").eq("id", "default").single();
      if (pd) setPrefs(pd as Preferences);
      const { data: ad } = await supabase.from("ai_analysis").select("*");
      if (ad) { const m: Record<string, any> = {}; ad.forEach((a: any) => { m[a.car_id] = a; }); setAi(m); }
      const { data: ck } = await supabase.from("checklist").select("*");
      if (ck) { const m: Record<string, boolean> = {}; ck.forEach((c: any) => { m[c.id] = c.checked; }); setChecks(m); }
    } catch { setCars(SEED_CARS as any[]); }
    setLoading(false);
  }

  const toggleTheme = () => {
    const n = theme === "dark" ? "light" : "dark";
    setTheme(n); document.documentElement.classList.toggle("light", n === "light");
    localStorage.setItem("pw-theme", n);
  };

  const savePrefs = async (p: Preferences) => {
    setPrefs(p);
    try { await supabase.from("preferences").upsert({ ...p, updated_at: new Date().toISOString() }, { onConflict: "id" }); } catch {}
  };

  const updateStage = async (id: string, stage: string) => {
    setCars(p => p.map(c => c.id === id ? { ...c, stage } : c));
    if (sel?.id === id) setSel({ ...sel, stage });
    try { await supabase.from("cars").update({ stage }).eq("id", id); } catch {}
    flash(`→ ${SCOUT_STAGES.find(s => s.id === stage)?.label || stage}`);
  };

  const ck = (cid: string, cat: string, item: string) => !!checks[`${cid}-${cat}-${item}`];
  const toggleCk = async (cid: string, cat: string, item: string) => {
    const k = `${cid}-${cat}-${item}`, v = !checks[k];
    setChecks(p => ({ ...p, [k]: v }));
    try { await supabase.from("checklist").upsert({ id: k, car_id: cid, category: cat, item, checked: v }, { onConflict: "id" }); } catch {}
  };
  const ckProg = (cid: string) => {
    let t = 0, d = 0;
    CHECKLIST_TEMPLATE.forEach(c => c.items.forEach(i => { t++; if (ck(cid, c.cat, i)) d++; }));
    return { t, d, p: t ? Math.round(d / t * 100) : 0 };
  };

  const runAi = async (car: any) => {
    setAiLoading(p => ({ ...p, [car.id]: true }));
    try {
      const r = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ car, prefs }) });
      const d = await r.json();
      if (d.success) { setAi(p => ({ ...p, [car.id]: d.analysis })); flash("Analysis complete"); }
      else flash(`Error: ${d.error}`);
    } catch { flash("AI analysis failed"); }
    setAiLoading(p => ({ ...p, [car.id]: false }));
  };

  const runScrape = async () => {
    setScraping(true); flash("Scraping...");
    try {
      const r = await fetch("/api/scrape", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ city: prefs.base_city?.toLowerCase() || "chennai", budgetMax: prefs.budget_max }) });
      const d = await r.json();
      if (d.success) { flash(`Found ${d.total_found} cars`); await loadData(); }
      else flash(`Error: ${d.error}`);
    } catch { flash("Scrape failed"); }
    setScraping(false);
  };

  const emptyNew = { model: "", variant: "", year: 2023, km: 0, price: 0, fuel: "Diesel", transmission: "Manual", body_type: "SUV", drivetrain: "2WD", owners: 1, reg_state: "TN", city: "Chennai", color: "", source: "Cars24", certified: false, link: "", notes: "", stage: "discovered", seller_name: "", seller_phone: "", seller_type: "unknown" };
  const [nc, setNc] = useState<any>(emptyNew);
  const addCar = async () => {
    if (!nc.model) { flash("Model required"); return; }
    const car = { ...nc, id: `m${Date.now()}`, price: +nc.price, km: +nc.km, year: +nc.year, owners: +nc.owners, images: [], scraped_at: new Date().toISOString(), created_at: new Date().toISOString() };
    setCars(p => [car, ...p]);
    try { await supabase.from("cars").upsert(car, { onConflict: "id" }); } catch {}
    setNc(emptyNew); setShowAdd(false); flash("Added!");
  };
  const delCar = async (id: string) => {
    setCars(p => p.filter(c => c.id !== id));
    try { await supabase.from("cars").delete().eq("id", id); } catch {}
    flash("Removed");
  };

  // ─── Process ───
  const processed = cars
    .map(c => ({ ...c, score: scoreCar(c, prefs), insights: generateInsights(c, prefs) }))
    .filter(c => {
      if (search && !c.model.toLowerCase().includes(search.toLowerCase())) return false;
      if (fFuel !== "All" && c.fuel !== fFuel) return false;
      if (fStage !== "All" && (c.stage || "discovered") !== fStage) return false;
      if (fHunter === "diesel" && !isDieselHunterMatch(c, prefs)) return false;
      if (fHunter === "pickup" && !isPickupHunterMatch(c, prefs)) return false;
      if (fHunter === "4x4" && !is4x4HunterMatch(c, prefs)) return false;
      return true;
    })
    .sort((a, b) => sort === "score" ? b.score - a.score : sort === "price_low" ? a.price - b.price : sort === "price_high" ? b.price - a.price : sort === "km" ? a.km - b.km : b.year - a.year);

  const sCol = (s: number) => s >= 80 ? "#16a34a" : s >= 60 ? "#ca8a04" : s >= 40 ? "#ea580c" : "#dc2626";

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center"><div className="text-5xl mb-4 animate-bounce">🚗</div><p className="text-lg font-semibold" style={{ color: "var(--accent)" }}>Loading...</p></div>
    </div>
  );

  // ═══════════════════════════════════════
  // GRID VIEW
  // ═══════════════════════════════════════
  const Grid = () => (
    <div>
      {/* Hunter Quick Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { id: "All", label: `All (${cars.length})`, icon: "📋" },
          { id: "diesel", label: `Diesel 2L+ (${cars.filter(c => isDieselHunterMatch(c, prefs)).length})`, icon: "🏴" },
          { id: "pickup", label: `Pickups (${cars.filter(c => isPickupHunterMatch(c, prefs)).length})`, icon: "🛻" },
          { id: "4x4", label: `4x4/AWD (${cars.filter(c => is4x4HunterMatch(c, prefs)).length})`, icon: "🏔" },
        ].map(h => (
          <button key={h.id} onClick={() => setFHunter(fHunter === h.id ? "All" : h.id)}
            className="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap"
            style={{ borderColor: fHunter === h.id ? "var(--accent)" : "var(--border)", background: fHunter === h.id ? "var(--accent)" : "var(--card)", color: fHunter === h.id ? "#fff" : "var(--text)" }}>
            {h.icon} {h.label}
          </button>
        ))}
      </div>

      {/* Search + Sort + Actions */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--muted)" }}>🔍</span>
          <input className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none" placeholder="Search any car..."
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="px-3 py-2.5 rounded-xl text-xs outline-none cursor-pointer"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
          value={sort} onChange={e => setSort(e.target.value)}>
          <option value="score">Best Match</option>
          <option value="price_low">Price: Low → High</option>
          <option value="price_high">Price: High → Low</option>
          <option value="km">Lowest KM</option>
          <option value="year">Newest First</option>
        </select>
        <select className="px-3 py-2.5 rounded-xl text-xs outline-none cursor-pointer"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
          value={fFuel} onChange={e => setFFuel(e.target.value)}>
          <option value="All">All Fuels</option>
          {[...new Set(cars.map(c => c.fuel))].map(f => <option key={f}>{f}</option>)}
        </select>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2.5 rounded-xl text-xs font-bold" style={{ background: "var(--accent)", color: "#fff" }}>+ Add Car</button>
        <button onClick={runScrape} disabled={scraping} className="px-4 py-2.5 rounded-xl text-xs font-bold border"
          style={{ borderColor: scraping ? "#16a34a" : "var(--border)", color: scraping ? "#16a34a" : "var(--muted)" }}>
          {scraping ? "⏳ Scraping..." : "🕷 Find Cars"}
        </button>
      </div>

      {/* Stage Pills */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        <button onClick={() => setFStage("All")} className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold"
          style={{ background: fStage === "All" ? "var(--accent)" : "var(--card)", color: fStage === "All" ? "#fff" : "var(--muted)", border: "1px solid var(--border)" }}>
          All
        </button>
        {SCOUT_STAGES.map(s => {
          const cnt = processed.filter(c => (c.stage || "discovered") === s.id).length;
          if (!cnt) return null;
          return (
            <button key={s.id} onClick={() => setFStage(fStage === s.id ? "All" : s.id)}
              className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold"
              style={{ background: fStage === s.id ? s.color : "var(--card)", color: fStage === s.id ? "#fff" : "var(--muted)", border: `1px solid ${fStage === s.id ? s.color : "var(--border)"}` }}>
              {s.icon} {s.label} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>{processed.length} cars found</p>

      {/* ─── CAR GRID ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {processed.map(car => {
          const dep = calcDepreciation(car);
          const trust = SOURCE_TRUST[car.source];
          const dist = getDistance(prefs.base_city || "Chennai", car.city);
          const distL = getDistanceLabel(dist);
          const stage = SCOUT_STAGES.find(s => s.id === (car.stage || "discovered"));
          const img = (car.images?.length ? car.images[0] : "") || carImg(car.model, car.color);
          const isDH = isDieselHunterMatch(car, prefs);
          const isPH = isPickupHunterMatch(car, prefs);
          const is4H = is4x4HunterMatch(car, prefs);
          const fresh = isNew(car.scraped_at || car.created_at);

          return (
            <div key={car.id} className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-xl group"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              onClick={() => { setSel(car); setView("detail"); setTab("info"); }}>

              {/* Image */}
              <div className="relative h-44 overflow-hidden" style={{ background: "var(--deep)" }}>
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { e.currentTarget.src = carImg(car.model, car.color); e.currentTarget.onerror = null; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🚗</div>
                )}
                {/* Score badge */}
                <div className="absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold text-white shadow-lg" style={{ background: sCol(car.score) }}>{car.score}</div>
                {/* Badges */}
                <div className="absolute top-3 right-3 flex gap-1">
                  {fresh && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500 text-white">NEW</span>}
                  {isDH && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">🏴 2L+</span>}
                  {isPH && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-600 text-white">🛻</span>}
                  {is4H && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">4x4</span>}
                </div>
                {/* Stage */}
                <div className="absolute bottom-3 left-3">
                  <span className="px-2 py-1 rounded-md text-[10px] font-semibold backdrop-blur-sm" style={{ background: (stage?.color || "#666") + "cc", color: "#fff" }}>
                    {stage?.icon} {stage?.label}
                  </span>
                </div>
                {/* Time */}
                {car.scraped_at && (
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-1 rounded-md text-[10px] backdrop-blur-sm" style={{ background: "#000a", color: "#ccc" }}>{timeAgo(car.scraped_at)}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm leading-tight truncate" style={{ color: "var(--text)" }}>{car.model}</h3>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--muted)" }}>{car.year} · {car.city} · {car.source}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-extrabold" style={{ color: "var(--accent)" }}>₹{(car.price / 100000).toFixed(1)}L</div>
                    {dep && dep.depPct >= 25 && <div className="text-[10px] font-semibold text-green-600">↓{dep.depPct}% off new</div>}
                  </div>
                </div>

                {/* Quick specs */}
                <div className="flex gap-2 mt-3 text-[11px] flex-wrap" style={{ color: "var(--muted)" }}>
                  <span>{(car.km / 1000).toFixed(0)}k km</span>
                  <span>·</span>
                  <span>{car.fuel}</span>
                  <span>·</span>
                  <span>{car.transmission}</span>
                  {car.owners && <><span>·</span><span>{car.owners} owner{car.owners > 1 ? "s" : ""}</span></>}
                  {dist < 9999 && dist > 0 && <><span>·</span><span style={{ color: distL.color }}>{dist}km</span></>}
                </div>

                {/* Quick insights count */}
                <div className="flex justify-between items-center mt-3">
                  <div className="flex gap-3 text-[11px]">
                    <span className="text-green-600 font-semibold">✓ {car.insights.whyBuy.length} pros</span>
                    <span className="text-red-500 font-semibold">✕ {car.insights.whyNot.length} cons</span>
                    {ai[car.id] && <span className="font-bold" style={{ color: ai[car.id].verdict === "BUY" ? "#16a34a" : ai[car.id].verdict === "SKIP" ? "#dc2626" : "#ca8a04" }}>AI: {ai[car.id].verdict}</span>}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--deep)", color: "var(--muted)", border: "1px solid var(--border)" }}>{car.source}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!processed.length && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-semibold" style={{ color: "var(--muted)" }}>No cars match your filters</p>
          <button onClick={() => { setSearch(""); setFFuel("All"); setFStage("All"); setFHunter("All"); }} className="mt-3 text-sm underline" style={{ color: "var(--accent)" }}>Clear all filters</button>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════
  // DETAIL VIEW (Tabbed)
  // ═══════════════════════════════════════
  const Detail = () => {
    if (!sel) return null;
    const car = { ...sel, score: scoreCar(sel, prefs), insights: generateInsights(sel, prefs) };
    const intel = findModelIntel(car.model);
    const dep = calcDepreciation(car);
    const trust = SOURCE_TRUST[car.source];
    const a = ai[car.id];
    const img = (car.images?.length ? car.images[0] : "") || carImg(car.model, car.color);
    const dist = getDistance(prefs.base_city || "Chennai", car.city);
    const distL = getDistanceLabel(dist);
    const cp = ckProg(car.id);
    const disp = getDisplacement(car.model);

    return (
      <div>
        <button onClick={() => setView("grid")} className="mb-4 text-sm font-semibold flex items-center gap-1" style={{ color: "var(--accent)" }}>← Back to list</button>

        {/* Hero */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="relative h-56 sm:h-72" style={{ background: "var(--deep)" }}>
            {img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt={car.model} className="w-full h-full object-cover" onError={e => { e.currentTarget.src = carImg(car.model, car.color); e.currentTarget.onerror = null; }} />
            )}
            <div className="absolute bottom-0 left-0 right-0 p-5" style={{ background: "linear-gradient(transparent, #000c)" }}>
              <h1 className="text-2xl font-extrabold text-white">{car.model}</h1>
              <p className="text-white/70 text-sm">{car.variant} · {car.year} · {car.city}</p>
            </div>
            <div className="absolute top-4 left-4 w-14 h-14 rounded-full flex items-center justify-center text-lg font-extrabold text-white shadow-xl" style={{ background: sCol(car.score) }}>{car.score}</div>
            {car.scraped_at && <span className="absolute top-4 right-4 px-2 py-1 rounded-md text-xs backdrop-blur-sm" style={{ background: "#000a", color: "#ccc" }}>{timeAgo(car.scraped_at)}</span>}
          </div>

          <div className="p-5">
            {/* Price + Stage + Actions */}
            <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
              <div>
                <div className="text-3xl font-extrabold" style={{ color: "var(--accent)" }}>₹{(car.price / 100000).toFixed(1)}L</div>
                {dep && <p className="text-sm mt-1"><span className="text-green-600 font-semibold">Save ₹{(dep.savedAmt / 100000).toFixed(1)}L</span> <span style={{ color: "var(--muted)" }}>({dep.depPct}% off ₹{(dep.avgNew / 100000).toFixed(0)}L new)</span></p>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* Always show a link — either direct listing or search on source */}
                {(() => {
                  if (car.link) return <a href={car.link} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "var(--accent)" }}>View Listing ↗</a>;
                  // Generate search URL based on source
                  const modelSlug = encodeURIComponent(car.model.split(" ").slice(0, 3).join(" "));
                  const citySlug = (car.city || "chennai").toLowerCase();
                  const searchUrls: Record<string, string> = {
                    "Cars24": `https://www.cars24.com/buy-used-cars-${citySlug}/?q=${modelSlug}`,
                    "Spinny": `https://www.spinny.com/used-cars/${citySlug}/?q=${modelSlug}`,
                    "CarDekho": `https://www.cardekho.com/used-cars+in+${citySlug}/${modelSlug}`,
                    "OLX": `https://www.olx.in/items/q-${modelSlug}`,
                    "Toyota U Trust": `https://www.toyotautrust.in/used-cars/${citySlug}`,
                    "Mahindra First Choice": `https://www.mahindrafirstchoice.com/used-cars/${citySlug}`,
                    "Das WeltAuto": `https://www.dasweltauto.co.in/search`,
                    "Hyundai H Promise": `https://www.hyundai.com/in/en/find-a-car/hpromise`,
                    "Team-BHP": `https://www.team-bhp.com/forum/classifieds/`,
                    "Facebook Marketplace": `https://www.facebook.com/marketplace/search/?query=${modelSlug}`,
                    "Facebook Group": `https://www.facebook.com/search/groups/?q=${modelSlug}+for+sale`,
                  };
                  const url = searchUrls[car.source] || `https://www.google.com/search?q=${modelSlug}+used+car+${citySlug}+for+sale`;
                  return <a href={url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl text-xs font-bold border" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>🔍 Search on {car.source} ↗</a>;
                })()}
                {car.seller_phone && <a href={`tel:${car.seller_phone}`} className="px-4 py-2 rounded-xl text-xs font-bold bg-green-600 text-white">📞 Call Seller</a>}
              </div>
            </div>

            {/* Stage selector */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
              {SCOUT_STAGES.map(s => (
                <button key={s.id} onClick={() => updateStage(car.id, s.id)}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold border"
                  style={{ borderColor: (car.stage || "discovered") === s.id ? s.color : "var(--border)", background: (car.stage || "discovered") === s.id ? s.color + "20" : "transparent", color: (car.stage || "discovered") === s.id ? s.color : "var(--muted)" }}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            {/* Quick specs */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {([["Year", car.year], ["KM", (car.km || 0).toLocaleString()], ["Fuel", car.fuel], ["Trans", car.transmission], ["Drive", car.drivetrain], ["Owners", car.owners], ["Reg", car.reg_state], ["Dist", dist < 9999 ? `${dist}km` : "—"]] as [string, any][]).map(([l, v]) => (
                <div key={l}><div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>{l}</div><div className="text-sm font-semibold">{v}</div></div>
              ))}
            </div>

            {/* Seller info */}
            {(car.seller_name || car.seller_phone) && (
              <div className="mt-4 p-3 rounded-xl flex items-center gap-3" style={{ background: "var(--deep)", border: "1px solid var(--border)" }}>
                <span>👤</span>
                <div>
                  {car.seller_name && <div className="text-sm font-semibold">{car.seller_name}</div>}
                  {car.seller_phone && <div className="text-xs" style={{ color: "var(--accent)" }}>{car.seller_phone}</div>}
                  {car.seller_type && car.seller_type !== "unknown" && <div className="text-[10px]" style={{ color: "var(--muted)" }}>{car.seller_type}</div>}
                </div>
              </div>
            )}

            {/* Trust + Distance */}
            <div className="flex gap-3 mt-4 flex-wrap">
              {trust && <span className="px-3 py-1.5 rounded-lg text-[11px] font-semibold" style={{ background: "var(--deep)", border: "1px solid var(--border)" }}>{trust.label} · {trust.desc}</span>}
              {dist > 0 && dist < 9999 && <span className="px-3 py-1.5 rounded-lg text-[11px] font-semibold" style={{ background: "var(--deep)", border: "1px solid var(--border)", color: distL.color }}>📍 {distL.label}</span>}
              {disp > 0 && <span className="px-3 py-1.5 rounded-lg text-[11px] font-semibold" style={{ background: "var(--deep)", border: "1px solid var(--border)" }}>🔧 {(disp/1000).toFixed(1)}L engine</span>}
            </div>

            {car.notes && <p className="mt-4 text-xs leading-relaxed p-3 rounded-xl" style={{ background: "var(--deep)", color: "var(--muted)" }}>📝 {car.notes}</p>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: "var(--deep)" }}>
          {([["info", "📊 Analysis"], ["insights", "💡 Insights"], ["checklist", `☑ Checklist (${cp.p}%)`], ["ai", "🤖 AI"]] as [string, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id as any)} className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: tab === id ? "var(--card)" : "transparent", color: tab === id ? "var(--text)" : "var(--muted)", boxShadow: tab === id ? "0 1px 3px #0002" : "none" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {tab === "info" && intel && (
            <div>
              <h3 className="text-sm font-bold mb-3">Model Intelligence</h3>
              <div className="grid grid-cols-5 gap-3 mb-4">
                {([["Reliability", intel.intel.reliability], ["Resale", intel.intel.resale], ["Parts", intel.intel.parts], ["Community", intel.intel.community], ["Mods", intel.intel.modPotential]] as [string, number][]).map(([l, v]) => (
                  <div key={l} className="text-center p-2 rounded-xl" style={{ background: "var(--deep)" }}>
                    <div className="text-xl font-bold" style={{ color: v >= 7 ? "#16a34a" : v >= 5 ? "#ca8a04" : "#dc2626" }}>{v}</div>
                    <div className="text-[10px]" style={{ color: "var(--muted)" }}>{l}</div>
                  </div>
                ))}
              </div>
              {intel.intel.avgServiceCost && <p className="text-xs" style={{ color: "var(--muted)" }}>Avg service: <strong>{intel.intel.avgServiceCost}</strong></p>}
              {intel.intel.inspectSpecial && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold mb-2" style={{ color: "var(--accent)" }}>🔧 Model-specific inspection points</h4>
                  {intel.intel.inspectSpecial.map((x, i) => <p key={i} className="text-xs py-1.5 border-b" style={{ color: "var(--muted)", borderColor: "var(--border)" }}>{x}</p>)}
                </div>
              )}
            </div>
          )}
          {tab === "info" && !intel && <p className="text-sm" style={{ color: "var(--muted)" }}>No model intelligence available for this car.</p>}

          {tab === "insights" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-bold mb-3 text-green-600">✓ Why Buy ({car.insights.whyBuy.length})</h3>
                {car.insights.whyBuy.map((x: string, i: number) => <div key={i} className="p-2.5 rounded-lg mb-2 text-xs leading-relaxed border-l-[3px] border-green-500" style={{ background: "#16a34a10" }}>{x}</div>)}
                {!car.insights.whyBuy.length && <p className="text-xs" style={{ color: "var(--muted)" }}>No strong buy signals</p>}
              </div>
              <div>
                <h3 className="text-sm font-bold mb-3 text-red-500">✕ Why Not ({car.insights.whyNot.length})</h3>
                {car.insights.whyNot.map((x: string, i: number) => <div key={i} className="p-2.5 rounded-lg mb-2 text-xs leading-relaxed border-l-[3px] border-red-500" style={{ background: "#dc262610" }}>{x}</div>)}
                {!car.insights.whyNot.length && <p className="text-xs" style={{ color: "var(--muted)" }}>No major red flags</p>}
              </div>
            </div>
          )}

          {tab === "checklist" && (
            <div>
              <div className="w-full h-2 rounded-full mb-4" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${cp.p}%`, background: cp.p >= 80 ? "#16a34a" : "var(--accent)" }} />
              </div>
              {CHECKLIST_TEMPLATE.map(cat => (
                <div key={cat.cat} className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2">{cat.cat}</h4>
                  {cat.items.map(item => (
                    <label key={item} className="flex gap-2 py-1.5 cursor-pointer text-xs items-start" style={{ color: ck(car.id, cat.cat, item) ? "#16a34a" : "var(--muted)", textDecoration: ck(car.id, cat.cat, item) ? "line-through" : "none" }}>
                      <input type="checkbox" checked={ck(car.id, cat.cat, item)} onChange={() => toggleCk(car.id, cat.cat, item)} className="mt-0.5" />
                      {item}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}

          {tab === "ai" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold">🤖 AI Deep Analysis</h3>
                <button onClick={() => runAi(car)} disabled={aiLoading[car.id]} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: "var(--accent)", color: "#fff" }}>
                  {aiLoading[car.id] ? "Analyzing..." : a ? "Re-analyze" : "Run Analysis"}
                </button>
              </div>
              {a && a.verdict !== "ERROR" ? (
                <div>
                  <div className="flex gap-3 items-center mb-4">
                    <span className="px-4 py-2 rounded-xl text-base font-extrabold text-white" style={{ background: a.verdict === "BUY" ? "#16a34a" : a.verdict === "SKIP" ? "#dc2626" : "#ca8a04" }}>{a.verdict}</span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>Confidence: <strong>{a.confidence}/10</strong></span>
                    {a.fair_price && <span className="text-xs" style={{ color: "var(--accent)" }}>Fair value: {a.fair_price}</span>}
                  </div>
                  <p className="text-sm leading-relaxed mb-4">{a.summary}</p>
                  {([["Hidden Costs (Year 1)", a.hidden_costs], ["Negotiation Tip", a.negotiation_tip], ["Must Inspect", a.check_these], ["3-5 Year Outlook", a.long_term]] as [string, string][]).map(([l, v]) => v ? (
                    <div key={l} className="mb-3">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--accent)" }}>{l}</h4>
                      <p className="text-xs leading-relaxed p-3 rounded-xl" style={{ background: "var(--deep)", color: "var(--muted)" }}>{v}</p>
                    </div>
                  ) : null)}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--muted)" }}>{a?.summary || "Click 'Run Analysis' for Claude-powered deep analysis — verdict, negotiation tips, hidden costs, and fair price estimate."}</p>
              )}
            </div>
          )}
        </div>

        <button onClick={() => { delCar(car.id); setView("grid"); }} className="mt-4 text-xs underline" style={{ color: "#dc2626" }}>Remove this car</button>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // PREFERENCES
  // ═══════════════════════════════════════
  const Prefs = () => (
    <div className="space-y-4">
      {([
        ["Budget", (
          <div key="b" className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "var(--muted)" }}>Min (₹)</label><input type="number" value={prefs.budget_min} onChange={e => savePrefs({ ...prefs, budget_min: +e.target.value })} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--deep)", border: "1px solid var(--border)", color: "var(--text)" }} /><span className="text-[10px]" style={{ color: "var(--muted)" }}>₹{(prefs.budget_min/100000).toFixed(1)}L</span></div>
            <div><label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "var(--muted)" }}>Max (₹)</label><input type="number" value={prefs.budget_max} onChange={e => savePrefs({ ...prefs, budget_max: +e.target.value })} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--deep)", border: "1px solid var(--border)", color: "var(--text)" }} /><span className="text-[10px]" style={{ color: "var(--muted)" }}>₹{(prefs.budget_max/100000).toFixed(1)}L</span></div>
          </div>
        )],
        ["Location", (
          <div key="l" className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "var(--muted)" }}>Base City</label><select value={prefs.base_city} onChange={e => savePrefs({ ...prefs, base_city: e.target.value })} className="w-full px-3 py-2 rounded-xl text-sm cursor-pointer outline-none" style={{ background: "var(--deep)", border: "1px solid var(--border)", color: "var(--text)" }}>{BASE_LOCATIONS.map(l => <option key={l.id} value={l.city}>{l.label}</option>)}</select></div>
            <div><label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "var(--muted)" }}>Radius</label><select value={prefs.search_radius} onChange={e => savePrefs({ ...prefs, search_radius: +e.target.value })} className="w-full px-3 py-2 rounded-xl text-sm cursor-pointer outline-none" style={{ background: "var(--deep)", border: "1px solid var(--border)", color: "var(--text)" }}><option value={200}>200km</option><option value={400}>400km</option><option value={600}>600km</option><option value={1000}>1000km</option><option value={9999}>All India</option></select></div>
          </div>
        )],
        ["Fuel Preference", (
          <div key="f" className="flex gap-2 flex-wrap">
            {["Diesel", "Petrol", "Hybrid", "Electric"].map(f => <button key={f} onClick={() => savePrefs({ ...prefs, fuel_pref: prefs.fuel_pref?.includes(f) ? prefs.fuel_pref.filter(x => x !== f) : [...(prefs.fuel_pref||[]), f] })} className="px-4 py-2 rounded-xl text-xs font-semibold border" style={{ borderColor: prefs.fuel_pref?.includes(f) ? "var(--accent)" : "var(--border)", background: prefs.fuel_pref?.includes(f) ? "var(--accent)" : "var(--card)", color: prefs.fuel_pref?.includes(f) ? "#fff" : "var(--muted)" }}>{f}</button>)}
          </div>
        )],
        ["Hunters", (
          <div key="h" className="space-y-2">
            {([
              ["diesel_hunter", "🏴 Diesel Hunter", "Highlight diesel 2L+ engines", prefs.diesel_hunter],
              ["pickup_hunter", "🛻 Pickup Hunter", "Flag Isuzu, Hilux, Tata pickups", prefs.pickup_hunter],
              ["fourx4_hunter", "🏔 4x4/AWD Hunter", "Flag all 4WD/AWD capable vehicles", prefs.fourx4_hunter],
            ] as [string, string, string, boolean][]).map(([key, label, desc, val]) => (
              <div key={key} className="flex justify-between items-center p-3 rounded-xl" style={{ background: "var(--deep)", border: "1px solid var(--border)" }}>
                <div><div className="text-sm font-semibold">{label}</div><div className="text-[11px]" style={{ color: "var(--muted)" }}>{desc}</div></div>
                <button onClick={() => savePrefs({ ...prefs, [key]: !val })} className="px-4 py-1.5 rounded-lg text-xs font-bold" style={{ background: val ? "#16a34a" : "var(--border)", color: val ? "#fff" : "var(--muted)" }}>{val ? "ON" : "OFF"}</button>
              </div>
            ))}
          </div>
        )],
      ] as [string, React.ReactNode][]).map(([title, content]) => (
        <div key={title} className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--accent)" }}>{title}</h3>
          {content}
        </div>
      ))}
    </div>
  );

  // ═══════════════════════════════════════
  // ADD CAR MODAL
  // ═══════════════════════════════════════
  const AddModal = () => !showAdd ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#0009" }} onClick={() => setShowAdd(false)}>
      <div className="rounded-2xl p-6 max-w-xl w-full max-h-[85vh] overflow-auto" style={{ background: "var(--card)", border: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4" style={{ color: "var(--accent)" }}>Add a Car</h3>
        <div className="grid grid-cols-2 gap-3">
          {([["model","Model *","text","Toyota Fortuner 2.8 AT"],["variant","Variant","text",""],["year","Year","number","2023"],["km","KM","number",""],["price","Price ₹","number",""],["city","City","text","Chennai"],["link","Listing URL","text","https://..."],["seller_name","Seller Name","text",""],["seller_phone","Phone","text","+91"],["color","Color","text",""]] as [string,string,string,string][]).map(([k,l,t,p]) => (
            <div key={k}><label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "var(--muted)" }}>{l}</label><input type={t} placeholder={p} value={nc[k]} onChange={e => setNc({...nc,[k]:e.target.value})} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--deep)", border: "1px solid var(--border)", color: "var(--text)" }} /></div>
          ))}
          {([["fuel",["Diesel","Petrol","Hybrid"]],["transmission",["Manual","Automatic"]],["body_type",["SUV","Sedan","MUV","Pickup","Hatchback"]],["drivetrain",["2WD","4WD","AWD"]],["source",["Cars24","Spinny","OLX","Toyota U Trust","Mahindra First Choice","Das WeltAuto","Team-BHP","Facebook Marketplace","Facebook Group","Personal Network","Direct Seller","4x4India","Indian Offroaders","Bank Auction"]]] as [string,string[]][]).map(([k,opts]) => (
            <div key={k}><label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "var(--muted)" }}>{k.replace("_"," ")}</label><select value={nc[k]} onChange={e => setNc({...nc,[k]:e.target.value})} className="w-full px-3 py-2 rounded-xl text-xs cursor-pointer outline-none" style={{ background: "var(--deep)", border: "1px solid var(--border)", color: "var(--text)" }}>{opts.map(o => <option key={o}>{o}</option>)}</select></div>
          ))}
        </div>
        <div className="mt-3"><label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "var(--muted)" }}>Notes</label><textarea value={nc.notes} onChange={e => setNc({...nc,notes:e.target.value})} className="w-full px-3 py-2 rounded-xl text-sm outline-none min-h-[50px] resize-y" style={{ background: "var(--deep)", border: "1px solid var(--border)", color: "var(--text)" }} /></div>
        <div className="flex gap-3 mt-4">
          <button onClick={addCar} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "var(--accent)" }}>Add Car</button>
          <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-xl text-sm" style={{ color: "var(--muted)", border: "1px solid var(--border)" }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  // MAIN
  // ═══════════════════════════════════════
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 px-5 py-3 backdrop-blur-xl" style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold tracking-tight" style={{ color: "var(--accent)" }}>Pre-Worshipped</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--deep)", color: "var(--muted)", border: "1px solid var(--border)" }}>{cars.length} cars</span>
          </div>
          <div className="flex gap-2 items-center">
            <select value={prefs.base_city} onChange={e => savePrefs({...prefs, base_city: e.target.value})} className="px-2 py-1.5 rounded-lg text-[11px] outline-none cursor-pointer" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}>
              {BASE_LOCATIONS.map(l => <option key={l.id} value={l.city}>📍 {l.label}</option>)}
            </select>
            {([["grid", "🏠"], ["prefs", "⚙️"]] as [string, string][]).map(([v, icon]) => (
              <button key={v} onClick={() => setView(v as any)} className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
                style={{ background: (view === v || (v === "grid" && view === "detail")) ? "var(--accent)" : "var(--card)", color: (view === v || (v === "grid" && view === "detail")) ? "#fff" : "var(--muted)", border: "1px solid var(--border)" }}>
                {icon}
              </button>
            ))}
            <button onClick={toggleTheme} className="w-9 h-9 rounded-xl flex items-center justify-center text-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-5">
        {view === "grid" && <Grid />}
        {view === "detail" && <Detail />}
        {view === "prefs" && <Prefs />}
      </div>

      <AddModal />

      {toast && <div className="fixed bottom-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-semibold shadow-xl z-50" style={{ background: "var(--accent)", color: "#fff" }}>{toast}</div>}
    </div>
  );
}
