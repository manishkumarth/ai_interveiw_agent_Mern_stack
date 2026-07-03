import React from "react";
import "./theme.css";

function ThemeWrapper({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(0,255,180,0.08),transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(26,44,255,0.12),transparent_60%)] text-[#e6f2ff]">
      {children}
    </div>
  );
}

export default ThemeWrapper;


