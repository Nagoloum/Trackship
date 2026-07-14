"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Mail, MailOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ExportVisiblePdfButton } from "@/components/dashboard/export-visible-pdf-button";
import { Button } from "@/components/ui/button";
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

export type AdminMessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read_at: string | null;
  created_at: string;
};

type SortKey = "name" | "email" | "subject" | "status" | "created";
type SortDirection = "asc" | "desc";

const PAGE_SIZES = [10, 25, 50] as const;

function ui(locale: string) {
  const fr = locale === "fr";
  return {
    search: fr ? "Rechercher un message" : "Search messages",
    allStates: fr ? "Tous les messages" : "All messages",
    unreadOnly: fr ? "Non lus" : "Unread",
    readOnly: fr ? "Lus" : "Read",
    read: fr ? "Lu" : "Read",
    unread: fr ? "Non lu" : "Unread",
    noSubject: fr ? "(sans sujet)" : "(no subject)",
    pageSize: fr ? "Lignes" : "Rows",
    previous: fr ? "Précédent" : "Previous",
    next: fr ? "Suivant" : "Next",
    empty: fr ? "Aucun message ne correspond aux filtres." : "No messages match the filters.",
    result: fr ? "résultat(s)" : "result(s)",
    bounded: fr ? "Chargement borné aux dernières lignes disponibles." : "Bounded to the latest available rows.",
    exportPdf: fr ? "Exporter PDF" : "Export PDF",
    pdfTitle: fr ? "Messages Trackship" : "Trackship messages",
    filtered: fr ? "lignes filtrées" : "filtered rows",
    columns: {
      name: fr ? "Nom" : "Name",
      email: "Email",
      subject: fr ? "Sujet" : "Subject",
      status: fr ? "État" : "State",
      created: fr ? "Reçu le" : "Received",
      message: "Message",
    },
  };
}

function includes(value: string | null | undefined, query: string) {
  return (value ?? "").toLowerCase().includes(query);
}

function compareText(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base", numeric: true });
}

export function MessagesDataTable({
  messages,
  locale,
}: {
  messages: AdminMessageRow[];
  locale: string;
}) {
  const text = ui(locale);
  const [query, setQuery] = useState("");
  const [readState, setReadState] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = messages.filter((message) => {
      const unread = !message.read_at;
      const matchesQuery =
        !q ||
        includes(message.name, q) ||
        includes(message.email, q) ||
        includes(message.subject, q) ||
        includes(message.message, q);
      const matchesReadState =
        readState === "all" ||
        (readState === "unread" && unread) ||
        (readState === "read" && !unread);
      return matchesQuery && matchesReadState;
    });

    filtered.sort((a, b) => {
      let result = 0;
      if (sortKey === "name") result = compareText(a.name, b.name);
      if (sortKey === "email") result = compareText(a.email, b.email);
      if (sortKey === "subject") {
        result = compareText(a.subject ?? a.message, b.subject ?? b.message);
      }
      if (sortKey === "status") {
        result = compareText(a.read_at ? text.read : text.unread, b.read_at ? text.read : text.unread);
      }
      if (sortKey === "created") {
        result =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortDirection === "asc" ? result : -result;
    });

    return filtered;
  }, [messages, query, readState, sortDirection, sortKey, text.read, text.unread]);

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
      setSortDirection(key === "created" ? "desc" : "asc");
    }
  };

  const resetPage = (next: () => void) => {
    next();
    setPage(1);
  };

  const pdfRows = filteredRows.map((message) => [
    message.name,
    message.email,
    message.subject ?? text.noSubject,
    message.read_at ? text.read : text.unread,
    dateFormatter.format(new Date(message.created_at)),
    message.message,
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
            value={readState}
            onChange={(event) => resetPage(() => setReadState(event.target.value))}
            className="border-input bg-background h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="all">{text.allStates}</option>
            <option value="unread">{text.unreadOnly}</option>
            <option value="read">{text.readOnly}</option>
          </select>
          <ExportVisiblePdfButton
            title={text.pdfTitle}
            subtitle={`${filteredRows.length} ${text.filtered}`}
            label={text.exportPdf}
            emptyLabel={text.empty}
            columns={[
              { header: text.columns.name, width: "15%" },
              { header: text.columns.email, width: "20%" },
              { header: text.columns.subject, width: "20%" },
              { header: text.columns.status, width: "10%" },
              { header: text.columns.created, width: "12%" },
              { header: text.columns.message, width: "23%" },
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
        {pageRows.map((message) => {
          const unread = !message.read_at;
          return (
            <li key={message.id}>
              <Link
                href={`/dashboard/messages/${message.id}`}
                className={cn(
                  "bg-card text-card-foreground hover:border-primary/40 block rounded-xl border p-4 shadow-sm transition-colors",
                  unread && "border-primary/40 bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        unread
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {unread ? (
                        <Mail className="h-4 w-4" />
                      ) : (
                        <MailOpen className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{message.name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {message.email}
                      </p>
                      <p className="mt-1 line-clamp-1 text-sm">
                        {message.subject ?? message.message}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground shrink-0 text-xs whitespace-nowrap">
                    {dateFormatter.format(new Date(message.created_at))}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="hidden rounded-xl border bg-card shadow-sm md:block">
        <div className="max-h-[560px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <SortableHead active={sortKey === "name"} direction={sortDirection} onClick={() => setSort("name")}>
                  {text.columns.name}
                </SortableHead>
                <SortableHead active={sortKey === "email"} direction={sortDirection} onClick={() => setSort("email")}>
                  {text.columns.email}
                </SortableHead>
                <SortableHead active={sortKey === "subject"} direction={sortDirection} onClick={() => setSort("subject")}>
                  {text.columns.subject}
                </SortableHead>
                <SortableHead active={sortKey === "status"} direction={sortDirection} onClick={() => setSort("status")}>
                  {text.columns.status}
                </SortableHead>
                <SortableHead active={sortKey === "created"} direction={sortDirection} onClick={() => setSort("created")}>
                  {text.columns.created}
                </SortableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((message) => {
                const unread = !message.read_at;
                return (
                  <TableRow key={message.id}>
                    <TableCell className="max-w-[180px] truncate font-medium">
                      <Link
                        href={`/dashboard/messages/${message.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {message.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[220px] truncate text-sm">
                      {message.email}
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-sm">
                      {message.subject ?? text.noSubject}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                          unread
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-border bg-muted text-muted-foreground"
                        )}
                      >
                        {unread ? text.unread : text.read}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                      {dateFormatter.format(new Date(message.created_at))}
                    </TableCell>
                  </TableRow>
                );
              })}
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
