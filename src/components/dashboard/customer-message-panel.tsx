"use client";

import { Check, Clipboard, Mail } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

const SUBJECT = "Confirmation de reception de votre colis - TRACKSHIP";

function countryName(countryCode: string) {
  try {
    return (
      new Intl.DisplayNames(["fr"], { type: "region" }).of(countryCode) ??
      countryCode
    );
  } catch {
    return countryCode;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function CustomerMessagePanel({
  recipientName,
  recipientEmail,
  trackingCode,
  originCountry,
  receivedAt,
  trackingUrl,
}: {
  recipientName: string;
  recipientEmail: string | null;
  trackingCode: string;
  originCountry: string;
  receivedAt: string;
  trackingUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const message = useMemo(
    () => `Bonsoir ${recipientName},

Nous vous confirmons que votre colis a bien été reçu et enregistré dans nos locaux par notre agence de transit TrackShip.

Vous trouverez en pièce jointe le récépissé de dépôt correspondant à votre expédition pour confirmation et suivi administratif.

📦 Numéro de suivi : ${trackingCode}
${trackingUrl}

📍 Provenance : ${countryName(originCountry)}

📅 Date de réception : ${formatDate(receivedAt)}

Vous pouvez suivre l’évolution de votre colis directement sur notre plateforme en ligne grâce à votre numéro de suivi.

Notre équipe reste à votre disposition pour toute information complémentaire.

Cordialement,

Service Client – TrackShip

trackshipp.contact@protonmail.com

https://trackshipp.vercel.app/fr/`,
    [originCountry, receivedAt, recipientName, trackingCode, trackingUrl]
  );

  const messageHtml = useMemo(
    () => `<div>
<p>Bonsoir ${escapeHtml(recipientName)},</p>
<p>Nous vous confirmons que votre colis a bien été reçu et enregistré dans nos locaux par notre agence de transit TrackShip.</p>
<p>Vous trouverez en pièce jointe le récépissé de dépôt correspondant à votre expédition pour confirmation et suivi administratif.</p>
<p>📦 Numéro de suivi : <a href="${escapeHtml(trackingUrl)}">${escapeHtml(trackingCode)}</a></p>
<p>📍 Provenance : ${escapeHtml(countryName(originCountry))}</p>
<p>📅 Date de réception : ${escapeHtml(formatDate(receivedAt))}</p>
<p>Vous pouvez suivre l’évolution de votre colis directement sur notre plateforme en ligne grâce à votre numéro de suivi.</p>
<p>Notre équipe reste à votre disposition pour toute information complémentaire.</p>
<p>Cordialement,</p>
<p>Service Client – TrackShip</p>
<p>trackshipp.contact@protonmail.com</p>
<p><a href="https://trackshipp.vercel.app/fr/">https://trackshipp.vercel.app/fr/</a></p>
</div>`,
    [originCountry, receivedAt, recipientName, trackingCode, trackingUrl]
  );

  const copyMessage = async () => {
    if (typeof ClipboardItem !== "undefined") {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([messageHtml], { type: "text/html" }),
          "text/plain": new Blob([message], { type: "text/plain" }),
        }),
      ]);
    } else {
      await navigator.clipboard.writeText(message);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
            <Mail className="h-4 w-4" />
            Message client
          </h2>
          <p className="text-muted-foreground mt-1 truncate text-xs">
            {recipientEmail ?? "Aucun email destinataire"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Masquer" : "Afficher le message"}
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={copyMessage}
            disabled={!recipientEmail}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Clipboard className="h-4 w-4" />
            )}
            {copied ? "Copié" : "Copier"}
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-3 border-t pt-4">
          <div className="grid gap-2 text-sm sm:grid-cols-[96px_1fr]">
            <span className="text-muted-foreground">À</span>
            <span className="break-all font-medium">
              {recipientEmail ?? "-"}
            </span>
            <span className="text-muted-foreground">Objet</span>
            <span className="font-medium">{SUBJECT}</span>
          </div>
          <div className="border-input bg-background space-y-4 rounded-lg border p-3 text-sm leading-relaxed">
            <p>Bonsoir {recipientName},</p>
            <p>
              Nous vous confirmons que votre colis a bien été reçu et
              enregistré dans nos locaux par notre agence de transit TrackShip.
            </p>
            <p>
              Vous trouverez en pièce jointe le récépissé de dépôt correspondant
              à votre expédition pour confirmation et suivi administratif.
            </p>
            <p>
              📦 Numéro de suivi :{" "}
              <a
                href={trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                {trackingCode}
              </a>
            </p>
            <p>📍 Provenance : {countryName(originCountry)}</p>
            <p>📅 Date de réception : {formatDate(receivedAt)}</p>
            <p>
              Vous pouvez suivre l’évolution de votre colis directement sur
              notre plateforme en ligne grâce à votre numéro de suivi.
            </p>
            <p>
              Notre équipe reste à votre disposition pour toute information
              complémentaire.
            </p>
            <p>Cordialement,</p>
            <p>Service Client – TrackShip</p>
            <p>trackshipp.contact@protonmail.com</p>
            <p>
              <a
                href="https://trackshipp.vercel.app/fr/"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                https://trackshipp.vercel.app/fr/
              </a>
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
