"use client";

import { useEffect, useState, useCallback } from "react";
import { BasketCard } from "@/components/BasketCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { useRouter } from "next/navigation";
import type { ThirteenFOverlap } from "@/lib/storage/types";

interface BasketData {
  id: string;
  name: string;
  firm?: string;
  theme?: string;
  sector?: string;
  tickers: string[];
  createdAt: string;
  overlaps?: ThirteenFOverlap[];
}

export default function BasketsPage() {
  const [baskets, setBaskets] = useState<BasketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchBaskets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/baskets");
      if (!res.ok) {
        const data = await res.json();
        if (data.error === "setup_required") {
          setError(data.message);
          return;
        }
        throw new Error(data.error || "Failed to fetch");
      }
      const data = await res.json();
      setBaskets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    void fetchBaskets();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fetchBaskets]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/baskets/${id}`, { method: "DELETE" });
    fetchBaskets();
  };

  const handleExportCsv = (basket: BasketData) => {
    const csv = `Ticker\n${basket.tickers.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${basket.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddAllToWatchlist = async (basket: BasketData) => {
    for (const t of basket.tickers) {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: t }),
      });
    }
  };

  const handleRunMetrics = async (basket: BasketData) => {
    await fetch(`/api/baskets/${basket.id}/run-metrics`, { method: "POST" });
  };

  if (error) return <ErrorState message={error} />;
  if (loading) return <LoadingState />;

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Baskets</h1>
      {baskets.length === 0 ? (
        <EmptyState
          title="No baskets yet"
          description="Create one from Overlap or add a basket."
          actions={[
            { label: "Go to Feed", onClick: () => router.push("/feed") },
            {
              label: "Go to Overlap",
              onClick: () => router.push("/conviction-lists/overlap"),
            },
          ]}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {baskets.map((b) => (
            <BasketCard
              key={b.id}
              id={b.id}
              name={b.name}
              firm={b.firm}
              theme={b.theme}
              sector={b.sector}
              tickers={b.tickers}
              createdAt={b.createdAt}
              overlaps={b.overlaps}
              onRunMetrics={() => handleRunMetrics(b)}
              onAddAllToWatchlist={() => handleAddAllToWatchlist(b)}
              onExportCsv={() => handleExportCsv(b)}
              onDelete={() => handleDelete(b.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
