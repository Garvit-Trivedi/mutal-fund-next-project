"use client";

import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

export default function FundsLoading() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
        gap: 3,
      }}
    >
      <CircularProgress
        size={80}
        thickness={4}
        sx={{
          color: "transparent",
          borderRadius: "50%",
          background: "conic-gradient(#6C47FF, #9333EA, #f107a3, #6C47FF)",
          WebkitMask: "radial-gradient(farthest-side, #0000 calc(100% - 8px), #000 0)",
          mask: "radial-gradient(farthest-side, #0000 calc(100% - 8px), #000 0)",
        }}
      />
      <Typography variant="h6" sx={{ fontWeight: 600, color: "text.secondary" }}>
        Fetching funds and metadata...
      </Typography>
    </Box>
  );
}
