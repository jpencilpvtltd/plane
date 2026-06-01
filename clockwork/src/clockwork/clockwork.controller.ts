import { Controller, Get, Query, BadRequestException } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ClockworkService } from "./clockwork.service.js";
import { UserDetailDto, UserSummaryDto, ExportListResponseDto } from "./clockwork.dto.js";

@ApiTags("Clockwork")
@Controller("clockwork")
export class ClockworkController {
  constructor(private readonly clockworkService: ClockworkService) {}

  @Get()
  @ApiOperation({
    summary: "Get time summary per user",
    description:
      "Returns total active time (In Progress) per user broken down by calendar day (UTC) for the given date range.",
  })
  @ApiQuery({
    name: "from",
    required: true,
    example: "2026-05-01",
    description: "Range start date (ISO 8601)",
  })
  @ApiQuery({
    name: "to",
    required: true,
    example: "2026-05-31",
    description: "Range end date (ISO 8601)",
  })
  @ApiResponse({
    status: 200,
    description: "Array of objects keyed by user name, each containing daily durations and a total.",
    type: [UserSummaryDto],
  })
  @ApiResponse({
    status: 400,
    description: "Missing or invalid query parameters.",
  })
  async get(@Query("from") from: string, @Query("to") to: string) {
    if (!from || !to) {
      throw new BadRequestException('Query params "from" and "to" are required (ISO 8601)');
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('"from" and "to" must be valid ISO 8601 dates');
    }

    if (fromDate > toDate) {
      throw new BadRequestException('"from" must be before "to"');
    }

    return this.clockworkService.get({ from: fromDate, to: toDate });
  }

  @Get("detail")
  @ApiOperation({
    summary: "Get per-issue time detail for a single day",
    description: "Returns each user's worked issues and time spent on a specific day (UTC).",
  })
  @ApiQuery({
    name: "date",
    required: true,
    example: "2026-05-20",
    description: "The day to query (YYYY-MM-DD)",
  })
  @ApiResponse({
    status: 200,
    description: "Array of users with their issues and durations for that day.",
    type: [UserDetailDto],
  })
  @ApiResponse({
    status: 400,
    description: "Missing or invalid date parameter.",
  })
  async getDetail(@Query("date") date: string) {
    if (!date) {
      throw new BadRequestException('Query param "date" is required (YYYY-MM-DD)');
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new BadRequestException('"date" must be a valid date (YYYY-MM-DD)');
    }

    return this.clockworkService.getDetail({ date: dateObj });
  }

  @Get("export-list")
  @ApiOperation({
    summary: "Export worklog data grouped by employee and date",
    description:
      "Returns time-tracking data grouped by employee → date → issues. " +
      "Optimised for report exports (Excel / PDF / CSV). Paginates over employees.",
  })
  @ApiQuery({
    name: "from",
    required: true,
    example: "2026-05-01",
    description: "Range start (YYYY-MM-DD)",
  })
  @ApiQuery({
    name: "to",
    required: true,
    example: "2026-05-31",
    description: "Range end (YYYY-MM-DD)",
  })
  @ApiQuery({
    name: "employee",
    required: false,
    example: "Murali",
    description: "Filter by employee name (partial, case-insensitive)",
  })
  @ApiQuery({
    name: "project",
    required: false,
    example: "uuid",
    description: "Filter by project UUID",
  })
  @ApiQuery({
    name: "status",
    required: false,
    example: "In Progress",
    description: "Filter by current issue state name (case-insensitive)",
  })
  @ApiQuery({
    name: "page",
    required: false,
    example: 1,
    description: "Page number (default 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    example: 20,
    description: "Employees per page, max 100 (default 20)",
  })
  @ApiResponse({
    status: 200,
    description: "Paginated worklog export grouped by employee and date.",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    type: ExportListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Missing or invalid query parameters.",
  })
  async getExportList(
    @Query("from") from: string,
    @Query("to") to: string,
    @Query("employee") employee?: string,
    @Query("project") project?: string,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    if (!from || !to) {
      throw new BadRequestException('Query params "from" and "to" are required (YYYY-MM-DD)');
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('"from" and "to" must be valid dates (YYYY-MM-DD)');
    }

    if (fromDate > toDate) {
      throw new BadRequestException('"from" must be before "to"');
    }

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    if (isNaN(pageNum) || pageNum < 1) {
      throw new BadRequestException('"page" must be a positive integer');
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('"limit" must be between 1 and 100');
    }

    return this.clockworkService.getExportList({
      from: fromDate,
      to: toDate,
      employee: employee || undefined,
      project: project || undefined,
      status: status || undefined,
      page: pageNum,
      limit: limitNum,
    });
  }
}
