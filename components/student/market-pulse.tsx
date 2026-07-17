"use client";

import { useEffect, useRef, useState } from "react";
import type { MarketQuote } from "@/lib/market";
import { AreaSpark } from "@/components/ui/charts";

function sparkFromChange(change: number, seed: number) {
  const direction = change >= 0 ? 1 : -1;
  return Array.from({ length: 8 }, (_, index) => {
    const wobble = Math.sin(index * 1.1 + seed) * 8;
    return Math.max(8, 50 + direction * index * 4 + wobble);
  });
}

const FALLBACK: MarketQuote[] = [
  { symbol: "SENSEX", name: "Sensex", price: 81452, changePercent: 0.67 },
  { symbol: "NIFTY", name: "Nifty 50", price: 24788, changePercent: 0.54 },
  { symbol: "GOLD", name: "Gold", price: 73140, changePercent: -0.21 },
  { symbol: "BANK", name: "Bank Nifty", price: 47820, changePercent: 0.65 },
];

export function MarketPulse() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const tickerRef = useRef<HTMLDivElement>(null);
  const heldRef = useRef(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/market-prices");
        const data = await res.json();
        setQuotes(data.quotes as MarketQuote[]);
      } catch {
        setQuotes([]);
      }
    }

    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const cards = quotes.length > 0 ? quotes : FALLBACK;

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) {
      return;
    }

    let frame = 0;
    let previousTime = performance.now();
    const repeatedCard = ticker.querySelector<HTMLElement>(
      "[data-ticker-repeat]",
    );

    const move = (time: number) => {
      const elapsed = Math.min(time - previousTime, 50);
      previousTime = time;

      if (!heldRef.current) {
        ticker.scrollLeft += elapsed * 0.05;
        const repeatedStart = repeatedCard?.offsetLeft;
        if (repeatedStart && ticker.scrollLeft >= repeatedStart) {
          ticker.scrollLeft -= repeatedStart;
        }
      }

      frame = requestAnimationFrame(move);
    };

    frame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(frame);
  }, [cards.length]);

  const tickerCards = [...cards, ...cards];

  return (
    <section className="max-w-full min-w-0 space-y-3 overflow-hidden">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple/20 text-purple-soft">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path d="M4 19h16M6 16l3.5-5 3 3.5L17 7l3 3" />
          </svg>
        </span>
        <div>
          <h2 className="font-semibold text-foreground">Market Pulse</h2>
          <p className="text-[11px] text-muted">Live market overview</p>
        </div>
      </div>

      <div
        ref={tickerRef}
        aria-label="Live market prices. Hold to pause."
        onPointerDown={() => {
          heldRef.current = true;
        }}
        onPointerUp={() => {
          heldRef.current = false;
        }}
        onPointerCancel={() => {
          heldRef.current = false;
        }}
        onPointerLeave={() => {
          heldRef.current = false;
        }}
        className="flex w-full touch-pan-x gap-3 overflow-x-auto pb-1 scrollbar-none"
      >
        {tickerCards.map((quote, index) => {
          const up = quote.changePercent >= 0;
          const graphColor = up ? "#22c55e" : "#ef4444";

          return (
            <article
              key={`${quote.symbol}-${index}`}
              aria-hidden={index >= cards.length}
              data-ticker-repeat={index === cards.length ? "" : undefined}
              className="glass flex h-40 w-32 shrink-0 flex-col items-start justify-center gap-1.5 rounded-2xl p-3"
            >
              <span className="text-[11px] font-semibold tracking-wider text-muted uppercase">
                {quote.name}
              </span>
              <span className="text-sm font-bold whitespace-nowrap text-foreground">
                {quote.price.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </span>
              <span
                className={`text-xs font-semibold whitespace-nowrap ${
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
        })}
      </div>
    </section>
  );
}
