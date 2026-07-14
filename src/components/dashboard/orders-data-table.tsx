"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ExportVisiblePdfButton } from "@/components/dashboard/export-visible-pdf-button";
import { StatusBadge } from "@/components/status-badge";
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
import { TRACKING_STATUSES } from "@/lib/statuses";
import { cn } from "@/lib/utils";

export type AdminOrderRow = {
  id: string;
  code: string;
  recipient_name: string;
  origin: string;
  origin_country: string;
  destination: string;
  destination_country: string;
  current_status: string;
  created_at: string;
};

type SortKey = "code" | "recipient" | "route" | "status" | "created";
type SortDirection = "asc" | "desc";

const PAGE_SIZES = [10, 25, 50] as const;

function ui(locale: string) {
  const fr = locale === "fr";
  return {
    search: fr ? "Rechercher une commande" : "Search orders",
    allStatuses: fr ? "Tous les statuts" : "All statuses",
    pageSize: fr ? "Lignes" : "Rows",
    previous: fr ? "Précédent" : "Previous",
    next: fr ? "Suivant" : "Next",
    empty: fr ? "Aucune commande ne correspond aux filtres." : "No orders match the filters.",
    result: fr ? "résultat(s)" : "result(s)",
    bounded: fr ? "Chargement borné aux dernières lignes disponibles." : "Bounded to the latest available rows.",
    exportPdf: fr ? "Exporter PDF" : "Export PDF",
    pdfTitle: fr ? "Commandes Trackship" : "Trackship orders",
    filtered: fr ? "lignes filtrées" : "filtered rows",
  };
}

function includes(value: string | null | undefined, query: string) {
  return (value ?? "").toLowerCase().includes(query);
}

function compareText(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base", numeric: true });
}

export function OrdersDataTable({
  orders,
  locale,
  columns,
  openLabel,
  statusLabels,
}: {
  orders: AdminOrderRow[];
  locale: string;
  columns: {
    code: string;
    recipient: string;
    route: string;
    status: string;
    created: string;
    actions: string;
  };
  openLabel: string;
  statusLabels: Record<string, string>;
}) {
  const text = ui(locale);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(1);

  const collatorRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = orders.filter((order) => {
      const route = `${order.origin} ${order.origin_country} ${order.destination} ${order.destination_country}`;
      const matchesQuery =
        !q ||
        includes(order.code, q) ||
        includes(order.recipient_name, q) ||
        includes(route, q) ||
        includes(statusLabels[order.current_status] ?? order.current_status, q);
      const matchesStatus = status === "all" || order.current_status === status;
      return matchesQuery && matchesStatus;
    });

    filtered.sort((a, b) => {
      let result = 0;
      if (sortKey === "code") result = compareText(a.code, b.code);
      if (sortKey === "recipient") {
        result = compareText(a.recipient_name, b.recipient_name);
      }
      if (sortKey === "route") {
        result = compareText(
          `${a.origin_country}-${a.destination_country}`,
          `${b.origin_country}-${b.destination_country}`
        );
      }
      if (sortKey === "status") {
        result = compareText(
          statusLabels[a.current_status] ?? a.current_status,
          statusLabels[b.current_status] ?? b.current_status
        );
      }
      if (sortKey === "created") {
        result =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortDirection === "asc" ? result : -result;
    });

    return filtered;
  }, [orders, query, sortDirection, sortKey, status, statusLabels]);

  const pageCount = Math.max(1, Math.ceil(collatorRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = collatorRows.slice(
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
      setSortDirection(key === "created" ? "desc" : "asc");
    }
  };

  const resetPage = (next: () => void) => {
    next();
    setPage(1);
  };

  const pdfRows = collatorRows.map((order) => [
    order.code,
    order.recipient_name,
    `${order.origin} (${order.origin_country}) -> ${order.destination} (${order.destination_country})`,
    statusLabels[order.current_status] ?? order.current_status,
    dateFormatter.format(new Date(order.created_at)),
  ]);

  return (
    <div className="space-y-4">
      <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_auto_auto] lg:items-center">
          <label className="relative block">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) =>
                resetPage(() => setQuery(event.target.value))
              }
              className="pl-8"
              placeholder={text.search}
            />
          </label>
          <select
            value={status}
            onChange={(event) => resetPage(() => setStatus(event.target.value))}
            className="border-input bg-background h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="all">{text.allStatuses}</option>
            {TRACKING_STATUSES.map((value) => (
              <option key={value} value={value}>
                {statusLabels[value] ?? value}
              </option>
            ))}
          </select>
          <ExportVisiblePdfButton
            title={text.pdfTitle}
            subtitle={`${collatorRows.length} ${text.filtered}`}
            label={text.exportPdf}
            emptyLabel={text.empty}
            columns={[
              { header: columns.code, width: "17%" },
              { header: columns.recipient, width: "22%" },
              { header: columns.route, width: "30%" },
              { header: columns.status, width: "16%" },
              { header: columns.created, width: "15%" },
            ]}
            rows={pdfRows}
          />
          <p className="text-muted-foreground text-xs lg:text-right">
            {collatorRows.length} {text.result}
            <span className="hidden lg:inline"> · {text.bounded}</span>
          </p>
        </div>
      </div>

      <ul className="space-y-3 md:hidden">
        {pageRows.map((order) => (
          <li key={order.id}>
            <Link
              href={`/dashboard/orders/${order.id}`}
              className="bg-card text-card-foreground hover:border-primary/40 block rounded-xl border p-4 shadow-sm transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-all font-mono text-xs text-primary">
                    {order.code}
                  </p>
                  <p className="mt-1 truncate font-medium">
                    {order.recipient_name}
                  </p>
                </div>
                <StatusBadge status={order.current_status} className="shrink-0" />
              </div>
              <div className="text-muted-foreground mt-3 text-xs">
                {order.origin} ({order.origin_country}) {"->"}{" "}
                {order.destination} ({order.destination_country})
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {dateFormatter.format(new Date(order.created_at))}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden rounded-xl border bg-card shadow-sm md:block">
        <div className="max-h-[560px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <SortableHead
                  active={sortKey === "code"}
                  direction={sortDirection}
                  onClick={() => setSort("code")}
                >
                  {columns.code}
                </SortableHead>
                <SortableHead
                  active={sortKey === "recipient"}
                  direction={sortDirection}
                  onClick={() => setSort("recipient")}
                >
                  {columns.recipient}
                </SortableHead>
                <SortableHead
                  active={sortKey === "route"}
                  direction={sortDirection}
                  onClick={() => setSort("route")}
                >
                  {columns.route}
                </SortableHead>
                <SortableHead
                  active={sortKey === "status"}
                  direction={sortDirection}
                  onClick={() => setSort("status")}
                >
                  {columns.status}
                </SortableHead>
                <SortableHead
                  active={sortKey === "created"}
                  direction={sortDirection}
                  onClick={() => setSort("created")}
                >
                  {columns.created}
                </SortableHead>
                <TableHead className="text-right">
                  <span className="sr-only">{columns.actions}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="text-primary font-mono text-xs hover:underline"
                    >
                      {order.code}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {order.recipient_name}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm whitespace-nowrap">
                      {order.origin_country} {"->"} {order.destination_country}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.current_status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                    {dateFormatter.format(new Date(order.created_at))}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      {openLabel}
                    </Link>
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
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= pageCount}
        >
          {text.next}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
