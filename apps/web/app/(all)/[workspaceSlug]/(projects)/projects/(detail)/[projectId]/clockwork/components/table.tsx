/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { AlignJustify, ChevronLeft, ChevronRight, Columns3, Download, Loader2 } from "lucide-react";
import { Button } from "@plane/propel/button";
import type { TClockworkAdvancedRow, TClockworkTableRow } from "./types";
import { useClockwork } from "./use-clockwork";
import { ClockworkDetailModal } from "./detail-modal";
import { useClockworkAdvanced } from "./use-clockwork-advanced";

// Column widths (px)
const COL_USER = 180;
const COL_TOTAL = 100;
const COL_DAY = 52;

// Advanced view extra sticky column widths (px)
const COL_TOTAL_ADV = 90;
const COL_ISSUE = 176;
const COL_DATE = 88;
const COL_ESTIMATE = 76;

// Advanced sticky left offsets
const ADV_LEFT_ISSUE = COL_USER; // 180
const ADV_LEFT_START = ADV_LEFT_ISSUE + COL_ISSUE; // 356
const ADV_LEFT_END = ADV_LEFT_START + COL_DATE; // 444
const ADV_LEFT_EST = ADV_LEFT_END + COL_DATE; // 532
const ADV_LEFT_ACT = ADV_LEFT_EST + COL_ESTIMATE; // 608
const ADV_LEFT_TOTAL = ADV_LEFT_ACT + COL_ESTIMATE; // 684

