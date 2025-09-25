// src/app/api/scheme/[code]/sip/route.js
import { parseISO, addMonths, addWeeks, addYears } from "date-fns";

export const dynamic = "force-dynamic";

// Simple XIRR function
function xirr(cashflows) {
  const guess = 0.1;
  const maxIter = 50;
  const tol = 1e-7;

  const firstDate = cashflows[0].date;
  const dayCount = (d1, d2) => (d2 - d1) / (1000 * 3600 * 24);

  const npv = (r) =>
    cashflows.reduce((sum, cf) => {
      const t = dayCount(firstDate, cf.date) / 365;
      return sum + cf.amount / Math.pow(1 + r, t);
    }, 0);

  const dnpv = (r) =>
    cashflows.reduce((sum, cf) => {
      const t = dayCount(firstDate, cf.date) / 365;
      return sum + (-t) * cf.amount / Math.pow(1 + r, t + 1);
    }, 0);

  let rate = guess;
  for (let i = 0; i < maxIter; i++) {
    const f = npv(rate);
    const df = dnpv(rate);
    if (Math.abs(df) < 1e-12) break;
    const newRate = rate - f / df;
    if (Math.abs(newRate - rate) <= tol) return rate;
    rate = newRate;
  }
  return rate;
}

// Generate investment dates
function generateDates(from, to, freq) {
  const dates = [];
  let current = new Date(from);
  while (current <= to) {
    dates.push(new Date(current));
    if (freq === "monthly") current = addMonths(current, 1);
    else if (freq === "weekly") current = addWeeks(current, 1);
    else if (freq === "yearly") current = addYears(current, 1);
    else break;
  }
  return dates;
}

function findNavOnOrAfter(navHistory, date) {
  return navHistory.find((item) => new Date(item.date) >= date);
}

async function fetchNavHistory(code) {
  const res = await fetch(`http://localhost:3000/api/scheme/${code}`);
  if (!res.ok) throw new Error("Failed to fetch scheme NAV");
  const data = await res.json();
  return data.navHistory;
}

export async function POST(req, { params }) {
  const { code } = params;

  try {
    const body = await req.json();
    const amount = Number(body.amount);
    const frequency = body.frequency || "monthly";
    const from = parseISO(body.from);
    const to = body.to ? parseISO(body.to) : new Date();

    const navHistory = await fetchNavHistory(code);
    if (!navHistory || !navHistory.length)
      return new Response("No NAV history", { status: 404 });

    navHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    const latestNav = navHistory[navHistory.length - 1];

    const dates = generateDates(from, to, frequency);

    let totalUnits = 0;
    let totalInvested = 0;
    const cashflows = [];

    dates.forEach((d) => {
      const navEntry = findNavOnOrAfter(navHistory, d);
      if (!navEntry) return;
      const units = amount / navEntry.nav;
      totalUnits += units;
      totalInvested += amount;
      cashflows.push({ date: new Date(navEntry.date), amount: -amount });
    });

    const currentValue = totalUnits * latestNav.nav;
    cashflows.push({ date: new Date(latestNav.date), amount: currentValue });

    const absoluteReturn = ((currentValue - totalInvested) / totalInvested) * 100;
    const annualizedReturn = xirr(cashflows) * 100;

    const response = {
      totalInvested,
      currentValue: parseFloat(currentValue.toFixed(2)),
      totalUnits: parseFloat(totalUnits.toFixed(4)),
      absoluteReturn: parseFloat(absoluteReturn.toFixed(2)),
      annualizedReturn: parseFloat(annualizedReturn.toFixed(2)),
    };

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to calculate SIP" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
