/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TClockworkRow } from "./types";

export const CLOCKWORK_MOCK_DATA: TClockworkRow[] = [
  {
    id: "1",
    user: { id: "u1", name: "Alice Chen" },
    task: "Design system audit",
    startDay: 1,
    endDay: 5,
    estimatedHours: 20,
  },
  {
    id: "2",
    user: { id: "u2", name: "Bob Martinez" },
    task: "API integration for payments",
    startDay: 3,
    endDay: 10,
    estimatedHours: 40,
  },
  {
    id: "3",
    user: { id: "u3", name: "Carol Singh" },
    task: "Onboarding flow redesign",
    startDay: 6,
    endDay: 12,
    estimatedHours: 32,
  },
  {
    id: "4",
    user: { id: "u1", name: "Alice Chen" },
    task: "Component library migration",
    startDay: 8,
    endDay: 18,
    estimatedHours: 56,
  },
  {
    id: "5",
    user: { id: "u4", name: "David Kim" },
    task: "Performance profiling & fixes",
    startDay: 10,
    endDay: 15,
    estimatedHours: 24,
  },
  {
    id: "6",
    user: { id: "u2", name: "Bob Martinez" },
    task: "CI/CD pipeline refactor",
    startDay: 12,
    endDay: 20,
    estimatedHours: 48,
  },
  {
    id: "7",
    user: { id: "u5", name: "Eva Rossi" },
    task: "Accessibility audit",
    startDay: 15,
    endDay: 22,
    estimatedHours: 36,
  },
  {
    id: "8",
    user: { id: "u3", name: "Carol Singh" },
    task: "Search indexing service",
    startDay: 18,
    endDay: 25,
    estimatedHours: 44,
  },
  {
    id: "9",
    user: { id: "u4", name: "David Kim" },
    task: "Mobile responsive fixes",
    startDay: 20,
    endDay: 28,
    estimatedHours: 40,
  },
  {
    id: "10",
    user: { id: "u5", name: "Eva Rossi" },
    task: "Release notes & documentation",
    startDay: 25,
    endDay: 30,
    estimatedHours: 20,
  },
];

export const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
