import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Types ───
export interface Car {
  id: string;
  model: string;
  variant: string;
  year: number;
  km: number;
  price: number;
  fuel: string;
  transmission: string;
  body_type: string;
  drivetrain: string;
  owners: number;
  reg_state: string;
  city: string;
  color: string;
  source: string;
  certified: boolean;
  link: string;
  notes: string;
  images: string[];
  stage: string;
  scraped_at: string;
  created_at: string;
  // Seller contact
  seller_name: string;
  seller_phone: string;
  seller_type: string; // "dealer" | "individual" | "oem" | "unknown"
}

export interface Preferences {
  id: string;
  budget_min: number;
  budget_max: number;
  fuel_pref: string[];
  body_types: string[];
  transmission: string;
  max_km: number;
  max_age: number;
  max_owners: number;
  wants_mods: boolean;
  wants_4x4: boolean;
  // Location
  base_city: string;
  search_radius: number;
  // Hunters
  diesel_hunter: boolean;
  min_displacement: number;
  pickup_hunter: boolean;
  fourx4_hunter: boolean;
}

export interface AiAnalysis {
  car_id: string;
  verdict: string;
  confidence: number;
  summary: string;
  hidden_costs: string;
  negotiation_tip: string;
  check_these: string;
  long_term: string;
  fair_price: string;
}

// ─── Database operations ───

export async function getCars(filters?: {
  source?: string;
  fuel?: string;
  stage?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  let query = supabase.from("cars").select("*").order("created_at", { ascending: false });

  if (filters?.source) query = query.eq("source", filters.source);
  if (filters?.fuel) query = query.eq("fuel", filters.fuel);
  if (filters?.stage) query = query.eq("stage", filters.stage);
  if (filters?.minPrice) query = query.gte("price", filters.minPrice);
  if (filters?.maxPrice) query = query.lte("price", filters.maxPrice);

  const { data, error } = await query;
  if (error) throw error;
  return data as Car[];
}

export async function getCarById(id: string) {
  const { data, error } = await supabase.from("cars").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Car;
}

export async function upsertCar(car: Partial<Car> & { id: string }) {
  const { data, error } = await supabase
    .from("cars")
    .upsert({ ...car, updated_at: new Date().toISOString() }, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data as Car;
}

export async function upsertManyCars(cars: Array<Partial<Car> & { id: string }>) {
  const { data, error } = await supabase
    .from("cars")
    .upsert(
      cars.map((c) => ({ ...c, updated_at: new Date().toISOString() })),
      { onConflict: "id" }
    );
  if (error) throw error;
  return data;
}

export async function deleteCar(id: string) {
  const { error } = await supabase.from("cars").delete().eq("id", id);
  if (error) throw error;
}

export async function updateCarStage(id: string, stage: string) {
  const { error } = await supabase
    .from("cars")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function getPreferences() {
  const { data, error } = await supabase.from("preferences").select("*").eq("id", "default").single();
  if (error) throw error;
  return data as Preferences;
}

export async function updatePreferences(prefs: Partial<Preferences>) {
  const { data, error } = await supabase
    .from("preferences")
    .upsert({ id: "default", ...prefs, updated_at: new Date().toISOString() }, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data as Preferences;
}

export async function getAiAnalysis(carId: string) {
  const { data, error } = await supabase
    .from("ai_analysis")
    .select("*")
    .eq("car_id", carId)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
  return data as AiAnalysis | null;
}

export async function saveAiAnalysis(analysis: AiAnalysis) {
  const { error } = await supabase
    .from("ai_analysis")
    .upsert({ ...analysis, analyzed_at: new Date().toISOString() }, { onConflict: "car_id" });
  if (error) throw error;
}

export async function getChecklist(carId: string) {
  const { data, error } = await supabase
    .from("checklist")
    .select("*")
    .eq("car_id", carId);
  if (error) throw error;
  return data || [];
}

export async function toggleChecklistItem(carId: string, category: string, item: string) {
  const id = `${carId}-${category}-${item}`;
  // Check if exists
  const { data } = await supabase.from("checklist").select("checked").eq("id", id).single();

  if (data) {
    await supabase
      .from("checklist")
      .update({ checked: !data.checked, updated_at: new Date().toISOString() })
      .eq("id", id);
  } else {
    await supabase.from("checklist").insert({
      id,
      car_id: carId,
      category,
      item,
      checked: true,
    });
  }
}
