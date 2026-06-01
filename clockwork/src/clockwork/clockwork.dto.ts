import { ApiProperty } from "@nestjs/swagger";

export class IssueDurationDto {
  @ApiProperty({ example: "a1b2c3d4-...", description: "Issue UUID" })
  id: string;

  @ApiProperty({ example: "Fix login bug", description: "Issue name" })
  name: string;

  @ApiProperty({ example: "02:30", description: "Time spent in HH:MM format" })
  duration: string;
}

export class UserDetailDto {
  @ApiProperty({ example: "Alice Smith", description: "Full name of the user" })
  user: string;

  @ApiProperty({
    type: [IssueDurationDto],
    description: "Issues worked on that day",
  })
  issues: IssueDurationDto[];
}

export class UserSummaryDto {
  @ApiProperty({
    description: 'Map of date → duration (HH:MM) plus a "total" key',
    example: {
      "2026-05-01": "02:30",
      "2026-05-02": "01:15",
      total: "03:45",
    },
    additionalProperties: { type: "string" },
  })
  dates: Record<string, string>;
}

// ── Export List ──────────────────────────────────────────────────────────────

export class ExportWorklogEntryDto {
  @ApiProperty({ example: "03:12", description: "Time worked (HH:MM)" })
  worklog: string;

  @ApiProperty({ example: "a1b2c3d4-...", description: "Issue UUID" })
  ticket_id: string;

  @ApiProperty({ example: "Fix login bug", description: "Issue title" })
  ticket_name: string;

  @ApiProperty({
    example: null,
    nullable: true,
    description: "Estimated hours — null until estimate data is available",
  })
  estimated_hours: string | null;

  @ApiProperty({ example: "03:12", description: "Actual hours worked (HH:MM)" })
  actual_hours: string;

  @ApiProperty({
    example: false,
    description: "True when actual_hours exceeds estimated_hours",
  })
  over_due: boolean;

  @ApiProperty({
    example: null,
    nullable: true,
    description: "Remaining hours (estimated − actual) — null until estimates available",
  })
  remaining: string | null;
}

export class ExportListMetaDto {
  @ApiProperty({
    example: 5,
    description: "Total number of matching employees",
  })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class ExportListResponseDto {
  @ApiProperty({
    type: [Object],
    description: "Array of objects keyed by employee name, each containing a map of date → worklog entries",
    example: [
      {
        "Murali s": {
          "2026-05-25": [
            {
              worklog: "00:08",
              ticket_id: "uuid",
              ticket_name: "Create Projects",
              estimated_hours: null,
              actual_hours: "00:08",
              over_due: false,
              remaining: null,
            },
          ],
        },
      },
    ],
  })
  data: Record<string, Record<string, ExportWorklogEntryDto[]>>[];

  @ApiProperty({ type: ExportListMetaDto })
  meta: ExportListMetaDto;
}
