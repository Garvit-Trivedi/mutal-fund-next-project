"use client";

import React from "react";
import { Box, Paper, Typography, LinearProgress, alpha } from "@mui/material";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import { useTheme } from "@mui/material/styles";

export default function BrandedLoader({ label = "Loading..." }) {
  const theme = useTheme();
  const gradient = `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)} 0%, ${alpha(theme.palette.primary.light, 0.18)} 100%)`;

  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: "40vh", px: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 520,
          borderRadius: 4,
          border: "1px solid",
          borderColor: theme.palette.divider,
          backgroundImage: gradient,
          backdropFilter: "blur(8px)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <AutoGraphRoundedIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Mutual Fund Explorer
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {label}
        </Typography>
        <LinearProgress color="primary" sx={{ height: 8, borderRadius: 999 }} />
      </Paper>
    </Box>
  );
}


