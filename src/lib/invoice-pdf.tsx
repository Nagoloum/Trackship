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

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingHorizontal: 36,
    paddingBottom: 56,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.text,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
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
    letterSpacing: 1,
  },
  brandLegal: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 9,
  },
  brandLine: {
    color: colors.muted,
    fontSize: 9,
    marginTop: 1,
  },
  receiptMeta: {
    alignItems: "flex-end",
  },
  receiptTitle: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },
  receiptNumber: {
    marginTop: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  receiptMetaLine: {
    color: colors.muted,
    fontSize: 9,
    marginTop: 2,
  },

  // Tracking strip — large code + QR
  trackingStrip: {
    marginTop: 18,
    flexDirection: "row",
    gap: 16,
    alignItems: "stretch",
  },
  trackingMain: {
    flex: 1,
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: 6,
    padding: 16,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  trackingLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  trackingCode: {
    color: colors.white,
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    marginTop: 4,
  },
  trackingStatusRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  trackingStatus: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  qrBox: {
    width: 130,
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qrImage: {
    width: 110,
    height: 110,
  },
  qrCaption: {
    color: colors.muted,
    fontSize: 7.5,
    marginTop: 4,
    textAlign: "center",
    letterSpacing: 0.5,
  },

  // Barcode strip
  barcodeBlock: {
    marginTop: 14,
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    alignItems: "center",
  },
  barcodeImage: {
    width: 360,
    height: 70,
  },

  // Two-column block — recipient + sender
  partiesRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 18,
  },
  partyCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 6,
    padding: 12,
  },
  partyTitle: {
    color: colors.primary,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  partyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  partyLine: {
    marginTop: 2,
    fontSize: 9.5,
  },
  partyMutedLine: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 9,
  },

  // Shipment details grid
  detailsGrid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  detailCell: {
    width: "31.5%",
    backgroundColor: colors.card,
    borderRadius: 6,
    padding: 10,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailValue: {
    marginTop: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  detailValueSmall: {
    marginTop: 4,
    fontSize: 10,
  },

  notice: {
    marginTop: 16,
    color: colors.muted,
    fontSize: 8.5,
    fontStyle: "italic",
    lineHeight: 1.4,
    paddingHorizontal: 4,
  },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    color: colors.muted,
    fontSize: 8,
    paddingTop: 8,
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

  return (
    <Document
      title={`${t.documentTitle} ${receipt.invoice_number}`}
      author={COMPANY.name}
      creator={COMPANY.name}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>{COMPANY.name.toUpperCase()}</Text>
            <Text style={styles.brandLegal}>{COMPANY.legalName}</Text>
            <Text style={styles.brandLine}>{COMPANY.addressLine1}</Text>
            <Text style={styles.brandLine}>
              {COMPANY.postalCode} {COMPANY.city}, {COMPANY.country}
            </Text>
            <Text style={styles.brandLine}>{COMPANY.email}</Text>
            <Text style={styles.brandLine}>{COMPANY.phone}</Text>
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

        {/* Tracking strip */}
        <View style={styles.trackingStrip}>
          <View style={styles.trackingMain}>
            <View>
              <Text style={styles.trackingLabel}>{t.trackingNumber}</Text>
              <Text style={styles.trackingCode}>{order.code}</Text>
            </View>
            <View style={styles.trackingStatusRow}>
              <Text style={styles.trackingStatus}>
                {t.status}: {getStatusLabel(order.current_status, locale)}
              </Text>
            </View>
          </View>
          <View style={styles.qrBox}>
            <Image src={qrDataUrl} style={styles.qrImage} />
            <Text style={styles.qrCaption}>{t.qrCaption}</Text>
          </View>
        </View>

        {/* Barcode */}
        <View style={styles.barcodeBlock}>
          <Image src={barcodeDataUrl} style={styles.barcodeImage} />
        </View>

        {/* Recipient + sender */}
        <View style={styles.partiesRow}>
          <View style={styles.partyCard}>
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
          </View>

          <View style={styles.partyCard}>
            <Text style={styles.partyTitle}>{t.sender}</Text>
            <Text style={styles.partyName}>{COMPANY.name}</Text>
            <Text style={styles.partyLine}>{COMPANY.addressLine1}</Text>
            <Text style={styles.partyLine}>
              {COMPANY.postalCode} {COMPANY.city}, {COMPANY.country}
            </Text>
            <Text style={styles.partyMutedLine}>{COMPANY.email}</Text>
          </View>
        </View>

        {/* Shipment details grid */}
        <View style={styles.detailsGrid}>
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
        </View>

        <Text style={styles.notice}>{t.scanNotice}</Text>
        <Text style={[styles.notice, { marginTop: 4 }]}>{trackingUrl}</Text>

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
