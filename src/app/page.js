"use client";

import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <Container sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: "center",
          mb: 10,
          borderRadius: 6,
          p: { xs: 4, md: 8 },
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.85), rgba(40, 38, 38, 0.21)),
            url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwIz4QtXanWPaem5JuOuFIsWMBWfbDlkFC7A&s")
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            backgroundImage: "linear-gradient(90deg, #7b2ff7, #f107a3)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontWeight: 800,
          }}
        >
          🚀 Discover Mutual Funds with Confidence
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 720, mx: "auto", fontSize: "1.1rem" }}
        >
          Mutual Fund Explorer helps you search schemes, view detailed metadata,
          analyze historical NAV, and run SIP calculations to understand
          potential outcomes. Start exploring the Indian mutual fund universe
          today.
        </Typography>
        <Stack
          spacing={2}
          direction={{ xs: "column", sm: "row" }}
          justifyContent="center"
          sx={{ mt: 4 }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 8,
              fontWeight: 600,
              background: "linear-gradient(90deg, #6C47FF, #9333EA)",
              boxShadow: "0 4px 14px rgba(108,71,255,0.4)",
              "&:hover": {
                background: "linear-gradient(90deg, #5b38e6, #7a29cc)",
              },
            }}
            component={Link}
            href="/funds"
          >
            🔍 Explore Funds
          </Button>
        </Stack>
      </Box>

      {/* Features */}
      <Grid container spacing={4} sx={{ mb: 10 }}>
        {[
          {
            title: "Search & Filter",
            desc: "Quickly find schemes by name and navigate to in-depth details for each fund.",
            icon: "🔎",
          },
          {
            title: "Returns & NAV",
            desc: "View precomputed returns across periods and visualize last-year NAV trends.",
            icon: "📈",
          },
          {
            title: "SIP Calculator",
            desc: "Simulate SIP investments over time with configurable frequency and dates.",
            icon: "💰",
          },
        ].map((feature) => (
          <Grid item xs={12} md={4} key={feature.title}>
            <Card
              sx={{
                borderRadius: 4,
                p: 2,
                textAlign: "center",
                background: "linear-gradient(135deg, #ffffff, #f9f9fb)",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent>
                <Typography variant="h3" gutterBottom>
                  {feature.icon}
                </Typography>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: 700 }}
                >
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Why Choose Us */}
      <Box sx={{ textAlign: "center", mb: 10 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          🌟 Why Choose Mutual Fund Explorer?
        </Typography>
        <Grid container spacing={4}>
          {[
            { text: "✅ Easy-to-use interface with fast search" },
            { text: "📊 Accurate data from reliable sources" },
            { text: "⚡ Real-time NAV & performance tracking" },
            { text: "🔒 Secure & privacy-first platform" },
          ].map((item, i) => (
            <Grid item xs={12} md={3} key={i}>
              <Typography variant="body1">{item.text}</Typography>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* How It Works */}
      <Box sx={{ textAlign: "center", mb: 10 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          🛠️ How It Works
        </Typography>
        <Grid container spacing={4}>
          {[
            {
              step: "1",
              title: "Search a Fund",
              desc: "Browse or search from thousands of mutual funds available in India.",
            },
            {
              step: "2",
              title: "Analyze Details",
              desc: "Check fund house, type, category, NAV history, and precomputed returns.",
            },
            {
              step: "3",
              title: "Plan Investments",
              desc: "Use our SIP calculator to simulate investments and future value.",
            },
          ].map((item) => (
            <Grid item xs={12} md={4} key={item.step}>
              <Card
                sx={{
                  borderRadius: 4,
                  textAlign: "center",
                  p: 3,
                  height: "100%",
                  background: "linear-gradient(135deg, #fafafa, #f0f0f5)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: "#6C47FF", mb: 1 }}
                >
                  {item.step}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          textAlign: "center",
          p: { xs: 4, md: 6 },
          borderRadius: 6,
          background: "linear-gradient(90deg, #6C47FF, #9333EA)",
          color: "white",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          🚀 Start Your Investment Journey Today
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
          Explore, compare, and analyze mutual funds with ease.
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 8,
            fontWeight: 600,
            backgroundColor: "#fff",
            color: "#6C47FF",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
          component={Link}
          href="/funds"
        >
          🔍 Explore Funds
        </Button>
      </Box>
    </Container>
  );
}
