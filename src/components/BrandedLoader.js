"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";

export default function BrandedLoader({ label = "Loading..." }) {
  return (
    <Box
      sx={{
        display: "grid",
        placeItems: "center",
        minHeight: "60vh",
        textAlign: "center",
        gap: 3,
      }}
    >
      {/* Circular Gradient Loader */}
      <Box
        sx={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          border: "6px solid transparent",
          borderTop: "6px solid #6C47FF",
          borderRight: "6px solid #9333EA",
          borderBottom: "6px solid #f107a3",
          animation: "spin 1.4s linear infinite",
        }}
      />

      {/* Icon + Text */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
        <AutoGraphRoundedIcon sx={{ fontSize: 28, color: "#6C47FF" }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Mutual Fund Explorer
        </Typography>
      </Box>

      {/* Label */}
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Box>
  );
}
