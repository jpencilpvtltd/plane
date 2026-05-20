/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
// hooks
import { useProject } from "@/hooks/store/use-project";
// local imports
import { ClockworkRoot } from "./components/root";
import type { Route } from "./+types/page";

function ProjectClockworkPage({ params: _ }: Route.ComponentProps) {
  // plane hooks
  const { t } = useTranslation();
  // hooks
  const { currentProjectDetails } = useProject();
  // derived values
  const pageTitle = currentProjectDetails?.name
    ? `${currentProjectDetails.name} - ${t("sidebar.clockwork")}`
    : t("sidebar.clockwork");

  return <ClockworkRoot pageTitle={pageTitle} />;
}

export default observer(ProjectClockworkPage);
