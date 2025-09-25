// src/app/api/scheme/[code]/returns/route.js
import { parseISO, subMonths, differenceInDays } from "date-fns";

export const dynamic = "force-dynamic";

async function fetchSchemeNav(code) {
  const res = await fetch(`http://localhost:3000/api/scheme/${code}`);
  if (!res.ok) throw new Error("Failed to fetch scheme NAV");
  const data = await res.json();
  return data.navHistory;
}

// Find the latest NAV on or BEFORE the target date
function findNavOnOrBefore(sortedAsc, targetDate) {
  let chosen = null;
  for (let i = 0; i < sortedAsc.length; i++) {
    const d = new Date(sortedAsc[i].date);
    if (d <= targetDate && sortedAsc[i].nav > 0) chosen = sortedAsc[i];
    if (d > targetDate) break;
  }
  return chosen;
}

export async function GET(request, context) {
  const { code } = await context.params;
  const url = new URL(request.url);
  const period = url.searchParams.get("period");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  try {
    const navHistory = await fetchSchemeNav(code);
    if (!navHistory || !navHistory.length)
      return new Response("No NAV data", { status: 404 });

    // Sort NAV history ascending
    navHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    const latestNav = navHistory[navHistory.length - 1];
    let startDate, endDate;

    // Determine start & end dates
    endDate = to ? parseISO(to) : new Date(latestNav.date);

    if (period) {
      switch (period) {
        case "1m":
          startDate = subMonths(new Date(latestNav.date), 1);
          break;
        case "3m":
          startDate = subMonths(new Date(latestNav.date), 3);
          break;
        case "6m":
          startDate = subMonths(new Date(latestNav.date), 6);
          break;
        case "1y":
          startDate = subMonths(new Date(latestNav.date), 12);
          break;
        default:
          startDate = subMonths(new Date(latestNav.date), 1);
      }
    } else if (from) {
      startDate = parseISO(from);
    } else {
      // default 1 month
      startDate = subMonths(new Date(latestNav.date), 1);
    }

    const startNavEntry = findNavOnOrBefore(navHistory, startDate);
    const endNavEntry = findNavOnOrBefore(navHistory, endDate) || latestNav;

    if (!startNavEntry || !endNavEntry)
      return new Response(JSON.stringify({ needsReview: true, reason: "NAV range not found" }), { status: 422, headers: { "Content-Type": "application/json" } });

    const simpleReturn =
      ((endNavEntry.nav / startNavEntry.nav - 1) * 100).toFixed(2);

    const days = differenceInDays(
      new Date(endNavEntry.date),
      new Date(startNavEntry.date)
    );

    if (days < 1) {
      return new Response(
        JSON.stringify({ needsReview: true, reason: "Insufficient date span" }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    const annualizedReturn = ((Math.pow(endNavEntry.nav / startNavEntry.nav, 365 / days) - 1) * 100).toFixed(2);

    const response = {
      startDate: startNavEntry.date,
      endDate: endNavEntry.date,
      startNAV: startNavEntry.nav,
      endNAV: endNavEntry.nav,
      simpleReturn: parseFloat(simpleReturn),
      annualizedReturn: parseFloat(annualizedReturn),
    };

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to calculate returns" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
