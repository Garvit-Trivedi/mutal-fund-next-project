// src/app/api/scheme/[code]/route.js

export const dynamic = "force-dynamic"; // disable static caching

let cache = {};
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function GET(request, context) {
  const { code } = await context.params;
  const now = Date.now();

  // Check cache
  if (
    cache[code] &&
    cache[code].timestamp &&
    now - cache[code].timestamp < CACHE_DURATION
  ) {
    return new Response(JSON.stringify(cache[code].data), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch(`https://api.mfapi.in/mf/${code}`);
    if (!res.ok) {
      throw new Error("Failed to fetch scheme details");
    }

    const schemeData = await res.json();

    // Extract metadata & NAV history
    const { meta, data } = schemeData;

    // Normalize date from dd-MM-yyyy to yyyy-MM-dd for reliable parsing
    const toISO = (d) => {
      // Expecting formats like '02-12-2024' or '2024-12-02'
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d; // already ISO
      const parts = d.split("-");
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        if (yyyy && mm && dd && yyyy.length === 4) {
          // already yyyy-mm-dd but with different delimiter order
          return `${yyyy}-${mm}-${dd}`;
        }
        // assume dd-mm-yyyy
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      // fallback
      return d;
    };

    const responseData = {
      metadata: {
        schemeName: meta.scheme_name,
        schemeType: meta.scheme_type,
        schemeCategory: meta.scheme_category,
        fundHouse: meta.fund_house,
        isinGrowth: meta.isin_growth,
        isinDividend: meta.isin_div_reinvestment,
      },
      navHistory: data.map((item) => ({
        date: toISO(item.date),
        nav: parseFloat(item.nav),
      })),
    };

    // Cache it
    cache[code] = {
      data: responseData,
      timestamp: now,
    };

    return new Response(JSON.stringify(responseData), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch scheme details" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

