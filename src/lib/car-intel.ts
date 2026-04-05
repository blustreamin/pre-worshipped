// ─── MODEL INTELLIGENCE DATABASE ───
// This is the brain — all model-specific knowledge lives here

export const MODEL_INTEL: Record<string, {
  reliability: number; resale: number; parts: number; community: number; modPotential: number;
  newPriceRange: [number, number];
  knownIssues: string[];
  strengths: string[];
  dieselBanRisk: boolean;
  avgServiceCost: string;
  inspectSpecial: string[];
}> = {
  "Toyota Fortuner": { reliability: 9, resale: 10, parts: 9, community: 8, modPotential: 7, newPriceRange: [3200000, 5100000], knownIssues: ["Injector failures post 150k km on pre-2016", "Turbo actuator can fail", "Touchscreen lag on 2017 units"], strengths: ["Bulletproof 2.8L diesel", "Best-in-class resale", "Legendary Toyota reliability", "450Nm torque"], dieselBanRisk: true, avgServiceCost: "₹8K–12K/service", inspectSpecial: ["Check turbo actuator play", "Inspect injector spray pattern", "Look for timing belt service records", "Test 4WD engagement"] },
  "Mahindra Thar": { reliability: 7, resale: 9, parts: 8, community: 10, modPotential: 10, newPriceRange: [1100000, 1800000], knownIssues: ["Water leakage in soft-top", "Clutch judder in early 2020 batches", "Infotainment freezes", "Wind noise at highway speeds"], strengths: ["Incredible mod ecosystem", "Diesel torque 300Nm+", "4x4 with low range", "Strong resale", "Head-turning looks"], dieselBanRisk: true, avgServiceCost: "₹5K–8K/service", inspectSpecial: ["Check for water ingress marks under carpets", "Test 4WD low range engagement", "Inspect hardtop seal", "Check clutch bite point"] },
  "Maruti Jimny": { reliability: 8, resale: 7, parts: 9, community: 7, modPotential: 8, newPriceRange: [1230000, 1480000], knownIssues: ["Underpowered NA engine 103bhp", "Large turning circle", "Bouncy ride on highways", "Limited rear space"], strengths: ["AllGrip Pro 4x4 with low range", "Ladder frame", "Suzuki reliability", "Maruti service network"], dieselBanRisk: false, avgServiceCost: "₹3.5K–5K/service", inspectSpecial: ["Check for undercarriage rust (off-road use)", "Test 4WD low range", "Inspect rear leaf springs", "Check tyre wear pattern"] },
  "Skoda Octavia": { reliability: 6, resale: 5, parts: 5, community: 7, modPotential: 8, newPriceRange: [2600000, 3800000], knownIssues: ["DSG mechatronic unit failures", "Costly spares", "DPF issues on diesel", "Electrical gremlins post 80k km"], strengths: ["Best driving dynamics in segment", "180bhp TSI is sublime", "Premium cabin", "Cavernous boot"], dieselBanRisk: true, avgServiceCost: "₹10K–18K/service", inspectSpecial: ["DSG fluid change history is CRITICAL", "Check for mechatronic unit error codes", "Test DSG at low speeds for judder", "Inspect turbo wastegate"] },
  "Hyundai Creta": { reliability: 7, resale: 8, parts: 9, community: 8, modPotential: 5, newPriceRange: [1100000, 2100000], knownIssues: ["Turbo petrol DCT reliability concerns", "Thin paint chips easily", "Average sound insulation"], strengths: ["Feature-loaded", "Strong diesel option", "Good resale", "Comfortable ride", "Wide service network"], dieselBanRisk: true, avgServiceCost: "₹4.5K–7K/service", inspectSpecial: ["If DCT: check clutch pack wear", "Inspect paint for chips and touch-ups", "Test all ADAS sensors", "Check panoramic sunroof drain tubes"] },
  "Volkswagen Taigun": { reliability: 7, resale: 6, parts: 6, community: 6, modPotential: 6, newPriceRange: [1140000, 1920000], knownIssues: ["1.0 TSI can feel strained", "Limited rear legroom", "Sparse features on lower variants"], strengths: ["5-star GNCAP safety", "Best-in-class handling MQB platform", "Solid build quality", "1.5 TSI is excellent"], dieselBanRisk: false, avgServiceCost: "₹5.5K–9K/service", inspectSpecial: ["Check DSG service history", "Test turbo lag response", "Inspect underbody for MQB platform corrosion", "Verify GNCAP safety kit intact"] },
  "Toyota Innova Crysta": { reliability: 9, resale: 10, parts: 9, community: 8, modPotential: 4, newPriceRange: [1980000, 2800000], knownIssues: ["Heavy to drive in city", "Diesel clatter", "3rd row only for kids"], strengths: ["Indestructible diesel", "Best resale in segment", "Captain seats are supreme", "Goes anywhere"], dieselBanRisk: true, avgServiceCost: "₹6K–10K/service", inspectSpecial: ["Check for taxi/fleet use signs", "Inspect injector health", "Test AC from all vents", "Look for body filler"] },
  "Tata Harrier": { reliability: 6, resale: 6, parts: 7, community: 6, modPotential: 5, newPriceRange: [1500000, 2500000], knownIssues: ["FCA-sourced diesel can have injector issues", "Panel gaps", "Infotainment bugs", "Paint quality"], strengths: ["OMEGA platform Land Rover derived", "170bhp diesel is strong", "Imposing road presence"], dieselBanRisk: true, avgServiceCost: "₹5K–8K/service", inspectSpecial: ["Check panel gaps consistency", "Test infotainment for freezing", "Inspect for paint bubbling", "Check diesel particulate filter status"] },
  "Renault Duster": { reliability: 7, resale: 5, parts: 6, community: 5, modPotential: 6, newPriceRange: [1050000, 1850000], knownIssues: ["Renault after-sales inconsistency", "New gen untested long-term", "Resale historically weak"], strengths: ["217mm ground clearance", "1.3 turbo is punchy 130bhp/230Nm", "Excellent chassis tuning"], dieselBanRisk: false, avgServiceCost: "₹4K–6.5K/service", inspectSpecial: ["Check turbo boost pressure", "Inspect clutch if manual", "Test drive on rough roads for suspension noise", "Verify service at authorized center"] },
  "Mahindra XUV700": { reliability: 6, resale: 7, parts: 7, community: 7, modPotential: 5, newPriceRange: [1400000, 2700000], knownIssues: ["Software glitches", "ADAS false alerts", "Build quality inconsistent", "Diesel AT can be jerky"], strengths: ["200bhp diesel is a beast", "ADAS at this price", "Spacious cabin", "Strong value"], dieselBanRisk: true, avgServiceCost: "₹5.5K–9K/service", inspectSpecial: ["Test all ADAS functions", "Check for software update history", "Inspect sunroof drain channels", "Test diesel AT in traffic crawl"] },
  "Honda City": { reliability: 9, resale: 8, parts: 8, community: 7, modPotential: 4, newPriceRange: [1200000, 1700000], knownIssues: ["CVT can feel rubber-bandy", "Road noise", "No diesel option", "Sedan losing to SUVs"], strengths: ["Honda reliability", "i-VTEC is refined", "Excellent ride quality", "Low maintenance"], dieselBanRisk: false, avgServiceCost: "₹3.5K–5.5K/service", inspectSpecial: ["Check CVT fluid condition", "Test AC compressor", "Inspect for accident repair", "Check alloy wheel curb damage"] },
  "Maruti Grand Vitara": { reliability: 8, resale: 8, parts: 9, community: 6, modPotential: 3, newPriceRange: [1100000, 2000000], knownIssues: ["Strong hybrid has no manual", "Mild hybrid AWD is thirsty", "Boot space average"], strengths: ["Strong hybrid gives 27+ kmpl", "AWD option", "Maruti service network", "Toyota hybrid tech"], dieselBanRisk: false, avgServiceCost: "₹3.5K–5.5K/service", inspectSpecial: ["Check hybrid battery health indicator", "Test EV mode engagement", "Inspect AWD coupling if equipped", "Verify Toyota service stamps"] },
  "Jeep Compass": { reliability: 5, resale: 5, parts: 4, community: 5, modPotential: 5, newPriceRange: [1900000, 3200000], knownIssues: ["Electrical issues common", "Expensive maintenance", "Stellantis parts availability", "Infotainment lag"], strengths: ["2.0 diesel is torquey", "Solid highway stability", "Premium badge", "4x4 available"], dieselBanRisk: true, avgServiceCost: "₹10K–16K/service", inspectSpecial: ["Full electrical diagnostic scan MANDATORY", "Check all window motors", "Test 4x4 system thoroughly", "Inspect 9AT gearbox behavior"] },
  "Ford Ecosport": { reliability: 8, resale: 6, parts: 4, community: 7, modPotential: 7, newPriceRange: [800000, 1200000], knownIssues: ["Ford exited India — parts scarce", "Service network shrinking", "No OEM warranty", "Resale dropping"], strengths: ["1.0 Ecoboost is fun", "Solid build", "Great handling", "Enthusiast community keeps it alive"], dieselBanRisk: true, avgServiceCost: "₹4K–7K (if you find parts)", inspectSpecial: ["CRITICAL: verify parts availability locally", "Check Ecoboost turbo health", "Inspect coolant system (known weak point)", "Test all electronics"] },
  "Kia Seltos": { reliability: 7, resale: 8, parts: 8, community: 7, modPotential: 5, newPriceRange: [1100000, 2100000], knownIssues: ["1.4 turbo DCT judder", "Thin paint", "Average NVH", "Clutch wear on DCT"], strengths: ["Feature-rich", "1.5 turbo diesel refined", "Smart hybrid option", "Strong resale"], dieselBanRisk: true, avgServiceCost: "₹4.5K–7K/service", inspectSpecial: ["If DCT: test low-speed crawling for judder", "Check clutch pack wear", "Inspect paint for stone chips", "Test Bose speakers if equipped"] },
  "Tata Nexon": { reliability: 7, resale: 7, parts: 8, community: 7, modPotential: 4, newPriceRange: [800000, 1500000], knownIssues: ["AMT can be jerky", "Build quality inconsistency", "Infotainment lag", "Diesel NVH could be better"], strengths: ["5-star GNCAP safety", "Diesel is torquey", "Feature-loaded", "Good ground clearance"], dieselBanRisk: true, avgServiceCost: "₹4K–6K/service", inspectSpecial: ["Test AMT in stop-go traffic", "Check body panel gap consistency", "Inspect sunroof drain channels", "Test all safety features"] },
  "Mahindra Scorpio N": { reliability: 7, resale: 8, parts: 8, community: 8, modPotential: 7, newPriceRange: [1400000, 2500000], knownIssues: ["Diesel AT jerky at low speeds", "3rd row only for kids", "ADAS calibration issues"], strengths: ["175bhp diesel is strong", "Proper body-on-frame SUV", "4x4 with locking diff", "Imposing road presence"], dieselBanRisk: true, avgServiceCost: "₹5K–8K/service", inspectSpecial: ["Check 4x4 transfer case engagement", "Test ADAS calibration", "Inspect rear leaf springs", "Test diesel AT in crawl mode"] },
  "Skoda Kushaq": { reliability: 6, resale: 6, parts: 6, community: 6, modPotential: 7, newPriceRange: [1070000, 1900000], knownIssues: ["Early batches had EPC light issues", "DSG reliability on early models", "Paint quality average"], strengths: ["MQB platform = excellent handling", "5-star GNCAP", "1.5 TSI is fantastic", "Sunroof now standard"], dieselBanRisk: false, avgServiceCost: "₹5.5K–9K/service", inspectSpecial: ["Check for EPC light error history", "DSG fluid service record critical", "Test turbo boost buildup", "Inspect for underbody stone damage"] },
  "Tata Safari": { reliability: 6, resale: 6, parts: 7, community: 6, modPotential: 5, newPriceRange: [1600000, 2800000], knownIssues: ["Same diesel as Harrier", "Heavy in city", "3rd row tight", "Panel gaps"], strengths: ["Captain seats are luxurious", "170bhp diesel strong", "ADAS on higher trims", "Good highway cruiser"], dieselBanRisk: true, avgServiceCost: "₹5K–8K/service", inspectSpecial: ["Check captain seat mechanisms", "Test 3rd row folding", "Inspect diesel exhaust system", "Full ADAS sensor check"] },
  "Toyota Innova Hycross": { reliability: 9, resale: 9, parts: 9, community: 7, modPotential: 3, newPriceRange: [1900000, 3100000], knownIssues: ["No diesel option", "CVT can feel rubber-bandy", "2nd row access tight vs Crysta"], strengths: ["Strong hybrid 23+ kmpl", "TNGA platform", "Quieter than Crysta", "Excellent resale expected"], dieselBanRisk: false, avgServiceCost: "₹5K–8K/service", inspectSpecial: ["Check hybrid battery health", "Test CVT at low speeds", "Inspect powered ottoman seats", "Verify OTA update history"] },
  "Toyota Hyryder": { reliability: 8, resale: 8, parts: 8, community: 6, modPotential: 3, newPriceRange: [1100000, 2000000], knownIssues: ["Strong hybrid has no manual", "Boot space average", "Cabin feels basic vs Creta"], strengths: ["Toyota badge = trust + resale", "Strong hybrid 27+ kmpl", "AWD option", "Reliable hybrid tech"], dieselBanRisk: false, avgServiceCost: "₹3.5K–5.5K/service", inspectSpecial: ["Check hybrid battery health", "Test EV mode engagement", "Inspect AWD coupling", "Verify Toyota service stamps"] },
  // ─── PICKUP TRUCKS ───
  "Isuzu D-Max": { reliability: 8, resale: 7, parts: 5, community: 5, modPotential: 8, newPriceRange: [1000000, 2500000], knownIssues: ["Limited service network in India", "Ride is truck-harsh", "Cabin feels utilitarian", "Infotainment is basic"], strengths: ["1.9L/3.0L diesel is torquey and proven globally", "True body-on-frame pickup", "Massive payload capacity", "4x4 with locking diff on V-Cross", "Bulletproof drivetrain"], dieselBanRisk: true, avgServiceCost: "₹5K–8K/service", inspectSpecial: ["Check chassis for commercial use wear", "Inspect leaf springs for sagging", "Test 4WD shift-on-fly if equipped", "Check bed liner and tailgate hinges", "Verify service history (limited network = often skipped)"] },
  "Isuzu V-Cross": { reliability: 8, resale: 7, parts: 5, community: 5, modPotential: 9, newPriceRange: [2000000, 2700000], knownIssues: ["Expensive for India", "Ride quality harsh unladen", "Limited dealer network", "Parts take time"], strengths: ["3.0L diesel 163bhp/360Nm", "Proper 4x4 with diff lock", "1 tonne payload", "Global platform proven in Australia/Thailand", "Massive mod potential"], dieselBanRisk: true, avgServiceCost: "₹6K–10K/service", inspectSpecial: ["Check 4WD transfer case operation", "Inspect diff lock engagement", "Look for tow bar stress marks on chassis", "Check turbo boost gauge readings", "Inspect bed for load damage"] },
  "Toyota Hilux": { reliability: 9, resale: 8, parts: 7, community: 6, modPotential: 9, newPriceRange: [3000000, 3800000], knownIssues: ["Very expensive for India market", "Ride is bouncy unladen", "Turning circle is large", "Fuel economy 8-10 kmpl"], strengths: ["2.8L diesel 204bhp/500Nm — same as Fortuner", "Toyota reliability", "Globally proven indestructible platform", "4x4 with locking rear diff", "Best resale of any pickup"], dieselBanRisk: true, avgServiceCost: "₹8K–12K/service", inspectSpecial: ["Check for fleet/commercial use", "Inspect suspension for lifted/modified setups", "Test 4WD and diff lock", "Check bed for heavy load damage", "Verify if mining/construction use"] },
  "Tata Yodha": { reliability: 6, resale: 5, parts: 8, community: 4, modPotential: 5, newPriceRange: [800000, 1200000], knownIssues: ["Commercial vehicle DNA", "Very basic cabin", "Harsh ride", "Not a lifestyle pickup"], strengths: ["Affordable diesel pickup", "2.0L diesel with decent torque", "Tata service network wide", "Payload champion"], dieselBanRisk: true, avgServiceCost: "₹3K–5K/service", inspectSpecial: ["Check for commercial overloading damage", "Inspect chassis for cracks", "Test clutch (often abused)", "Check cab mount bushings"] },
  "Tata Xenon": { reliability: 6, resale: 4, parts: 7, community: 4, modPotential: 5, newPriceRange: [700000, 1100000], knownIssues: ["Discontinued — parts getting scarce", "Very basic by modern standards", "Underpowered", "Ride quality poor"], strengths: ["Cheap to buy used", "2.2L diesel", "Simple to maintain", "Decent off-road"], dieselBanRisk: true, avgServiceCost: "₹3K–5K/service", inspectSpecial: ["Check for commercial fleet use", "Inspect suspension thoroughly", "Verify engine hasn't been overworked", "Check for rust under bed"] },
  "Mahindra Bolero Camper": { reliability: 7, resale: 6, parts: 9, community: 6, modPotential: 6, newPriceRange: [900000, 1300000], knownIssues: ["Very basic commercial vehicle", "Harsh ride", "No modern features", "Cab is cramped"], strengths: ["Bulletproof mHawk diesel", "Mahindra service everywhere", "True workhorse", "Simple mechanicals"], dieselBanRisk: true, avgServiceCost: "₹3K–5K/service", inspectSpecial: ["Check for commercial abuse", "Inspect leaf springs", "Test 4WD if equipped", "Check for welding repairs on chassis"] },
  "Force Gurkha": { reliability: 6, resale: 6, parts: 5, community: 7, modPotential: 9, newPriceRange: [1500000, 1800000], knownIssues: ["Build quality inconsistent", "Very utilitarian cabin", "Fuel economy poor", "NVH is high"], strengths: ["Mercedes-derived 2.6L diesel", "Proper 4x4 with low range + diff locks", "Extreme off-road capability", "Unique military-inspired design"], dieselBanRisk: true, avgServiceCost: "₹5K–9K/service", inspectSpecial: ["Check all diff locks engage properly", "Inspect for off-road damage underneath", "Test low range transfer case", "Check for water ingress"] },
  "Mahindra Thar ROXX": { reliability: 7, resale: 8, parts: 8, community: 9, modPotential: 8, newPriceRange: [1300000, 2300000], knownIssues: ["New model — long-term unknown", "Waiting period was huge", "Some early batch issues reported", "Heavier than 3-door"], strengths: ["5-door practical Thar", "2.2L diesel 175bhp", "4x4 with crawl mode", "Modern cabin with ADAS", "Best of both worlds"], dieselBanRisk: true, avgServiceCost: "₹5K–8K/service", inspectSpecial: ["Check for early batch build issues", "Test ADAS calibration", "Verify 4x4 crawl mode", "Check door alignment (new platform)"] },
};

