import { COMPANY } from "@/lib/company";
import {
  formatInvoiceDate,
  getInvoiceStrings,
  getStatusLabel,
  type InvoiceLocale,
} from "@/lib/invoice-strings";
import type { OrderItem } from "@/lib/order-items";

const COLORS = {
  primary: "#1F3FA8",
  text: "#10153A",
  muted: "#5A6082",
  border: "#D4D9EA",
  card: "#F6F7FB",
  white: "#FFFFFF",
};

export type ReceiptPngOrder = {
  code: string;
  recipient_name: string;
  recipient_email?: string | null;
  recipient_phone?: string | null;
  recipient_address?: string | null;
  origin: string;
  origin_country: string;
  destination: string;
  destination_country: string;
  weight_kg: number | null;
  declared_value?: number | null;
  current_status: string;
  items?: OrderItem[];
  categoryLabel?: (key: string) => string;
};

export type ReceiptPngProps = {
  /** Sequential admin number — when undefined, the line is hidden. */
  invoiceNumber?: string;
  language: string;
  issuedAt: string;
  order: ReceiptPngOrder;
  qrDataUrl: string;
  barcodeDataUrl: string;
  trackingUrl: string;
};

/** PNG dimensions — landscape A4 at ~150 DPI. */
export const RECEIPT_PNG_SIZE = { width: 1754, height: 1240 };

/**
 * Landscape A4 tracking-receipt rendered as a PNG by Satori (next/og).
 * Shared by the admin route (`/api/invoices/[id]/png`) and the public
 * route (`/api/track/[code]/png`). Packs every available data point so
 * there's no empty space.
 */
