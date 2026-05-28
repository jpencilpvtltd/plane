/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useEffect, useState } from "react";
import { clockworkService } from "@/services/clockwork.service";
import type { TClockworkExportListResponse, TClockworkAdvancedRow } from "./types";

/** Add two "HH:MM" strings and return "HH:MM" */
function addHHMM(a: string, b: string): string {
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  const total = ah * 60 + am + bh * 60 + bm;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * Transform the export-list API response into normalised table rows.
 * Each unique (userName, ticket_id) pair becomes one row; the `days` map
 * accumulates per-day worklogs and `total` is the cross-day sum.
 */
function transformExportList(response: TClockworkExportListResponse): TClockworkAdvancedRow[] {
  // userName → ticket_id → partial row (isFirstForUser set later)
  const userMap = new Map<string, Map<string, TClockworkAdvancedRow>>();

  for (const item of response.data) {
    for (const [userName, dateMap] of Object.entries(item)) {
      if (!userMap.has(userName)) userMap.set(userName, new Map());
      const ticketMap = userMap.get(userName)!;

      for (const [date, entries] of Object.entries(dateMap)) {
        for (const entry of entries) {
          const existing = ticketMap.get(entry.ticket_id);
          if (existing) {
            existing.days[date] = addHHMM(existing.days[date] ?? "00:00", entry.worklog);
            existing.total = addHHMM(existing.total, entry.worklog);
            if (!existing.estimated && entry.estimated_hours) {
              existing.estimated = entry.estimated_hours;
            }
            if (entry.actual_hours) {
              existing.actual = existing.actual ? addHHMM(existing.actual, entry.actual_hours) : entry.actual_hours;
            }
          } else {
            ticketMap.set(entry.ticket_id, {
              userName,
              issueId: entry.ticket_id,
              issueName: entry.ticket_name,
              estimated: entry.estimated_hours ?? undefined,
              actual: entry.actual_hours ?? undefined,
              total: entry.worklog,
              days: { [date]: entry.worklog },
              isFirstForUser: false, // resolved below
            });
          }
        }
      }
    }
  }

  const rows: TClockworkAdvancedRow[] = [];
  for (const ticketMap of userMap.values()) {
    let first = true;
    for (const row of ticketMap.values()) {
      row.isFirstForUser = first;
      first = false;
      rows.push(row);
    }
  }
  return rows;
}

type TReturn = {
  rows: TClockworkAdvancedRow[];
  isLoading: boolean;
  error: string | null;
};

export function useClockworkAdvanced(from: string, to: string, enabled: boolean): TReturn {
  const [rows, setRows] = useState<TClockworkAdvancedRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await clockworkService.getExportList(from, to);
      setRows(transformExportList(data));
    } catch {
      setError("Failed to load advanced data.");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [from, to, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { rows, isLoading, error };
}