// ─── SOURCE TRUST TIERS ───
export const SOURCE_TRUST: Record<string, { tier: number; label: string; premiumPct: number; desc: string }> = {
  "Personal Network": { tier: 1, label: "🟢 Highest Trust", premiumPct: -5, desc: "Friends/family — genuine history insight" },
  "Toyota U Trust": { tier: 2, label: "🟢 OEM Certified", premiumPct: 7, desc: "203-point inspection, 2yr/30k warranty" },
  "Das WeltAuto": { tier: 2, label: "🟢 OEM Certified", premiumPct: 5, desc: "160+ checks, 12-month warranty" },
  "Hyundai H Promise": { tier: 2, label: "🟢 OEM Certified", premiumPct: 6, desc: "147-point check" },
  "Maruti True Value": { tier: 2, label: "🟢 OEM Certified", premiumPct: 6, desc: "376-point digital evaluation" },
  "Mahindra First Choice": { tier: 2, label: "🟢 OEM Certified", premiumPct: 5, desc: "118-point inspection" },
  "Honda Auto Terrace": { tier: 2, label: "🟢 OEM Certified", premiumPct: 5, desc: "Honda pre-owned program" },
  "Isuzu Certified": { tier: 2, label: "🟢 OEM Certified", premiumPct: 5, desc: "Isuzu pre-owned with warranty" },
  "Cars24": { tier: 3, label: "🟡 Platform", premiumPct: 10, desc: "300-point inspection, ~10% premium" },
  "Spinny": { tier: 3, label: "🟡 Platform", premiumPct: 12, desc: "Fixed-price, 5-day return, highest premium" },
  "CarDekho": { tier: 3, label: "🟡 Platform", premiumPct: 5, desc: "Aggregator" },
  "CarTrade": { tier: 3, label: "🟡 Platform", premiumPct: 5, desc: "Multi-city dealer network" },
  "Droom": { tier: 3, label: "🟡 Platform", premiumPct: 3, desc: "ECO inspection, Orange Book Value" },
  "CarWale": { tier: 3, label: "🟡 Platform", premiumPct: 4, desc: "Dealer listings aggregator" },
  // Forums & Enthusiast
  "Team-BHP": { tier: 2, label: "🟢 Enthusiast", premiumPct: -3, desc: "Well-maintained enthusiast cars, best deals" },
  "4x4India": { tier: 2, label: "🟢 Enthusiast", premiumPct: -5, desc: "Off-road community — 4x4/pickup specialists" },
  "Xbhp": { tier: 2, label: "🟢 Enthusiast", premiumPct: -3, desc: "Automotive enthusiast forum" },
  "Rushlane Forum": { tier: 3, label: "🟡 Forum", premiumPct: -2, desc: "Auto news forum with classifieds" },
  "Indian Offroaders": { tier: 2, label: "🟢 Enthusiast", premiumPct: -5, desc: "4x4 and off-road community — gold for pickup trucks" },
  // Marketplaces
  "OLX": { tier: 5, label: "🔴 Marketplace", premiumPct: -8, desc: "Cheapest but zero safety net" },
  "Facebook Marketplace": { tier: 5, label: "🔴 Marketplace", premiumPct: -10, desc: "Widest reach, zero vetting" },
  "Facebook Group": { tier: 3, label: "🟡 Community", premiumPct: -5, desc: "Model-specific groups — knowledgeable sellers" },
  "Instagram": { tier: 5, label: "🔴 Social", premiumPct: -5, desc: "DM-based deals, no protection" },
  "Quikr": { tier: 5, label: "🔴 Marketplace", premiumPct: -8, desc: "Declining but still has listings" },
  // Direct
  "Independent Dealer": { tier: 4, label: "🟠 Dealer", premiumPct: 0, desc: "Negotiate hard, inspect harder" },
  "Direct Seller": { tier: 4, label: "🟠 Direct", premiumPct: -5, desc: "Cut the middleman" },
  "Army Canteen / Govt Auction": { tier: 3, label: "🟡 Auction", premiumPct: -15, desc: "Government/military disposals — great condition, low price" },
  "Bank Auction": { tier: 4, label: "🟠 Auction", premiumPct: -20, desc: "Repossessed vehicles — cheap but no warranty" },
  "New (Showroom)": { tier: 0, label: "⚪ New Car", premiumPct: 0, desc: "Baseline comparison" },
};

