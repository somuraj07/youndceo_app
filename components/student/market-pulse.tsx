"use client";

import { useEffect, useState } from "react";
import type { MarketQuote } from "@/lib/market";
import { AreaSpark } from "@/components/ui/charts";

function sparkFromChange(change: number, seed: number) {
  const direction = change >= 0 ? 1 : -1;
  return Array.from({ length: 8 }, (_, index) => {
    const wobble = Math.sin(index * 1.1 + seed) * 8;
    return Math.max(8, 50 + direction * index * 4 + wobble);
  });
}

function formatInrPrice(price: number) {
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)}L`;
  }
  return `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function MarketCard({ quote, index }: { quote: MarketQuote; index: number }) {
  const up = quote.changePercent >= 0;
  const graphColor = up ? "#22c55e" : "#ef4444";

  return (
    <article className="glass flex h-44 w-36 shrink-0 flex-col items-start justify-center gap-2 rounded-2xl p-3.5">
      <span className="text-sm font-semibold tracking-wider text-muted uppercase">
        {quote.name}
      </span>
      <span className="text-base font-bold whitespace-nowrap text-foreground">
        {formatInrPrice(quote.price)}
      </span>
      <span
        className={`text-sm font-semibold whitespace-nowrap ${
          up ? "text-green" : "text-red"
        }`}
      >
        {up ? "▲" : "▼"} {up ? "+" : "-"}
        {Math.abs(quote.changePercent).toFixed(2)}%
      </span>
      <div className="mt-1 h-9 w-full">
        <AreaSpark
          values={sparkFromChange(quote.changePercent, index)}
          color={graphColor}
          height={36}
        />
      </div>
    </article>
  );
}

export function MarketPulse() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch(`/api/market-prices?t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!active) {
          return;
        }
        setQuotes((data.quotes as MarketQuote[]) ?? []);
        setUpdatedAt(data.updatedAt ?? null);
      } catch {
        if (active) {
          setQuotes([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    const id = setInterval(load, 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const tickerCards = quotes.length > 0 ? [...quotes, ...quotes] : [];

  return (
    <section className="max-w-full min-w-0 space-y-3 overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple/20 text-purple-soft">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path d="M4 19h16M6 16l3.5-5 3 3.5L17 7l3 3" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Market Pulse</h2>
            <p className="text-sm text-muted">Live Indian market overview</p>
          </div>
        </div>
        {!loading && quotes.length > 0 ? (
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-green">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green" />
            Live
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-purple" />
          Loading live prices…
        </div>
      ) : quotes.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          Market prices unavailable right now. Please try again shortly.
        </p>
      ) : (
        <div className="overflow-hidden pb-1">
          <div className="market-pulse-track flex w-max gap-3">
            {tickerCards.map((quote, index) => (
              <MarketCard
                key={`${quote.symbol}-${index}`}
                quote={quote}
                index={index % quotes.length}
              />
            ))}
          </div>
        </div>
      )}

      {updatedAt ? (
        <p className="text-xs text-muted">
          Updated {new Date(updatedAt).toLocaleTimeString("en-IN")}
        </p>
      ) : null}
    </section>
  );
}
