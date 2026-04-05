# ─── Pre-Worshipped: Scraping Backend ───
# FastAPI server that scrapes used car listings from multiple sources
# Run: uvicorn main:app --reload
# Deploy: Vercel serverless or any Python host

import asyncio
import json
import re
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from bs4 import BeautifulSoup

app = FastAPI(title="Pre-Worshipped Scraper API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-memory store (swap for PostgreSQL/Supabase in prod) ───
car_store: dict = {}  # id -> car dict
last_scrape: dict = {}  # source -> timestamp
scrape_status: dict = {}  # source -> {status, count, error}


# ─── Models ───
class CarListing(BaseModel):
    id: str
    model: str
    variant: str = ""
    year: int
    km: int
    price: int
    fuel: str
    transmission: str
    bodyType: str = "SUV"
    drivetrain: str = "2WD"
    owners: int = 1
    regState: str = ""
    city: str = ""
    color: str = ""
    source: str
    certified: bool = False
    link: str = ""
    notes: str = ""
    images: list[str] = []
    stage: str = "discovered"
    scraped_at: str = ""
    raw_title: str = ""


class ScrapeRequest(BaseModel):
    sources: list[str] = ["cars24", "spinny", "cardekho"]
    city: str = "chennai"
    budget_min: int = 500000
    budget_max: int = 2000000
    fuel: list[str] = ["diesel", "petrol"]
    body_type: list[str] = ["suv"]
    max_results_per_source: int = 30


class Preferences(BaseModel):
    budget_min: int = 800000
    budget_max: int = 1600000
    fuel: list[str] = ["Diesel", "Petrol"]
    body_types: list[str] = ["SUV"]
    transmission: str = "Any"
    max_km: int = 120000
    max_age: int = 9
    max_owners: int = 2
    wants_mods: bool = True
    wants_4x4: bool = True


# ─── Helpers ───
def generate_id(source: str, title: str, price: int) -> str:
    """Generate deterministic ID for deduplication"""
    raw = f"{source}:{title}:{price}"
    return hashlib.md5(raw.encode()).hexdigest()[:12]


def extract_year(text: str) -> int:
    """Extract year from text"""
    match = re.search(r'20[12]\d', text)
    return int(match.group()) if match else 2022


def extract_km(text: str) -> int:
    """Extract km from text"""
    text = text.lower().replace(",", "").replace(" ", "")
    match = re.search(r'(\d+)\s*(?:km|kms)', text)
    if match:
        return int(match.group(1))
    match = re.search(r'(\d+)', text)
    return int(match.group(1)) if match else 0


def detect_fuel(text: str) -> str:
    text = text.lower()
    if "diesel" in text: return "Diesel"
    if "hybrid" in text: return "Hybrid"
    if "electric" in text or "ev" in text: return "Electric"
    if "cng" in text: return "CNG"
    return "Petrol"


def detect_transmission(text: str) -> str:
    text = text.lower()
    if any(x in text for x in ["automatic", "at", "dsg", "dct", "cvt", "amt", "torque converter"]): 
        return "Automatic"
    return "Manual"


def detect_body_type(text: str) -> str:
    text = text.lower()
    if any(x in text for x in ["suv", "crossover"]): return "SUV"
    if any(x in text for x in ["sedan", "saloon"]): return "Sedan"
    if any(x in text for x in ["muv", "mpv", "innova", "crysta", "hycross"]): return "MUV"
    if any(x in text for x in ["hatchback", "hatch"]): return "Hatchback"
    return "SUV"


def detect_state(text: str) -> str:
    text = text.upper()
    state_map = {
        "TN": "TN", "TAMIL NADU": "TN", "CHENNAI": "TN",
        "KA": "KA", "KARNATAKA": "KA", "BANGALORE": "KA", "BENGALURU": "KA",
        "MH": "MH", "MAHARASHTRA": "MH", "MUMBAI": "MH", "PUNE": "MH",
        "DL": "DL", "DELHI": "DL", "NEW DELHI": "DL",
        "KL": "KL", "KERALA": "KL", "KOCHI": "KL",
        "AP": "AP", "ANDHRA": "AP", "HYDERABAD": "TS", "TS": "TS", "TELANGANA": "TS",
        "PY": "PY", "PONDICHERRY": "PY", "PUDUCHERRY": "PY",
        "GA": "GA", "GOA": "GA",
    }
    for key, val in state_map.items():
        if key in text: return val
    return ""


# ═══════════════════════════════════════════════════════
# SCRAPERS
# ═══════════════════════════════════════════════════════

async def scrape_cars24(params: ScrapeRequest) -> list[CarListing]:
    """
    Cars24 scraper
    Cars24 has a JSON API that powers their frontend.
    Endpoint: https://api.cars24.com/buy-used-cars
    """
    cars = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
    }
    
    city_map = {"chennai": "chennai", "bangalore": "bengaluru", "mumbai": "mumbai", "delhi": "new-delhi"}
    city_slug = city_map.get(params.city.lower(), params.city.lower())
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            # Cars24's search API
            url = f"https://listing-service.cars24.com/api/v1/listing"
            api_params = {
                "city": city_slug,
                "sort": "bestmatch",
                "budget": f"{params.budget_min}-{params.budget_max}",
                "size": min(params.max_results_per_source, 50),
            }
            
            resp = await client.get(url, params=api_params, headers=headers)
            
            if resp.status_code == 200:
                data = resp.json()
                listings = data.get("data", {}).get("listing", []) or data.get("results", [])
                
                for item in listings[:params.max_results_per_source]:
                    try:
                        title = item.get("title", "") or item.get("car_name", "")
                        price = item.get("price", 0) or item.get("selling_price", 0)
                        km = item.get("km", 0) or item.get("kms_driven", 0)
                        year = item.get("year", 0) or extract_year(title)
                        fuel = item.get("fuel_type", "") or detect_fuel(title)
                        trans = item.get("transmission", "") or detect_transmission(title)
                        city = item.get("city", params.city)
                        images = item.get("images", []) or item.get("image_urls", [])
                        link = item.get("url", "") or item.get("detail_url", "")
                        
                        if isinstance(images, list) and len(images) > 0:
                            images = [img if isinstance(img, str) else img.get("url", "") for img in images[:5]]
                        
                        car = CarListing(
                            id=generate_id("cars24", title, price),
                            model=title,
                            variant=item.get("variant", ""),
                            year=year,
                            km=km,
                            price=price,
                            fuel=detect_fuel(fuel),
                            transmission=detect_transmission(trans),
                            bodyType=detect_body_type(title),
                            owners=item.get("owner_count", 1) or 1,
                            regState=detect_state(city),
                            city=city.title(),
                            color=item.get("color", ""),
                            source="Cars24",
                            certified=True,
                            link=f"https://www.cars24.com{link}" if link and not link.startswith("http") else link,
                            images=images,
                            stage="discovered",
                            scraped_at=datetime.now().isoformat(),
                            raw_title=title,
                        )
                        cars.append(car)
                    except Exception:
                        continue
    except Exception as e:
        scrape_status["cars24"] = {"status": "error", "error": str(e), "count": 0}
    
    scrape_status["cars24"] = {"status": "done", "count": len(cars), "error": None}
    return cars


