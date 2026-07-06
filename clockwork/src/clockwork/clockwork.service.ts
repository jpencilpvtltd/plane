import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const ACTIVE_STATES = new Set(['in progress', 'qa in progress']);

interface RawActivity {
  created_at: Date;
  issue_id: string | null;
  new_value: string | null;
  old_value: string | null;
  users_issue_activities_actor_idTousers: {
    first_name: string;
    last_name: string;
  } | null;
  issues: { created_at: Date } | null;
}

interface RawActivityWithIssue extends RawActivity {
  issues: { name: string; created_at: Date } | null;
}

@Injectable()
export class ClockworkService {
  constructor(private readonly prisma: PrismaService) {}

  private formatDuration(ms: number): string {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  private distributeMs(
    dateMs: Map<string, number>,
    allDatesSet: Set<string>,
    start: Date,
    end: Date,
  ) {
    let cursor = new Date(start);
    while (cursor < end) {
      const dateKey = cursor.toISOString().split('T')[0];
      const endOfDay = new Date(dateKey + 'T23:59:59.999Z');
      const segEnd = end <= endOfDay ? end : endOfDay;
      const ms = segEnd.getTime() - cursor.getTime();
      if (allDatesSet.has(dateKey)) {
        dateMs.set(dateKey, (dateMs.get(dateKey) ?? 0) + ms);
      }
      cursor = new Date(endOfDay.getTime() + 1);
    }
  }

  async get({ from, to }: { from: Date; to: Date }) {
    // Build all dates in range
    const allDates: string[] = [];
    const d = new Date(from);
    while (d <= to) {
      allDates.push(d.toISOString().split('T')[0]);
      d.setUTCDate(d.getUTCDate() + 1);
    }
    const allDatesSet = new Set(allDates);

    // Fetch all state-change activities in range, joining actor
    const records = (await this.prisma.issue_activities.findMany({
      where: {
        field: 'state',
        created_at: { gte: from, lte: to },
        actor_id: { not: null },
        issue_id: { not: null },
      },
      include: {
        users_issue_activities_actor_idTousers: {
          select: { first_name: true, last_name: true },
        },
        issues: { select: { created_at: true } },
      },
      orderBy: { created_at: 'asc' },
    })) as RawActivity[];

    type NormRecord = {
      user_name: string;
      issue_id: string;
      new_state: string;
      old_state: string;
      timestamp: Date;
      issue_created_at: Date | null;
    };

    const normalized: NormRecord[] = records
      .filter(
        (r) =>
          r.users_issue_activities_actor_idTousers !== null &&
          r.issue_id !== null,
      )
      .map((r) => ({
        user_name: `${r.users_issue_activities_actor_idTousers!.first_name} ${r.users_issue_activities_actor_idTousers!.last_name}`,
        issue_id: r.issue_id!,
        new_state: (r.new_value ?? '').toLowerCase(),
        old_state: (r.old_value ?? '').toLowerCase(),
        timestamp: r.created_at,
        issue_created_at: r.issues?.created_at ?? null,
      }));

    // Build timelines: Map<user_name, Map<issue_id, NormRecord[]>>
    const timelines = new Map<string, Map<string, NormRecord[]>>();
    for (const rec of normalized) {
      if (!timelines.has(rec.user_name))
        timelines.set(rec.user_name, new Map());
      const issueMap = timelines.get(rec.user_name)!;
      if (!issueMap.has(rec.issue_id)) issueMap.set(rec.issue_id, []);
      issueMap.get(rec.issue_id)!.push(rec);
    }

    // Compute active-state duration per user per date
    const userDateMs = new Map<string, Map<string, number>>();

    for (const [username, issues] of timelines) {
      const dateMs = new Map(allDates.map((dt) => [dt, 0]));
      userDateMs.set(username, dateMs);

      for (const issueRecords of issues.values()) {
        // If the issue was already active before `from`, synthesize a virtual
        // start event using the first record's old_value — avoids an extra DB query.
        const first = issueRecords[0];
        if (ACTIVE_STATES.has(first.old_state)) {
          // Bound the synthetic start by when the issue was actually created.
          // An issue cannot have been in progress before it existed.
          const syntheticStart =
            first.issue_created_at && first.issue_created_at > from
              ? first.issue_created_at
              : from;
          issueRecords.unshift({
            ...first,
            new_state: first.old_state,
            timestamp: syntheticStart,
          });
        }

        for (let i = 0; i < issueRecords.length; i++) {
          const curr = issueRecords[i];
          if (!ACTIVE_STATES.has(curr.new_state)) continue;

          // Open session with no closing record — skip
          if (i + 1 >= issueRecords.length) continue;

          const activeStart = curr.timestamp < from ? from : curr.timestamp;
          const activeEnd = issueRecords[i + 1].timestamp;
          const clippedEnd = activeEnd > to ? to : activeEnd;

          if (activeStart < clippedEnd) {
            this.distributeMs(dateMs, allDatesSet, activeStart, clippedEnd);
          }
        }
      }
    }

    // Format result
    return Array.from(userDateMs.entries()).map(([username, dateMs]) => {
      const totalMs = Array.from(dateMs.values()).reduce(
        (sum, ms) => sum + ms,
        0,
      );
      return {
        [username]: {
          ...Object.fromEntries(
            Array.from(dateMs.entries()).map(([date, ms]) => [
              date,
              this.formatDuration(ms),
            ]),
          ),
          total: this.formatDuration(totalMs),
        },
      };
    });
  }

  async getDetail({ date }: { date: Date }) {
    const from = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const to = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    // Fetch state-change activities for the day, joining actor and issue name
    const records = (await this.prisma.issue_activities.findMany({
      where: {
        field: 'state',
        created_at: { gte: from, lte: to },
        actor_id: { not: null },
        issue_id: { not: null },
      },
      include: {
        users_issue_activities_actor_idTousers: {
          select: { first_name: true, last_name: true },
        },
        issues: { select: { name: true, created_at: true } },
      },
      orderBy: { created_at: 'asc' },
    })) as RawActivityWithIssue[];

    type NormRecord = {
      user_name: string;
      issue_id: string;
      issue_name: string;
      new_state: string;
      old_state: string;
      timestamp: Date;
      issue_created_at: Date | null;
    };

    const normalized: NormRecord[] = records
      .filter((r) => r.users_issue_activities_actor_idTousers && r.issues)
      .map((r) => ({
        user_name: `${r.users_issue_activities_actor_idTousers!.first_name} ${r.users_issue_activities_actor_idTousers!.last_name}`,
        issue_id: r.issue_id!,
        issue_name: r.issues!.name,
        new_state: (r.new_value ?? '').toLowerCase(),
        old_state: (r.old_value ?? '').toLowerCase(),
        timestamp: r.created_at,
        issue_created_at: r.issues?.created_at ?? null,
      }));

    // Fetch the latest preceding record per (user, issue) to detect pre-day active sessions
    const issueIds = [...new Set(normalized.map((r) => r.issue_id))];
    const actorPairSet = new Set(
      normalized.map((r) => `${r.user_name}\x00${r.issue_id}`),
    );

    const precedingAll = issueIds.length
      ? ((await this.prisma.issue_activities.findMany({
          where: {
            field: 'state',
            issue_id: { in: issueIds },
            created_at: { lt: from },
          },
          include: {
            users_issue_activities_actor_idTousers: {
              select: { first_name: true, last_name: true },
            },
            issues: { select: { name: true, created_at: true } },
          },
          orderBy: { created_at: 'desc' },
        })) as RawActivityWithIssue[])
      : [];

    const seenPairs = new Set<string>();
    const preceding: NormRecord[] = precedingAll
      .filter((r) => {
        if (!r.users_issue_activities_actor_idTousers || !r.issues)
          return false;
        const uname = `${r.users_issue_activities_actor_idTousers.first_name} ${r.users_issue_activities_actor_idTousers.last_name}`;
        const key = `${uname}\x00${r.issue_id}`;
        if (!actorPairSet.has(key) || seenPairs.has(key)) return false;
        seenPairs.add(key);
        return true;
      })
      .map((r) => ({
        user_name: `${r.users_issue_activities_actor_idTousers!.first_name} ${r.users_issue_activities_actor_idTousers!.last_name}`,
        issue_id: r.issue_id!,
        issue_name: r.issues!.name,
        new_state: (r.new_value ?? '').toLowerCase(),
        old_state: (r.old_value ?? '').toLowerCase(),
        timestamp: r.created_at,
        issue_created_at: r.issues?.created_at ?? null,
      }));

    // Build timelines: Map<user_name, Map<issue_id, NormRecord[]>>
    const issueMeta = new Map<string, string>(); // issue_id → issue_name
    const timelines = new Map<string, Map<string, NormRecord[]>>();
    const addRec = (rec: NormRecord) => {
      issueMeta.set(rec.issue_id, rec.issue_name);
      if (!timelines.has(rec.user_name))
        timelines.set(rec.user_name, new Map());
      const issueMap = timelines.get(rec.user_name)!;
      if (!issueMap.has(rec.issue_id)) issueMap.set(rec.issue_id, []);
      issueMap.get(rec.issue_id)!.push(rec);
    };
    for (const rec of preceding) addRec(rec);
    for (const rec of normalized) addRec(rec);

    // Compute active ms per user per issue for the day
    const result: Array<{
      user: string;
      issues: Array<{ id: string; name: string; duration: string }>;
    }> = [];

    for (const [username, issues] of timelines) {
      const issueRows: Array<{ id: string; name: string; duration: string }> =
        [];

      for (const [issueId, issueRecords] of issues) {
        issueRecords.sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
        );

        // Prepend synthetic start if the preceding record shows the issue was active at day start
        const first = issueRecords[0];
        if (first.timestamp < from && ACTIVE_STATES.has(first.new_state)) {
          issueRecords.unshift({ ...first, timestamp: from });
        } else if (
          first.timestamp >= from &&
          ACTIVE_STATES.has(first.old_state)
        ) {
          const syntheticStart =
            first.issue_created_at && first.issue_created_at > from
              ? first.issue_created_at
              : from;
          issueRecords.unshift({
            ...first,
            new_state: first.old_state,
            timestamp: syntheticStart,
          });
        }

        let issueMs = 0;
        for (let i = 0; i < issueRecords.length; i++) {
          const curr = issueRecords[i];
          if (!ACTIVE_STATES.has(curr.new_state)) continue;
          if (i + 1 >= issueRecords.length) continue;

          const activeStart = curr.timestamp < from ? from : curr.timestamp;
          const activeEnd =
            issueRecords[i + 1].timestamp > to
              ? to
              : issueRecords[i + 1].timestamp;

          if (activeStart < activeEnd) {
            issueMs += activeEnd.getTime() - activeStart.getTime();
          }
        }

        if (issueMs > 0) {
          issueRows.push({
            id: issueId,
            name: issueMeta.get(issueId)!,
            duration: this.formatDuration(issueMs),
          });
        }
      }

      if (issueRows.length > 0) {
        result.push({ user: username, issues: issueRows });
      }
    }

    // --- Carryover sessions (two cases) ---
    // Issues that were "in progress" at the start of the day but have NO state
    // changes on this day are invisible to the day-activity path above.
    // We handle two sub-cases:
    //
    // Case A: the (issue, actor) has at least one state activity BEFORE `from`.
    //   → The most-recent pre-day activity determines the state. Use DISTINCT ON
    //     ordered DESC to get it.
    //
    // Case B: the (issue, actor) has NO state activity before `from` at all.
    //   → The FIRST-EVER activity's `old_value` tells us the state that existed
    //     before any recorded history. If that is "in progress" the issue was
    //     active all day (mirrors the list API's first.old_state heuristic).

    type CarryoverRow = {
      issue_id: string;
      state_value: string; // new_value (Case A) or old_value (Case B)
      first_name: string;
      last_name: string;
      issue_name: string;
    };

    // Case A – last state change before the day
    const caseARaw = await this.prisma.$queryRaw<CarryoverRow[]>`
      SELECT DISTINCT ON (ia.issue_id, ia.actor_id)
        ia.issue_id::text  AS issue_id,
        ia.new_value       AS state_value,
        u.first_name,
        u.last_name,
        iss.name           AS issue_name
      FROM issue_activities ia
      INNER JOIN users u    ON ia.actor_id  = u.id
      INNER JOIN issues iss ON ia.issue_id  = iss.id
      WHERE ia.field      = 'state'
        AND ia.created_at < ${from}
        AND ia.issue_id   IS NOT NULL
        AND ia.actor_id   IS NOT NULL
      ORDER BY ia.issue_id, ia.actor_id, ia.created_at DESC
    `;

    // Case B – first-ever activity, used only when no records exist before `from`
    type FirstEverRow = CarryoverRow & {
      created_at: Date;
      issue_created_at: Date;
    };
    const caseBRaw = await this.prisma.$queryRaw<FirstEverRow[]>`
      SELECT DISTINCT ON (ia.issue_id, ia.actor_id)
        ia.issue_id::text  AS issue_id,
        ia.old_value       AS state_value,
        ia.created_at,
        iss.created_at     AS issue_created_at,
        u.first_name,
        u.last_name,
        iss.name           AS issue_name
      FROM issue_activities ia
      INNER JOIN users u    ON ia.actor_id  = u.id
      INNER JOIN issues iss ON ia.issue_id  = iss.id
      WHERE ia.field     = 'state'
        AND ia.issue_id  IS NOT NULL
        AND ia.actor_id  IS NOT NULL
      ORDER BY ia.issue_id, ia.actor_id, ia.created_at ASC
    `;

    // Build a set of (issue_id\0actor_id) pairs covered by Case A so Case B
    // can skip them (Case A takes precedence for state determination).
    const caseACoveredPairs = new Set(
      caseARaw.map((r) => `${r.issue_id}\x00${r.first_name} ${r.last_name}`),
    );

    const addCarryover = (
      rows: CarryoverRow[],
      skipIfCreatedBefore?: Date, // used for Case B
    ) => {
      for (const row of rows) {
        if (!ACTIVE_STATES.has(row.state_value.toLowerCase())) continue;
        const userName = `${row.first_name} ${row.last_name}`;
        const pairKey = `${userName}\x00${row.issue_id}`;
        if (actorPairSet.has(pairKey)) continue; // handled on-day
        if (skipIfCreatedBefore) {
          // Case B: only apply when the first-ever activity is on/after `from`
          // (i.e., the pair has no prior history — Case A would cover it otherwise)
          const firstEver = row as FirstEverRow;
          if (firstEver.created_at < from) continue;
          if (caseACoveredPairs.has(pairKey)) continue;
          // Issue didn't exist on this day — no credit
          if (firstEver.issue_created_at > to) continue;
        }

        // Bound credit start by issue creation date so we never attribute time
        // before the issue actually existed.
        const issueCreatedAt = (row as Partial<FirstEverRow>).issue_created_at;
        const dayStart =
          issueCreatedAt && issueCreatedAt > from ? issueCreatedAt : from;
        const creditMs = to.getTime() - dayStart.getTime() + 1;

        const issueRow = {
          id: row.issue_id,
          name: row.issue_name,
          duration: this.formatDuration(creditMs),
        };
        const existing = result.find((r) => r.user === userName);
        if (existing) {
          existing.issues.push(issueRow);
        } else {
          result.push({ user: userName, issues: [issueRow] });
        }
      }
    };

    addCarryover(caseARaw);
    addCarryover(caseBRaw, from); // pass `from` as the sentinel for Case B check

    return result;
  }

