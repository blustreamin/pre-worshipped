import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing url param", { status: 400 });

  // Determine correct referer based on CDN domain
  let referer = "https://www.google.com/";
  if (url.includes("aeplcdn.com")) referer = "https://www.carwale.com/";
  if (url.includes("cardekho.com")) referer = "https://www.cardekho.com/";
  if (url.includes("carandbike.com")) referer = "https://www.carandbike.com/";

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        "Referer": referer,
        "Origin": referer.replace(/\/$/, ""),
      },
    });

    if (!res.ok) return new NextResponse("Image not found", { status: 404 });

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}
