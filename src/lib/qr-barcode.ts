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
 * Build the public tracking URL for a given code. Uses the request's origin
 * (or NEXT_PUBLIC_APP_URL fallback) so QR codes scan correctly in production
 * AND on a local network during development.
 */
export function publicTrackingUrl(origin: string, code: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/track/${encodeURIComponent(code)}`;
}
