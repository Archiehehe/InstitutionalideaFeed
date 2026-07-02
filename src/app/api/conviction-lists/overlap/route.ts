import { NextRequest } from "next/server";
import { getStore } from "@/lib/storage";
import { handleApiError } from "@/lib/api/responses";

interface OverlapListEntry {
  id: string;
  displayName: string;
  institution: string;
  year?: number;
  period?: string;
  theme?: string;
  sector?: string;
  reviewStatus?: string;
  confidence: "verified" | "needs_review";
  sourceType: string;
  action?: string;
  note?: string;
}

interface OverlapRow {
  ticker: string;
  companyName?: string;
  mentionCount: number;
  institutionCount: number;
  listCount: number;
  institutions: string[];
  lists: OverlapListEntry[];
  actions: string[];
  latestYear?: number;
  latestPeriod?: string;
  themes: string[];
  sectors: string[];
  reviewStatuses: string[];
  confidences: string[];
}

export async function GET(request: NextRequest) {
  try {
    const store = getStore();
    const { searchParams } = new URL(request.url);
    const includeRejected = searchParams.get("includeRejected") === "true";
    const institution = searchParams.get("institution")?.trim();
    const year = searchParams.get("year")?.trim();
    const sector = searchParams.get("sector")?.trim();
    const theme = searchParams.get("theme")?.trim();
    const reviewStatus = searchParams.get("reviewStatus")?.trim();
    const confidence = searchParams.get("confidence")?.trim();
    const sourceType = searchParams.get("sourceType")?.trim();
    const minMentions = Number(searchParams.get("minMentions") ?? "1");
    const search = searchParams.get("search")?.trim().toLowerCase();

    const lists = (await store.getConvictionLists())
      .filter((list) => includeRejected || list.reviewStatus !== "rejected")
      .filter((list) => {
        if (institution && list.institution !== institution) return false;
        if (year && String(list.year) !== year) return false;
        if (sector && list.sector !== sector) return false;
        if (theme && list.theme !== theme) return false;
        if (reviewStatus && list.reviewStatus !== reviewStatus) return false;
        if (confidence && list.confidence !== confidence) return false;
        if (sourceType && list.sourceType !== sourceType) return false;
        return true;
      });

    if (lists.length === 0) {
      return Response.json({
        rows: [],
        count: 0,
        message: "Import starter lists to create lists first.",
        summary: {
          totalTickers: 0,
          repeatedTickerCount: 0,
          verifiedMentions: 0,
          needsReviewMentions: 0,
        },
      });
    }

    const rowsByTicker = new Map<string, OverlapRow>();

    for (const list of lists) {
      const members = await store.getConvictionListMembers(list.id);
      for (const member of members) {
        const ticker = member.ticker.toUpperCase();
        const entry: OverlapListEntry = {
          id: list.id,
          displayName: list.displayName,
          institution: list.institution,
          year: list.year,
          period: list.period,
          theme: list.theme,
          sector: list.sector,
          reviewStatus: list.reviewStatus,
          confidence: list.confidence,
          sourceType: list.sourceType,
          action: member.action,
          note: member.note,
        };

        const existing = rowsByTicker.get(ticker);
        if (existing) {
          existing.lists.push(entry);
          existing.actions.push(
            ...(member.action ? [member.action.toLowerCase()] : []),
          );
          existing.themes.push(...(list.theme ? [list.theme] : []));
          existing.sectors.push(...(list.sector ? [list.sector] : []));
          existing.reviewStatuses.push(list.reviewStatus ?? "needs_review");
          existing.confidences.push(list.confidence);
          existing.institutions.push(list.institution);
          existing.latestYear = latestYear(existing.latestYear, list.year);
          existing.latestPeriod = latestPeriod(
            existing.latestPeriod,
            list.period,
          );
        } else {
          rowsByTicker.set(ticker, {
            ticker,
            companyName: member.companyName,
            mentionCount: 1,
            institutionCount: 1,
            listCount: 1,
            institutions: [list.institution],
            lists: [entry],
            actions: member.action ? [member.action.toLowerCase()] : [],
            latestYear: list.year,
            latestPeriod: list.period,
            themes: list.theme ? [list.theme] : [],
            sectors: list.sector ? [list.sector] : [],
            reviewStatuses: [list.reviewStatus ?? "needs_review"],
            confidences: [list.confidence],
          });
        }
      }
    }

    const rows = Array.from(rowsByTicker.values())
      .map((row) => {
        const uniqueInstitutions = Array.from(new Set(row.institutions)).filter(
          Boolean,
        );
        const uniqueThemes = Array.from(new Set(row.themes)).filter(Boolean);
        const uniqueSectors = Array.from(new Set(row.sectors)).filter(Boolean);
        const uniqueActions = Array.from(new Set(row.actions)).filter(Boolean);
        const uniqueReviewStatuses = Array.from(
          new Set(row.reviewStatuses),
        ).filter(Boolean);
        const uniqueConfidences = Array.from(new Set(row.confidences)).filter(
          Boolean,
        );
        const mentionCount = row.lists.length;
        const institutionCount = uniqueInstitutions.length;

        return {
          ...row,
          mentionCount,
          institutionCount,
          listCount: mentionCount,
          institutions: uniqueInstitutions,
          actions: uniqueActions,
          latestYear: row.latestYear,
          latestPeriod: row.latestPeriod,
          themes: uniqueThemes,
          sectors: uniqueSectors,
          reviewStatuses: uniqueReviewStatuses,
          confidences: uniqueConfidences,
        };
      })
      .filter((row) => {
        if (search) {
          const haystack =
            `${row.ticker} ${row.companyName ?? ""}`.toLowerCase();
          if (!haystack.includes(search)) return false;
        }
        if (minMentions > 1 && row.mentionCount < minMentions) return false;
        return true;
      })
      .sort((a, b) => {
        if (b.mentionCount !== a.mentionCount)
          return b.mentionCount - a.mentionCount;
        if (b.institutionCount !== a.institutionCount)
          return b.institutionCount - a.institutionCount;
        return a.ticker.localeCompare(b.ticker);
      });

    const summary = {
      totalTickers: rows.length,
      repeatedTickerCount: rows.filter((row) => row.mentionCount >= 2).length,
      verifiedMentions: rows.reduce(
        (total, row) =>
          total +
          row.lists.filter((list) => list.confidence === "verified").length,
        0,
      ),
      needsReviewMentions: rows.reduce(
        (total, row) =>
          total +
          row.lists.filter((list) => list.confidence === "needs_review").length,
        0,
      ),
    };

    return Response.json({
      rows,
      count: rows.length,
      message: rows.some((row) => row.mentionCount > 1)
        ? "Repeated mentions are shown below."
        : "No ticker appears in multiple lists yet. Showing single-mention tickers.",
      summary,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

function latestYear(current?: number, incoming?: number): number | undefined {
  if (incoming === undefined) return current;
  if (current === undefined) return incoming;
  return incoming > current ? incoming : current;
}

function latestPeriod(current?: string, incoming?: string): string | undefined {
  if (!incoming) return current;
  if (!current) return incoming;
  return incoming > current ? incoming : current;
}