export function ReceiptPngLayout({
  invoiceNumber,
  language,
  issuedAt,
  order,
  qrDataUrl,
  barcodeDataUrl,
  trackingUrl,
}: ReceiptPngProps) {
  const locale = (language || "en") as InvoiceLocale;
  const t = getInvoiceStrings(locale);
  const items = order.items ?? [];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.white,
        color: COLORS.text,
        fontFamily: "sans-serif",
        padding: "44px 56px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingBottom: 18,
          borderBottom: `4px solid ${COLORS.primary}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              color: COLORS.primary,
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: 3,
            }}
          >
            {COMPANY.name.toUpperCase()}
          </span>
          <span style={{ color: COLORS.muted, fontSize: 20, marginTop: 6 }}>
            {COMPANY.legalName} · {COMPANY.addressLine1}
          </span>
          <span style={{ color: COLORS.muted, fontSize: 18, marginTop: 2 }}>
            {COMPANY.postalCode} {COMPANY.city}, {COMPANY.country} ·{" "}
            {COMPANY.email}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              color: COLORS.primary,
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: 4,
            }}
          >
            {t.documentTitle}
          </span>
          {invoiceNumber && (
            <span style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>
              {invoiceNumber}
            </span>
          )}
          <span style={{ color: COLORS.muted, fontSize: 18, marginTop: 4 }}>
            {t.issueDate} {formatInvoiceDate(issuedAt, locale)}
          </span>
        </div>
      </div>

      {/* Main 3-column row: tracking · recipient/sender · QR */}
      <div
        style={{
          display: "flex",
          marginTop: 20,
          gap: 18,
        }}
      >
        {/* Tracking column */}
        <div
          style={{
            flex: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: COLORS.primary,
            color: COLORS.white,
            borderRadius: 14,
            padding: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 3,
                color: "rgba(255,255,255,0.85)",
                textTransform: "uppercase",
              }}
            >
              {t.trackingNumber}
            </span>
            <span
              style={{
                fontSize: 56,
                fontWeight: 700,
                letterSpacing: 3,
                marginTop: 10,
              }}
            >
              {order.code}
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 2,
                color: "#FFFFFF",
                backgroundColor: "rgba(255,255,255,0.18)",
                marginTop: 14,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 14,
                paddingRight: 14,
                borderRadius: 8,
                alignSelf: "flex-start",
                textTransform: "uppercase",
              }}
            >
              {getStatusLabel(order.current_status, locale)}
            </span>
          </div>
          <span
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.85)",
              marginTop: 18,
              wordBreak: "break-all",
            }}
          >
            {trackingUrl}
          </span>
        </div>

        {/* Recipient + sender column */}
        <div
          style={{
            flex: 4,
            display: "flex",
            flexDirection: "column",
            backgroundColor: COLORS.card,
            borderRadius: 14,
            padding: 22,
          }}
        >
          <span
            style={{
              color: COLORS.primary,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {t.billTo}
          </span>
          <span style={{ fontSize: 22, fontWeight: 700 }}>
            {order.recipient_name}
          </span>
          {order.recipient_address && (
            <span style={{ fontSize: 16, marginTop: 4 }}>
              {order.recipient_address}
            </span>
          )}
          {order.recipient_email && (
            <span style={{ color: COLORS.muted, fontSize: 15, marginTop: 2 }}>
              {order.recipient_email}
            </span>
          )}
          {order.recipient_phone && (
            <span style={{ color: COLORS.muted, fontSize: 15, marginTop: 2 }}>
              {order.recipient_phone}
            </span>
          )}

          <span
            style={{
              color: COLORS.primary,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            {t.sender}
          </span>
          <span style={{ fontSize: 22, fontWeight: 700 }}>{COMPANY.name}</span>
          <span style={{ fontSize: 16, marginTop: 4 }}>
            {COMPANY.addressLine1}, {COMPANY.postalCode} {COMPANY.city}
          </span>
          <span style={{ color: COLORS.muted, fontSize: 15, marginTop: 2 }}>
            {COMPANY.country} · {COMPANY.email}
          </span>
        </div>

        {/* QR column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 18,
            width: 250,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            width={210}
            height={210}
            alt="QR"
            style={{ width: 210, height: 210 }}
          />
          <span
            style={{
              color: COLORS.muted,
              fontSize: 13,
              marginTop: 10,
              textAlign: "center",
              lineHeight: 1.3,
              display: "flex",
            }}
          >
            {t.qrCaption}
          </span>
        </div>
      </div>

      {/* Barcode + 6-cell details grid in one row */}
      <div style={{ display: "flex", marginTop: 16, gap: 14 }}>
        <div
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: 14,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={barcodeDataUrl}
            alt="Barcode"
            style={{ height: 90, maxWidth: "100%" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", marginTop: 14, gap: 10 }}>
        <DetailCell
          label={t.origin}
          value={`${order.origin} (${order.origin_country})`}
        />
        <DetailCell
          label={t.destination}
          value={`${order.destination} (${order.destination_country})`}
        />
        <DetailCell
          label={t.weight}
          value={order.weight_kg != null ? `${order.weight_kg} kg` : "—"}
        />
        <DetailCell
          label={t.declaredValue}
          value={
            order.declared_value != null
              ? `${Number(order.declared_value).toFixed(2)} €`
              : "—"
          }
        />
        <DetailCell
          label={t.issueDate}
          value={formatInvoiceDate(issuedAt, locale)}
        />
        <DetailCell
          label={t.status}
          value={getStatusLabel(order.current_status, locale)}
        />
      </div>

      {/* Items list (compact grid) */}
      {items.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 14,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: COLORS.primary,
              color: COLORS.white,
              padding: "8px 14px",
            }}
          >
            <span
              style={{
                width: 40,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              #
            </span>
            <span
              style={{
                flex: 2,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {t.itemsCategory}
            </span>
            <span
              style={{
                flex: 4,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                paddingLeft: 8,
              }}
            >
              {t.itemsDescription}
            </span>
            <span
              style={{
                width: 80,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                textAlign: "right",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              {t.itemsQuantity}
            </span>
          </div>
          {items.slice(0, 6).map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 14px",
                borderTop: i === 0 ? "none" : `1px solid ${COLORS.border}`,
                backgroundColor: i % 2 === 1 ? COLORS.card : COLORS.white,
              }}
            >
              <span style={{ width: 40, fontSize: 14, color: COLORS.muted }}>
                {i + 1}
              </span>
              <span
                style={{
                  flex: 2,
                  fontSize: 14,
                  fontWeight: 700,
                  color: COLORS.primary,
                }}
              >
                {item.category && order.categoryLabel
                  ? order.categoryLabel(item.category)
                  : item.category ?? "—"}
              </span>
              <span style={{ flex: 4, fontSize: 14, paddingLeft: 8 }}>
                {item.description ?? "—"}
              </span>
              <span
                style={{
                  width: 80,
                  fontSize: 16,
                  fontWeight: 700,
                  textAlign: "right",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                × {item.quantity}
              </span>
            </div>
          ))}
        </div>
      )}

      <span
        style={{
          color: COLORS.muted,
          fontSize: 11,
          marginTop: "auto",
          paddingTop: 14,
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        {COMPANY.legalName} · {t.vatNumber}: {COMPANY.vatNumber} ·{" "}
        {t.registrationNumber}: {COMPANY.registrationNumber}
      </span>
    </div>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.card,
        borderRadius: 10,
        padding: 12,
      }}
    >
      <span
        style={{
          color: COLORS.muted,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>
        {value}
      </span>
    </div>
  );
}