// ─── SCOUTING STAGES ───
export const SCOUT_STAGES = [
  { id: "discovered", label: "Discovered", icon: "👁", color: "#64748b" },
  { id: "watching", label: "Watching", icon: "👀", color: "#3b82f6" },
  { id: "shortlisted", label: "Shortlisted", icon: "⭐", color: "#d4a843" },
  { id: "contacted", label: "Contacted", icon: "📞", color: "#a78bfa" },
  { id: "inspected", label: "Inspected", icon: "🔍", color: "#34d399" },
  { id: "passed", label: "Passed", icon: "❌", color: "#f87171" },
];

// ─── CHECKLIST TEMPLATE ───
export const CHECKLIST_TEMPLATE = [
  { cat: "Documents", items: ["RC book original verified", "Insurance validity checked", "Service history available", "NOC obtained (if out-of-state)", "Loan clearance certificate", "Pollution certificate valid"] },
  { cat: "Inspection", items: ["Third-party inspection at authorized service center", "OBD scanner diagnostic completed", "Accidental damage check (body filler, paint mismatch)", "Underbody rust and corrosion inspection", "Suspension check (bounce test, noise)", "Tyre condition and wear pattern", "All fluids checked"] },
  { cat: "Test Drive", items: ["Cold start observed", "City driving tested", "Highway tested (80+ kmph)", "Braking tested", "AC tested on max", "All gears/modes tested", "Infotainment and electronics working"] },
  { cat: "Dealer Eval", items: ["Asked about accident history — got clear answer", "Verified owner count with RC", "Dealer was transparent about known issues", "No pressure to close deal immediately", "Written warranty offered"] },
  { cat: "Financial", items: ["Compared price with 3+ similar listings", "Checked OBV/Blue Book value", "Insurance transfer cost estimated", "RTO transfer cost calculated", "Negotiated from initial asking price"] },
];