async def scrape_cardekho(params: ScrapeRequest) -> list[CarListing]:
    """
    CarDekho used cars scraper
    Uses their web pages since API is restricted
    """
    cars = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    }
    
    city_slug = params.city.lower()
    
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            url = f"https://www.cardekho.com/used-cars+in+{city_slug}"
            resp = await client.get(url, headers=headers)
            
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                
                # CardDekho uses specific class patterns for listings
                listings = soup.select(".gsc_col-sm-12.gsc_col-xs-12.gsc_col-md-12") or \
                           soup.select("[data-tracking-section='usedCarListing']") or \
                           soup.select(".carsListData")
                
                for item in listings[:params.max_results_per_source]:
                    try:
                        title_el = item.select_one("a.title") or item.select_one("h3") or item.select_one(".heading")
                        price_el = item.select_one(".price") or item.select_one("[class*='price']")
                        
                        if not title_el: continue
                        
                        title = title_el.get_text(strip=True)
                        price_text = price_el.get_text(strip=True) if price_el else "0"
                        
                        # Parse price (handle "₹ 12.5 Lakh" format)
                        price_clean = re.sub(r'[₹,\s]', '', price_text.lower())
                        price = 0
                        if "lakh" in price_clean or "lac" in price_clean:
                            num = re.search(r'([\d.]+)', price_clean)
                            if num: price = int(float(num.group(1)) * 100000)
                        elif "crore" in price_clean or "cr" in price_clean:
                            num = re.search(r'([\d.]+)', price_clean)
                            if num: price = int(float(num.group(1)) * 10000000)
                        else:
                            num = re.search(r'(\d+)', price_clean)
                            if num: price = int(num.group(1))
                        
                        link_el = item.select_one("a[href*='used-car']") or title_el
                        link = link_el.get("href", "") if link_el else ""
                        
                        img_el = item.select_one("img[src*='car']") or item.select_one("img")
                        images = [img_el.get("src", "")] if img_el and img_el.get("src") else []
                        
                        # Extract details from text
                        details_text = item.get_text(" ", strip=True)
                        
                        car = CarListing(
                            id=generate_id("cardekho", title, price),
                            model=title,
                            year=extract_year(title + " " + details_text),
                            km=extract_km(details_text),
                            price=price,
                            fuel=detect_fuel(details_text),
                            transmission=detect_transmission(details_text),
                            bodyType=detect_body_type(title),
                            regState=detect_state(params.city),
                            city=params.city.title(),
                            source="CarDekho",
                            link=f"https://www.cardekho.com{link}" if link and not link.startswith("http") else link,
                            images=images,
                            stage="discovered",
                            scraped_at=datetime.now().isoformat(),
                            raw_title=title,
                        )
                        cars.append(car)
                    except Exception:
                        continue
    except Exception as e:
        scrape_status["cardekho"] = {"status": "error", "error": str(e), "count": 0}
    
    scrape_status["cardekho"] = {"status": "done", "count": len(cars), "error": None}
    return cars


