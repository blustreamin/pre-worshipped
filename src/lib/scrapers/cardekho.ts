import * as cheerio from "cheerio";
import { genId, extractYear, extractKm, parsePrice, detectFuel, detectTrans, detectBody, detectState, detectDrivetrain, fetchWithRetry, ScrapedCar } from "./utils";

export async function scrapeCarDekho(city: string = "chennai", budgetMax: number = 2500000): Promise<ScrapedCar[]> {
  const cars: ScrapedCar[] = [];
  const slug = city.toLowerCase().replace(/\s+/g, "-");

  try {
    const url = `https://www.cardekho.com/used-cars+in+${slug}`;
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    // CarDekho uses various listing card patterns
    const selectors = [
      ".gsc_col-sm-12.listingWrap",
      "[data-tracking-section='usedCarListing']",
      ".UsedListingNew__carCard",
      ".carsListData li",
    ];

    let listings: any = null;
    for (const sel of selectors) {
      const found = $(sel);
      if (found.length > 0) { listings = found; break; }
    }

    if (!listings || listings.length === 0) {
      // Try JSON-LD structured data
      const scripts = $('script[type="application/ld+json"]');
      scripts.each((_: any, el: any) => {
        try {
          const json = JSON.parse($(el).html() || "");
          if (json["@type"] === "ItemList" && json.itemListElement) {
            for (const item of json.itemListElement.slice(0, 30)) {
              const thing = item.item || item;
              const title = thing.name || "";
              const price = parsePrice(thing.offers?.price?.toString() || "0");
              if (!title || !price) continue;

              cars.push({
                id: genId("cardekho", title, price),
                model: title,
                variant: "",
                year: extractYear(title),
                km: 0,
                price: price,
                fuel: detectFuel(title),
                transmission: detectTrans(title),
                body_type: detectBody(title),
                drivetrain: detectDrivetrain(title),
                owners: 1,
                reg_state: detectState(city),
                city: city.replace(/^\w/, c => c.toUpperCase()),
                color: "",
                source: "CarDekho",
                certified: false,
                link: thing.url || "",
                notes: "Scraped from CarDekho",
                images: thing.image ? [thing.image] : [],
                stage: "discovered",
                seller_name: "",
                seller_phone: "",
                seller_type: "unknown",
                scraped_at: new Date().toISOString(),
              });
            }
          }
        } catch {}
      });
      return cars;
    }

    listings.slice(0, 30).each((_: any, el: any) => {
      try {
        const card = $(el);
        const titleEl = card.find("a.title, h3 a, .heading a, .UsedListingNew__carName").first();
        const priceEl = card.find(".price, [class*='price'], .UsedListingNew__price").first();
        
        const title = titleEl.text().trim();
        if (!title) return;
        
        const price = parsePrice(priceEl.text());
        const href = titleEl.attr("href") || card.find("a").first().attr("href") || "";
        const link = href.startsWith("http") ? href : href ? `https://www.cardekho.com${href}` : "";
        
        const imgEl = card.find("img[src*='car'], img[data-src]").first();
        const imgSrc = imgEl.attr("data-src") || imgEl.attr("src") || "";
        
        const detailsText = card.text();
        
        // Try to extract km and year from details
        const km = extractKm(detailsText);
        const year = extractYear(detailsText + " " + title);

        cars.push({
          id: genId("cardekho", title, price),
          model: title,
          variant: "",
          year: year,
          km: km,
          price: price,
          fuel: detectFuel(detailsText),
          transmission: detectTrans(detailsText),
          body_type: detectBody(title),
          drivetrain: detectDrivetrain(detailsText),
          owners: 1,
          reg_state: detectState(city),
          city: city.replace(/^\w/, c => c.toUpperCase()),
          color: "",
          source: "CarDekho",
          certified: false,
          link: link,
          notes: "Scraped from CarDekho",
          images: imgSrc ? [imgSrc] : [],
          stage: "discovered",
          seller_name: "",
          seller_phone: "",
          seller_type: "unknown",
          scraped_at: new Date().toISOString(),
        });
      } catch {}
    });
  } catch (e: any) {
    console.error("CarDekho scraper error:", e.message);
  }

  return cars;
}