// ─── FUNCTIONS ───

export function findModelIntel(model: string) {
  const entry = Object.entries(MODEL_INTEL).find(([k]) => model?.includes(k));
  return entry ? { key: entry[0], intel: entry[1] } : null;
}

export function calcDepreciation(car: { model: string; price: number; year: number }) {
  const found = findModelIntel(car.model);
  if (!found) return null;
  const avgNew = (found.intel.newPriceRange[0] + found.intel.newPriceRange[1]) / 2;
  const depPct = Math.round(((avgNew - car.price) / avgNew) * 100);
  const savedAmt = avgNew - car.price;
  return { avgNew, depPct, savedAmt, perYear: Math.round(depPct / Math.max(1, 2026 - car.year)) };
}

// ─── LOCATION SYSTEM ───
// Coordinates of major Indian cities + distance calculator

export const CITY_COORDS: Record<string, { lat: number; lng: number; state: string }> = {
  "Chennai": { lat: 13.0827, lng: 80.2707, state: "TN" },
  "Bangalore": { lat: 12.9716, lng: 77.5946, state: "KA" },
  "Bengaluru": { lat: 12.9716, lng: 77.5946, state: "KA" },
  "Mumbai": { lat: 19.0760, lng: 72.8777, state: "MH" },
  "Delhi": { lat: 28.6139, lng: 77.2090, state: "DL" },
  "New Delhi": { lat: 28.6139, lng: 77.2090, state: "DL" },
  "Hyderabad": { lat: 17.3850, lng: 78.4867, state: "TS" },
  "Pune": { lat: 18.5204, lng: 73.8567, state: "MH" },
  "Kolkata": { lat: 22.5726, lng: 88.3639, state: "WB" },
  "Coimbatore": { lat: 11.0168, lng: 76.9558, state: "TN" },
  "Madurai": { lat: 9.9252, lng: 78.1198, state: "TN" },
  "Trichy": { lat: 10.7905, lng: 78.7047, state: "TN" },
  "Salem": { lat: 11.6643, lng: 78.1460, state: "TN" },
  "Pondicherry": { lat: 11.9416, lng: 79.8083, state: "PY" },
  "Kochi": { lat: 9.9312, lng: 76.2673, state: "KL" },
  "Trivandrum": { lat: 8.5241, lng: 76.9366, state: "KL" },
  "Mysore": { lat: 12.2958, lng: 76.6394, state: "KA" },
  "Mangalore": { lat: 12.9141, lng: 74.8560, state: "KA" },
  "Vizag": { lat: 17.6868, lng: 83.2185, state: "AP" },
  "Vijayawada": { lat: 16.5062, lng: 80.6480, state: "AP" },
  "Goa": { lat: 15.2993, lng: 74.1240, state: "GA" },
  "Nagpur": { lat: 21.1458, lng: 79.0882, state: "MH" },
  "Ahmedabad": { lat: 23.0225, lng: 72.5714, state: "GJ" },
  "Jaipur": { lat: 26.9124, lng: 75.7873, state: "RJ" },
  "Lucknow": { lat: 26.8467, lng: 80.9462, state: "UP" },
  "Chandigarh": { lat: 30.7333, lng: 76.7794, state: "CH" },
  "Indore": { lat: 22.7196, lng: 75.8577, state: "MP" },
  "Bhopal": { lat: 23.2599, lng: 77.4126, state: "MP" },
  "Gurgaon": { lat: 28.4595, lng: 77.0266, state: "HR" },
  "Noida": { lat: 28.5355, lng: 77.3910, state: "UP" },
};

