import { NextRequest, NextResponse } from "next/server";
import { saveAiAnalysis } from "@/lib/supabase";
import { generateInsights, calcDepreciation, findModelIntel } from "@/lib/car-intel";

export async function POST(req: NextRequest) {
  try {
    const { car, prefs } = await req.json();

    if (!car || !car.id) {
      return NextResponse.json({ error: "Car data required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const insights = generateInsights(car, prefs);
    const dep = calcDepreciation(car);
    const found = findModelIntel(car.model);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `You are a brutally honest Indian used car expert. Analyze for a Chennai buyer who drove a Stage 2 tuned S-Cross diesel and loves driving fun. Budget: ₹${prefs.budget_min / 100000}L-${prefs.budget_max / 100000}L.

CAR: ${car.model} (${car.year}) | ₹${(car.price / 100000).toFixed(1)}L | ${car.km}km | ${car.fuel} ${car.transmission} | ${car.owners} owner | ${car.reg_state} reg | Source: ${car.source}
${dep ? `Depreciation: ${dep.depPct}% from ₹${(dep.avgNew / 100000).toFixed(0)}L new` : ""}
${found ? `Known issues: ${found.intel.knownIssues?.join("; ")}` : ""}
Notes: ${car.notes}

Respond with JSON ONLY (no markdown/backticks):
{"verdict":"BUY"/"CONSIDER"/"SKIP","confidence":1-10,"summary":"2-3 honest sentences","hidden_costs":"estimate first-year costs beyond purchase","negotiation_tip":"specific tip for THIS car","check_these":"3 things to inspect at THIS km/age","long_term":"2-sentence 3-5 year outlook","fair_price":"what you think fair market value is in ₹"}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.map((c: any) => c.text || "").join("");
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    // Save to database
    const analysis = {
      car_id: car.id,
      verdict: parsed.verdict,
      confidence: parsed.confidence,
      summary: parsed.summary,
      hidden_costs: parsed.hidden_costs,
      negotiation_tip: parsed.negotiation_tip,
      check_these: parsed.check_these,
      long_term: parsed.long_term,
      fair_price: parsed.fair_price,
    };

    await saveAiAnalysis(analysis);

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "AI analysis failed" },
      { status: 500 }
    );
  }
}
