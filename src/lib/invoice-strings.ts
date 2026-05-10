/**
 * Localized strings used inside the tracking-receipt PDF/PNG. Kept separate
 * from the next-intl message catalog because the receipts run outside React's
 * i18n context (rendered by @react-pdf/renderer / Satori on the server).
 */
export type InvoiceLocale = "fr" | "en" | "es" | "de";

export type InvoiceStrings = {
  documentTitle: string;
  invoiceNumber: string;
  issueDate: string;
  billTo: string;
  sender: string;
  shipment: string;
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  weight: string;
  qrCaption: string;
  scanNotice: string;
  vatNumber: string;
  registrationNumber: string;
  page: string;
  status_pending: string;
  status_picked_up: string;
  status_in_transit: string;
  status_out_for_delivery: string;
  status_delivered: string;
  status_failed: string;
  status_returned: string;
};

const STRINGS: Record<InvoiceLocale, InvoiceStrings> = {
  fr: {
    documentTitle: "RÉCÉPISSÉ DE TRACKING",
    invoiceNumber: "Récépissé n°",
    issueDate: "Émis le",
    billTo: "Destinataire",
    sender: "Expéditeur",
    shipment: "Expédition",
    trackingNumber: "Numéro de suivi",
    status: "Statut",
    origin: "Origine",
    destination: "Destination",
    weight: "Poids",
    qrCaption: "Scannez pour suivre votre colis",
    scanNotice:
      "Scannez le QR code pour consulter en temps réel le statut, la timeline et le détail de cette expédition. Le code-barres ci-dessus reproduit le numéro de suivi et peut être lu par un scanner logistique.",
    vatNumber: "N° TVA",
    registrationNumber: "Immatriculation",
    page: "Page",
    status_pending: "En attente",
    status_picked_up: "Collectée",
    status_in_transit: "En transit",
    status_out_for_delivery: "En cours de livraison",
    status_delivered: "Livrée",
    status_failed: "Échec de livraison",
    status_returned: "Retournée",
  },
  en: {
    documentTitle: "TRACKING RECEIPT",
    invoiceNumber: "Receipt no.",
    issueDate: "Issued on",
    billTo: "Recipient",
    sender: "Sender",
    shipment: "Shipment",
    trackingNumber: "Tracking number",
    status: "Status",
    origin: "Origin",
    destination: "Destination",
    weight: "Weight",
    qrCaption: "Scan to track your parcel",
    scanNotice:
      "Scan the QR code to view this shipment's real-time status, timeline and details. The barcode above encodes the tracking number and can be read by any logistics scanner.",
    vatNumber: "VAT no.",
    registrationNumber: "Registration",
    page: "Page",
    status_pending: "Pending",
    status_picked_up: "Picked up",
    status_in_transit: "In transit",
    status_out_for_delivery: "Out for delivery",
    status_delivered: "Delivered",
    status_failed: "Delivery failed",
    status_returned: "Returned",
  },
  es: {
    documentTitle: "RECIBO DE SEGUIMIENTO",
    invoiceNumber: "Recibo n.°",
    issueDate: "Emitido el",
    billTo: "Destinatario",
    sender: "Remitente",
    shipment: "Envío",
    trackingNumber: "Número de seguimiento",
    status: "Estado",
    origin: "Origen",
    destination: "Destino",
    weight: "Peso",
    qrCaption: "Escanea para rastrear tu paquete",
    scanNotice:
      "Escanea el código QR para consultar en tiempo real el estado, la línea de tiempo y los detalles de este envío. El código de barras superior contiene el número de seguimiento y puede leerse con cualquier escáner logístico.",
    vatNumber: "N.º IVA",
    registrationNumber: "Registro",
    page: "Página",
    status_pending: "Pendiente",
    status_picked_up: "Recogido",
    status_in_transit: "En tránsito",
    status_out_for_delivery: "En reparto",
    status_delivered: "Entregado",
    status_failed: "Entrega fallida",
    status_returned: "Devuelto",
  },
  de: {
    documentTitle: "SENDUNGSBELEG",
    invoiceNumber: "Beleg-Nr.",
    issueDate: "Ausgestellt am",
    billTo: "Empfänger",
    sender: "Absender",
    shipment: "Sendung",
    trackingNumber: "Sendungsnummer",
    status: "Status",
    origin: "Absendeort",
    destination: "Zielort",
    weight: "Gewicht",
    qrCaption: "Scannen, um die Sendung zu verfolgen",
    scanNotice:
      "Scannen Sie den QR-Code, um den aktuellen Status, die Zeitleiste und alle Details dieser Sendung in Echtzeit aufzurufen. Der Barcode oben enthält die Sendungsnummer und kann von jedem Logistik-Scanner gelesen werden.",
    vatNumber: "USt-IdNr.",
    registrationNumber: "Handelsregister",
    page: "Seite",
    status_pending: "Ausstehend",
    status_picked_up: "Abgeholt",
    status_in_transit: "Unterwegs",
    status_out_for_delivery: "In Zustellung",
    status_delivered: "Zugestellt",
    status_failed: "Zustellung fehlgeschlagen",
    status_returned: "Retourniert",
  },
};

export function getInvoiceStrings(locale: string): InvoiceStrings {
  if (locale === "fr" || locale === "en" || locale === "es" || locale === "de") {
    return STRINGS[locale];
  }
  return STRINGS.en;
}

const STATUS_KEYS: Record<string, keyof InvoiceStrings> = {
  pending: "status_pending",
  picked_up: "status_picked_up",
  in_transit: "status_in_transit",
  out_for_delivery: "status_out_for_delivery",
  delivered: "status_delivered",
  failed: "status_failed",
  returned: "status_returned",
};

export function getStatusLabel(status: string, locale: InvoiceLocale): string {
  const key = STATUS_KEYS[status];
  if (!key) return status;
  return STRINGS[locale][key];
}

const DATE_LOCALE: Record<InvoiceLocale, string> = {
  fr: "fr-FR",
  en: "en-US",
  es: "es-ES",
  de: "de-DE",
};

export function formatInvoiceDate(iso: string, locale: InvoiceLocale): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