  // ── Export List ────────────────────────────────────────────────────────────

  /**
   * Distribute milliseconds per (user, issue, date) into a nested map.
   * Mirrors distributeMs but tracks the issue dimension too.
   */
  private distributeIssueMsPerUser(
    userIssueDateMs: Map<string, Map<string, Map<string, number>>>,
    username: string,
    issueId: string,
    allDatesSet: Set<string>,
    start: Date,
    end: Date,
  ): void {
    if (!userIssueDateMs.has(username))
      userIssueDateMs.set(username, new Map());
    const issueDateMs = userIssueDateMs.get(username)!;
    if (!issueDateMs.has(issueId)) issueDateMs.set(issueId, new Map());
    const dateMs = issueDateMs.get(issueId)!;

    let cursor = new Date(start);
    while (cursor < end) {
      const dateKey = cursor.toISOString().split('T')[0];
      const endOfDay = new Date(dateKey + 'T23:59:59.999Z');
      const segEnd = end <= endOfDay ? end : endOfDay;
      const ms = segEnd.getTime() - cursor.getTime();
      if (allDatesSet.has(dateKey)) {
        dateMs.set(dateKey, (dateMs.get(dateKey) ?? 0) + ms);
      }
      cursor = new Date(endOfDay.getTime() + 1);
    }
  }

