import { scrapeCars24 } from "./cars24";
import { scrapeCarDekho } from "./cardekho";
import { scrapeCarWale } from "./carwale";
import { scrapeTeamBHP } from "./teambhp";
import { scrapeToyotaUTrust, scrapeMahindraFC } from "./oem";
import type { ScrapedCar } from "./utils";

export interface ScrapeConfig {
  sources: string[];
  city: string;
  budgetMax: number;
}

export interface ScrapeResult {
  source: string;
  status: "success" | "error";
  count: number;
  error?: string;
  timeMs: number;
}

const SCRAPER_MAP: Record<string, (city: string, budget: number) => Promise<ScrapedCar[]>> = {
  cars24: (city, budget) => scrapeCars24(city, budget),
  cardekho: (city, budget) => scrapeCarDekho(city, budget),
  carwale: (city, budget) => scrapeCarWale(city, budget),
  teambhp: () => scrapeTeamBHP(),
  toyota_utrust: (city) => scrapeToyotaUTrust(city),
  mahindra_fc: (city) => scrapeMahindraFC(city),
};

export const AVAILABLE_SCRAPERS = Object.keys(SCRAPER_MAP);

export async function runScrapers(config: ScrapeConfig): Promise<{
  cars: ScrapedCar[];
  results: ScrapeResult[];
}> {
  const allCars: ScrapedCar[] = [];
  const results: ScrapeResult[] = [];
  const seenIds = new Set<string>();

  const sources = config.sources.length > 0 ? config.sources : AVAILABLE_SCRAPERS;

  // Run scrapers in parallel with individual error handling
  const promises = sources.map(async (source) => {
    const scraper = SCRAPER_MAP[source];
    if (!scraper) {
      results.push({ source, status: "error", count: 0, error: "Unknown scraper", timeMs: 0 });
      return;
    }

    const start = Date.now();
    try {
      const cars = await scraper(config.city, config.budgetMax);
      const elapsed = Date.now() - start;

      // Deduplicate by ID
      let added = 0;
      for (const car of cars) {
        if (!seenIds.has(car.id) && car.model && car.price > 0) {
          seenIds.add(car.id);
          allCars.push(car);
          added++;
        }
      }

      results.push({ source, status: "success", count: added, timeMs: elapsed });
    } catch (e: any) {
      results.push({ source, status: "error", count: 0, error: e.message, timeMs: Date.now() - start });
    }
  });

  await Promise.allSettled(promises);

  return { cars: allCars, results };
}
