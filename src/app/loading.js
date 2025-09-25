"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, LinearProgress, Stack } from "@mui/material";

const messages = [
  "📊 Analyzing NAV trends...",
  "💰 Calculating SIP growth...",
  "🔍 Finding the best mutual funds...",
  "📈 Projecting long-term returns...",
  "📂 Organizing fund data...",
];

export default function RootLoading() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000); // cycle messages every 2s
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        bgcolor: "linear-gradient(180deg, #f9fafb, #f3f4f6)",
        textAlign: "center",
        px: 3,
      }}
    >
      {/* Animated Loading Icon */}
      <Typography
        variant="h2"
        sx={{
          mb: 2,
          animation: "pulse 1.5s infinite",
          "@keyframes pulse": {
            "0%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.15)" },
            "100%": { transform: "scale(1)" },
          },
        }}
      >
        📈
      </Typography>

      {/* Rotating messages */}
      <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Preparing your Mutual Fund Explorer...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {messages[messageIndex]}
        </Typography>
      </Stack>

      {/* Progress bar */}
      <LinearProgress
        sx={{
          width: "60%",
          maxWidth: 400,
          borderRadius: 2,
          height: 8,
          "& .MuiLinearProgress-bar": {
            background: "linear-gradient(90deg, #7b2ff7, #f107a3)",
          },
        }}
      />
    </Box>
  );
}
