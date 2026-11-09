import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F2EEE6",
          border: "4px solid #14130F",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "118px",
            height: "118px",
            border: "4px solid #14130F",
            color: "#B43621",
            fontSize: "96px",
            lineHeight: 1,
            fontFamily: "sans-serif",
          }}
        >
          X
        </div>
      </div>
    ),
    { ...size },
  );
}