export const BASE_LOCATIONS = [
  { id: "chennai", label: "Chennai", city: "Chennai" },
  { id: "delhi", label: "Delhi NCR", city: "Delhi" },
  { id: "mumbai", label: "Mumbai", city: "Mumbai" },
  { id: "bangalore", label: "Bengaluru", city: "Bangalore" },
];

export function getDistance(city1: string, city2: string): number {
  const c1 = CITY_COORDS[city1] || CITY_COORDS[Object.keys(CITY_COORDS).find(k => k.toLowerCase() === city1?.toLowerCase()) || ""];
  const c2 = CITY_COORDS[city2] || CITY_COORDS[Object.keys(CITY_COORDS).find(k => k.toLowerCase() === city2?.toLowerCase()) || ""];
  if (!c1 || !c2) return 9999;

  const R = 6371;
  const dLat = (c2.lat - c1.lat) * Math.PI / 180;
  const dLng = (c2.lng - c1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  // Road distance is roughly 1.3x straight-line distance in India
  return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.3);
}

export function getDistanceLabel(km: number): { label: string; color: string } {
  if (km <= 50) return { label: "Local", color: "#34d399" };
  if (km <= 200) return { label: `${km}km — day trip`, color: "#34d399" };
  if (km <= 400) return { label: `${km}km — overnight trip`, color: "#d4a843" };
  if (km <= 600) return { label: `${km}km — within range`, color: "#d4a843" };
  if (km <= 1000) return { label: `${km}km — road trip or transport`, color: "#f59e0b" };
  return { label: `${km}km — shipping needed`, color: "#f87171" };
}

