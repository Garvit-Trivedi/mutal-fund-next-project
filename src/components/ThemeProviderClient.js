"use client";

import React from "react";

export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>My Next.js App</title>
      </head>
      <body>
        <div style={{ margin: "0 auto", maxWidth: "1200px", padding: "1rem" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
