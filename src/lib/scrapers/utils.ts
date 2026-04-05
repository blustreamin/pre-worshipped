import crypto from "crypto";

// ─── Generate deterministic ID for dedup ───
export function genId(source: string, title: string, price: number): string {
  return crypto.createHash("md5").update(`${source}:${title}:${price}`).digest("hex").slice(0, 12);
}

// ─── Extract year from text ───
export function extractYear(text: string): number {
  const m = text.match(/20[12]\d/);
  return m ? parseInt(m[0]) : 2022;
}

// ─── Extract km from text ───
export function extractKm(text: string): number {
  const clean = text.toLowerCase().replace(/,/g, "").replace(/\s/g, "");
  const m = clean.match(/(\d+)\s*(?:km|kms)/);
  if (m) return parseInt(m[1]);
  // Try bare number with context
  const m2 = clean.match(/(\d{4,6})/);
  return m2 ? parseInt(m2[1]) : 0;
}

// ─── Parse Indian price formats ───
export function parsePrice(text: string): number {
  const clean = text.toLowerCase().replace(/[₹,\s]/g, "");
  if (clean.includes("lakh") || clean.includes("lac")) {
    const n = clean.match(/([\d.]+)/);
    return n ? Math.round(parseFloat(n[1]) * 100000) : 0;
  }
  if (clean.includes("crore") || clean.includes("cr")) {
    const n = clean.match(/([\d.]+)/);
    return n ? Math.round(parseFloat(n[1]) * 10000000) : 0;
  }
  const n = clean.match(/(\d+)/);
  return n ? parseInt(n[1]) : 0;
}

// ─── Detect fuel type ───
export function detectFuel(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("diesel")) return "Diesel";
  if (t.includes("hybrid")) return "Hybrid";
  if (t.includes("electric") || t.includes(" ev")) return "Electric";
  if (t.includes("cng")) return "CNG";
  return "Petrol";
}

// ─── Detect transmission ───
export function detectTrans(text: string): string {
  const t = text.toLowerCase();
  if (["automatic", " at ", "dsg", "dct", "cvt", "amt", "torque converter", "tiptronic"].some(x => t.includes(x)))
    return "Automatic";
  return "Manual";
}

// ─── Detect body type ───
export function detectBody(text: string): string {
  const t = text.toLowerCase();
  if (["pickup", "d-max", "hilux", "yodha", "xenon", "camper"].some(x => t.includes(x))) return "Pickup";
  if (["suv", "crossover"].some(x => t.includes(x))) return "SUV";
  if (["sedan", "saloon", "city", "verna", "octavia", "virtus", "slavia"].some(x => t.includes(x))) return "Sedan";
  if (["muv", "mpv", "innova", "crysta", "hycross", "ertiga", "carens"].some(x => t.includes(x))) return "MUV";
  if (["hatchback", "hatch", "swift", "baleno", "i20", "polo"].some(x => t.includes(x))) return "Hatchback";
  return "SUV";
}

// ─── Detect state from city/text ───
export function detectState(text: string): string {
  const t = text.toUpperCase();
  const map: Record<string, string> = {
    "CHENNAI": "TN", "COIMBATORE": "TN", "MADURAI": "TN", "TRICHY": "TN", "SALEM": "TN", "TAMIL NADU": "TN",
    "BANGALORE": "KA", "BENGALURU": "KA", "MYSORE": "KA", "MANGALORE": "KA", "KARNATAKA": "KA",
    "MUMBAI": "MH", "PUNE": "MH", "NAGPUR": "MH", "MAHARASHTRA": "MH",
    "DELHI": "DL", "NEW DELHI": "DL", "GURGAON": "HR", "NOIDA": "UP",
    "HYDERABAD": "TS", "TELANGANA": "TS",
    "KOCHI": "KL", "TRIVANDRUM": "KL", "KERALA": "KL",
    "PONDICHERRY": "PY", "PUDUCHERRY": "PY",
    "GOA": "GA", "VIZAG": "AP", "VIJAYAWADA": "AP",
    "AHMEDABAD": "GJ", "JAIPUR": "RJ", "LUCKNOW": "UP", "KOLKATA": "WB",
    "CHANDIGARH": "CH", "INDORE": "MP", "BHOPAL": "MP",
  };
  for (const [key, val] of Object.entries(map)) {
    if (t.includes(key)) return val;
  }
  return "";
}

// ─── Detect drivetrain ───
export function detectDrivetrain(text: string): string {
  const t = text.toLowerCase();
  if (["4x4", "4wd", "awd", "all wheel", "four wheel", "allgrip pro"].some(x => t.includes(x))) return "4WD";
  if (["awd", "all-wheel", "allgrip select"].some(x => t.includes(x))) return "AWD";
  return "2WD";
}

// ─── Fetch with timeout and retries ───
export async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    ...(options.headers as Record<string, string> || {}),
  };

  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) return res;
    } catch (e) {
      if (i === retries) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error(`Failed to fetch ${url}`);
}

// ─── Standard car listing shape ───
export interface ScrapedCar {
  id: string;
  model: string;
  variant: string;
  year: number;
  km: number;
  price: number;
  fuel: string;
  transmission: string;
  body_type: string;
  drivetrain: string;
  owners: number;
  reg_state: string;
  city: string;
  color: string;
  source: string;
  certified: boolean;
  link: string;
  notes: string;
  images: string[];
  stage: string;
  seller_name: string;
  seller_phone: string;
  seller_type: string;
  scraped_at: string;
}
