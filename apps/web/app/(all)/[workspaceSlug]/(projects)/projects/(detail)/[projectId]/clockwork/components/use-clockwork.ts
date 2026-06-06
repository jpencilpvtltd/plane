/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useEffect, useState } from "react";
import { clockworkService } from "@/services/clockwork.service";
import type { TClockworkApiResponse, TClockworkTableRow } from "./types";

// ── helpers ────────────────────────────────────────────────────────────────

/** Format using local date parts to avoid UTC-offset off-by-one errors. */
function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/** Returns every ISO date string between from and to (inclusive). */
export function buildDateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const cur = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  while (cur <= end) {
    dates.push(toIsoDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/** Transforms raw API response into flat table rows. */
function transformApiData(data: TClockworkApiResponse): TClockworkTableRow[] {
  // Ensure data is an array (handle cases where API response might be wrapped)
  const entries = Array.isArray(data) ? data : [];
  
  return entries.flatMap((entry) =>
    Object.entries(entry).map(([userName, userData]) => {
      const { total = "00:00", ...dayEntries } = userData;
      return { userName, total, days: dayEntries };
    })
  );
}

// ── hook ───────────────────────────────────────────────────────────────────

type TUseClockworkReturn = {
  rows: TClockworkTableRow[];
  dates: string[]; // ISO date strings for visible columns
  from: string;
  to: string;
  isLoading: boolean;
  error: string | null;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  setDateRange: (from: string, to: string) => void;
};

export function useClockwork(): TUseClockworkReturn {
  const now = new Date();
  const [from, setFrom] = useState(() => toIsoDate(startOfMonth(now)));
  const [to, setTo] = useState(() => toIsoDate(endOfMonth(now)));
  const [rows, setRows] = useState<TClockworkTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (fromDate: string, toDate: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clockworkService.getTimeEntries(fromDate, toDate);
      setRows(transformApiData(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clockwork data");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(from, to);
  }, [from, to, fetchData]);

  const goToPrevMonth = useCallback(() => {
    const d = new Date(from + "T00:00:00");
    d.setMonth(d.getMonth() - 1);
    setFrom(toIsoDate(startOfMonth(d)));
    setTo(toIsoDate(endOfMonth(d)));
  }, [from]);

  const goToNextMonth = useCallback(() => {
    const d = new Date(from + "T00:00:00");
    d.setMonth(d.getMonth() + 1);
    setFrom(toIsoDate(startOfMonth(d)));
    setTo(toIsoDate(endOfMonth(d)));
  }, [from]);

  const setDateRange = useCallback((newFrom: string, newTo: string) => {
    setFrom(newFrom);
    setTo(newTo);
  }, []);

  const dates = buildDateRange(from, to);

  return { rows, dates, from, to, isLoading, error, goToPrevMonth, goToNextMonth, setDateRange };
}