// ─── ENGINE DISPLACEMENT DATABASE ───
// Maps model patterns to displacement in cc for diesel hunter filtering

export const ENGINE_DISPLACEMENT: Record<string, number> = {
  "Fortuner 2.8": 2755,
  "Fortuner 2.7": 2694,
  "Innova Crysta 2.4": 2393,
  "Innova Crysta 2.8": 2755,
  "Innova Hycross": 1987,
  "Thar 2.2": 2184,
  "Thar 2.0": 1997,
  "Thar 1.5": 1493,
  "Thar LXT RWD 2.2": 2184,
  "Thar ROXX": 2184,
  "XUV700 2.2": 2184,
  "XUV700 AX7": 2184,
  "XUV700 AX5": 2184,
  "Scorpio N": 1997,
  "Harrier": 1956,
  "Safari": 1956,
  "Compass": 1956,
  "Creta 1.5": 1493,
  "Creta 1.4": 1353,
  "Seltos 1.5": 1493,
  "Seltos 1.4": 1353,
  "Octavia 2.0": 1984,
  "Octavia 1.8": 1798,
  "Octavia RS": 1984,
  "Duster 1.3": 1333,
  "Ecosport 1.5": 1498,
  "Ecosport 1.0": 999,
  "Taigun 1.5": 1498,
  "Taigun 1.0": 999,
  "Kushaq 1.5": 1498,
  "Kushaq 1.0": 999,
  "Virtus 1.5": 1498,
  "Virtus 1.0": 999,
  "Nexon 1.5": 1497,
  "Nexon 1.2": 1199,
  "City 1.5": 1498,
  "Grand Vitara": 1462,
  "Hyryder": 1462,
  "Jimny": 1462,
  "Venue 1.0": 998,
  "Sonet 1.5": 1493,
};

