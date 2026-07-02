"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Input } from "@/components/ui/input";
import { Download, Trash2, TrendingUp, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSnapJudgementUrl } from "@/lib/integrations/snapJudgement";

interface WatchlistItem {
  id: string;
  ticker: string;
  companyName?: string;
  exchange?: string;
  country?: string;
  sector?: string;
  theme?: string;
  notes?: string;
  createdAt: string;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTicker, setNewTicker] = useState("");
  const router = useRouter();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/watchlist");
      if (!res.ok) {
        const data = await res.json();
        if (data.error === "setup_required") {
          setError(data.message);
          return;
        }
        throw new Error(data.error || "Failed to fetch");
      }
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async () => {
    if (!newTicker.trim()) return;
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker: newTicker.toUpperCase() }),
    });
    setNewTicker("");
    fetchItems();
  };

  const handleRemove = async (id: string) => {
    await fetch(`/api/watchlist/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleExportCsv = () => {
    const headers = [
      "Ticker",
      "Company",
      "Exchange",
      "Country",
      "Sector",
      "Theme",
      "Notes",
    ];
    const rows = items.map((i) =>
      [
        i.ticker,
        i.companyName || "",
        i.exchange || "",
        i.country || "",
        i.sector || "",
        i.theme || "",
        i.notes || "",
      ].join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "watchlist.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunMetrics = async (ticker: string) => {
    const res = await fetch(`/api/metrics/${ticker}`);
    if (!res.ok) return;
    const data = await res.json();
    alert(
      `Metrics for ${ticker}:\nPrice: ${data.price}\nAnalyst Rating: ${data.analystRating}\nTarget: ${data.avgPriceTarget}\nUpside: ${data.impliedUpside}%`,
    );
  };

  if (error) return <ErrorState message={error} />;
  if (loading) return <LoadingState />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Watchlist</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleExportCsv}
          >
            <Download className="h-3 w-3" /> CSV
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Add ticker (e.g. AAPL)"
          className="max-w-xs h-9 text-sm font-mono"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button size="sm" onClick={handleAdd}>
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No watchlist items yet"
          description="Add tickers from extracted baskets or type one in manually."
          actions={[
            { label: "Go to Baskets", onClick: () => router.push("/baskets") },
          ]}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Exchange</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Theme</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono font-medium">
                    {item.ticker}
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.companyName || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.exchange || "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.country || "—"}
                  </TableCell>
                  <TableCell>
                    {item.sector && (
                      <Badge variant="secondary" className="text-xs">
                        {item.sector}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.theme && (
                      <Badge variant="outline" className="text-xs">
                        {item.theme}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <a
                        href={getSnapJudgementUrl(item.ticker)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in SnapJudgement"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <Zap className="h-3 w-3" />
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleRunMetrics(item.ticker)}
                        title="Run metrics"
                      >
                        <TrendingUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500"
                        onClick={() => handleRemove(item.id)}
                        title="Remove"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
