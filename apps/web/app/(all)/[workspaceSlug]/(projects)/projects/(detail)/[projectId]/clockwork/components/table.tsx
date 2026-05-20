/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Download } from "lucide-react";
import { Button } from "@plane/propel/button";
import { CLOCKWORK_MOCK_DATA, DAYS } from "./mock-data";
import type { TClockworkRow } from "./types";

// Reference: Day 1 = May 1 2026
const BASE_DATE = new Date(2026, 4, 1);

function getDayOfWeek(day: number): string {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() + day - 1);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function exportToCsv() {
  const header = ["User", "Task", "Start Day", "End Day", "Est. Hours"];
  const rows = CLOCKWORK_MOCK_DATA.map((r) => [
    r.user.name,
    `"${r.task.replace(/"/g, '""')}"`,
    r.startDay,
    r.endDay,
    r.estimatedHours,
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "clockwork.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// Column widths (px) — must match sticky left offsets below
const COL_USER = 160;
const COL_TASK = 200;
const COL_START = 120;
const COL_END = 120;
const COL_EST = 100;
const COL_DAY = 52;

const LEFT_COLS_WIDTH = COL_USER + COL_TASK + COL_START + COL_END + COL_EST;

// User-color mapping for avatar fallback circles
const USER_COLORS: Record<string, string> = {
  u1: "bg-red-400",
  u2: "bg-blue-400",
  u3: "bg-green-400",
  u4: "bg-amber-400",
  u5: "bg-purple-400",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDay(day: number) {
  return String(day).padStart(2, "0");
}

type THeaderCellProps = {
  children: React.ReactNode;
  width: number;
  stickyLeft?: number;
  isLast?: boolean;
};

function StickyTh({ children, width, stickyLeft, isLast }: THeaderCellProps) {
  return (
    <th
      style={{ width, minWidth: width, left: stickyLeft }}
      className={`sticky top-0 z-20 border-r border-b border-subtle bg-surface-2 px-3 py-2 text-left text-11 font-medium text-secondary ${
        isLast ? "shadow-[2px_0_4px_0_rgba(0,0,0,0.06)]" : ""
      }`}
    >
      {children}
    </th>
  );
}

function DayTh({ day }: { day: number }) {
  const weekday = getDayOfWeek(day);
  const isWeekend = weekday === "Sat" || weekday === "Sun";
  return (
    <th
      style={{ width: COL_DAY, minWidth: COL_DAY }}
      className={`sticky top-0 z-10 border-r border-b border-subtle bg-surface-2 px-1 py-1.5 text-center ${
        isWeekend ? "bg-surface-3" : ""
      }`}
    >
      <div className="text-11 font-medium text-secondary">{formatDay(day)}</div>
      <div className={`font-normal text-[9px] ${isWeekend ? "text-red-400" : "text-tertiary"}`}>{weekday}</div>
    </th>
  );
}

type TRowProps = { row: TClockworkRow; isEven: boolean };

function ClockworkRow({ row, isEven }: TRowProps) {
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
            className={`flex size-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white ${
              USER_COLORS[row.user.id] ?? "bg-gray-400"
            }`}
          >
            {getInitials(row.user.name)}
          </span>
          <span className="truncate text-11 font-medium text-primary">{row.user.name}</span>
        </div>
      </td>

      {/* Task */}
      <td
        style={{ width: COL_TASK, minWidth: COL_TASK, left: COL_USER }}
        className={`sticky z-10 border-r border-b border-subtle px-3 py-1.5 ${rowBg}`}
      >
        <span className="line-clamp-1 text-11 text-primary">{row.task}</span>
      </td>

      {/* Start Date */}
      <td
        style={{
          width: COL_START,
          minWidth: COL_START,
          left: COL_USER + COL_TASK,
        }}
        className={`sticky z-10 border-r border-b border-subtle px-3 py-1.5 ${rowBg}`}
      >
        <span className="text-11 text-secondary">Day {row.startDay}</span>
      </td>

      {/* End Date */}
      <td
        style={{
          width: COL_END,
          minWidth: COL_END,
          left: COL_USER + COL_TASK + COL_START,
        }}
        className={`sticky z-10 border-r border-b border-subtle px-3 py-1.5 ${rowBg}`}
      >
        <span className="text-11 text-secondary">Day {row.endDay}</span>
      </td>

      {/* Estimated Hours */}
      <td
        style={{
          width: COL_EST,
          minWidth: COL_EST,
          left: COL_USER + COL_TASK + COL_START + COL_END,
        }}
        className={`sticky z-10 border-r border-b border-subtle px-3 py-1.5 text-right shadow-[2px_0_4px_0_rgba(0,0,0,0.06)] ${rowBg}`}
      >
        <span className="text-11 text-secondary">{row.estimatedHours}h</span>
      </td>

      {/* Day cells 1–30 */}
      {DAYS.map((day) => {
        const isActive = day >= row.startDay && day <= row.endDay;
        const isStart = day === row.startDay;
        const isEnd = day === row.endDay;
        return (
          <td
            key={day}
            style={{ width: COL_DAY, minWidth: COL_DAY }}
            className={`border-r border-b border-subtle px-0.5 py-1.5 ${rowBg}`}
          >
            {isActive && (
              <div
                className={`h-5 bg-accent-primary/20 ${
                  isStart && isEnd ? "mx-0.5 rounded" : isStart ? "ml-0.5 rounded-l" : isEnd ? "mr-0.5 rounded-r" : ""
                }`}
              />
            )}
          </td>
        );
      })}
    </tr>
  );
}

export function ClockworkTable() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-shrink-0 items-center justify-end border-b border-subtle bg-surface-1 px-4 py-2">
        <Button variant="tertiary" size="sm" onClick={exportToCsv}>
          <Download className="size-3.5" />
          Export
        </Button>
      </div>

      {/* Column group legend */}
      <div
        className="flex flex-shrink-0 items-center gap-2 border-b border-subtle bg-surface-1 px-4 py-1.5 text-11 text-secondary"
        style={{ paddingLeft: LEFT_COLS_WIDTH + 16 }}
      >
        <span className="inline-block size-3 rounded-sm bg-accent-primary/20" />
        <span>Scheduled days</span>
      </div>

      {/* Scrollable table */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse">
          <colgroup>
            <col style={{ width: COL_USER }} />
            <col style={{ width: COL_TASK }} />
            <col style={{ width: COL_START }} />
            <col style={{ width: COL_END }} />
            <col style={{ width: COL_EST }} />
            {DAYS.map((d) => (
              <col key={d} style={{ width: COL_DAY }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <StickyTh width={COL_USER} stickyLeft={0}>
                User
              </StickyTh>
              <StickyTh width={COL_TASK} stickyLeft={COL_USER}>
                Task
              </StickyTh>
              <StickyTh width={COL_START} stickyLeft={COL_USER + COL_TASK}>
                Start Date
              </StickyTh>
              <StickyTh width={COL_END} stickyLeft={COL_USER + COL_TASK + COL_START}>
                End Date
              </StickyTh>
              <StickyTh width={COL_EST} stickyLeft={COL_USER + COL_TASK + COL_START + COL_END} isLast>
                Est. Hours
              </StickyTh>
              {DAYS.map((day) => (
                <DayTh key={day} day={day} />
              ))}
            </tr>
          </thead>
          <tbody>
            {CLOCKWORK_MOCK_DATA.map((row, idx) => (
              <ClockworkRow key={row.id} row={row} isEven={idx % 2 === 0} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