async def scrape_spinny(params: ScrapeRequest) -> list[CarListing]:
    """
    Spinny scraper — fixed-price model
    """
    cars = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
    }
    
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            # Spinny's API endpoint
            url = "https://api.spinny.com/v3/listing/cars"
            api_params = {
                "city": params.city.lower(),
                "budget_min": params.budget_min,
                "budget_max": params.budget_max,
                "page": 1,
                "size": min(params.max_results_per_source, 30),
            }
            
            resp = await client.get(url, params=api_params, headers=headers)
            
            if resp.status_code == 200:
                data = resp.json()
                listings = data.get("data", {}).get("cars", []) or data.get("results", [])
                
                for item in listings[:params.max_results_per_source]:
                    try:
                        title = item.get("name", "") or f"{item.get('make', '')} {item.get('model', '')}"
                        price = item.get("price", 0) or item.get("selling_price", 0)
                        images = item.get("images", []) or []
                        if isinstance(images, list):
                            images = [img if isinstance(img, str) else img.get("url", "") for img in images[:5]]
                        
                        car = CarListing(
                            id=generate_id("spinny", title, price),
                            model=title.strip(),
                            variant=item.get("variant", ""),
                            year=item.get("year", extract_year(title)),
                            km=item.get("km", 0) or item.get("kms_driven", 0),
                            price=price,
                            fuel=detect_fuel(item.get("fuel_type", title)),
                            transmission=detect_transmission(item.get("transmission", title)),
                            bodyType=detect_body_type(title),
                            owners=item.get("owners", 1),
                            regState=detect_state(params.city),
                            city=params.city.title(),
                            color=item.get("color", ""),
                            source="Spinny",
                            certified=True,
                            link=item.get("url", ""),
                            images=images,
                            stage="discovered",
                            scraped_at=datetime.now().isoformat(),
                            raw_title=title,
                        )
                        cars.append(car)
                    except Exception:
                        continue
    except Exception as e:
        scrape_status["spinny"] = {"status": "error", "error": str(e), "count": 0}
    
    scrape_status["spinny"] = {"status": "done", "count": len(cars), "error": None}
    return cars


