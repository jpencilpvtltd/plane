/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export type TClockworkUser = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type TClockworkRow = {
  id: string;
  user: TClockworkUser;
  task: string;
  startDay: number; // 1–30
  endDay: number; // 1–30
  estimatedHours: number;
};