  async getExportList({
    from: rawFrom,
    to: rawTo,
    employee,
    project,
    status,
    page = 1,
    limit = 20,
  }: {
    from: Date;
    to: Date;
    employee?: string;
    project?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    // Normalise to full-day UTC boundaries
    const from = new Date(
      Date.UTC(
        rawFrom.getUTCFullYear(),
        rawFrom.getUTCMonth(),
        rawFrom.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const to = new Date(
      Date.UTC(
        rawTo.getUTCFullYear(),
        rawTo.getUTCMonth(),
        rawTo.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    // Build the full date list for distribution and result keys
    const allDates: string[] = [];
    const d = new Date(from);
    while (d <= to) {
      allDates.push(d.toISOString().split('T')[0]);
      d.setUTCDate(d.getUTCDate() + 1);
    }
    const allDatesSet = new Set(allDates);

    // Build optional nested Prisma filter fragments
    const issueWhere: Record<string, unknown> = {};
    if (project) issueWhere.project_id = project;
    if (status)
      issueWhere.states = {
        name: { equals: status, mode: 'insensitive' },
      };

    const actorWhere: Record<string, unknown> = {};
    if (employee) {
      actorWhere.OR = [
        { first_name: { contains: employee, mode: 'insensitive' } },
        { last_name: { contains: employee, mode: 'insensitive' } },
      ];
    }

    // Single query — no N+1
    const records = (await this.prisma.issue_activities.findMany({
      where: {
        field: 'state',
        created_at: { gte: from, lte: to },
        actor_id: { not: null },
        issue_id: { not: null },
        ...(Object.keys(actorWhere).length && {
          users_issue_activities_actor_idTousers: actorWhere,
        }),
        ...(Object.keys(issueWhere).length && { issues: issueWhere }),
      },
      include: {
        users_issue_activities_actor_idTousers: {
          select: { first_name: true, last_name: true },
        },
        issues: {
          select: { name: true, created_at: true },
        },
      },
      orderBy: { created_at: 'asc' },
    })) as RawActivityWithIssue[];

    type ExportNorm = {
      user_name: string;
      issue_id: string;
      issue_name: string;
      issue_created_at: Date | null;
      new_state: string;
      old_state: string;
      timestamp: Date;
    };

    const normalized: ExportNorm[] = records
      .filter(
        (r) =>
          r.users_issue_activities_actor_idTousers && r.issues && r.issue_id,
      )
      .map((r) => ({
        user_name: `${r.users_issue_activities_actor_idTousers!.first_name} ${r.users_issue_activities_actor_idTousers!.last_name}`,
        issue_id: r.issue_id!,
        issue_name: r.issues!.name,
        issue_created_at: r.issues?.created_at ?? null,
        new_state: (r.new_value ?? '').toLowerCase(),
        old_state: (r.old_value ?? '').toLowerCase(),
        timestamp: r.created_at,
      }));

    // Build per-issue metadata and timelines
    const issueMeta = new Map<
      string,
      { name: string; created_at: Date | null }
    >();
    const timelines = new Map<string, Map<string, ExportNorm[]>>();

    for (const rec of normalized) {
      issueMeta.set(rec.issue_id, {
        name: rec.issue_name,
        created_at: rec.issue_created_at,
      });
      if (!timelines.has(rec.user_name))
        timelines.set(rec.user_name, new Map());
      const issueMap = timelines.get(rec.user_name)!;
      if (!issueMap.has(rec.issue_id)) issueMap.set(rec.issue_id, []);
      issueMap.get(rec.issue_id)!.push(rec);
    }

    // Compute durations per (user, issue, date)
    const userIssueDateMs = new Map<string, Map<string, Map<string, number>>>();

    for (const [username, issues] of timelines) {
      for (const [issueId, issueRecords] of issues) {
        const meta = issueMeta.get(issueId)!;

        // Same old_state carryover heuristic as get(), bounded by issue.created_at
        const first = issueRecords[0];
        if (ACTIVE_STATES.has(first.old_state)) {
          const syntheticStart =
            meta.created_at && meta.created_at > from ? meta.created_at : from;
          issueRecords.unshift({
            ...first,
            new_state: first.old_state,
            timestamp: syntheticStart,
          });
        }

        for (let i = 0; i < issueRecords.length; i++) {
          const curr = issueRecords[i];
          if (!ACTIVE_STATES.has(curr.new_state)) continue;
          if (i + 1 >= issueRecords.length) continue; // open session — skip

          const activeStart = curr.timestamp < from ? from : curr.timestamp;
          const activeEnd =
            issueRecords[i + 1].timestamp > to
              ? to
              : issueRecords[i + 1].timestamp;

          if (activeStart < activeEnd) {
            this.distributeIssueMsPerUser(
              userIssueDateMs,
              username,
              issueId,
              allDatesSet,
              activeStart,
              activeEnd,
            );
          }
        }
      }
    }

    // Paginate over employees (alphabetically sorted)
    const allUsers = Array.from(userIssueDateMs.keys()).toSorted();
    const total = allUsers.length;
    const offset = (page - 1) * limit;
    const paginatedUsers = allUsers.slice(offset, offset + limit);

    type WorklogEntry = {
      worklog: string;
      ticket_id: string;
      ticket_name: string;
      estimated_hours: string | null;
      actual_hours: string;
      over_due: boolean;
      remaining: string | null;
    };

    // Build the grouped response
    const data = paginatedUsers.map((username) => {
      const issueDateMs = userIssueDateMs.get(username)!;
      const dateMap = new Map<string, WorklogEntry[]>();

      for (const [issueId, dateMsMap] of issueDateMs) {
        const meta = issueMeta.get(issueId)!;
        for (const [date, ms] of dateMsMap) {
          if (ms === 0) continue;
          if (!dateMap.has(date)) dateMap.set(date, []);
          const duration = this.formatDuration(ms);
          dateMap.get(date)!.push({
            worklog: duration,
            ticket_id: issueId,
            ticket_name: meta.name,
            estimated_hours: null,
            actual_hours: duration,
            over_due: false,
            remaining: null,
          });
        }
      }

      // Sort date keys ascending
      const dateEntries = Object.fromEntries(
        Array.from(dateMap.entries()).toSorted(([a], [b]) =>
          a.localeCompare(b),
        ),
      );

      return { [username]: dateEntries };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
