#!/usr/bin/env node
// Run: node scripts/fetch-images.js
// Fetches correct stimg.cardekho.com image URLs for all models

const models = [
  { key: "Toyota Fortuner", url: "https://www.cardekho.com/carmodels/Toyota/Toyota_Fortuner" },
  { key: "Mahindra Thar ROXX", url: "https://www.cardekho.com/mahindra/thar-roxx" },
  { key: "Mahindra Thar", url: "https://www.cardekho.com/mahindra/thar" },
  { key: "Maruti Jimny", url: "https://www.cardekho.com/maruti/jimny" },
  { key: "Hyundai Creta", url: "https://www.cardekho.com/hyundai/creta" },
  { key: "Tata Harrier", url: "https://www.cardekho.com/tata/harrier" },
  { key: "Kia Seltos", url: "https://www.cardekho.com/kia/seltos" },
  { key: "Skoda Octavia", url: "https://www.cardekho.com/skoda/octavia" },
  { key: "Toyota Innova Hycross", url: "https://www.cardekho.com/toyota/innova-hycross" },
  { key: "Toyota Innova", url: "https://www.cardekho.com/toyota/innova-crysta" },
  { key: "Volkswagen Taigun", url: "https://www.cardekho.com/volkswagen/taigun" },
  { key: "Toyota Hilux", url: "https://www.cardekho.com/toyota/hilux" },
  { key: "Force Gurkha", url: "https://www.cardekho.com/force/gurkha" },
  { key: "Isuzu D-Max", url: "https://www.cardekho.com/isuzu/d-max" },
  { key: "Mahindra XUV700", url: "https://www.cardekho.com/mahindra/xuv700" },
  { key: "Mahindra Scorpio", url: "https://www.cardekho.com/mahindra/scorpio-n" },
  { key: "Tata Safari", url: "https://www.cardekho.com/tata/safari" },
  { key: "Renault Duster", url: "https://www.cardekho.com/renault/duster" },
  { key: "Honda City", url: "https://www.cardekho.com/honda/city" },
  { key: "Maruti Grand Vitara", url: "https://www.cardekho.com/maruti/grand-vitara" },
  { key: "Jeep Compass", url: "https://www.cardekho.com/jeep/compass" },
  { key: "Skoda Kushaq", url: "https://www.cardekho.com/skoda/kushaq" },
  { key: "Tata Nexon", url: "https://www.cardekho.com/tata/nexon" },
  { key: "Ford Ecosport", url: "https://www.cardekho.com/ford/ecosport" },
  { key: "Volkswagen Virtus", url: "https://www.cardekho.com/volkswagen/virtus" },
  { key: "Toyota Hyryder", url: "https://www.cardekho.com/toyota/hyryder" },
  { key: "Kia Sonet", url: "https://www.cardekho.com/kia/sonet" },
  { key: "Hyundai Venue", url: "https://www.cardekho.com/hyundai/venue" },
  { key: "Mahindra Bolero", url: "https://www.cardekho.com/mahindra/bolero" },
  { key: "Tata Yodha", url: "https://www.cardekho.com/tata/yodha" },
];

async function fetchImageUrl(model) {
  try {
    const res = await fetch(model.url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" }
    });
    const html = await res.text();
    
    // Extract first stimg.cardekho.com image URL
    const match = html.match(/https:\/\/stimg\.cardekho\.com\/images\/carexteriorimages\/630x420\/[^"'\s]+front-left-side[^"'\s]*/);
    if (match) {
      // Remove ?tr= transform params
      const url = match[0].split("?")[0];
      return { key: model.key, url, status: "OK" };
    }
    
    // Fallback: try any stimg image
    const fallback = html.match(/https:\/\/stimg\.cardekho\.com\/images\/carexteriorimages\/630x420\/[^"'\s]+\.jpg/);
    if (fallback) {
      return { key: model.key, url: fallback[0].split("?")[0], status: "FALLBACK" };
    }
    
    return { key: model.key, url: null, status: "NOT_FOUND" };
  } catch (e) {
    return { key: model.key, url: null, status: "ERROR: " + e.message };
  }
}

async function main() {
  console.log("Fetching image URLs for", models.length, "models...\n");
  
  const results = [];
  for (const model of models) {
    const result = await fetchImageUrl(model);
    console.log(`${result.status.padEnd(10)} ${result.key.padEnd(25)} ${result.url || "—"}`);
    results.push(result);
    // Be nice to the server
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log("\n\n// ─── Paste this into page.tsx ───");
  console.log("const MODEL_IMGS: Record<string, string> = {");
  for (const r of results) {
    if (r.url) {
      console.log(`  "${r.key}": "${r.url}",`);
    } else {
      console.log(`  // "${r.key}": NOT FOUND`);
    }
  }
  console.log("};");
}

main();
