import * as cheerio from "cheerio";
import { genId, extractYear, extractKm, parsePrice, detectFuel, detectTrans, detectBody, detectState, detectDrivetrain, fetchWithRetry, ScrapedCar } from "./utils";

export async function scrapeCarWale(city: string = "chennai", budgetMax: number = 2500000): Promise<ScrapedCar[]> {
  const cars: ScrapedCar[] = [];
  const slug = city.toLowerCase();
  const maxLakh = Math.round(budgetMax / 100000);

  try {
    const url = `https://www.carwale.com/used/cars-for-sale/?budget=${maxLakh}&city=${slug}`;
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    // CarWale listing cards
    const cards = $(".stockListItem, .used-stock-card, [class*='stockList']");

    cards.slice(0, 30).each((_: any, el: any) => {
      try {
        const card = $(el);
        const title = card.find("h2, h3, .car-name, [class*='carName']").first().text().trim();
        if (!title) return;

        const priceText = card.find("[class*='price'], .price").first().text();
        const price = parsePrice(priceText);
        if (!price) return;

        const href = card.find("a[href*='used']").first().attr("href") || "";
        const link = href.startsWith("http") ? href : href ? `https://www.carwale.com${href}` : "";

        const imgSrc = card.find("img").first().attr("data-src") || card.find("img").first().attr("src") || "";
        const details = card.text();

        cars.push({
          id: genId("carwale", title, price),
          model: title,
          variant: "",
          year: extractYear(details + " " + title),
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
          source: "CarWale",
          certified: false,
          link: link,
          notes: "Scraped from CarWale",
          images: imgSrc ? [imgSrc] : [],
          stage: "discovered",
          seller_name: "",
          seller_phone: "",
          seller_type: "dealer",
          scraped_at: new Date().toISOString(),
        });
      } catch {}
    });
  } catch (e: any) {
    console.error("CarWale scraper error:", e.message);
  }

  return cars;
}
