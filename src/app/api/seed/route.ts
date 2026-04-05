import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SEED_CARS } from "@/lib/seed-data";

export async function POST() {
  try {
    // Delete existing seed data (IDs starting with 's')
    await supabase.from("cars").delete().like("id", "s%");

    const { data, error } = await supabase
      .from("cars")
      .upsert(
        SEED_CARS.map((car) => ({
          ...car,
          scraped_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "id" }
      );

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Re-seeded ${SEED_CARS.length} cars (old seed data cleared)`,
      count: SEED_CARS.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    info: "POST to this endpoint to seed the database with 75 cars",
    count: SEED_CARS.length,
  });
}
