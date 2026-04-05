import * as cheerio from "cheerio";
import { genId, extractYear, extractKm, parsePrice, detectFuel, detectTrans, detectBody, detectState, detectDrivetrain, fetchWithRetry, ScrapedCar } from "./utils";

// ─── Toyota U Trust ───
export async function scrapeToyotaUTrust(city: string = "chennai"): Promise<ScrapedCar[]> {
  const cars: ScrapedCar[] = [];

  try {
    const url = `https://www.toyotautrust.in/used-cars/${city.toLowerCase()}`;
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const cards = $(".car-card, .vehicle-card, [class*='listing'], .carItem");

    cards.slice(0, 20).each((_: any, el: any) => {
      try {
        const card = $(el);
        const title = card.find("h2, h3, .car-name, .title").first().text().trim();
        if (!title) return;

        const priceText = card.find("[class*='price'], .price").first().text();
        const price = parsePrice(priceText);
        if (!price) return;

        const href = card.find("a").first().attr("href") || "";
        const link = href.startsWith("http") ? href : href ? `https://www.toyotautrust.in${href}` : "";
        const img = card.find("img").first().attr("src") || card.find("img").first().attr("data-src") || "";
        const details = card.text();

        cars.push({
          id: genId("toyotautrust", title, price),
          model: title,
          variant: "",
          year: extractYear(details),
          km: extractKm(details),
          price: price,
          fuel: detectFuel(details),
          transmission: detectTrans(details),
          body_type: detectBody(title),
          drivetrain: detectDrivetrain(details),
          owners: 1,
          reg_state: detectState(city),
          city: city.replace(/^\w/, c => c.toUpperCase()),
          color: "",
          source: "Toyota U Trust",
          certified: true,
          link: link,
          notes: "Toyota OEM certified. 203-point inspection. 2yr/30K warranty.",
          images: img ? [img] : [],
          stage: "discovered",
          seller_name: "",
          seller_phone: "",
          seller_type: "oem",
          scraped_at: new Date().toISOString(),
        });
      } catch {}
    });
  } catch (e: any) {
    console.error("Toyota U Trust scraper error:", e.message);
  }

  return cars;
}

// ─── Mahindra First Choice ───
export async function scrapeMahindraFC(city: string = "chennai"): Promise<ScrapedCar[]> {
  const cars: ScrapedCar[] = [];

  try {
    const url = `https://www.mahindrafirstchoice.com/used-cars/${city.toLowerCase()}`;
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const cards = $(".car-card, .vehicle-listing, [class*='listing'], .carItem");

    cards.slice(0, 20).each((_: any, el: any) => {
      try {
        const card = $(el);
        const title = card.find("h2, h3, .car-name, .title").first().text().trim();
        if (!title) return;

        const priceText = card.find("[class*='price'], .price").first().text();
        const price = parsePrice(priceText);
        if (!price) return;

        const href = card.find("a").first().attr("href") || "";
        const link = href.startsWith("http") ? href : href ? `https://www.mahindrafirstchoice.com${href}` : "";
        const img = card.find("img").first().attr("src") || "";
        const details = card.text();

        cars.push({
          id: genId("mahindrafc", title, price),
          model: title,
          variant: "",
          year: extractYear(details),
          km: extractKm(details),
          price: price,
          fuel: detectFuel(details),
          transmission: detectTrans(details),
          body_type: detectBody(title),
          drivetrain: detectDrivetrain(details),
          owners: 1,
          reg_state: detectState(city),
          city: city.replace(/^\w/, c => c.toUpperCase()),
          color: "",
          source: "Mahindra First Choice",
          certified: true,
          link: link,
          notes: "Mahindra OEM certified. 118-point inspection.",
          images: img ? [img] : [],
          stage: "discovered",
          seller_name: "",
          seller_phone: "",
          seller_type: "oem",
          scraped_at: new Date().toISOString(),
        });
      } catch {}
    });
  } catch (e: any) {
    console.error("Mahindra FC scraper error:", e.message);
  }

  return cars;
}
