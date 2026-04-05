import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { runScrapers, AVAILABLE_SCRAPERS } from "@/lib/scrapers";

export const maxDuration = 60; // Allow up to 60s for scraping on Vercel Pro

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    
    const config = {
      sources: body.sources || AVAILABLE_SCRAPERS,
      city: body.city || "chennai",
      budgetMax: body.budgetMax || 2500000,
    };

    console.log(`[Scraper] Starting scrape: sources=${config.sources.join(",")}, city=${config.city}`);

    const { cars, results } = await runScrapers(config);

    console.log(`[Scraper] Found ${cars.length} cars from ${results.length} sources`);

    // Upsert to Supabase
    let savedCount = 0;
    if (cars.length > 0) {
      // Batch upsert in chunks of 50
      for (let i = 0; i < cars.length; i += 50) {
        const chunk = cars.slice(i, i + 50).map(car => ({
          ...car,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error } = await supabase
          .from("cars")
          .upsert(chunk, { onConflict: "id", ignoreDuplicates: false });

        if (error) {
          console.error(`[Scraper] Supabase upsert error:`, error.message);
        } else {
          savedCount += chunk.length;
        }
      }

      // Log the scrape
      for (const result of results) {
        await supabase.from("scrape_log").insert({
          source: result.source,
          status: result.status,
          cars_found: result.count,
          error: result.error || null,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      total_found: cars.length,
      total_saved: savedCount,
      results: results,
      config: config,
    });
  } catch (error: any) {
    console.error("[Scraper] Fatal error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return scraper info and last run status
  const { data: logs } = await supabase
    .from("scrape_log")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(20);

  const { count } = await supabase
    .from("cars")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({
    available_scrapers: AVAILABLE_SCRAPERS,
    total_cars_in_db: count,
    recent_scrapes: logs || [],
    usage: {
      method: "POST",
      body: {
        sources: "string[] — which scrapers to run (default: all)",
        city: "string — city to search (default: chennai)",
        budgetMax: "number — max budget in ₹ (default: 2500000)",
      },
      example: {
        sources: ["cars24", "cardekho"],
        city: "chennai",
        budgetMax: 2000000,
      },
    },
  });
}
