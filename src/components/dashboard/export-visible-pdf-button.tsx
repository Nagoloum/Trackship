"use client";

import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";

type PdfColumn = {
  header: string;
  width?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function ExportVisiblePdfButton({
  title,
  subtitle,
  columns,
  rows,
  label,
  emptyLabel,
}: {
  title: string;
  subtitle?: string;
  columns: PdfColumn[];
  rows: string[][];
  label: string;
  emptyLabel: string;
}) {
  const handleExport = () => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) return;

    const headerCells = columns
      .map(
        (col) =>
          `<th${col.width ? ` style="width:${escapeHtml(col.width)}"` : ""}>${escapeHtml(col.header)}</th>`
      )
      .join("");
    const bodyRows = rows
      .map(
        (row) =>
          `<tr>${row
            .map((cell) => `<td>${escapeHtml(cell || "-")}</td>`)
            .join("")}</tr>`
      )
      .join("");

    printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page { size: A4 landscape; margin: 12mm; }
      * { box-sizing: border-box; }
      body {
        color: #111827;
        font-family: Arial, Helvetica, sans-serif;
        margin: 0;
      }
      header {
        border-bottom: 2px solid #111827;
        margin-bottom: 14px;
        padding-bottom: 10px;
      }
      h1 {
        font-size: 20px;
        margin: 0 0 4px;
      }
      p {
        color: #4b5563;
        font-size: 11px;
        margin: 0;
      }
      table {
        border-collapse: collapse;
        font-size: 10px;
        table-layout: fixed;
        width: 100%;
      }
      th,
      td {
        border: 1px solid #d1d5db;
        padding: 6px;
        text-align: left;
        vertical-align: top;
        word-break: break-word;
      }
      th {
        background: #f3f4f6;
        font-weight: 700;
      }
      tr:nth-child(even) td {
        background: #fafafa;
      }
      .empty {
        border: 1px solid #d1d5db;
        color: #4b5563;
        font-size: 12px;
        padding: 18px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(subtitle ?? "")}</p>
    </header>
    ${
      rows.length > 0
        ? `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`
        : `<div class="empty">${escapeHtml(emptyLabel)}</div>`
    }
    <script>
      window.addEventListener("load", () => {
        window.focus();
        setTimeout(() => window.print(), 150);
      });
    </script>
  </body>
</html>`);
    printWindow.document.close();
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={handleExport}
    >
      <FileText className="h-4 w-4" />
      {label}
    </Button>
  );
}