// Deterministic avatar color based on user name
const AVATAR_PALETTE = [
  "bg-label-crimson-icon",
  "bg-label-indigo-icon",
  "bg-label-emerald-icon",
  "bg-label-yellow-icon",
  "bg-accent-primary",
  "bg-danger-primary",
  "bg-success-primary",
  "bg-warning-primary",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** "00:08" → false, "00:00" → true */
function isZero(hhmm: string): boolean {
  return !hhmm || hhmm === "00:00";
}

function exportToCsv(rows: TClockworkTableRow[], dates: string[], from: string, to: string) {
  const header = ["User", "Total", ...dates];
  const dataRows = rows.map((r) => [
    `"${r.userName.replace(/"/g, '""')}"`,
    r.total,
    ...dates.map((d) => r.days[d] ?? "00:00"),
  ]);
  const csv = [header, ...dataRows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clockwork-${from}-${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Sub-components ──────────────────────────────────────────────────────────

type TStickyThProps = {
  children: React.ReactNode;
  width: number;
  stickyLeft?: number;
  isLast?: boolean;
  align?: "left" | "right";
};

function StickyTh({ children, width, stickyLeft, isLast, align = "left" }: TStickyThProps) {
  return (
    <th
      style={{ width, minWidth: width, left: stickyLeft }}
      className={`sticky top-0 z-20 border-r border-b border-subtle bg-surface-2 px-3 py-2 text-${align} text-11 font-medium text-secondary ${
        isLast ? "shadow-[2px_0_4px_0_rgba(0,0,0,0.06)]" : ""
      }`}
    >
      {children}
    </th>
  );
}

function DayTh({ dateStr }: { dateStr: string }) {
  const d = new Date(dateStr + "T00:00:00");
  const day = String(d.getDate()).padStart(2, "0");
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const isWeekend = weekday === "Sat" || weekday === "Sun";
  return (
    <th
      style={{ width: COL_DAY, minWidth: COL_DAY }}
      className={`sticky top-0 z-10 border-r border-b border-subtle px-1 py-1.5 text-center ${isWeekend ? "bg-surface-3" : "bg-surface-2"}`}
    >
      <div className="text-11 font-medium text-secondary">{day}</div>
      <div className={`font-normal text-[9px] ${isWeekend ? "text-danger-primary" : "text-tertiary"}`}>{weekday}</div>
    </th>
  );
}

type TRowProps = {
  row: TClockworkTableRow;
  dates: string[];
  isEven: boolean;
  onCellClick: (date: string, userName: string) => void;
};

function ClockworkRow({ row, dates, isEven, onCellClick }: TRowProps) {
  const rowBg = isEven ? "bg-surface-1" : "bg-surface-2";

  return (
    <tr className="group">
      {/* User */}
      <td
        style={{ width: COL_USER, minWidth: COL_USER, left: 0 }}
        className={`sticky z-10 border-r border-b border-subtle px-3 py-1.5 ${rowBg}`}
      >
        <div className="flex items-center gap-1.5">
          <span
            className={`flex size-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white ${avatarColor(row.userName)}`}
          >
            {getInitials(row.userName)}
          </span>
          <span className="truncate text-11 font-medium text-primary">{row.userName}</span>
        </div>
      </td>

      {/* Total */}
      <td
        style={{ width: COL_TOTAL, minWidth: COL_TOTAL, left: COL_USER }}
        className={`sticky z-10 border-r border-b border-subtle px-3 py-1.5 text-right shadow-[2px_0_4px_0_rgba(0,0,0,0.06)] ${rowBg}`}
      >
        <span className={`text-12 font-medium ${isZero(row.total) ? "text-tertiary" : "text-primary"}`}>
          {row.total}
        </span>
      </td>

      {/* Per-day cells */}
      {dates.map((dateStr) => {
        const val = row.days[dateStr] ?? "00:00";
        const hasTime = !isZero(val);
        return (
          <td key={dateStr} title={`${row.userName} — ${dateStr}: ${val}`}>
            {hasTime ? (
              <button
                className="flex h-10 w-full cursor-pointer flex-col items-center justify-center rounded bg-accent-primary/15 px-3 py-0.5 transition-colors hover:bg-accent-primary/25"
                onClick={() => onCellClick(dateStr, row.userName)}
                title={`View details for ${row.userName} on ${dateStr}`}
              >
                <span className="text-[12px] leading-none font-semibold text-accent-primary">{val}</span>
              </button>
            ) : (
              <span className="text-[12px] leading-none font-medium text-danger-primary">00:00</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

// ── Advanced row sub-component ──────────────────────────────────────────────

/** Format "YYYY-MM-DD" → "Mon D" for compact display in narrow columns */
function formatShortDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

type TAdvancedRowProps = {
  row: TClockworkAdvancedRow;
  dates: string[];
  groupEven: boolean;
  onCellClick: (date: string, userName: string) => void;
};

function AdvancedClockworkRow({ row, dates, groupEven, onCellClick }: TAdvancedRowProps) {
  const rowBg = groupEven ? "bg-surface-1" : "bg-surface-2";
  const { isFirstForUser } = row;

  return (
    <tr className={`group ${isFirstForUser ? "border-t border-t-subtle-1" : ""}`}>
      {/* User */}
      <td
        style={{ width: COL_USER, minWidth: COL_USER, left: 0 }}
        className={`sticky z-10 border-r border-b border-subtle px-3 py-1.5 ${rowBg}`}
      >
        <div className="flex items-center gap-1.5">
          {isFirstForUser ? (
            <span
              className={`flex size-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white ${avatarColor(row.userName)}`}
            >
              {getInitials(row.userName)}
            </span>
          ) : (
            <span className="size-5 flex-shrink-0" />
          )}
          <span className={`truncate text-11 font-medium ${isFirstForUser ? "text-primary" : "text-tertiary"}`}>
            {row.userName}
          </span>
        </div>
      </td>

      {/* Issue Name */}
      <td
        style={{ width: COL_ISSUE, minWidth: COL_ISSUE, left: ADV_LEFT_ISSUE }}
        className={`sticky z-10 border-r border-b border-subtle px-3 py-1.5 ${rowBg}`}
      >
        <span className="block truncate text-11 text-primary" title={row.issueName}>
          {row.issueName}
        </span>
      </td>

      {/* Start Date */}
      <td
        style={{ width: COL_DATE, minWidth: COL_DATE, left: ADV_LEFT_START }}
        className={`sticky z-10 border-r border-b border-subtle px-2 py-1.5 ${rowBg}`}
      >
        <span className="text-11 text-secondary">{formatShortDate(row.startDate)}</span>
      </td>

      {/* End Date */}
      <td
        style={{ width: COL_DATE, minWidth: COL_DATE, left: ADV_LEFT_END }}
        className={`sticky z-10 border-r border-b border-subtle px-2 py-1.5 ${rowBg}`}
      >
        <span className="text-11 text-secondary">{formatShortDate(row.endDate)}</span>
      </td>

      {/* Estimated */}
      <td
        style={{
          width: COL_ESTIMATE,
          minWidth: COL_ESTIMATE,
          left: ADV_LEFT_EST,
        }}
        className={`sticky z-10 border-r border-b border-subtle px-2 py-1.5 text-right ${rowBg}`}
      >
        <span className="text-11 text-secondary tabular-nums">{row.estimated ?? "—"}</span>
      </td>

      {/* Actual */}
      <td
        style={{
          width: COL_ESTIMATE,
          minWidth: COL_ESTIMATE,
          left: ADV_LEFT_ACT,
        }}
        className={`sticky z-10 border-r border-b border-subtle px-2 py-1.5 text-right ${rowBg}`}
      >
        <span className="text-11 text-secondary tabular-nums">{row.actual ?? "—"}</span>
      </td>

      {/* Total */}
      <td
        style={{
          width: COL_TOTAL_ADV,
          minWidth: COL_TOTAL_ADV,
          left: ADV_LEFT_TOTAL,
        }}
        className={`sticky z-10 border-r border-b border-subtle px-3 py-1.5 text-right shadow-[2px_0_4px_0_rgba(0,0,0,0.06)] ${rowBg}`}
      >
        <span className={`text-12 font-medium tabular-nums ${isZero(row.total) ? "text-tertiary" : "text-primary"}`}>
          {row.total}
        </span>
      </td>

      {/* Per-day cells */}
      {dates.map((dateStr) => {
        const val = row.days[dateStr] ?? "00:00";
        const hasTime = !isZero(val);
        return (
          <td
            key={dateStr}
            style={{ width: COL_DAY, minWidth: COL_DAY }}
            className={`border-r border-b border-subtle px-0.5 py-1 text-center ${
              hasTime ? rowBg : "bg-danger-subtle"
            }`}
            title={`${row.userName} — ${row.issueName} — ${dateStr}: ${val}`}
          >
            {hasTime ? (
              <button
                className="flex h-8 w-full flex-col items-center justify-center rounded bg-accent-primary/15 px-0.5 py-0.5 transition-colors hover:bg-accent-primary/25"
                onClick={() => onCellClick(dateStr, row.userName)}
                title={`View details for ${row.userName} on ${dateStr}`}
              >
                <span className="text-[11px] leading-none font-semibold text-accent-primary">{val}</span>
              </button>
            ) : (
              <span className="text-[11px] leading-none font-medium text-danger-primary">—</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export function ClockworkTable() {
  const { rows, dates, from, to, isLoading, error, goToPrevMonth, goToNextMonth } = useClockwork();

  const [selectedCell, setSelectedCell] = useState<{
    date: string;
    userName: string;
  } | null>(null);

  const [isAdvanced, setIsAdvanced] = useState(false);

  const {
    rows: advancedRows,
    isLoading: advancedIsLoading,
    error: advancedError,
  } = useClockworkAdvanced(from, to, isAdvanced);

  // Pre-compute user→groupIndex for even/odd row alternation in advanced view
  const advancedGroupMap = advancedRows.reduce<Map<string, number>>((map, row) => {
    if (!map.has(row.userName)) map.set(row.userName, map.size);
    return map;
  }, new Map());

  const effectiveIsLoading = isLoading || (isAdvanced && advancedIsLoading);
  const effectiveError = error ?? (isAdvanced ? advancedError : null);
  const hasNoData =
    !effectiveIsLoading && !effectiveError && (isAdvanced ? advancedRows.length === 0 : rows.length === 0);

  // Month label derived from the "from" date
  const monthLabel = new Date(from + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-subtle bg-surface-1 px-4 py-2">
        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            className="hover:bg-surface-3 flex size-6 items-center justify-center rounded text-secondary hover:text-primary"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-32 text-center text-13 font-medium text-primary">{monthLabel}</span>
          <button
            onClick={goToNextMonth}
            className="hover:bg-surface-3 flex size-6 items-center justify-center rounded text-secondary hover:text-primary"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
          {effectiveIsLoading && <Loader2 className="size-4 animate-spin text-secondary" />}
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded border border-subtle bg-surface-2 p-0.5">
            <button
              className={`flex items-center gap-1 rounded px-2 py-1 text-11 font-medium transition-colors ${
                !isAdvanced ? "bg-canvas text-primary shadow-raised-100" : "text-secondary hover:text-primary"
              }`}
              onClick={() => setIsAdvanced(false)}
            >
              <AlignJustify className="size-3" />
              Basic
            </button>
            <button
              className={`flex items-center gap-1 rounded px-2 py-1 text-11 font-medium transition-colors ${
                isAdvanced ? "bg-canvas text-primary shadow-raised-100" : "text-secondary hover:text-primary"
              }`}
              onClick={() => setIsAdvanced(true)}
            >
              <Columns3 className="size-3" />
              Advanced
            </button>
          </div>

          <Button
            variant="tertiary"
            size="sm"
            onClick={() => exportToCsv(rows, dates, from, to)}
            disabled={effectiveIsLoading || rows.length === 0}
          >
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {effectiveError && (
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-danger-subtle bg-danger-subtle px-4 py-2 text-11 text-danger-primary">
          {effectiveError}
        </div>
      )}

      {/* Scrollable table */}
      <div className="flex-1 overflow-auto">
        {hasNoData ? (
          <div className="flex h-full items-center justify-center text-13 text-secondary">
            No time entries found for {monthLabel}.
          </div>
        ) : (
          <table className="border-collapse">
            <colgroup>
              <col style={{ width: COL_USER }} />
              {!isAdvanced && <col style={{ width: COL_TOTAL }} />}
              {isAdvanced && (
                <>
                  <col style={{ width: COL_ISSUE }} />
                  <col style={{ width: COL_DATE }} />
                  <col style={{ width: COL_DATE }} />
                  <col style={{ width: COL_ESTIMATE }} />
                  <col style={{ width: COL_ESTIMATE }} />
                  <col style={{ width: COL_TOTAL_ADV }} />
                </>
              )}
              {dates.map((d) => (
                <col key={d} style={{ width: COL_DAY }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <StickyTh width={COL_USER} stickyLeft={0}>
                  User
                </StickyTh>
                {!isAdvanced && (
                  <StickyTh width={COL_TOTAL} stickyLeft={COL_USER} isLast align="right">
                    Total
                  </StickyTh>
                )}
                {isAdvanced && (
                  <>
                    <StickyTh width={COL_ISSUE} stickyLeft={ADV_LEFT_ISSUE}>
                      Issue
                    </StickyTh>
                    <StickyTh width={COL_DATE} stickyLeft={ADV_LEFT_START}>
                      Start
                    </StickyTh>
                    <StickyTh width={COL_DATE} stickyLeft={ADV_LEFT_END}>
                      End
                    </StickyTh>
                    <StickyTh width={COL_ESTIMATE} stickyLeft={ADV_LEFT_EST} align="right">
                      Est.
                    </StickyTh>
                    <StickyTh width={COL_ESTIMATE} stickyLeft={ADV_LEFT_ACT} align="right">
                      Actual
                    </StickyTh>
                    <StickyTh width={COL_TOTAL_ADV} stickyLeft={ADV_LEFT_TOTAL} isLast align="right">
                      Total
                    </StickyTh>
                  </>
                )}
                {dates.map((d) => (
                  <DayTh key={d} dateStr={d} />
                ))}
              </tr>
            </thead>
            <tbody>
              {isAdvanced
                ? advancedRows.map((row) => (
                    <AdvancedClockworkRow
                      key={`${row.userName}-${row.issueId}`}
                      row={row}
                      dates={dates}
                      groupEven={(advancedGroupMap.get(row.userName) ?? 0) % 2 === 0}
                      onCellClick={(date, userName) => setSelectedCell({ date, userName })}
                    />
                  ))
                : rows.map((row, idx) => (
                    <ClockworkRow
                      key={row.userName}
                      row={row}
                      dates={dates}
                      isEven={idx % 2 === 0}
                      onCellClick={(date, userName) => setSelectedCell({ date, userName })}
                    />
                  ))}
            </tbody>
          </table>
        )}
      </div>

      <ClockworkDetailModal
        isOpen={selectedCell !== null}
        onClose={() => setSelectedCell(null)}
        date={selectedCell?.date ?? ""}
        userName={selectedCell?.userName ?? ""}
      />
    </div>
  );
}
