/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React, { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Loader2, Clock } from "lucide-react";
import { clockworkService } from "@/services/clockwork.service";
import type { TClockworkDetailResponse } from "./types";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  date: string; // "YYYY-MM-DD"
  userName: string;
};

/** "HH:MM" strings → total minutes */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Total minutes → "HH:MM" */
function fromMinutes(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function ClockworkDetailModal({ isOpen, onClose, date, userName }: TProps) {
  const [data, setData] = useState<TClockworkDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !date) return;
    setIsLoading(true);
    setError(null);
    setData(null);
    clockworkService
      .getDetailEntries(date)
      .then(setData)
      .catch(() => setError("Failed to load time details. Please try again."))
      .finally(() => setIsLoading(false));
  }, [isOpen, date]);

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const userEntry = data?.find((u) => u.user === userName);

  const totalLogged = fromMinutes(userEntry?.issues.reduce((acc, issue) => acc + toMinutes(issue.duration), 0) ?? 0);
  const totalEstimated = userEntry?.issues.some((i) => i.estimated)
    ? fromMinutes(userEntry.issues.reduce((acc, issue) => acc + toMinutes(issue.estimated ?? "00:00"), 0))
    : null;
  const totalActual = userEntry?.issues.some((i) => i.actual)
    ? fromMinutes(userEntry.issues.reduce((acc, issue) => acc + toMinutes(issue.actual ?? "00:00"), 0))
    : null;

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-backdrop" />
        </Transition.Child>

        {/* Panel */}
        <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-150"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="flex max-h-[80vh] w-full max-w-xl flex-col rounded-lg border border-subtle bg-surface-1 shadow-overlay-200">
              {/* ── Header ── */}
              <div className="flex flex-shrink-0 items-start justify-between border-b border-subtle px-5 py-4">
                <div className="min-w-0">
                  <Dialog.Title className="text-15 truncate font-semibold text-primary">{userName}</Dialog.Title>
                  <p className="mt-0.5 text-12 text-secondary">{formattedDate}</p>
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 flex size-6 flex-shrink-0 items-center justify-center rounded text-tertiary hover:bg-layer-1-hover hover:text-secondary"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* ── Body ── */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {/* Loading */}
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-5 animate-spin text-secondary" />
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-center justify-center py-12 text-13 text-danger-primary">{error}</div>
                )}

                {/* Empty */}
                {!isLoading && !error && data && !userEntry && (
                  <div className="flex items-center justify-center py-12 text-13 text-secondary">
                    No time entries found for this day.
                  </div>
                )}

                {/* Issue table */}
                {!isLoading && !error && userEntry && (
                  <div className="w-full">
                    {/* Column headers */}
                    <div className="mb-1 grid grid-cols-[1fr_80px_80px_80px] items-center gap-x-3 border-b border-subtle px-2 pb-2">
                      <span className="text-11 font-medium text-secondary">Issue</span>
                      <span className="text-right text-11 font-medium text-secondary">Logged</span>
                      <span className="text-right text-11 font-medium text-secondary">Estimated</span>
                      <span className="text-right text-11 font-medium text-secondary">Actual</span>
                    </div>

                    {/* Rows */}
                    <div className="space-y-0.5">
                      {userEntry.issues.map((issue) => (
                        <div
                          key={issue.id}
                          className="grid grid-cols-[1fr_80px_80px_80px] items-center gap-x-3 rounded px-2 py-2 hover:bg-layer-1-hover"
                        >
                          {/* Issue name */}
                          <div className="flex min-w-0 items-center gap-2">
                            <Clock className="size-3.5 flex-shrink-0 text-icon-accent-primary" />
                            <span className="truncate text-12 text-primary">{issue.name}</span>
                          </div>

                          {/* Logged */}
                          <span className="text-right text-12 font-medium text-accent-primary tabular-nums">
                            {issue.duration}
                          </span>

                          {/* Estimated */}
                          <span className="text-right text-12 text-tertiary tabular-nums">
                            {issue.estimated ?? "—"}
                          </span>

                          {/* Actual */}
                          <span className="text-right text-12 text-tertiary tabular-nums">{issue.actual ?? "—"}</span>
                        </div>
                      ))}
                    </div>

                    {/* Totals row */}
                    <div className="mt-2 grid grid-cols-[1fr_80px_80px_80px] items-center gap-x-3 border-t border-subtle px-2 pt-2">
                      <span className="text-12 font-semibold text-primary">Total</span>
                      <span className="text-right text-12 font-semibold text-accent-primary tabular-nums">
                        {totalLogged}
                      </span>
                      <span className="text-right text-12 font-semibold text-secondary tabular-nums">
                        {totalEstimated ?? "—"}
                      </span>
                      <span className="text-right text-12 font-semibold text-secondary tabular-nums">
                        {totalActual ?? "—"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
