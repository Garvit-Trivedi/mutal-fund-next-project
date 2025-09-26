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
    <Container sx={{ py: 10, maxWidth: "1200px !important" }}>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: "center",
          mb: 12,
          borderRadius: 6,
          p: { xs: 4, md: 10 },
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 40px rgba(108,71,255,0.2)",
        }}
      >
        <Typography
          variant="h2"
          gutterBottom
          sx={{
            backgroundImage:
              "linear-gradient(90deg, #7b2ff7, #f107a3, #ff8c00)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontWeight: 800,
            animation: "gradientShift 6s linear infinite",
          }}
        >
          🚀 Discover Mutual Funds with Confidence
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 720, mx: "auto", fontSize: "1.2rem" }}
        >
          Mutual Fund Explorer helps you search schemes, view detailed metadata,
          analyze NAV history, and run SIP simulations for smarter investing.
        </Typography>

        <Stack
          spacing={2}
          direction={{ xs: "column", sm: "row" }}
          justifyContent="center"
          sx={{ mt: 5 }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 5,
              py: 1.8,
              borderRadius: 10,
              fontWeight: 700,
              fontSize: "1.1rem",
              background: "linear-gradient(90deg, #6C47FF, #9333EA)",
              boxShadow: "0 6px 20px rgba(108,71,255,0.5)",
              "&:hover": {
                background: "linear-gradient(90deg, #5b38e6, #7a29cc)",
                transform: "scale(1.05)",
              },
              transition: "all 0.3s ease",
            }}
            component={Link}
            href="/funds"
          >
            🔍 Explore Funds
          </Button>
        </Stack>
      </Box>

      {/* Features */}
      <Grid container spacing={5} sx={{ mb: 12 }}>
        {[
          {
            title: "Search & Filter",
            desc: "Quickly find schemes by name and explore in-depth details.",
            icon: "🔎",
          },
          {
            title: "Returns & NAV",
            desc: "Visualize precomputed returns and track NAV history.",
            icon: "📈",
          },
          {
            title: "SIP Calculator",
            desc: "Simulate SIP investments over time with ease.",
            icon: "💰",
          },
        ].map((feature) => (
          <Grid item xs={12} md={4} key={feature.title}>
            <Card
              sx={{
                borderRadius: 5,
                p: 3,
                textAlign: "center",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(250,250,255,0.6))",
                backdropFilter: "blur(12px)",
                boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                transition: "transform 0.4s, box-shadow 0.4s",
                "&:hover": {
                  transform: "translateY(-10px) scale(1.03)",
                  boxShadow: "0 16px 36px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent>
                <Typography variant="h2" gutterBottom>
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

      {/* How It Works (Stepper Style) */}
      <Box sx={{ textAlign: "center", mb: 12 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 6 }}>
          🛠️ How It Works
        </Typography>
        <Grid container spacing={6} justifyContent="center">
          {[
            {
              step: "1",
              title: "Search a Fund",
              desc: "Browse or search from thousands of mutual funds available.",
            },
            {
              step: "2",
              title: "Analyze Details",
              desc: "Check type, category, NAV history & precomputed returns.",
            },
            {
              step: "3",
              title: "Plan Investments",
              desc: "Use our SIP calculator to simulate investments.",
            },
          ].map((item, i) => (
            <Grid item xs={12} md={4} key={item.step}>
              <Box
                sx={{
                  p: 4,
                  borderRadius: 4,
                  position: "relative",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(245,245,250,0.7))",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                  "&:hover": {
                    transform: "scale(1.03)",
                    transition: "0.3s ease",
                  },
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: "#6C47FF",
                    mb: 2,
                  }}
                >
                  {item.step}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          textAlign: "center",
          p: { xs: 5, md: 8 },
          borderRadius: 6,
          background:
            "linear-gradient(120deg, #6C47FF, #9333EA, #f107a3)",
          color: "white",
          boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 3 }}>
          🚀 Start Your Investment Journey Today
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, opacity: 0.95 }}>
          Explore, compare, and analyze mutual funds with confidence.
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            px: 5,
            py: 1.8,
            borderRadius: 10,
            fontWeight: 700,
            fontSize: "1.1rem",
            backgroundColor: "#fff",
            color: "#6C47FF",
            boxShadow: "0 4px 14px rgba(255,255,255,0.4)",
            "&:hover": {
              backgroundColor: "#f5f5f5",
              transform: "scale(1.08)",
            },
            transition: "all 0.3s ease",
          }}
          component={Link}
          href="/funds"
        >
          🔍 Explore Funds
        </Button>
      </Box>

      {/* Gradient Animation */}
      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </Container>
  );
}
