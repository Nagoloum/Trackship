import { COMPANY } from "@/lib/company";
import {
  formatInvoiceDate,
  getInvoiceStrings,
  getStatusLabel,
  type InvoiceLocale,
} from "@/lib/invoice-strings";

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
  current_status: string;
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

/** PNG dimensions used by both routes. */
export const RECEIPT_PNG_SIZE = { width: 1240, height: 1754 };

/**
 * The full JSX tree for a tracking receipt rendered as a PNG by Satori
 * (next/og). Shared by the admin route (`/api/invoices/[id]/png`) and the
 * public route (`/api/track/[code]/png`).
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
        padding: "40px 48px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingBottom: 18,
          borderBottom: `3px solid ${COLORS.primary}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              color: COLORS.primary,
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            {COMPANY.name.toUpperCase()}
          </span>
          <span style={{ color: COLORS.muted, fontSize: 18, marginTop: 4 }}>
            {COMPANY.legalName}
          </span>
          <span style={{ color: COLORS.muted, fontSize: 16, marginTop: 2 }}>
            {COMPANY.addressLine1}, {COMPANY.postalCode} {COMPANY.city}
          </span>
          <span style={{ color: COLORS.muted, fontSize: 16, marginTop: 2 }}>
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
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: 3,
            }}
          >
            {t.documentTitle}
          </span>
          {invoiceNumber && (
            <span style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>
              {invoiceNumber}
            </span>
          )}
          <span style={{ color: COLORS.muted, fontSize: 16, marginTop: 4 }}>
            {t.issueDate} {formatInvoiceDate(issuedAt, locale)}
          </span>
        </div>
      </div>

      {/* Tracking strip */}
      <div
        style={{
          display: "flex",
          marginTop: 28,
          gap: 24,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: COLORS.primary,
            color: COLORS.white,
            borderRadius: 12,
            padding: "28px 32px",
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
          </div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 2,
              color: "rgba(255,255,255,0.85)",
              textTransform: "uppercase",
              marginTop: 16,
            }}
          >
            {t.status}: {getStatusLabel(order.current_status, locale)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: 14,
            width: 220,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            width={180}
            height={180}
            alt="QR"
            style={{ width: 180, height: 180 }}
          />
          <span
            style={{
              color: COLORS.muted,
              fontSize: 13,
              marginTop: 8,
              textAlign: "center",
              lineHeight: 1.3,
              display: "flex",
            }}
          >
            {t.qrCaption}
          </span>
        </div>
      </div>

      {/* Barcode */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: COLORS.white,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          padding: 16,
          marginTop: 18,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={barcodeDataUrl}
          alt="Barcode"
          style={{ height: 110, maxWidth: "100%" }}
        />
      </div>

      {/* Recipient + sender */}
      <div style={{ display: "flex", marginTop: 22, gap: 18 }}>
        <PartyCard
          title={t.billTo}
          name={order.recipient_name}
          lines={[
            order.recipient_address ?? null,
            order.recipient_email ?? null,
            order.recipient_phone ?? null,
          ]}
        />
        <PartyCard
          title={t.sender}
          name={COMPANY.name}
          lines={[
            COMPANY.addressLine1,
            `${COMPANY.postalCode} ${COMPANY.city}, ${COMPANY.country}`,
            COMPANY.email,
          ]}
        />
      </div>

      {/* Shipment grid */}
      <div style={{ display: "flex", marginTop: 18, gap: 14 }}>
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
      </div>

      <span
        style={{
          color: COLORS.muted,
          fontSize: 14,
          marginTop: "auto",
          paddingTop: 24,
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        {COMPANY.legalName} · {t.vatNumber}: {COMPANY.vatNumber} ·{" "}
        {trackingUrl}
      </span>
    </div>
  );
}

function PartyCard({
  title,
  name,
  lines,
}: {
  title: string;
  name: string;
  lines: Array<string | null>;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 18,
      }}
    >
      <span
        style={{
          color: COLORS.primary,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {title}
      </span>
      <span style={{ fontSize: 22, fontWeight: 700 }}>{name}</span>
      {lines
        .filter((l): l is string => Boolean(l))
        .map((line, i) => (
          <span
            key={i}
            style={{ color: COLORS.muted, fontSize: 16, marginTop: 4 }}
          >
            {line}
          </span>
        ))}
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
        borderRadius: 12,
        padding: 18,
      }}
    >
      <span
        style={{
          color: COLORS.muted,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>
        {value}
      </span>
    </div>
  );
}
