import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a used car listing finder for the Indian market. Your job is to search the web and find REAL used car listings that match the user's criteria.

For each car you find, extract this EXACT JSON structure:
{
  "model": "Full model name with variant (e.g. Toyota Fortuner 2.8 4x4 AT)",
  "variant": "Engine/trim details",
  "year": 2021,
  "km": 35000,
  "price": 3100000,
  "fuel": "Diesel",
  "transmission": "Automatic",
  "body_type": "SUV",
  "drivetrain": "4WD",
  "owners": 1,
  "reg_state": "TN",
  "city": "Chennai",
  "color": "White",
  "source": "Platform name (Cars24/OLX/Spinny/Team-BHP/Facebook/etc)",
  "link": "Direct URL to the listing",
  "notes": "Any relevant details about the car",
  "seller_name": "Seller name if available",
  "seller_phone": "Phone if visible",
  "seller_type": "dealer/individual/oem"
}

CRITICAL RULES:
- Only return cars you actually find in search results with REAL URLs
- Price must be in Indian Rupees (full number, not lakhs)
- Include the actual listing URL - this is the most important field
- Search across: Cars24, OLX, Spinny, CarDekho, Facebook Marketplace, Team-BHP classifieds, Quikr, CarTrade, Droom
- For each search, try to find 5-10 distinct listings
- If you find a listing on a forum or marketplace, include the seller name if visible
- Return ONLY the JSON array, no other text

Respond with a JSON array of car objects. Nothing else.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "ANTHROPIC_API_KEY not set. Add it in Vercel env vars." }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      query = "used diesel SUV",
      city = "chennai",
      budgetMax = 2500000,
      budgetMin = 500000,
      models = [],
    } = body;

    const budgetMaxL = (budgetMax / 100000).toFixed(0);
    const budgetMinL = (budgetMin / 100000).toFixed(0);
    const modelStr = models.length > 0 ? models.join(", ") : "";

    const userPrompt = modelStr
      ? `Find used ${modelStr} cars for sale in ${city} and nearby cities. Budget: ₹${budgetMinL}L to ₹${budgetMaxL}L. Search on Cars24, OLX, Spinny, CarDekho, Team-BHP classifieds, Facebook marketplace, and any other platform. Find at least 8 real listings with actual URLs.`
      : `Find used cars matching: "${query}" in ${city} and nearby cities. Budget: ₹${budgetMinL}L to ₹${budgetMaxL}L. Search on Cars24, OLX, Spinny, CarDekho, Team-BHP classifieds, Facebook marketplace, and any other platform. Find at least 8 real listings with actual URLs.`;

    console.log(`[AI Finder] Query: ${userPrompt}`);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[AI Finder] API error:", err);
      return NextResponse.json({ success: false, error: `API error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();

    // Extract text content from response
    let textContent = "";
    for (const block of data.content || []) {
      if (block.type === "text") {
        textContent += block.text;
      }
    }

    // Parse JSON from response
    let cars: any[] = [];
    try {
      // Try direct parse
      cars = JSON.parse(textContent.trim());
    } catch {
      // Try extracting JSON array from text
      const jsonMatch = textContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          cars = JSON.parse(jsonMatch[0]);
        } catch {
          console.error("[AI Finder] Could not parse JSON from response");
        }
      }
    }

    if (!Array.isArray(cars)) cars = [];

    // Clean and validate
    const validCars = cars
      .filter((c: any) => c.model && c.price > 0)
      .map((c: any, i: number) => ({
        id: `ai${Date.now()}${i}`,
        model: c.model || "",
        variant: c.variant || "",
        year: c.year || 2022,
        km: c.km || 0,
        price: c.price || 0,
        fuel: c.fuel || "Diesel",
        transmission: c.transmission || "Manual",
        body_type: c.body_type || "SUV",
        drivetrain: c.drivetrain || "2WD",
        owners: c.owners || 1,
        reg_state: c.reg_state || "",
        city: c.city || city,
        color: c.color || "",
        source: c.source || "AI Search",
        certified: false,
        link: c.link || "",
        notes: c.notes || "Found via AI search",
        images: [],
        stage: "discovered",
        seller_name: c.seller_name || "",
        seller_phone: c.seller_phone || "",
        seller_type: c.seller_type || "unknown",
        scraped_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

    // Upsert to Supabase
    let savedCount = 0;
    if (validCars.length > 0) {
      const { error } = await supabase
        .from("cars")
        .upsert(validCars, { onConflict: "id" });
      if (error) {
        console.error("[AI Finder] DB error:", error.message);
      } else {
        savedCount = validCars.length;
      }
    }

    // Log
    await supabase.from("scrape_log").insert({
      source: "ai_finder",
      status: validCars.length > 0 ? "success" : "no_results",
      cars_found: validCars.length,
      error: null,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      query: userPrompt,
      found: validCars.length,
      saved: savedCount,
      cars: validCars,
    });
  } catch (error: any) {
    console.error("[AI Finder] Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: "AI Car Finder",
    description: "Uses Claude with web search to find real used car listings",
    usage: {
      method: "POST",
      body: {
        query: "Free text search (e.g. 'diesel SUV under 15 lakh')",
        city: "Base city (default: chennai)",
        budgetMin: "Min budget in ₹ (default: 500000)",
        budgetMax: "Max budget in ₹ (default: 2500000)",
        models: "Array of specific models to search (e.g. ['Fortuner', 'Thar', 'Hilux'])",
      },
    },
  });
}
