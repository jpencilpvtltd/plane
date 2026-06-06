/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import axios from "axios";
import type {
  TClockworkExportListResponse,
  TClockworkApiResponse,
  TClockworkDetailResponse,
} from "@/app/(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/clockwork/components/types";

const CLOCKWORK_BASE_URL = process.env.VITE_CLOCKWORK_BASE_URL ?? "http://localhost:4001";

const clockworkAxios = axios.create({ baseURL: CLOCKWORK_BASE_URL });

export class ClockworkService {
  /**
   * Fetch time-tracking data for all members between two ISO dates (inclusive).
   * @param from  "YYYY-MM-DD"
   * @param to    "YYYY-MM-DD"
   */
  async getTimeEntries(from: string, to: string): Promise<TClockworkApiResponse> {
    const response = await clockworkAxios.get("/clockwork", {
      params: { from, to },
    });
    // Handle both direct array response and wrapped response
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data ?? []);
  }

  /**
   * Fetch per-issue time detail for all members on a single date.
   * @param date  "YYYY-MM-DD"
   */
  async getDetailEntries(date: string): Promise<TClockworkDetailResponse> {
    const response = await clockworkAxios.get<TClockworkDetailResponse>("/clockwork/detail", {
      params: { date },
    });
    return response.data;
  }

  /**
   * Fetch per-issue, per-day breakdown for all members (export-list API).
   * Fetches all pages up to limit=1000 in a single call.
   * @param from  "YYYY-MM-DD"
   * @param to    "YYYY-MM-DD"
   */
  async getExportList(from: string, to: string): Promise<TClockworkExportListResponse> {
    const response = await clockworkAxios.get<TClockworkExportListResponse>("/clockwork/export-list", {
      params: { from, to, page: 1, limit: 100 },
    });
    return response.data;
  }
}

export const clockworkService = new ClockworkService();
