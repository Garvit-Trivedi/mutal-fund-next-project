"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Autocomplete,
  TextField,
  Chip,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  NoSsr,
  Box,
  Paper,
  Fade,
} from "@mui/material";
import { LineChart, ScatterChart } from "@mui/x-charts";
import { parseISO, subYears } from "date-fns";
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import TableChartIcon from '@mui/icons-material/TableChart';

export default function ComparePage() {
  const [allSchemes, setAllSchemes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [metaMap, setMetaMap] = useState({});
  const [navMap, setNavMap] = useState({});

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/mf");
      const d = await r.json();
      setAllSchemes(d);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const codes = selected.map((s) => s.schemeCode);
      const promises = codes.map(async (code) => {
        if (metaMap[code] && navMap[code]) return;
        const r = await fetch(`/api/scheme/${code}`);
        const d = await r.json();
        return [code, d.metadata, d.navHistory];
      });
      const results = await Promise.all(promises);
      const nextMeta = { ...metaMap };
      const nextNav = { ...navMap };
      results?.forEach((triple) => {
        if (!triple) return;
        const [code, meta, nav] = triple;
        nextMeta[code] = meta;
        nextNav[code] = nav || [];
      });
      setMetaMap(nextMeta);
      setNavMap(nextNav);
    })();
  }, [selected]);

  const lastYearDates = useMemo(() => {
    if (!selected.length) return [];
    const any = navMap[selected[0]?.schemeCode] || [];
    const latest = any.length ? parseISO(any[any.length - 1].date) : null;
    if (!latest) return [];
    const from = subYears(latest, 1);
    return (any || []).filter((n) => parseISO(n.date) >= from).map((n) => n.date);
  }, [selected, navMap]);

  const series = useMemo(() => {
    return selected.map((s) => {
      const nav = (navMap[s.schemeCode] || []).filter((n) => lastYearDates.includes(n.date));
      return { id: s.schemeCode, data: nav.map((n) => Number(n.nav)), label: s.schemeName };
    });
  }, [selected, navMap, lastYearDates]);

  const returnsRows = useMemo(() => {
    return selected.map((s) => {
      const m = metaMap[s.schemeCode];
      return {
        code: s.schemeCode,
        name: s.schemeName,
        fundHouse: m?.fundHouse,
        type: m?.schemeType,
        category: m?.schemeCategory,
      };
    });
  }, [selected, metaMap]);

  const riskReturn = useMemo(() => {
    return selected.map((s) => {
      const nav = (navMap[s.schemeCode] || []).slice(-260).map((n) => Number(n.nav));
      const rets = [];
      for (let i = 1; i < nav.length; i++) {
        const r = (nav[i] - nav[i - 1]) / (nav[i - 1] || 1);
        if (isFinite(r)) rets.push(r);
      }
      const avg = rets.reduce((a, b) => a + b, 0) / (rets.length || 1);
      const vol = Math.sqrt(rets.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / (rets.length || 1));
      return { x: vol * 100, y: avg * 100, id: s.schemeCode, label: s.schemeName };
    });
  }, [selected, navMap]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Fade in timeout={500}>
        <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <SearchIcon color="primary" />
              <Typography variant="h4" fontWeight={700} color="primary.main">
                Fund Comparison
              </Typography>
<div className="emoji">🚀</div>
<div className="emoji">💰</div>
<div className="emoji">📈</div>
<div className="emoji">😂</div>
<div className="emoji">💵</div>
<div className="emoji">🍕</div>
<div className="emoji">🥳</div>
<div className="emoji">🐱‍👤</div>
<div className="emoji">💎</div>

            </Stack>
            <Autocomplete
              multiple
              options={allSchemes}
              value={selected}
              onChange={(_, val) => setSelected(val)}
              getOptionLabel={(o) => o.schemeName}
              isOptionEqualToValue={(o, v) => o.schemeCode === v.schemeCode}
              filterSelectedOptions
              renderOption={(props, option) => (
                <li {...props} key={option.schemeCode}>
                  <Stack>
                    <Typography variant="body1">{option.schemeName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.fundHouse} | {option.schemeCategory}
                    </Typography>
                  </Stack>
                </li>
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...chipProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={option.schemeCode}
                      {...chipProps}
                      label={option.schemeName}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ m: 0.5, borderRadius: 1 }}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search and select funds to compare"
                  placeholder="Type to search..."
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                />
              )}
              sx={{ minWidth: 300 }}
            />
          </CardContent>
        </Card>
      </Fade>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Fade in timeout={600}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="h6" color="text.primary">NAV Trends (Last Year)</Typography>
                </Stack>
                <NoSsr>
                  <LineChart
                    xAxis={[{ scaleType: "point", data: lastYearDates }]}
                    series={series}
                    height={400}
                    slotProps={{
                      legend: { direction: 'row', position: { vertical: 'top', horizontal: 'middle' } },
                      grid: { horizontal: true, vertical: true },
                    }}
                    sx={{
                      '& .MuiChartsLegend-root': { fontSize: '0.9rem' },
                    }}
                  />
                </NoSsr>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
        <Grid item xs={12} md={4}>
          <Fade in timeout={700}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <ScatterPlotIcon color="primary" />
                  <Typography variant="h6" color="text.primary">Risk vs Return</Typography>
                </Stack>
                <NoSsr>
                  <ScatterChart
                    xAxis={[{ label: "Volatility (%)" }]}
                    yAxis={[{ label: "Avg Return (%)" }]}
                    series={[{ data: riskReturn.map((p) => ({ x: p.x, y: p.y, id: p.id })) }]}
                    height={400}
                    slotProps={{
                      legend: { direction: 'row', position: { vertical: 'top', horizontal: 'middle' } },
                    }}
                    sx={{
                      '& .MuiChartsLegend-root': { fontSize: '0.9rem' },
                    }}
                  />
                </NoSsr>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      <Fade in timeout={800}>
        <Card sx={{ mt: 3, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <TableChartIcon color="primary" />
              <Typography variant="h6" color="text.primary">Metadata Snapshot</Typography>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Scheme</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fund House</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {returnsRows.map((r) => (
                  <TableRow key={r.code} hover sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.fundHouse}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.category}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Fade>
    </Container>
  );
}