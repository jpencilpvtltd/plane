/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// components
import { PageHead } from "@/components/core/page-title";
import { ClockworkTable } from "./table";

type TClockworkRootProps = {
  pageTitle: string;
};

export function ClockworkRoot({ pageTitle }: TClockworkRootProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <PageHead title={pageTitle} />
      <ClockworkTable />
    </div>
  );
}
