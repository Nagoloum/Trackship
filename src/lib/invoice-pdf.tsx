import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { COMPANY } from "@/lib/company";
import {
  formatInvoiceDate,
  getInvoiceStrings,
  getStatusLabel,
  type InvoiceLocale,
} from "@/lib/invoice-strings";
import type { OrderItem } from "@/lib/order-items";

export type ReceiptPdfData = {
  /** Sequential admin-issued number. Omit for the public download — the
   *  receipt-number line is then hidden. */
  invoice_number?: string;
  language: string;
  issued_at: string;
};

export type OrderPdfData = {
  code: string;
  recipient_name: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  recipient_address: string | null;
  origin: string;
  origin_country: string;
  destination: string;
  destination_country: string;
  weight_kg: number | null;
  declared_value: number | null;
  current_status: string;
  /** Optional list of items in the parcel — rendered as a table when set. */
  items?: OrderItem[];
  /** Localised category label resolver. */
  categoryLabel?: (key: string) => string;
};

const colors = {
  primary: "#1F3FA8",
  primarySoft: "#EEF1FB",
  text: "#10153A",
  muted: "#5A6082",
  border: "#D4D9EA",
  card: "#F6F7FB",
  white: "#FFFFFF",
};

// A4 landscape working area: 842 × 595pt with 24pt margins → 794 × 547pt usable.
const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingHorizontal: 24,
    paddingBottom: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: colors.text,
  },

  // Header strip
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  brandBlock: {
    flexDirection: "column",
  },
  brandName: {
    color: colors.primary,
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
  },
  brandLine: {
    color: colors.muted,
    fontSize: 8,
    marginTop: 1,
  },
  receiptMeta: {
    alignItems: "flex-end",
  },
  receiptTitle: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },
  receiptNumber: {
    marginTop: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  receiptMetaLine: {
    color: colors.muted,
    fontSize: 8,
    marginTop: 2,
  },

  // 3-column main row: tracking / recipient / qr
  mainRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
  },
  trackingCol: {
    flex: 4,
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: 6,
    padding: 12,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  recipientCol: {
    flex: 4,
    backgroundColor: colors.card,
    borderRadius: 6,
    padding: 12,
  },
  qrCol: {
    width: 140,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  trackingLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  trackingCode: {
    color: colors.white,
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    marginTop: 4,
  },
  trackingStatusBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    color: colors.white,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  trackingFooter: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 7.5,
    marginTop: 6,
  },

  partyTitle: {
    color: colors.primary,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  partyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  partyLine: {
    marginTop: 2,
    fontSize: 8.5,
  },
  partyMutedLine: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 8,
  },

  qrImage: {
    width: 110,
    height: 110,
  },
  qrCaption: {
    color: colors.muted,
    fontSize: 6.5,
    marginTop: 4,
    textAlign: "center",
    letterSpacing: 0.3,
  },

  // Barcode row
  barcodeRow: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: "center",
  },
  barcodeImage: {
    width: 360,
    height: 50,
  },

  // Compact details grid (6 cells in one row)
  detailsRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 6,
  },
  detailCell: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 5,
    padding: 7,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  detailValue: {
    marginTop: 2,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  detailValueSmall: {
    marginTop: 2,
    fontSize: 8.5,
  },

  // Items table (full width)
  itemsBlock: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  itemsHeaderRow: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    color: colors.white,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  itemsHeaderCell: {
    color: colors.white,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemRowAlt: {
    backgroundColor: colors.card,
  },
  itemCellIndex: {
    width: 22,
    fontSize: 8,
    color: colors.muted,
  },
  itemCellCategory: {
    flex: 2,
    fontSize: 8.5,
    color: colors.primary,
    fontFamily: "Helvetica-Bold",
  },
  itemCellDescription: {
    flex: 4,
    fontSize: 8.5,
    paddingHorizontal: 4,
  },
  itemCellQty: {
    width: 40,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },

  // Notice + tracking URL strip at the bottom
  notice: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 7,
    fontStyle: "italic",
    lineHeight: 1.3,
  },
  trackingUrl: {
    marginTop: 2,
    color: colors.primary,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },

  footer: {
    position: "absolute",
    bottom: 14,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    color: colors.muted,
    fontSize: 6.5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export function ReceiptPdf({
  receipt,
  order,
  qrDataUrl,
  barcodeDataUrl,
  trackingUrl,
}: {
  receipt: ReceiptPdfData;
  order: OrderPdfData;
  qrDataUrl: string;
  barcodeDataUrl: string;
  trackingUrl: string;
}) {
  const locale = (receipt.language || "en") as InvoiceLocale;
  const t = getInvoiceStrings(locale);
  const items = order.items ?? [];

  return (
    <Document
      title={`${t.documentTitle} ${order.code}`}
      author={COMPANY.name}
      creator={COMPANY.name}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>{COMPANY.name.toUpperCase()}</Text>
            <Text style={styles.brandLine}>{COMPANY.legalName}</Text>
            <Text style={styles.brandLine}>
              {COMPANY.city}, {COMPANY.country}
            </Text>
            <Text style={styles.brandLine}>
              {COMPANY.email} · {t.vatNumber}: {COMPANY.vatNumber}
            </Text>
          </View>

          <View style={styles.receiptMeta}>
            <Text style={styles.receiptTitle}>{t.documentTitle}</Text>
            {receipt.invoice_number && (
              <Text style={styles.receiptNumber}>{receipt.invoice_number}</Text>
            )}
            <Text style={styles.receiptMetaLine}>
              {t.issueDate} {formatInvoiceDate(receipt.issued_at, locale)}
            </Text>
          </View>
        </View>

        {/* 3 columns: tracking · recipient · QR */}
        <View style={styles.mainRow}>
          <View style={styles.trackingCol}>
            <View>
              <Text style={styles.trackingLabel}>{t.trackingNumber}</Text>
              <Text style={styles.trackingCode}>{order.code}</Text>
              <Text style={styles.trackingStatusBadge}>
                {getStatusLabel(order.current_status, locale)}
              </Text>
            </View>
            <Text style={styles.trackingFooter}>{trackingUrl}</Text>
          </View>

          <View style={styles.recipientCol}>
            <Text style={styles.partyTitle}>{t.billTo}</Text>
            <Text style={styles.partyName}>{order.recipient_name}</Text>
            {order.recipient_address && (
              <Text style={styles.partyLine}>{order.recipient_address}</Text>
            )}
            {order.recipient_email && (
              <Text style={styles.partyMutedLine}>{order.recipient_email}</Text>
            )}
            {order.recipient_phone && (
              <Text style={styles.partyMutedLine}>{order.recipient_phone}</Text>
            )}
            <Text style={[styles.partyTitle, { marginTop: 8 }]}>{t.sender}</Text>
            <Text style={styles.partyName}>{COMPANY.name}</Text>
            <Text style={styles.partyLine}>
              {COMPANY.city}, {COMPANY.country}
            </Text>
            <Text style={styles.partyMutedLine}>{COMPANY.email}</Text>
          </View>

          <View style={styles.qrCol}>
            <Image src={qrDataUrl} style={styles.qrImage} />
            <Text style={styles.qrCaption}>{t.qrCaption}</Text>
          </View>
        </View>

        {/* Barcode strip */}
        <View style={styles.barcodeRow}>
          <Image src={barcodeDataUrl} style={styles.barcodeImage} />
        </View>

        {/* Compact 6-cell shipment grid: origin / destination / weight / value / created / status */}
        <View style={styles.detailsRow}>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>{t.origin}</Text>
            <Text style={styles.detailValueSmall}>{order.origin}</Text>
            <Text style={styles.detailLabel}>({order.origin_country})</Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>{t.destination}</Text>
            <Text style={styles.detailValueSmall}>{order.destination}</Text>
            <Text style={styles.detailLabel}>
              ({order.destination_country})
            </Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>{t.weight}</Text>
            <Text style={styles.detailValue}>
              {order.weight_kg != null ? `${order.weight_kg} kg` : "—"}
            </Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>{t.declaredValue}</Text>
            <Text style={styles.detailValue}>
              {order.declared_value != null
                ? `${Number(order.declared_value).toFixed(2)} €`
                : "—"}
            </Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>{t.issueDate}</Text>
            <Text style={styles.detailValueSmall}>
              {formatInvoiceDate(receipt.issued_at, locale)}
            </Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>{t.status}</Text>
            <Text style={styles.detailValueSmall}>
              {getStatusLabel(order.current_status, locale)}
            </Text>
          </View>
        </View>

        {/* Items table */}
        {items.length > 0 && (
          <View style={styles.itemsBlock}>
            <View style={styles.itemsHeaderRow}>
              <Text style={[styles.itemsHeaderCell, { width: 22 }]}>#</Text>
              <Text style={[styles.itemsHeaderCell, { flex: 2 }]}>
                {t.itemsCategory}
              </Text>
              <Text style={[styles.itemsHeaderCell, { flex: 4, paddingHorizontal: 4 }]}>
                {t.itemsDescription}
              </Text>
              <Text style={[styles.itemsHeaderCell, { width: 40, textAlign: "right" }]}>
                {t.itemsQuantity}
              </Text>
            </View>
            {items.map((item, i) => (
              <View
                key={i}
                style={[
                  styles.itemRow,
                  i % 2 === 1 ? styles.itemRowAlt : {},
                ]}
              >
                <Text style={styles.itemCellIndex}>{i + 1}</Text>
                <Text style={styles.itemCellCategory}>
                  {item.category && order.categoryLabel
                    ? order.categoryLabel(item.category)
                    : item.category ?? "—"}
                </Text>
                <Text style={styles.itemCellDescription}>
                  {item.description ?? "—"}
                </Text>
                <Text style={styles.itemCellQty}>× {item.quantity}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.notice}>{t.scanNotice}</Text>
        <Text style={styles.trackingUrl}>{trackingUrl}</Text>

        <View style={styles.footer} fixed>
          <Text>
            {COMPANY.legalName} · {t.vatNumber}: {COMPANY.vatNumber} ·{" "}
            {t.registrationNumber}: {COMPANY.registrationNumber}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${t.page} ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

