// src/app/api/mf/route.js

export const dynamic = "force-dynamic"; // ensures it's not statically cached

let cache = {
  data: null,
  timestamp: null,
};
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function GET() {
  const now = Date.now();

  // Return cached data if still valid
  if (cache.data && cache.timestamp && now - cache.timestamp < CACHE_DURATION) {
    return new Response(JSON.stringify(cache.data), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch("https://api.mfapi.in/mf");
    if (!res.ok) {
      throw new Error("Failed to fetch schemes");
    }

    const data = await res.json();

    // Update cache
    cache = {
      data,
      timestamp: now,
    };

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch mutual fund schemes" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
