"use client";

import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Pagination,
  Stack,
  InputAdornment,
  Chip,
  Box,
  Button,
  CardActionArea,
  Avatar,
  Divider,
} from "@mui/material";
import Link from "next/link";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import BrandedLoader from "@/components/BrandedLoader";

const PAGE_SIZE = 30;

export default function FundsPage() {
  const [schemes, setSchemes] = useState([]);
  const [metadataMap, setMetadataMap] = useState({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch schemes list
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await fetch("/api/mf");
        const data = await res.json();
        setSchemes(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSchemes();
  }, []);

  // Fetch metadata for current page schemes
  useEffect(() => {
    const fetchMetadata = async () => {
      setLoading(true);
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const currentSchemes = schemes.slice(start, end);

      const promises = currentSchemes.map(async (scheme) => {
        if (!metadataMap[scheme.schemeCode]) {
          try {
            const res = await fetch(`/api/scheme/${scheme.schemeCode}`);
            const data = await res.json();
            return [scheme.schemeCode, data.metadata];
          } catch (err) {
            return [scheme.schemeCode, null];
          }
        } else {
          return [scheme.schemeCode, metadataMap[scheme.schemeCode]];
        }
      });

      const results = await Promise.all(promises);
      const newMap = { ...metadataMap };
      results.forEach(([code, meta]) => {
        newMap[code] = meta;
      });
      setMetadataMap(newMap);
      setLoading(false);
    };

    if (schemes.length > 0) fetchMetadata();
  }, [schemes, page]);

  // Filter schemes by search
  const filteredSchemes = schemes
    .filter((scheme) =>
      scheme.schemeName.toLowerCase().includes(search.toLowerCase())
    )
    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) return <BrandedLoader label="📊 Fetching mutual funds data..." />;

  return (
    <Box>
      {/* Hero Banner */}
      <Box
        sx={{
          py: 6,
          px: { xs: 2, md: 6 },
          textAlign: "center",
          background:
            "linear-gradient(135deg, #6C47FF 0%, #9333EA 50%, #F107A3 100%)",
          color: "white",
          borderRadius: "0 0 24px 24px",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Explore Mutual Funds 🔍
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 720, mx: "auto", mb: 2 }}>
          Discover detailed information, analyze categories, and compare funds
          with ease. Make informed investment decisions.
        </Typography>
        
        <TextField
          placeholder="Search by scheme name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: "white" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: "100%",
            maxWidth: 400,
            bgcolor: "rgba(255,255,255,0.15)",
            borderRadius: 2,
            input: { color: "white" },
            label: { color: "white" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { border: "none" },
            },
          }}
        />
      </Box>

      {/* Funds Grid */}
      <Box sx={{ px: { xs: 2, md: 4 }, pb: 6 }}>
        {filteredSchemes.length === 0 ? (
          <Typography align="center" sx={{ mt: 4 }} color="text.secondary">
            ❌ No schemes found matching your search.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredSchemes.map((scheme) => {
              const meta = metadataMap[scheme.schemeCode];
              return (
                <Grid item xs={12} sm={6} md={4} key={scheme.schemeCode}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 4,
                      transition: "transform 0.3s, box-shadow 0.3s",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <CardActionArea
                      component={Link}
                      href={`/scheme/${scheme.schemeCode}`}
                      sx={{ height: "100%" }}
                    >
                      <CardContent>
                        <Stack spacing={1.5}>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                boxShadow: 2,
                              }}
                            >
                              <AutoAwesomeRoundedIcon fontSize="small" />
                            </Avatar>
                            <Typography
                              variant="subtitle1"
                              fontWeight={700}
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {scheme.schemeName}
                            </Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <Chip
                              size="small"
                              label={`#${scheme.schemeCode}`}
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </Stack>

                          <Divider />

                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip
                              size="small"
                              label={meta?.fundHouse || "Unknown"}
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={meta?.schemeType || "N/A"}
                              color={
                                meta?.schemeType === "Open Ended"
                                  ? "success"
                                  : "default"
                              }
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={meta?.schemeCategory || "N/A"}
                              color={
                                meta?.schemeCategory?.includes("Equity")
                                  ? "success"
                                  : meta?.schemeCategory?.includes("Debt")
                                  ? "info"
                                  : meta?.schemeCategory?.includes("Hybrid")
                                  ? "warning"
                                  : "default"
                              }
                              variant="outlined"
                            />
                          </Stack>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Pagination */}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Pagination
            color="primary"
            count={Math.ceil(
              schemes.filter((scheme) =>
                scheme.schemeName.toLowerCase().includes(search.toLowerCase())
              ).length / PAGE_SIZE
            )}
            page={page}
            onChange={handlePageChange}
            sx={{
              "& .MuiPagination-ul": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                borderRadius: 3,
                p: 1,
                bgcolor: "white",
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
