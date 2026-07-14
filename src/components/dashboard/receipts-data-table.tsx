"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, FileText, ImageIcon, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ExportVisiblePdfButton } from "@/components/dashboard/export-visible-pdf-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type AdminReceiptRow = {
  id: string;
  invoice_number: string;
  language: string;
  issued_at: string;
  orders: {
    id: string;
    code: string;
    recipient_name: string;
    destination: string;
    destination_country: string;
  } | null;
};

type SortKey = "number" | "order" | "recipient" | "destination" | "language" | "issued";
type SortDirection = "asc" | "desc";

const PAGE_SIZES = [10, 25, 50] as const;

function ui(locale: string) {
  const fr = locale === "fr";
  return {
    search: fr ? "Rechercher un récépissé" : "Search receipts",
    allLanguages: fr ? "Toutes les langues" : "All languages",
    pageSize: fr ? "Lignes" : "Rows",
    previous: fr ? "Précédent" : "Previous",
    next: fr ? "Suivant" : "Next",
    empty: fr ? "Aucun récépissé ne correspond aux filtres." : "No receipts match the filters.",
    result: fr ? "résultat(s)" : "result(s)",
    bounded: fr ? "Chargement borné aux dernières lignes disponibles." : "Bounded to the latest available rows.",
    exportPdf: fr ? "Exporter PDF" : "Export PDF",
    pdfTitle: fr ? "Historique des récépissés Trackship" : "Trackship receipt history",
    filtered: fr ? "lignes filtrées" : "filtered rows",
  };
}

function includes(value: string | null | undefined, query: string) {
  return (value ?? "").toLowerCase().includes(query);
}

function compareText(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base", numeric: true });
}

