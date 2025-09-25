"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  NoSsr,
  Box,
  Chip,
  Stack,
  Tabs,
  Tab,
  Paper,
  Fade,
} from "@mui/material";
import BrandedLoader from "@/components/BrandedLoader";
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import CalculateIcon from '@mui/icons-material/Calculate';
import MoneyIcon from '@mui/icons-material/Money';
import PaymentsIcon from '@mui/icons-material/Payments';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

import { LineChart } from "@mui/x-charts/LineChart";
import { parseISO, addMonths, addWeeks, addYears, differenceInYears, subYears, isSameDay } from "date-fns";

export default function SchemeDetailPage({ params }) {
  const { code } = params;
  const [metadata, setMetadata] = useState(null);
  const [navHistory, setNavHistory] = useState([]);
  const [returnsRows, setReturnsRows] = useState([]);
  const [tab, setTab] = useState(0);
  const [sipAmount, setSipAmount] = useState(5000);
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2023-12-31");
  const [sipResult, setSipResult] = useState(null);
  const [lumpsumAmount, setLumpsumAmount] = useState(50000);
  const [swpAmount, setSwpAmount] = useState(2000);
  const [swpFrequency, setSwpFrequency] = useState("monthly");
  const [showMA, setShowMA] = useState(false);
  const [maWindow, setMaWindow] = useState(10);

  useEffect(() => {
    let cancelled = false;
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/scheme/${code}`);
        if (!res.ok) throw new Error("Failed to fetch scheme details");
        const data = await res.json();
        if (!cancelled) {
          setMetadata(data.metadata);
          setNavHistory(Array.isArray(data.navHistory) ? data.navHistory : []);
        }
      } catch (e) {
        console.error("/scheme/[code]: failed to load details", e);
      }
    }
    fetchDetails();
    return () => {
      cancelled = true;
    };
  }, [code]);

  useEffect(() => {
    let cancelled = false;
    async function fetchReturns() {
      try {
        const periods = ["1m", "3m", "6m", "1y"];
        const results = await Promise.all(
          periods.map(async (p) => {
            const r = await fetch(`/api/scheme/${code}/returns?period=${p}`);
            if (!r.ok) return { period: p, needs_review: true };
            const d = await r.json();
            return {
              period: p,
              startDate: d.startDate,
              endDate: d.endDate,
              startNav: d.startNAV,
              endNav: d.endNAV,
              simpleReturn: d.simpleReturn,
              annualizedReturn: d.annualizedReturn,
            };
          })
        );
        if (!cancelled) setReturnsRows(results);
      } catch (e) {
        console.warn("/scheme/[code]: returns fetch failed", e);
        if (!cancelled) setReturnsRows([]);
      }
    }
    if (code) fetchReturns();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const sortedNav = useMemo(() => {
    return [...navHistory]
      .filter((n) => n && n.nav != null && Number(n.nav) > 0)
      .sort((a, b) => parseISO(a.date) - parseISO(b.date));
  }, [navHistory]);

  const handleCalculateSIP = () => {
    if (sortedNav.length === 0) {
      setSipResult({ needsReview: true, reason: "No NAV history available" });
      return;
    }

    const from = parseISO(startDate);
    const to = parseISO(endDate);
    if (isNaN(from) || isNaN(to) || from > to) {
      setSipResult({ needsReview: true, reason: "Invalid date range" });
      return;
    }

    const investmentDates = [];
    let current = from;
    while (current <= to) {
      investmentDates.push(current);
      if (frequency === "monthly") current = addMonths(current, 1);
      else if (frequency === "weekly") current = addWeeks(current, 1);
      else if (frequency === "yearly") current = addYears(current, 1);
      else break;
    }

    const filteredNav = sortedNav.filter((n) => {
      const d = parseISO(n.date);
      return d >= from && d <= to;
    });

    if (filteredNav.length === 0) {
      setSipResult({ needsReview: true, reason: "No NAV data in the date range" });
      return;
    }

    let totalUnits = 0;
    let totalInvested = 0;
    const labels = [];
    const values = [];

    const investmentSet = new Set(investmentDates.map((d) => d.toISOString().split("T")[0]));

    filteredNav.forEach((n) => {
      const d = parseISO(n.date);
      const dateStr = d.toISOString().split("T")[0];
      if (investmentSet.has(dateStr)) {
        const units = sipAmount / Number(n.nav);
        if (isFinite(units)) {
          totalUnits += units;
          totalInvested += sipAmount;
        }
      }
      labels.push(n.date);
      values.push(parseFloat((totalUnits * Number(n.nav)).toFixed(2)));
    });

    const latestNavEntry = filteredNav[filteredNav.length - 1];
    if (!latestNavEntry || totalInvested <= 0) {
      setSipResult({ needsReview: true, reason: "Insufficient data for calculation" });
      return;
    }

    const finalCurrentValue = totalUnits * Number(latestNavEntry.nav);
    const absoluteReturn = ((finalCurrentValue - totalInvested) / totalInvested) * 100;
    const years = Math.max(differenceInYears(to, from), 0.0001);
    const annualizedReturn = (Math.pow(finalCurrentValue / totalInvested, 1 / years) - 1) * 100;

    setSipResult({
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      currentValue: parseFloat(finalCurrentValue.toFixed(2)),
      absoluteReturn: parseFloat(absoluteReturn.toFixed(2)),
      annualizedReturn: parseFloat(annualizedReturn.toFixed(2)),
      chart: { labels, values },
    });
  };

  if (!metadata) return <BrandedLoader label="Loading scheme details..." />;

  // NAV last 1 year based on latest available NAV date (deterministic for SSR/CSR)
  const latestDate = sortedNav.length ? parseISO(sortedNav[sortedNav.length - 1].date) : null;
  const oneYearAgo = latestDate ? subYears(latestDate, 1) : null;
  const points = oneYearAgo ? sortedNav.filter((n) => parseISO(n.date) >= oneYearAgo) : [];
  const x = points.map((p) => p.date);
  const y = points.map((p) => Number(p.nav));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h4" fontWeight={700} color="primary">
              {metadata.schemeName}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip size="small" label={metadata.fundHouse} color="primary" variant="outlined" />
              <Chip size="small" label={metadata.schemeCategory} color="secondary" variant="outlined" />
              <Chip size="small" label={metadata.schemeType} color="info" variant="outlined" />
              {metadata.isinGrowth && <Chip size="small" label={`ISIN G: ${metadata.isinGrowth}`} variant="outlined" />}
              {metadata.isinDividend && <Chip size="small" label={`ISIN D: ${metadata.isinDividend}`} variant="outlined" />}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          scrollButtons="auto"
          aria-label="scheme tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<ShowChartIcon />} iconPosition="start" label="Overview" />
          <Tab icon={<TableChartIcon />} iconPosition="start" label="Returns" />
          <Tab icon={<CalculateIcon />} iconPosition="start" label="SIP Calculator" />
          <Tab icon={<MoneyIcon />} iconPosition="start" label="Lumpsum" />
          <Tab icon={<PaymentsIcon />} iconPosition="start" label="SWP" />
          <Tab icon={<CompareArrowsIcon />} iconPosition="start" label="Strategies Compare" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <Fade in={tab === 0} timeout={350}>
              <Box>
                <Card variant="outlined" sx={{ boxShadow: 2 }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                      <Typography variant="h6" color="text.primary">NAV (Last 1 Year)</Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                          size="small"
                          label={showMA ? "MA: ON" : "MA: OFF"}
                          onClick={() => setShowMA((v) => !v)}
                          variant="outlined"
                          color={showMA ? "primary" : "default"}
                        />
                        <TextField
                          size="small"
                          label="MA Window"
                          type="number"
                          value={maWindow}
                          onChange={(e) => setMaWindow(Math.max(2, Number(e.target.value) || 10))}
                          sx={{ width: 120 }}
                        />
                      </Stack>
                    </Stack>
                    <NoSsr>
                      <LineChart
                        xAxis={[{ scaleType: "point", data: x }]}
                        series={[
                          { data: y, label: "NAV", area: true },
                          ...(showMA ? [{ data: movingAverage(y, maWindow), label: `MA(${maWindow})`, color: "#888" }] : []),
                        ]}
                        height={320}
                        slotProps={{
                          legend: { direction: 'row', position: { vertical: 'top', horizontal: 'middle' } },
                          grid: { horizontal: true, vertical: true },
                        }}
                      />
                    </NoSsr>
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          )}
          {tab === 1 && (
            <Fade in={tab === 1} timeout={350}>
              <Box>
                <Card variant="outlined" sx={{ boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="text.primary">Pre-computed Returns</Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Period</strong></TableCell>
                          <TableCell><strong>Start Date</strong></TableCell>
                          <TableCell><strong>End Date</strong></TableCell>
                          <TableCell><strong>Start NAV</strong></TableCell>
                          <TableCell><strong>End NAV</strong></TableCell>
                          <TableCell><strong>Simple Return (%)</strong></TableCell>
                          <TableCell><strong>Annualized Return (%)</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {returnsRows.map((r, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell>{r.period}</TableCell>
                            <TableCell>{r.startDate || "-"}</TableCell>
                            <TableCell>{r.endDate || "-"}</TableCell>
                            <TableCell>{r.startNav ?? "-"}</TableCell>
                            <TableCell>{r.endNav ?? "-"}</TableCell>
                            <TableCell>{r.simpleReturn ?? "-"}</TableCell>
                            <TableCell>{r.annualizedReturn ?? "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          )}
          {tab === 2 && (
            <Fade in={tab === 2} timeout={350}>
              <Box>
                <Card variant="outlined" sx={{ boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="text.primary">SIP Calculator</Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="SIP Amount"
                          type="number"
                          fullWidth
                          value={sipAmount}
                          onChange={(e) => setSipAmount(Number(e.target.value))}
                          variant="outlined"
                          InputProps={{ startAdornment: <Typography>₹</Typography> }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Frequency"
                          select
                          fullWidth
                          value={frequency}
                          onChange={(e) => setFrequency(e.target.value)}
                          variant="outlined"
                        >
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="yearly">Yearly</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Start Date"
                          type="date"
                          fullWidth
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="End Date"
                          type="date"
                          fullWidth
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                    <Button variant="contained" color="primary" onClick={handleCalculateSIP} sx={{ mt: 1 }}>
                      Calculate Returns
                    </Button>
                    {sipResult && !sipResult.needsReview && (
                      <Card sx={{ mt: 3, boxShadow: 1 }}>
                        <CardContent>
                          <Stack spacing={1}>
                            <Typography variant="body1">Total Invested: ₹{sipResult.totalInvested}</Typography>
                            <Typography variant="body1">Current Value: ₹{sipResult.currentValue}</Typography>
                            <Typography variant="body1">Absolute Return: {sipResult.absoluteReturn}%</Typography>
                            <Typography variant="body1">Annualized Return: {sipResult.annualizedReturn}%</Typography>
                          </Stack>
                          <NoSsr>
                            <LineChart
                              xAxis={[{ scaleType: "point", data: sipResult.chart.labels }]}
                              series={[{ data: sipResult.chart.values, label: "Investment Value", area: true }]}
                              height={300}
                              slotProps={{
                                legend: { direction: 'row', position: { vertical: 'top', horizontal: 'middle' } },
                                grid: { horizontal: true, vertical: true },
                              }}
                            />
                          </NoSsr>
                        </CardContent>
                      </Card>
                    )}
                    {sipResult && sipResult.needsReview && (
                      <Typography color="error" sx={{ mt: 2 }}>
                        Calculation needs review: {sipResult.reason || "insufficient data"}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          )}
          {tab === 3 && (
            <Fade in={tab === 3} timeout={350}>
              <Box>
                <Card variant="outlined" sx={{ boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="text.primary">Lumpsum Calculator</Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Lumpsum Amount"
                          type="number"
                          fullWidth
                          value={lumpsumAmount}
                          onChange={(e) => setLumpsumAmount(Number(e.target.value))}
                          variant="outlined"
                          InputProps={{ startAdornment: <Typography>₹</Typography> }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Start Date"
                          type="date"
                          fullWidth
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="End Date"
                          type="date"
                          fullWidth
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                    <NoSsr>
                      {(() => {
                        const lumpsumData = simulateLumpsum(navHistory, lumpsumAmount, startDate, endDate);
                        return (
                          <LineChart
                            xAxis={[{ scaleType: "point", data: lumpsumData.labels }]}
                            series={[{ data: lumpsumData.values, label: "Lumpsum Value", area: true }]}
                            height={300}
                            slotProps={{
                              legend: { direction: 'row', position: { vertical: 'top', horizontal: 'middle' } },
                              grid: { horizontal: true, vertical: true },
                            }}
                          />
                        );
                      })()}
                    </NoSsr>
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          )}
          {tab === 4 && (
            <Fade in={tab === 4} timeout={350}>
              <Box>
                <Card variant="outlined" sx={{ boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="text.primary">SWP Calculator</Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Withdrawal Amount"
                          type="number"
                          fullWidth
                          value={swpAmount}
                          onChange={(e) => setSwpAmount(Number(e.target.value))}
                          variant="outlined"
                          InputProps={{ startAdornment: <Typography>₹</Typography> }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Frequency"
                          select
                          fullWidth
                          value={swpFrequency}
                          onChange={(e) => setSwpFrequency(e.target.value)}
                          variant="outlined"
                        >
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="yearly">Yearly</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Start Date"
                          type="date"
                          fullWidth
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="End Date"
                          type="date"
                          fullWidth
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                    <NoSsr>
                      {(() => {
                        const swpData = simulateSWP(navHistory, swpAmount, swpFrequency, startDate, endDate);
                        return (
                          <LineChart
                            xAxis={[{ scaleType: "point", data: swpData.labels }]}
                            series={[{ data: swpData.values, label: "Portfolio Value", area: true }]}
                            height={300}
                            slotProps={{
                              legend: { direction: 'row', position: { vertical: 'top', horizontal: 'middle' } },
                              grid: { horizontal: true, vertical: true },
                            }}
                          />
                        );
                      })()}
                    </NoSsr>
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          )}
          {tab === 5 && (
            <Fade in={tab === 5} timeout={350}>
              <Box>
                <Card variant="outlined" sx={{ boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="text.primary">Strategies Compare</Typography>
                    <NoSsr>
                      {(() => {
                        const sipData = simulateSIPSeries(navHistory, sipAmount, frequency, startDate, endDate);
                        const lumpsumData = simulateLumpsum(navHistory, lumpsumAmount, startDate, endDate);
                        const swpData = simulateSWP(navHistory, swpAmount, swpFrequency, startDate, endDate);
                        return (
                          <LineChart
                            xAxis={[{ scaleType: "point", data: sipData.labels }]}
                            series={[
                              { data: sipData.values, label: "SIP" },
                              { data: lumpsumData.values, label: "Lumpsum" },
                              { data: swpData.values, label: "SWP" },
                            ]}
                            height={320}
                            slotProps={{
                              legend: { direction: 'row', position: { vertical: 'top', horizontal: 'middle' } },
                              grid: { horizontal: true, vertical: true },
                            }}
                          />
                        );
                      })()}
                    </NoSsr>
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

// Utilities
function movingAverage(values, windowSize) {
  const out = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const slice = values.slice(start, i + 1).filter((v) => typeof v === "number" && isFinite(v));
    if (slice.length === 0) out.push(null);
    else out.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return out;
}

function simulateLumpsum(navHistory, amount, startDateStr, endDateStr) {
  if (!Array.isArray(navHistory) || navHistory.length === 0) return { labels: [], values: [] };
  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);
  const sorted = [...navHistory].filter((n) => n && n.nav != null).sort((a, b) => parseISO(a.date) - parseISO(b.date));
  const filtered = sorted.filter((n) => {
    const d = parseISO(n.date);
    return d >= start && d <= end;
  });
  if (filtered.length === 0) return { labels: [], values: [] };
  const firstEntry = filtered[0] || sorted.find((n) => parseISO(n.date) >= start) || sorted[0];
  if (!firstEntry) return { labels: [], values: [] };
  const units = amount / Number(firstEntry.nav);
  const labels = filtered.map((n) => n.date);
  const values = filtered.map((n) => parseFloat((units * Number(n.nav)).toFixed(2)));
  return { labels, values };
}

function simulateSWP(navHistory, withdrawal, frequency, startDateStr, endDateStr) {
  if (!Array.isArray(navHistory) || navHistory.length === 0) return { labels: [], values: [] };
  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);
  const sorted = [...navHistory].filter((n) => n && n.nav != null).sort((a, b) => parseISO(a.date) - parseISO(b.date));
  const startIndex = sorted.findIndex((n) => parseISO(n.date) >= start);
  if (startIndex < 0) return { labels: [], values: [] };
  let units = 0;
  const initialAmount = withdrawal * 12;
  if (sorted[startIndex]) units = initialAmount / Number(sorted[startIndex].nav);
  const labels = [];
  const values = [];
  let counter = 0;
  const stepFunc = (freq) => (freq === "weekly" ? 7 : freq === "monthly" ? 30 : 365);
  const stepValue = stepFunc(frequency);
  for (let i = startIndex; i < sorted.length; i++) {
    const d = parseISO(sorted[i].date);
    if (d > end) break;
    const nav = Number(sorted[i].nav);
    let value = units * nav;
    if (counter % stepValue === 0 && i !== startIndex) {
      const withdrawUnits = withdrawal / nav;
      units = Math.max(0, units - withdrawUnits);
      value = units * nav;
    }
    labels.push(sorted[i].date);
    values.push(parseFloat(value.toFixed(2)));
    counter += 1;
  }
  return { labels, values };
}

function simulateSIPSeries(navHistory, sipAmount, frequency, startDateStr, endDateStr) {
  if (!Array.isArray(navHistory) || navHistory.length === 0) return { labels: [], values: [] };
  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);
  const sorted = [...navHistory].filter((n) => n && n.nav != null).sort((a, b) => parseISO(a.date) - parseISO(b.date));
  const filtered = sorted.filter((n) => {
    const d = parseISO(n.date);
    return d >= start && d <= end;
  });
  if (filtered.length === 0) return { labels: [], values: [] };
  const labels = [];
  const values = [];
  let totalUnits = 0;
  const stepValue = frequency === "weekly" ? 7 : frequency === "yearly" ? 365 : 30;
  for (let i = 0; i < filtered.length; i++) {
    const nav = Number(filtered[i].nav);
    const dayIndex = i;
    const shouldInvest = dayIndex % stepValue === 0;
    if (shouldInvest) totalUnits += sipAmount / nav;
    labels.push(filtered[i].date);
    values.push(parseFloat((totalUnits * nav).toFixed(2)));
  }
  return { labels, values };
}