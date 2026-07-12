"use client";

import { useEffect, useState } from "react";
import type { MarketQuote } from "@/lib/market";
import { AreaSpark } from "@/components/ui/charts";

function sparkFromChange(change: number) {
  const base = 50;
  const direction = change >= 0 ? 1 : -1;
  return Array.from({ length: 8 }, (_, i) => {
    const wobble = Math.sin(i * 1.1) * 8;
    return Math.max(8, base + direction * i * 4 + wobble);
  });
}

export function MarketPulse() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/market-prices");
        const data = await res.json();
        setQuotes((data.quotes as MarketQuote[]).slice(0, 3));
      } catch {
        setQuotes([]);
      }
    }

    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const fallback = [
    { symbol: "SENSEX", name: "Sensex", price: 72450, changePercent: 0.42 },
    { symbol: "NIFTY", name: "Nifty 50", price: 22180, changePercent: -0.18 },
    { symbol: "BANK", name: "Bank Nifty", price: 47820, changePercent: 0.65 },
  ];

  const cards = quotes.length >= 3 ? quotes.slice(0, 3) : fallback;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple/20 text-purple-soft">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path d="M4 19h16M6 16l3.5-5 3 3.5L17 7l3 3" />
          </svg>
        </span>
        <div>
          <h2 className="font-semibold text-foreground">Market Pulse</h2>
          <p className="text-[11px] text-muted">Live index snapshot</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map((quote, index) => {
          const up = quote.changePercent >= 0;
          const color = up ? "#22c55e" : "#ef4444";

          return (
            <article
              key={quote.symbol}
              className="glass overflow-hidden rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-muted">{quote.name}</p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {quote.price.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    up ? "bg-green/20 text-green" : "bg-red/20 text-red"
                  }`}
                >
                  {up ? "▲" : "▼"} {Math.abs(quote.changePercent).toFixed(2)}%
                </span>
              </div>
              <div className="mt-3 h-12">
                <AreaSpark
                  values={sparkFromChange(quote.changePercent + index)}
                  color={color}
                  height={48}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
