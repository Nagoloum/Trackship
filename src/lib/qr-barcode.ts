import "server-only";

import bwipjs from "bwip-js/node";
import QRCode from "qrcode";

/**
 * Generate a QR code (PNG) as a data URL ready to embed in PDFs/images.
 *
 * @param text the payload encoded inside the QR (the public tracking URL).
 * @param size pixel size of the resulting square image.
 */
export async function generateQrDataUrl(
  text: string,
  size = 220
): Promise<string> {
  return QRCode.toDataURL(text, {
    type: "image/png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: size,
    color: {
      dark: "#10153A",
      light: "#FFFFFF",
    },
  });
}

/**
 * Generate a Code 128 barcode (PNG) as a data URL ready to embed in PDFs/images.
 *
 * @param text the payload encoded inside the barcode (the tracking code).
 * @param scale visual scale factor.
 */
export async function generateBarcodeDataUrl(
  text: string,
  scale = 3
): Promise<string> {
  const buffer = await bwipjs.toBuffer({
    bcid: "code128",
    text,
    scale,
    height: 14,
    includetext: true,
    textxalign: "center",
    textsize: 10,
    backgroundcolor: "FFFFFF",
    paddingwidth: 2,
    paddingheight: 2,
  });
  const base64 = buffer.toString("base64");
  return `data:image/png;base64,${base64}`;
}

/**
 * Build the public tracking URL for a given code, optionally locale-prefixed.
 * Prefers `NEXT_PUBLIC_APP_URL` when set (so QRs always point at the canonical
 * production domain even when generated from a preview deployment) and falls
 * back to the request's origin otherwise.
 */
export function publicTrackingUrl(
  origin: string,
  code: string,
  locale?: string
): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const base = (configured || origin).replace(/\/$/, "");
  const prefix = locale ? `/${locale}` : "";
  return `${base}${prefix}/track/${encodeURIComponent(code)}`;
}
