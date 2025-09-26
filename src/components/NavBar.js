"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Link from "next/link";

export default function NavBar() {
  // Example default scheme code
  const defaultSchemeCode = "118834"; // replace with any valid scheme code

  return (
    <AppBar
      position="sticky"
      sx={{
        top: 12,
        mx: "auto",
        width: "95%",
        borderRadius: 3,
        background: "linear-gradient(90deg, #6C47FF, #9333EA)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      }}
    >
      <Toolbar sx={{ gap: 2, px: { xs: 2, sm: 4 } }}>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            letterSpacing: 1,
            fontSize: "1.25rem",
          }}
        >
          Mutual Fund Explorer
        </Typography>

        {/* Nav Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {[
            { label: "Home", href: "/" },
            { label: "Funds", href: "/funds" },
            // { label: "Compare", href: "/compare" },
            { label: "Scheme Details", href: `/scheme/${defaultSchemeCode}` },
          ].map((item) => (
            <Button
              key={item.label}
              component={Link}
              href={item.href}
              sx={{
                color: "white",
                fontWeight: 500,
                letterSpacing: 0.5,
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  width: "0%",
                  height: "2px",
                  bottom: 0,
                  left: 0,
                  backgroundColor: "#fff",
                  transition: "width 0.3s ease-in-out",
                },
                "&:hover::after": {
                  width: "100%",
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
