/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// --- Legacy types (kept for reference) ---
export type TClockworkUser = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type TClockworkRow = {
  id: string;
  user: TClockworkUser;
  task: string;
  startDay: number;
  endDay: number;
  estimatedHours: number;
};

// --- API response types ---
/** Per-user data: keys are ISO date strings ("2026-05-01") plus "total", values are "HH:MM" */
export type TClockworkUserData = Record<string, string>;

/** Each element in the API array: { "User Name": TClockworkUserData } */
export type TClockworkApiEntry = Record<string, TClockworkUserData>;

export type TClockworkApiResponse = TClockworkApiEntry[];

// --- Normalized table row ---
export type TClockworkTableRow = {
  userName: string;
  total: string; // "HH:MM"
  days: Record<string, string>; // { "2026-05-01": "00:08", ... }
};

// --- Detail modal types ---
export type TClockworkDetailIssue = {
  id: string;
  name: string;
  duration: string; // "HH:MM"
  estimated?: string; // "HH:MM" — future field
  actual?: string; // "HH:MM" — future field
};

export type TClockworkDetailUser = {
  user: string;
  issues: TClockworkDetailIssue[];
};

export type TClockworkDetailResponse = TClockworkDetailUser[];

// --- Advanced table (export-list API) types ---
export type TClockworkExportListEntry = {
  worklog: string;
  ticket_id: string;
  ticket_name: string;
  estimated_hours: string | null;
  actual_hours: string | null;
  over_due: boolean;
  remaining: string | null;
};

/** { "YYYY-MM-DD": TClockworkExportListEntry[] } */
export type TClockworkExportListDateMap = Record<string, TClockworkExportListEntry[]>;

/** { "User Name": TClockworkExportListDateMap } */
export type TClockworkExportListDataItem = Record<string, TClockworkExportListDateMap>;

export type TClockworkExportListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type TClockworkExportListResponse = {
  data: TClockworkExportListDataItem[];
  meta: TClockworkExportListMeta;
};

export type TClockworkAdvancedRow = {
  userName: string;
  issueId: string;
  issueName: string;
  startDate?: string; // not provided by this API — will display "—"
  endDate?: string; // not provided by this API — will display "—"
  estimated?: string;
  actual?: string;
  total: string;
  days: Record<string, string>;
  isFirstForUser: boolean;
};