export function ReceiptsDataTable({
  receipts,
  locale,
  columns,
  downloadsLabel,
  viewOrderLabel,
}: {
  receipts: AdminReceiptRow[];
  locale: string;
  columns: {
    number: string;
    order: string;
    recipient: string;
    destination: string;
    language: string;
    issued: string;
  };
  downloadsLabel: string;
  viewOrderLabel: string;
}) {
  const text = ui(locale);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("issued");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(1);

  const languages = useMemo(
    () => Array.from(new Set(receipts.map((r) => r.language))).sort(),
    [receipts]
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = receipts.filter((receipt) => {
      const order = receipt.orders;
      const matchesQuery =
        !q ||
        includes(receipt.invoice_number, q) ||
        includes(receipt.language, q) ||
        includes(order?.code, q) ||
        includes(order?.recipient_name, q) ||
        includes(order?.destination, q) ||
        includes(order?.destination_country, q);
      const matchesLanguage =
        language === "all" || receipt.language === language;
      return matchesQuery && matchesLanguage;
    });

    filtered.sort((a, b) => {
      let result = 0;
      if (sortKey === "number") result = compareText(a.invoice_number, b.invoice_number);
      if (sortKey === "order") {
        result = compareText(a.orders?.code ?? "", b.orders?.code ?? "");
      }
      if (sortKey === "recipient") {
        result = compareText(
          a.orders?.recipient_name ?? "",
          b.orders?.recipient_name ?? ""
        );
      }
      if (sortKey === "destination") {
        result = compareText(
          `${a.orders?.destination ?? ""} ${a.orders?.destination_country ?? ""}`,
          `${b.orders?.destination ?? ""} ${b.orders?.destination_country ?? ""}`
        );
      }
      if (sortKey === "language") result = compareText(a.language, b.language);
      if (sortKey === "issued") {
        result =
          new Date(a.issued_at).getTime() - new Date(b.issued_at).getTime();
      }
      return sortDirection === "asc" ? result : -result;
    });

    return filtered;
  }, [language, query, receipts, sortDirection, sortKey]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  const setSort = (key: SortKey) => {
    setPage(1);
    if (key === sortKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "issued" ? "desc" : "asc");
    }
  };

  const resetPage = (next: () => void) => {
    next();
    setPage(1);
  };

  const pdfRows = filteredRows.map((receipt) => [
    receipt.invoice_number,
    receipt.orders?.code ?? "-",
    receipt.orders?.recipient_name ?? "-",
    receipt.orders?.destination
      ? `${receipt.orders.destination} (${receipt.orders.destination_country})`
      : "-",
    receipt.language.toUpperCase(),
    dateFormatter.format(new Date(receipt.issued_at)),
  ]);

  return (
    <div className="space-y-4">
      <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_auto_auto] lg:items-center">
          <label className="relative block">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => resetPage(() => setQuery(event.target.value))}
              className="pl-8"
              placeholder={text.search}
            />
          </label>
          <select
            value={language}
            onChange={(event) => resetPage(() => setLanguage(event.target.value))}
            className="border-input bg-background h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="all">{text.allLanguages}</option>
            {languages.map((value) => (
              <option key={value} value={value}>
                {value.toUpperCase()}
              </option>
            ))}
          </select>
          <ExportVisiblePdfButton
            title={text.pdfTitle}
            subtitle={`${filteredRows.length} ${text.filtered}`}
            label={text.exportPdf}
            emptyLabel={text.empty}
            columns={[
              { header: columns.number, width: "19%" },
              { header: columns.order, width: "17%" },
              { header: columns.recipient, width: "22%" },
              { header: columns.destination, width: "22%" },
              { header: columns.language, width: "8%" },
              { header: columns.issued, width: "12%" },
            ]}
            rows={pdfRows}
          />
          <p className="text-muted-foreground text-xs lg:text-right">
            {filteredRows.length} {text.result}
            <span className="hidden lg:inline"> · {text.bounded}</span>
          </p>
        </div>
      </div>

      <ul className="space-y-3 md:hidden">
        {pageRows.map((receipt) => (
          <li key={receipt.id}>
            <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-all font-mono text-sm font-medium text-primary">
                    {receipt.invoice_number}
                  </p>
                  <p className="mt-1 truncate font-medium">
                    {receipt.orders?.recipient_name ?? "-"}
                  </p>
                  <p className="text-muted-foreground mt-0.5 truncate font-mono text-xs">
                    {receipt.orders?.code ?? "-"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs whitespace-nowrap">
                    {dateFormatter.format(new Date(receipt.issued_at))}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs uppercase">
                    {receipt.language}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`/api/invoices/${receipt.id}/pdf?download=1`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </a>
                <a
                  href={`/api/invoices/${receipt.id}/png?download=1`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
                >
                  <ImageIcon className="h-4 w-4" />
                  PNG
                </a>
                {receipt.orders?.id && (
                  <Link
                    href={`/dashboard/orders/${receipt.orders.id}`}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "ml-auto")}
                  >
                    {viewOrderLabel}
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden rounded-xl border bg-card shadow-sm md:block">
        <div className="max-h-[560px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <SortableHead active={sortKey === "number"} direction={sortDirection} onClick={() => setSort("number")}>
                  {columns.number}
                </SortableHead>
                <SortableHead active={sortKey === "order"} direction={sortDirection} onClick={() => setSort("order")}>
                  {columns.order}
                </SortableHead>
                <SortableHead active={sortKey === "recipient"} direction={sortDirection} onClick={() => setSort("recipient")}>
                  {columns.recipient}
                </SortableHead>
                <SortableHead active={sortKey === "destination"} direction={sortDirection} onClick={() => setSort("destination")}>
                  {columns.destination}
                </SortableHead>
                <SortableHead active={sortKey === "language"} direction={sortDirection} onClick={() => setSort("language")}>
                  {columns.language}
                </SortableHead>
                <SortableHead active={sortKey === "issued"} direction={sortDirection} onClick={() => setSort("issued")}>
                  {columns.issued}
                </SortableHead>
                <TableHead className="text-right">
                  <span className="sr-only">{downloadsLabel}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-mono text-xs text-primary">
                    {receipt.invoice_number}
                  </TableCell>
                  <TableCell>
                    {receipt.orders?.id ? (
                      <Link
                        href={`/dashboard/orders/${receipt.orders.id}`}
                        className="text-primary font-mono text-xs hover:underline"
                      >
                        {receipt.orders.code}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-50 truncate font-medium">
                    {receipt.orders?.recipient_name ?? "-"}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {receipt.orders?.destination
                      ? `${receipt.orders.destination} (${receipt.orders.destination_country})`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-xs uppercase">
                    {receipt.language}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                    {dateFormatter.format(new Date(receipt.issued_at))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <a
                        href={`/api/invoices/${receipt.id}/pdf?download=1`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        PDF
                      </a>
                      <a
                        href={`/api/invoices/${receipt.id}/png?download=1`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        PNG
                      </a>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {pageRows.length === 0 && (
          <p className="text-muted-foreground px-4 py-8 text-center text-sm">
            {text.empty}
          </p>
        )}
      </div>

      <Pagination
        locale={locale}
        page={currentPage}
        pageCount={pageCount}
        pageSize={pageSize}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
        onPrevious={() => setPage((value) => Math.max(1, value - 1))}
        onNext={() => setPage((value) => Math.min(pageCount, value + 1))}
      />
    </div>
  );
}

function SortableHead({
  children,
  active,
  direction,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead>
      <button
        type="button"
        onClick={onClick}
        className="hover:text-primary inline-flex items-center gap-1.5"
      >
        {children}
        <Icon className={cn("h-3.5 w-3.5", !active && "text-muted-foreground")} />
      </button>
    </TableHead>
  );
}

function Pagination({
  locale,
  page,
  pageCount,
  pageSize,
  onPageSizeChange,
  onPrevious,
  onNext,
}: {
  locale: string;
  page: number;
  pageCount: number;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const text = ui(locale);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="text-muted-foreground flex items-center gap-2 text-sm">
        {text.pageSize}
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="border-input bg-background h-8 rounded-lg border px-2 text-sm"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrevious} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
          {text.previous}
        </Button>
        <span className="text-muted-foreground text-sm">
          {page} / {pageCount}
        </span>
        <Button variant="outline" size="sm" onClick={onNext} disabled={page >= pageCount}>
          {text.next}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