async def scrape_teambhp(params: ScrapeRequest) -> list[CarListing]:
    """
    Team-BHP Classifieds scraper — enthusiast-owned, well-maintained cars
    Often the best deals because sellers are car enthusiasts
    """
    cars = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    }
    
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            # Team-BHP classifieds section
            url = "https://www.team-bhp.com/classifieds"
            resp = await client.get(url, headers=headers)
            
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                
                listings = soup.select(".classified-listing") or soup.select("tr.classified")
                
                for item in listings[:params.max_results_per_source]:
                    try:
                        title_el = item.select_one("a.title") or item.select_one("a")
                        price_el = item.select_one(".price") or item.select_one("[class*='price']")
                        
                        if not title_el: continue
                        
                        title = title_el.get_text(strip=True)
                        link = title_el.get("href", "")
                        
                        price_text = price_el.get_text(strip=True) if price_el else "0"
                        price_clean = re.sub(r'[₹,\s]', '', price_text.lower())
                        price = 0
                        if "lakh" in price_clean:
                            num = re.search(r'([\d.]+)', price_clean)
                            if num: price = int(float(num.group(1)) * 100000)
                        
                        details = item.get_text(" ", strip=True)
                        
                        car = CarListing(
                            id=generate_id("teambhp", title, price),
                            model=title,
                            year=extract_year(details),
                            km=extract_km(details),
                            price=price,
                            fuel=detect_fuel(details),
                            transmission=detect_transmission(details),
                            bodyType=detect_body_type(title),
                            city=params.city.title(),
                            source="Team-BHP",
                            certified=False,
                            link=f"https://www.team-bhp.com{link}" if not link.startswith("http") else link,
                            notes="Enthusiast-owned. Team-BHP classifieds = typically well-maintained.",
                            stage="discovered",
                            scraped_at=datetime.now().isoformat(),
                            raw_title=title,
                        )
                        cars.append(car)
                    except Exception:
                        continue
    except Exception as e:
        scrape_status["teambhp"] = {"status": "error", "error": str(e), "count": 0}
    
    scrape_status["teambhp"] = {"status": "done", "count": len(cars), "error": None}
    return cars


async def scrape_olx(params: ScrapeRequest) -> list[CarListing]:
    """
    OLX Autos scraper
    """
    cars = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    }
    
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            url = f"https://www.olx.in/api/relevance/v2/search"
            api_params = {
                "category": "84",  # Cars category
                "location": params.city.lower(),
                "price_min": params.budget_min,
                "price_max": params.budget_max,
                "page": 1,
                "limit": min(params.max_results_per_source, 40),
            }
            
            resp = await client.get(url, params=api_params, headers=headers)
            
            if resp.status_code == 200:
                data = resp.json()
                listings = data.get("data", [])
                
                for item in listings[:params.max_results_per_source]:
                    try:
                        title = item.get("title", "")
                        price = item.get("price", {}).get("value", {}).get("raw", 0) if isinstance(item.get("price"), dict) else 0
                        images = []
                        if item.get("images"):
                            images = [img.get("url", "") for img in item["images"][:5] if isinstance(img, dict)]
                        
                        params_data = {p.get("key", ""): p.get("value", "") for p in item.get("parameters", []) if isinstance(p, dict)}
                        
                        car = CarListing(
                            id=generate_id("olx", title, price),
                            model=title,
                            year=extract_year(str(params_data.get("year", title))),
                            km=extract_km(str(params_data.get("mileage", "0"))),
                            price=price,
                            fuel=detect_fuel(params_data.get("fuel", title)),
                            transmission=detect_transmission(params_data.get("transmission", title)),
                            bodyType=detect_body_type(title),
                            owners=int(params_data.get("no_of_owners", "1").replace("+", "") or 1),
                            city=params.city.title(),
                            source="OLX",
                            certified=False,
                            link=item.get("url", ""),
                            images=images,
                            notes="⚠ OLX listing — no certification. Independent inspection mandatory.",
                            stage="discovered",
                            scraped_at=datetime.now().isoformat(),
                            raw_title=title,
                        )
                        cars.append(car)
                    except Exception:
                        continue
    except Exception as e:
        scrape_status["olx"] = {"status": "error", "error": str(e), "count": 0}
    
    scrape_status["olx"] = {"status": "done", "count": len(cars), "error": None}
    return cars


# ─── Scraper registry ───
SCRAPERS = {
    "cars24": scrape_cars24,
    "cardekho": scrape_cardekho,
    "spinny": scrape_spinny,
    "teambhp": scrape_teambhp,
    "olx": scrape_olx,
}


# ═══════════════════════════════════════════════════════
# API ROUTES
# ═══════════════════════════════════════════════════════

@app.get("/")
def root():
    return {
        "name": "Pre-Worshipped Scraper API",
        "version": "2.0",
        "endpoints": {
            "/scrape": "POST - Start scraping from specified sources",
            "/cars": "GET - Get all scraped cars",
            "/cars/{id}": "GET - Get specific car",
            "/status": "GET - Scraping status",
            "/sources": "GET - Available scraper sources",
            "/health": "GET - Health check",
        },
        "available_sources": list(SCRAPERS.keys()),
        "total_cars": len(car_store),
    }


