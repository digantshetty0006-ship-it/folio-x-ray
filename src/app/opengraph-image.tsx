import { ImageResponse } from "next/og";

export const alt =
  "Folio X-Ray — a private mutual fund portfolio X-ray for Indian investors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F2EEE6",
          color: "#14130F",
          padding: "54px 64px 46px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(20,19,15,0.22)",
            paddingBottom: "18px",
            fontSize: "20px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          <span>Folio X-Ray</span>
          <span style={{ color: "#6B675D" }}>Mutual fund X-ray · India</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "112px", lineHeight: 0.9, letterSpacing: "-0.04em" }}>
            Know what
          </div>
          <div style={{ fontSize: "112px", lineHeight: 0.9, letterSpacing: "-0.04em" }}>
            you actually
          </div>
          <div
            style={{
              fontSize: "112px",
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              color: "#B43621",
              fontStyle: "italic",
            }}
          >
            own.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid rgba(20,19,15,0.22)",
            paddingTop: "18px",
            fontSize: "20px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          <span>XIRR · Overlap · Costs · Goal odds</span>
          <span style={{ color: "#6B675D" }}>Holdings stay in your browser</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