export function getDisplacement(model: string): number {
  const key = Object.keys(ENGINE_DISPLACEMENT).find(k => model?.includes(k));
  return key ? ENGINE_DISPLACEMENT[key] : 0;
}

// ─── VEHICLE CATEGORIES ───
const PICKUP_MODELS = ["Isuzu D-Max", "Isuzu V-Cross", "Toyota Hilux", "Tata Yodha", "Tata Xenon", "Mahindra Bolero Camper", "Mahindra Pik-Up", "Force Trax"];
const FOUR_BY_FOUR_MODELS = ["Fortuner", "Thar", "Jimny", "Gurkha", "Scorpio N Z8L", "XUV700 AX7", "Hilux", "V-Cross", "D-Max V-Cross", "Grand Vitara.*AWD", "Hyryder.*AWD", "Compass.*4x4"];

export function isPickup(model: string): boolean {
  return PICKUP_MODELS.some(p => model?.includes(p));
}

export function is4x4Capable(car: any): boolean {
  if (car.drivetrain === "4WD" || car.drivetrain === "AWD") return true;
  return FOUR_BY_FOUR_MODELS.some(p => new RegExp(p, "i").test(car.model || ""));
}

export function isPickupHunterMatch(car: any, prefs: any): boolean {
  if (!prefs.pickup_hunter) return false;
  return isPickup(car.model);
}

export function is4x4HunterMatch(car: any, prefs: any): boolean {
  if (!prefs.fourx4_hunter) return false;
  return is4x4Capable(car);
}

export function isDieselHunterMatch(car: any, prefs: any): boolean {
  if (!prefs.diesel_hunter) return false;
  if (car.fuel !== "Diesel") return false;
  const disp = getDisplacement(car.model);
  if (disp < (prefs.min_displacement || 2000)) return false;
  // Distance check
  if (prefs.base_city) {
    const dist = getDistance(prefs.base_city, car.city);
    if (dist > (prefs.search_radius || 600)) return false;
  }
  return true;
}

// ─── Updated scoreCar with location + diesel hunter ───

export function scoreCar(car: any, prefs: any): number {
  let s = 50;
  const found = findModelIntel(car.model);
  const dep = calcDepreciation(car);

  if (car.price <= prefs.budget_max && car.price >= prefs.budget_min) s += 20;
  else if (car.price <= prefs.budget_max * 1.1) s += 10;
  else if (car.price > prefs.budget_max * 1.2) s -= 20;

  if (car.km < 40000) s += 10; else if (car.km < 70000) s += 7; else if (car.km < 100000) s += 3; else s -= 5;

  const age = 2026 - car.year;
  if (age <= 3) s += 10; else if (age <= 5) s += 7; else if (age <= 8) s += 3; else s -= 5;

  if (prefs.fuel_pref?.includes(car.fuel)) s += 10;
  if (prefs.body_types?.includes(car.body_type)) s += 5;
  if (!prefs.transmission || prefs.transmission === "Any" || car.transmission === prefs.transmission) s += 5;
  if (car.owners === 1) s += 5; if (car.owners >= 3) s -= 5;

  const trust = SOURCE_TRUST[car.source];
  if (trust?.tier <= 2) s += 8; else if (trust?.tier === 3) s += 4;

  // Location-aware reg state scoring
  const baseState = CITY_COORDS[prefs.base_city || "Chennai"]?.state || "TN";
  if (car.reg_state === baseState) s += 5; else s -= 3;

  // Distance bonus/penalty
  if (prefs.base_city && car.city) {
    const dist = getDistance(prefs.base_city, car.city);
    if (dist <= 100) s += 5;
    else if (dist <= 300) s += 2;
    else if (dist > 600) s -= 5;
  }

  if (found) { s += (found.intel.reliability - 5) * 2; s += (found.intel.resale - 5) * 2; if (prefs.wants_mods) s += (found.intel.modPotential - 5); }
  if (prefs.wants_4x4 && car.drivetrain === "4WD") s += 10;
  if (dep && dep.depPct >= 40) s += 5;

  // Diesel hunter bonus
  if (prefs.diesel_hunter && isDieselHunterMatch(car, prefs)) s += 15;
  // Pickup hunter bonus
  if (prefs.pickup_hunter && isPickupHunterMatch(car, prefs)) s += 15;
  // 4x4 hunter bonus
  if (prefs.fourx4_hunter && is4x4HunterMatch(car, prefs)) s += 12;

  return Math.max(0, Math.min(100, s));
}

