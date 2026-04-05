import { genId, detectFuel, detectTrans, detectBody, detectState, detectDrivetrain, fetchWithRetry, ScrapedCar } from "./utils";

export async function scrapeCars24(city: string = "chennai", budgetMax: number = 2500000): Promise<ScrapedCar[]> {
  const cars: ScrapedCar[] = [];
  
  const cityMap: Record<string, string> = {
    "chennai": "chennai", "bangalore": "bengaluru", "mumbai": "mumbai",
    "delhi": "new-delhi", "hyderabad": "hyderabad", "pune": "pune",
    "coimbatore": "coimbatore", "kolkata": "kolkata",
  };
  const slug = cityMap[city.toLowerCase()] || city.toLowerCase();

  try {
    // Cars24 listing API
    const url = `https://www.cars24.com/api/buy-used-cars/?sort=bestmatch&city=${slug}&budgetMax=${budgetMax}&size=40`;
    const res = await fetchWithRetry(url, {
      headers: { "Accept": "application/json" },
    });
    const data = await res.json();
    
    const listings = data?.data?.cars || data?.data?.listing || data?.results || [];
    
    for (const item of listings) {
      try {
        const title = item.car_name || item.title || item.name || "";
        if (!title) continue;
        
        const price = item.price || item.selling_price || item.display_price || 0;
        const km = item.km || item.kms_driven || item.distance_covered || 0;
        const year = item.manufacturing_year || item.year || 0;
        
        let images: string[] = [];
        if (item.images && Array.isArray(item.images)) {
          images = item.images.slice(0, 5).map((img: any) => typeof img === "string" ? img : img?.url || img?.path || "").filter(Boolean);
        } else if (item.image_url) {
          images = [item.image_url];
        }

        const detailUrl = item.detail_url || item.url || item.slug || "";
        const fullLink = detailUrl.startsWith("http") ? detailUrl : detailUrl ? `https://www.cars24.com${detailUrl}` : "";
        
        cars.push({
          id: genId("cars24", title, price),
          model: title,
          variant: item.variant || item.trim || "",
          year: year,
          km: km,
          price: price,
          fuel: detectFuel(item.fuel_type || title),
          transmission: detectTrans(item.transmission || title),
          body_type: detectBody(title),
          drivetrain: detectDrivetrain(title + " " + (item.variant || "")),
          owners: item.owner_count || item.no_of_owners || 1,
          reg_state: detectState(item.city || city),
          city: (item.city || city).replace(/^\w/, (c: string) => c.toUpperCase()),
          color: item.color || "",
          source: "Cars24",
          certified: true,
          link: fullLink,
          notes: `Cars24 listing. ${item.certification_status || ""}`.trim(),
          images: images,
          stage: "discovered",
          seller_name: "",
          seller_phone: "",
          seller_type: "dealer",
          scraped_at: new Date().toISOString(),
        });
      } catch { continue; }
    }
  } catch (e: any) {
    console.error("Cars24 scraper error:", e.message);
  }

  return cars;
}
