import * as cheerio from "cheerio";
import { genId, extractYear, extractKm, parsePrice, detectFuel, detectTrans, detectBody, detectState, detectDrivetrain, fetchWithRetry, ScrapedCar } from "./utils";

export async function scrapeTeamBHP(): Promise<ScrapedCar[]> {
  const cars: ScrapedCar[] = [];

  try {
    // Team-BHP classifieds forum section
    const url = "https://www.team-bhp.com/forum/classifieds/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Forum thread listings in classifieds
    const threads = $("tr[id^='thread_'], .threadbit, ol#threads li");

    threads.slice(0, 30).each((_: any, el: any) => {
      try {
        const row = $(el);
        const titleEl = row.find("a.title, a[id^='thread_title']").first();
        const title = titleEl.text().trim();
        if (!title) return;
        
        // Team-BHP titles often include price and location
        // Format: "[City] Year Model - ₹X.XX Lakh" or similar
        const price = parsePrice(title);
        const href = titleEl.attr("href") || "";
        const link = href.startsWith("http") ? href : href ? `https://www.team-bhp.com/forum/${href}` : "";

        // Skip non-car threads
        if (title.toLowerCase().includes("wtb") || title.toLowerCase().includes("wanted")) return;

        const year = extractYear(title);
        const km = extractKm(title);

        cars.push({
          id: genId("teambhp", title, price),
          model: title.replace(/\[.*?\]/g, "").replace(/₹[\d.,]+\s*(lakh|lac|l)?/gi, "").trim(),
          variant: "",
          year: year,
          km: km,
          price: price,
          fuel: detectFuel(title),
          transmission: detectTrans(title),
          body_type: detectBody(title),
          drivetrain: detectDrivetrain(title),
          owners: 1,
          reg_state: detectState(title),
          city: "",
          color: "",
          source: "Team-BHP",
          certified: false,
          link: link,
          notes: "🏆 Team-BHP classified — enthusiast-owned, typically well-maintained. Best deals here.",
          images: [],
          stage: "discovered",
          seller_name: row.find(".username, .author").first().text().trim() || "",
          seller_phone: "",
          seller_type: "individual",
          scraped_at: new Date().toISOString(),
        });
      } catch {}
    });
  } catch (e: any) {
    console.error("Team-BHP scraper error:", e.message);
  }

  return cars;
}
