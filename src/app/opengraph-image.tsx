import { ImageResponse } from "next/og";
import { siteName, siteTagline } from "@/lib/seo";

export const alt = `${siteName} — ${siteTagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#171717",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "80px",
        width: "100%",
      }}
    >
      <div style={{ color: "#a3a3a3", display: "flex", fontSize: 30, letterSpacing: "-0.02em" }}>
        {siteName}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 78,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            lineHeight: 1.05,
          }}
        >
          {siteTagline}
        </div>
        <div style={{ color: "#a3a3a3", display: "flex", fontSize: 28, marginTop: 28 }}>
          Secure checkout with Payments.lk · Built in Sri Lanka
        </div>
      </div>
    </div>,
    { ...size },
  );
}