export function generateInsights(car: any, prefs: any) {
  const whyBuy: string[] = [], whyNot: string[] = [];
  const found = findModelIntel(car.model);
  const dep = calcDepreciation(car);
  const trust = SOURCE_TRUST[car.source];

  if (car.price <= prefs.budget_max * 0.75) whyBuy.push("Priced well under budget — room for mods or negotiation");
  if (car.price > prefs.budget_max) whyNot.push("Over your stated budget ceiling");

  if (dep) {
    if (dep.depPct >= 40) whyBuy.push(`${dep.depPct}% depreciated — saving ₹${(dep.savedAmt / 100000).toFixed(1)}L vs new`);
    if (dep.depPct < 20) whyNot.push(`Only ${dep.depPct}% depreciated — paying near-new price for used`);
    if (dep.perYear >= 10) whyBuy.push(`High depreciation brand (${dep.perYear}%/yr) — great used value`);
  }

  if (trust) {
    if (trust.tier <= 2) whyBuy.push(`${trust.label}: ${trust.desc}`);
    if (trust.tier >= 4) whyNot.push(`${trust.label}: ${trust.desc} — independent inspection MANDATORY`);
    if (trust.premiumPct >= 8) whyNot.push(`Source typically charges ${trust.premiumPct}% premium — negotiate or compare elsewhere`);
    if (trust.premiumPct <= -5) whyBuy.push(`Source typically ${Math.abs(trust.premiumPct)}% below organized platforms`);
  }

  if (car.km < 30000) whyBuy.push("Very low km"); else if (car.km < 50000) whyBuy.push("Low km for age");
  else if (car.km > 100000) whyNot.push("High km — expect wear on suspension, clutch, drivetrain");

  const age = 2026 - car.year;
  if (age > 8 && car.fuel === "Diesel") whyNot.push(`${age}-yr-old diesel — approaching 10-year ban risk`);
  if (age <= 3) whyBuy.push("Recent model — near warranty period");
  if (age >= 5 && age <= 7) whyBuy.push("Sweet spot: most depreciation absorbed, years of life left");

  // Location-aware insights
  const baseCity = prefs.base_city || "Chennai";
  const baseState = CITY_COORDS[baseCity]?.state || "TN";
  if (car.reg_state && car.reg_state !== baseState) whyNot.push(`${car.reg_state} reg — NOC + re-registration to ${baseState} needed`);
  if (car.reg_state === baseState) whyBuy.push(`${baseState} registered — no transfer hassle`);

  // Distance insights
  if (car.city && baseCity) {
    const dist = getDistance(baseCity, car.city);
    const distInfo = getDistanceLabel(dist);
    if (dist > 400) whyNot.push(`${distInfo.label} from ${baseCity} — factor in travel/transport cost (₹${Math.round(dist * 15 / 1000)}K–${Math.round(dist * 25 / 1000)}K for carrier)`);
    if (dist <= 100 && dist > 0) whyBuy.push(`Only ${dist}km from ${baseCity} — easy to inspect and pick up`);
  }

  if (car.owners === 1) whyBuy.push("Single owner"); if (car.owners >= 3) whyNot.push("3+ owners — inconsistent maintenance risk");
  if (prefs.fuel_pref?.includes(car.fuel)) whyBuy.push(`Matches ${car.fuel} preference`);

  // Diesel hunter insights
  if (prefs.diesel_hunter) {
    const disp = getDisplacement(car.model);
    if (car.fuel === "Diesel" && disp >= 2000) {
      whyBuy.push(`🏴 Diesel Hunter match: ${(disp / 1000).toFixed(1)}L diesel engine — ${disp}cc`);
    }
    if (car.fuel === "Diesel" && disp > 0 && disp < 2000) {
      whyNot.push(`Diesel but only ${(disp / 1000).toFixed(1)}L (${disp}cc) — below your 2.0L+ preference`);
    }
  }

  // Pickup hunter insights
  if (prefs.pickup_hunter && isPickup(car.model)) {
    whyBuy.push("🛻 Pickup Hunter match — true pickup truck with bed/payload capability");
  }

  // 4x4 hunter insights
  if (prefs.fourx4_hunter && is4x4Capable(car)) {
    whyBuy.push("🏔 4x4/AWD Hunter match — off-road capable drivetrain");
  }
  if (prefs.fourx4_hunter && !is4x4Capable(car) && car.drivetrain === "2WD") {
    whyNot.push("2WD only — no 4x4/AWD capability");
  }

  if (found) {
    if (found.intel.reliability >= 8) whyBuy.push(`Reliability ${found.intel.reliability}/10`);
    if (found.intel.reliability <= 5) whyNot.push(`Reliability ${found.intel.reliability}/10 — budget for repairs`);
    if (found.intel.resale >= 8) whyBuy.push(`Resale ${found.intel.resale}/10`);
    if (found.intel.resale <= 5) whyNot.push(`Resale ${found.intel.resale}/10`);
    if (found.intel.parts <= 5) whyNot.push(`Parts availability ${found.intel.parts}/10`);
    if (found.intel.strengths?.[0]) whyBuy.push(found.intel.strengths[0]);
    if (found.intel.knownIssues?.[0]) whyNot.push(`Known: ${found.intel.knownIssues[0]}`);
  }

  return { whyBuy, whyNot };
}
