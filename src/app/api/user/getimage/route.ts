import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  // get query from URL
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return NextResponse.json({ imageUrl: data.results[0].urls.small });
    } else {
      return NextResponse.json({ message: "No image found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
