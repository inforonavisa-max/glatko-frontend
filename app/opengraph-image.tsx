import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Glatko — Montenegro's Premier Service Marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b1f23 0%, #0a1a18 50%, #0b1f23 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(20,184,166,0.15), transparent 70%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            Glatko
          </span>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "#14B8A6",
              marginTop: "8px",
            }}
          />
        </div>
        <p
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.6)",
            marginTop: "16px",
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          Montenegro&apos;s Premier Service Marketplace
        </p>
        <p
          style={{
            fontSize: "18px",
            color: "rgba(20,184,166,0.8)",
            marginTop: "12px",
          }}
        >
          glatko.app
        </p>
      </div>
    ),
    { ...size }
  );
}
