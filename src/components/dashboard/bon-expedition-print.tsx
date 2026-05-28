"use client";

import { ArrowLeft, ArrowRight, Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";
import { isTrackingStatus, STATUS_TONE } from "@/lib/statuses";
import type { OrderItem } from "@/lib/order-items";
import { cn } from "@/lib/utils";

type TransportMode = "road" | "air" | "sea" | "rail" | "express";

export interface BonExpeditionProps {
  locale: string;
  orderId: string;
  code: string;
  recipientName: string;
  recipientEmail: string | null;
  recipientPhone: string | null;
  recipientAddress: string[];
  senderName: string;
  senderLines: string[];
  origin: string;
  originCountry: string;
  destination: string;
  destinationCountry: string;
  weightKg: number | null;
  declaredValue: number | null;
  vatRate: number | null;
  items: OrderItem[];
  currentStatus: string;
  createdAt: string;
  notes: string | null;
  qrDataUrl: string;
}

const TONE_PRINT: Record<string, { bg: string; text: string; border: string }> = {
  neutral: { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" },
  info:    { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  warn:    { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
  success: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  danger:  { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
};

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function fmtDate(iso: string, locale: string): string {
  const d = new Date(iso + "T12:00:00");
  const loc =
    locale === "fr" ? "fr-FR"
    : locale === "es" ? "es-ES"
    : locale === "de" ? "de-DE"
    : "en-US";
  return new Intl.DateTimeFormat(loc, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

const CATEGORY_FR: Record<string, string> = {
  electronics: "Électronique",
  clothing: "Vêtements",
  books: "Livres",
  documents: "Documents",
  food: "Alimentaire",
  cosmetics: "Cosmétiques",
  toys: "Jouets",
  furniture: "Mobilier",
  home: "Articles maison",
  sports: "Sport",
  health: "Santé",
  tools: "Outillage",
  jewelry: "Bijoux",
  spare_parts: "Pièces",
  other: "Autre",
};

export function BonExpeditionPrint(props: BonExpeditionProps) {
  const t = useTranslations("bonExpedition");
  const tStatus = useTranslations("status");
  const { locale, orderId, code, currentStatus } = props;

  const tone = isTrackingStatus(currentStatus) ? STATUS_TONE[currentStatus] : "neutral";
  const statusColors = TONE_PRINT[tone];
  const statusLabel = isTrackingStatus(currentStatus) ? tStatus(currentStatus) : currentStatus;

  const [transportMode, setTransportMode] = useState<TransportMode>("road");
  const [pickupDate, setPickupDate] = useState(() => props.createdAt.split("T")[0]);
  const [estimatedDelivery, setEstimatedDelivery] = useState(() => addDays(5));

  const emittedDate = fmtDate(new Date().toISOString().split("T")[0], locale);

  const numFmt = new Intl.NumberFormat(
    locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : locale === "de" ? "de-DE" : "en-US",
    { style: "currency", currency: "EUR" }
  );

  const vatBreak = props.declaredValue != null
    ? (() => {
        const rate = props.vatRate ?? 0;
        const net = props.declaredValue;
        const vat = net * rate;
        return { rate, net, vat, total: net + vat };
      })()
    : null;

  const catLabel = (key?: string | null) =>
    key ? (CATEGORY_FR[key] ?? key) : "";

  return (
    <>
      {/* Print CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { visibility: hidden; }
          #bon-expedition-doc, #bon-expedition-doc * { visibility: visible; }
          #bon-expedition-doc {
            position: fixed;
            top: 0; left: 0;
            width: 100%;
            background: white;
            box-shadow: none !important;
          }
          .bon-input {
            border: none !important;
            background: transparent !important;
            -webkit-appearance: none;
            appearance: none;
            outline: none !important;
            padding-left: 0 !important;
          }
          @page { size: A4 portrait; margin: 8mm; }
        }
      `}} />

      {/* Toolbar */}
      <div className="mb-6 flex items-center gap-3 print:hidden">
        <Link
          href={`/dashboard/orders/${orderId}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>
        <span className="flex-1 font-mono text-sm text-muted-foreground">{code}</span>
        <button
          type="button"
          onClick={() => window.print()}
          className={cn(buttonVariants({ size: "sm" }), "gap-2")}
        >
          <Printer className="h-4 w-4" />
          {t("print")}
        </button>
      </div>

      {/* Document */}
      <div
        id="bon-expedition-doc"
        className="mx-auto max-w-[794px] overflow-hidden bg-white shadow-xl ring-1 ring-slate-200 print:shadow-none print:ring-0"
      >
        {/* Header */}
        <div className="flex items-stretch bg-[#1F3FA8] text-white">
          <div className="flex min-w-[165px] flex-col justify-center border-r border-blue-700 px-5 py-5">
            <p className="text-lg font-black tracking-widest">{COMPANY.name.toUpperCase()}</p>
            <p className="mt-0.5 text-[11px] text-blue-300">{COMPANY.legalName}</p>
            <p className="mt-0.5 text-[10px] text-blue-400">
              {COMPANY.city}, {COMPANY.country}
            </p>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-5">
            <h1 className="text-2xl font-black tracking-[0.2em] uppercase">{t("title")}</h1>
            <p className="mt-1 text-[11px] tracking-widest text-blue-300 uppercase">{t("subtitle")}</p>
          </div>
          <div className="flex min-w-[165px] flex-col justify-center border-l border-blue-700 px-5 py-5 text-right">
            <p className="text-[10px] uppercase tracking-wider text-blue-300">{t("ref")}</p>
            <p className="font-mono text-sm font-bold tracking-wider">{code}</p>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-blue-300">{t("emittedOn")}</p>
            <p className="text-xs">{emittedDate}</p>
          </div>
        </div>

        {/* Status bar */}
        <div
          className="flex items-center gap-4 border-b border-slate-200 px-6 py-3"
          style={{ backgroundColor: statusColors.bg }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
            {t("currentStatus")} :
          </span>
          <span
            className="rounded-full border px-5 py-1 text-sm font-bold"
            style={{
              backgroundColor: statusColors.bg,
              color: statusColors.text,
              borderColor: statusColors.border,
            }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Expeditor / Recipient */}
        <div className="grid grid-cols-2 border-b border-slate-200">
          <div className="border-r border-slate-200 p-6">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-[#1F3FA8]" />
              {t("expeditor")}
            </p>
            <p className="font-bold text-slate-800">{props.senderName}</p>
            {props.senderLines.map((line, i) => (
              <p key={i} className="mt-0.5 text-sm text-slate-600">{line}</p>
            ))}
          </div>
          <div className="p-6">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              {t("recipient")}
            </p>
            <p className="font-bold text-slate-800">{props.recipientName}</p>
            {props.recipientAddress.map((line, i) => (
              <p key={i} className="mt-0.5 text-sm text-slate-600">{line}</p>
            ))}
            {props.recipientEmail && (
              <p className="mt-0.5 text-sm text-slate-500">{props.recipientEmail}</p>
            )}
            {props.recipientPhone && (
              <p className="mt-0.5 text-sm text-slate-500">{props.recipientPhone}</p>
            )}
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full border-2 border-[#1F3FA8] bg-white" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Départ</p>
              <p className="font-semibold text-slate-800">{props.origin}</p>
              <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                {props.originCountry}
              </span>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-1 px-3">
            <div className="h-0.5 flex-1 border-t-2 border-dashed border-slate-300" />
            <ArrowRight className="h-5 w-5 shrink-0 text-[#1F3FA8]" />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Arrivée</p>
              <p className="font-semibold text-slate-800">{props.destination}</p>
              <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                {props.destinationCountry}
              </span>
            </div>
            <span className="h-3 w-3 rounded-full border-2 border-emerald-500 bg-white" />
          </div>
        </div>

        {/* Editable details grid */}
        <div className="grid grid-cols-2 border-b border-slate-200">
          <div className="border-b border-r border-slate-200 p-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t("transportMode")}
            </p>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value as TransportMode)}
              className="bon-input w-full cursor-pointer border-b border-dashed border-slate-300 bg-transparent py-1 text-sm font-semibold text-slate-800 focus:border-[#1F3FA8] focus:outline-none"
            >
              <option value="road">{t("transportModes.road")}</option>
              <option value="air">{t("transportModes.air")}</option>
              <option value="sea">{t("transportModes.sea")}</option>
              <option value="rail">{t("transportModes.rail")}</option>
              <option value="express">{t("transportModes.express")}</option>
            </select>
          </div>
          <div className="border-b border-slate-200 p-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t("pickupDate")}
            </p>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="bon-input w-full border-b border-dashed border-slate-300 bg-transparent py-1 text-sm font-semibold text-slate-800 focus:border-[#1F3FA8] focus:outline-none"
            />
          </div>
          <div className="border-r border-slate-200 p-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t("estimatedDelivery")}
            </p>
            <input
              type="date"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              className="bon-input w-full border-b border-dashed border-slate-300 bg-transparent py-1 text-sm font-semibold text-slate-800 focus:border-[#1F3FA8] focus:outline-none"
            />
          </div>
          <div className="p-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t("packageInfo")}
            </p>
            {props.weightKg != null ? (
              <p className="text-sm font-semibold text-slate-800">
                {t("weight")} : {props.weightKg} kg
              </p>
            ) : (
              <p className="text-sm italic text-slate-400">—</p>
            )}
          </div>
        </div>

        {/* Items, prices + QR code */}
        <div className="grid grid-cols-[1fr_auto] border-b border-slate-200">
          <div className="space-y-4 border-r border-slate-200 p-5">
            {/* Notes */}
            {props.notes && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  {t("notes")}
                </p>
                <p className="text-sm leading-relaxed text-slate-700">{props.notes}</p>
              </div>
            )}

            {/* Items list */}
            {props.items.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  {t("itemsTitle")}
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {t("itemCategory")}
                      </th>
                      <th className="pb-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {t("itemDescription")}
                      </th>
                      <th className="pb-1.5 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {t("itemQty")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.items.map((item, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="py-1.5 text-xs text-slate-600">
                          {catLabel(item.category)}
                        </td>
                        <td className="py-1.5 text-xs text-slate-800">{item.description ?? "—"}</td>
                        <td className="py-1.5 text-right font-mono text-xs font-semibold text-slate-800">
                          × {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Price breakdown */}
            {vatBreak && (
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  {t("priceDetails")}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{t("declaredValue")}</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {numFmt.format(vatBreak.net)}
                    </span>
                  </div>
                  {vatBreak.rate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        {t("vat")} ({(vatBreak.rate * 100).toFixed(0)}%)
                      </span>
                      <span className="font-mono text-slate-700">
                        {numFmt.format(vatBreak.vat)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-1 text-sm font-bold">
                    <span className="text-slate-800">{t("total")}</span>
                    <span className="font-mono text-[#1F3FA8]">
                      {numFmt.format(vatBreak.total)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Fallback if no items and no notes */}
            {props.items.length === 0 && !props.notes && !vatBreak && (
              <div className="min-h-[60px]" />
            )}
          </div>

          {/* QR code */}
          <div className="flex flex-col items-center justify-center gap-1.5 px-5 py-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={props.qrDataUrl} alt="QR" width={96} height={96} />
            <p className="max-w-[96px] text-center text-[9px] leading-tight text-slate-400">
              {t("scanQr")}
            </p>
          </div>
        </div>

        {/* Signature + Stamp (2 columns, no recipient) */}
        <div className="grid grid-cols-2 border-b border-slate-200">
          {/* Carrier signature */}
          <div className="border-r border-slate-200 p-6">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t("signatureCarrier")}
            </p>
            {/* Real signature image — mix-blend-mode: multiply removes white bg */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/bon-expedition-signature.png"
              alt="Signature"
              className="h-20 w-auto object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
            <div className="mt-3 border-t border-dashed border-slate-300 pt-2">
              <p className="text-xs font-medium text-slate-600">{COMPANY.name}</p>
              <p className="text-[11px] text-slate-400">{emittedDate}</p>
            </div>
          </div>

          {/* Company stamp — no title */}
          <div className="flex items-center justify-center p-6">
            {/* Real stamp image — mix-blend-mode: multiply removes white bg */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/bon-expedition-stamp.png"
              alt="Cachet"
              className="h-32 w-32 object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>
        </div>

        {/* Legal footer */}
        <div className="flex items-center justify-between bg-slate-50 px-6 py-2.5">
          <p className="text-[10px] text-slate-400">
            {COMPANY.legalName} · {COMPANY.addressLine1}, {COMPANY.postalCode} {COMPANY.city} · {COMPANY.email}
          </p>
          <p className="font-mono text-[10px] text-slate-400">{code}</p>
        </div>
      </div>
    </>
  );
}