@app.get("/health")
def health():
    return {"status": "healthy", "total_cars": len(car_store), "last_scrapes": last_scrape}


@app.get("/sources")
def get_sources():
    return {
        "available": list(SCRAPERS.keys()),
        "descriptions": {
            "cars24": "Cars24 — organized platform, 300-point inspection, ~10% premium",
            "cardekho": "CarDekho — largest aggregator, multi-city",
            "spinny": "Spinny — fixed-price, 5-day return, ~12% premium",
            "teambhp": "Team-BHP Classifieds — enthusiast-owned, hidden gem",
            "olx": "OLX — marketplace, cheapest but zero safety net",
        },
        "coming_soon": [
            "Toyota U Trust (toyotautrust.in)",
            "Mahindra First Choice (mahindrafirstchoice.com)",
            "Das WeltAuto (dasweltauto.co.in)",
            "Hyundai H Promise (hpromise.co.in)",
            "Maruti True Value (marutisuzukitruevalue.com)",
            "Droom (droom.in)",
            "CarTrade (cartrade.com)",
            "Facebook Marketplace",
        ],
        "status": scrape_status,
    }


@app.post("/scrape")
async def start_scrape(req: ScrapeRequest, background_tasks: BackgroundTasks):
    """Start scraping from specified sources"""
    
    # Mark all as in-progress
    for source in req.sources:
        if source in SCRAPERS:
            scrape_status[source] = {"status": "scraping", "count": 0, "error": None}
    
    # Run scrapers
    async def run_scrapers():
        tasks = []
        for source in req.sources:
            if source in SCRAPERS:
                tasks.append(SCRAPERS[source](req))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        new_count = 0
        for result in results:
            if isinstance(result, list):
                for car in result:
                    car_store[car.id] = car.dict()
                    new_count += 1
        
        for source in req.sources:
            last_scrape[source] = datetime.now().isoformat()
        
        return new_count
    
    count = await run_scrapers()
    
    return {
        "status": "completed",
        "new_cars_found": count,
        "total_cars": len(car_store),
        "source_status": {s: scrape_status.get(s, {}) for s in req.sources},
    }


@app.get("/cars")
def get_cars(
    source: Optional[str] = None,
    fuel: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    min_year: Optional[int] = None,
    city: Optional[str] = None,
    transmission: Optional[str] = None,
    sort_by: str = "price",
    limit: int = 100,
):
    """Get all scraped cars with optional filters"""
    cars = list(car_store.values())
    
    if source: cars = [c for c in cars if c.get("source", "").lower() == source.lower()]
    if fuel: cars = [c for c in cars if c.get("fuel", "").lower() == fuel.lower()]
    if min_price: cars = [c for c in cars if c.get("price", 0) >= min_price]
    if max_price: cars = [c for c in cars if c.get("price", 0) <= max_price]
    if min_year: cars = [c for c in cars if c.get("year", 0) >= min_year]
    if city: cars = [c for c in cars if city.lower() in c.get("city", "").lower()]
    if transmission: cars = [c for c in cars if c.get("transmission", "").lower() == transmission.lower()]
    
    # Sort
    if sort_by == "price": cars.sort(key=lambda c: c.get("price", 0))
    elif sort_by == "year": cars.sort(key=lambda c: c.get("year", 0), reverse=True)
    elif sort_by == "km": cars.sort(key=lambda c: c.get("km", 0))
    
    return {"total": len(cars), "cars": cars[:limit]}


@app.get("/cars/{car_id}")
def get_car(car_id: str):
    car = car_store.get(car_id)
    if not car:
        return {"error": "Car not found"}
    return car


@app.get("/status")
def get_status():
    return {
        "total_cars": len(car_store),
        "sources": scrape_status,
        "last_scrapes": last_scrape,
        "cars_by_source": {
            source: len([c for c in car_store.values() if c.get("source", "").lower() == source.lower()])
            for source in SCRAPERS.keys()
        },
    }


@app.delete("/cars")
def clear_cars():
    """Clear all scraped cars"""
    car_store.clear()
    return {"status": "cleared"}


# ─── Run with: uvicorn main:app --reload --port 8000 ───
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
