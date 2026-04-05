import { NextRequest, NextResponse } from "next/server";
import { supabase, getCars, upsertCar } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters: any = {};
    if (searchParams.get("source")) filters.source = searchParams.get("source");
    if (searchParams.get("fuel")) filters.fuel = searchParams.get("fuel");
    if (searchParams.get("stage")) filters.stage = searchParams.get("stage");
    if (searchParams.get("minPrice")) filters.minPrice = parseInt(searchParams.get("minPrice")!);
    if (searchParams.get("maxPrice")) filters.maxPrice = parseInt(searchParams.get("maxPrice")!);

    const cars = await getCars(filters);
    return NextResponse.json({ total: cars.length, cars });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const car = await upsertCar(body);
    return NextResponse.json({ success: true, car });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
