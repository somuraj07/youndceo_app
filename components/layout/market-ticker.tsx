"use client";

import { useEffect, useState } from "react";
import type { MarketQuote } from "@/lib/market";

function formatPrice(price: number) {
  if (price >= 1000) {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 4 : 2,
  });
}

function TickerItem({ quote }: { quote: MarketQuote }) {
  const isUp = quote.changePercent >= 0;

  return (
    <span className="inline-flex shrink-0 items-center gap-2 px-4 text-xs">
      <span className="font-semibold text-foreground">{quote.symbol}</span>
      <span className="text-muted">${formatPrice(quote.price)}</span>
      <span className={isUp ? "text-green" : "text-red"}>
        {isUp ? "+" : ""}
        {quote.changePercent.toFixed(2)}%
      </span>
    </span>
  );
}

export function MarketTicker() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);

  useEffect(() => {
    async function loadQuotes() {
      try {
        const response = await fetch("/api/market-prices");
        const data = await response.json();
        setQuotes(data.quotes ?? []);
      } catch {
        setQuotes([]);
      }
    }

    loadQuotes();
    const interval = setInterval(loadQuotes, 30_000);

    return () => clearInterval(interval);
  }, []);

  const items = quotes.length > 0 ? quotes : null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 h-8 overflow-hidden border-b border-border bg-[var(--ticker-bg)]">
      <div className="flex h-full items-center">
        {items ? (
          <div className="ticker-track flex w-max items-center whitespace-nowrap">
            {[...items, ...items].map((quote, index) => (
              <TickerItem key={`${quote.symbol}-${index}`} quote={quote} />
            ))}
          </div>
        ) : (
          <div className="flex w-full items-center justify-center gap-2 px-4 text-xs text-muted">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-purple" />
            Loading live market prices...
          </div>
        )}
      </div>
    </div>
  );
}
