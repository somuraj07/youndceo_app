export type MarketQuote = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  currency: "INR";
};

type ChartQuote = {
  price: number;
  changePercent: number;
};

const MARKET_INSTRUMENTS: {
  symbol: string;
  key: string;
  name: string;
  usdBased?: boolean;
  perTenGrams?: boolean;
}[] = [
  { symbol: "^NSEI", key: "NIFTY", name: "Nifty 50" },
  { symbol: "GC=F", key: "GOLD", name: "Gold / 10g", usdBased: true, perTenGrams: true },
  { symbol: "CL=F", key: "CRUDE", name: "Crude Oil", usdBased: true },
];

const CRYPTO_INSTRUMENTS = [
  { id: "bitcoin", key: "BTC", name: "Bitcoin" },
] as const;

async function fetchYahooChartQuote(yahooSymbol: string): Promise<ChartQuote | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`,
      {
        cache: "no-store",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) {
      return null;
    }

    const price = meta.regularMarketPrice as number;
    let changePercent = meta.regularMarketChangePercent as number | undefined;

    if (changePercent == null) {
      const previous =
        (meta.chartPreviousClose as number | undefined) ??
        (meta.previousClose as number | undefined);
      changePercent = previous ? ((price - previous) / previous) * 100 : 0;
    }

    return { price, changePercent };
  } catch {
    return null;
  }
}

async function fetchUsdInrRate(): Promise<number> {
  const quote = await fetchYahooChartQuote("USDINR=X");
  return quote?.price ?? 84;
}

async function fetchIndianMarketQuotes(): Promise<MarketQuote[]> {
  const usdInr = await fetchUsdInrRate();

  const results: MarketQuote[] = [];

  for (const instrument of MARKET_INSTRUMENTS) {
    const quote = await fetchYahooChartQuote(instrument.symbol);
    if (!quote) {
      continue;
    }

    let price = instrument.usdBased ? quote.price * usdInr : quote.price;
    if (instrument.perTenGrams) {
      price = price / 3.11035;
    }

    results.push({
      symbol: instrument.key,
      name: instrument.name,
      price,
      changePercent: quote.changePercent,
      currency: "INR",
    });
  }

  return results;
}

async function fetchCryptoQuotes(): Promise<MarketQuote[]> {
  try {
    const ids = CRYPTO_INSTRUMENTS.map((c) => c.id).join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=inr&include_24hr_change=true`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const quotes: MarketQuote[] = [];

    for (const { id, key, name } of CRYPTO_INSTRUMENTS) {
      const price = data[id]?.inr ?? 0;
      if (price <= 0) {
        continue;
      }

      quotes.push({
        symbol: key,
        name,
        price,
        changePercent: data[id]?.inr_24h_change ?? 0,
        currency: "INR",
      });
    }

    return quotes;
  } catch {
    return [];
  }
}

export async function getLiveMarketQuotes(): Promise<MarketQuote[]> {
  const { CacheKeys, TTL, cached } = await import("@/lib/cache");

  return cached(CacheKeys.market, TTL.market, async () => {
    const [indian, crypto] = await Promise.all([
      fetchIndianMarketQuotes(),
      fetchCryptoQuotes(),
    ]);

    const order = ["NIFTY", "BTC", "GOLD", "CRUDE"];
    const bySymbol = new Map(
      [...indian, ...crypto].map((quote) => [quote.symbol, quote]),
    );

    return order
      .map((symbol) => bySymbol.get(symbol))
      .filter((quote): quote is MarketQuote => quote !== undefined);
  });
}
