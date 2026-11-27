import { ImageResponse } from "next/og";

/** Taille standard d'une image d'aperçu Open Graph / Twitter. */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function ogImage(params: {
  eyebrow: string;
  title: string;
  subtitle: string;
  footer: string;
}): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #140b2e 0%, #3b1d76 55%, #6d28d9 100%)",
          color: "#ffffff",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              background: "#ffffff",
              color: "#5b21b6",
              fontSize: "40px",
              fontWeight: 800,
            }}
          >
            GT
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "4px" }}>GR TICKET</div>
            <div style={{ fontSize: "20px", opacity: 0.75 }}>par Goldman Record Company</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ fontSize: "26px", textTransform: "uppercase", letterSpacing: "3px", opacity: 0.8 }}>
            {params.eyebrow}
          </div>
          <div style={{ fontSize: "62px", fontWeight: 800, lineHeight: 1.1, maxWidth: "980px" }}>
            {params.title}
          </div>
          <div style={{ fontSize: "32px", opacity: 0.9 }}>{params.subtitle}</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid rgba(255,255,255,0.25)",
            paddingTop: "24px",
            fontSize: "24px",
            opacity: 0.85,
          }}
        >
          <div>{params.footer}</div>
          <div>Billets garantis · QR dynamique</div>
        </div>
      </div>
    ),
    { ...ogSize }
  );
}
