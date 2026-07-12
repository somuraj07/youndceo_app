export type MarketQuote = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
};

const STOCK_SYMBOLS = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN", "META", "SPY"];

const CRYPTO_IDS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
];

async function fetchStockQuotes(): Promise<MarketQuote[]> {
  const symbols = STOCK_SYMBOLS.join(",");
  const response = await fetch(
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`,
    {
      next: { revalidate: 0 },
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    },
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const results = data?.quoteResponse?.result ?? [];

  return results.map(
    (item: {
      symbol: string;
      shortName?: string;
      regularMarketPrice?: number;
      regularMarketChangePercent?: number;
    }) => ({
      symbol: item.symbol,
      name: item.shortName ?? item.symbol,
      price: item.regularMarketPrice ?? 0,
      changePercent: item.regularMarketChangePercent ?? 0,
    }),
  );
}

async function fetchCryptoQuotes(): Promise<MarketQuote[]> {
  const ids = CRYPTO_IDS.map((c) => c.id).join(",");
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
    { next: { revalidate: 0 } },
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return CRYPTO_IDS.map(({ id, symbol, name }) => ({
    symbol,
    name,
    price: data[id]?.usd ?? 0,
    changePercent: data[id]?.usd_24h_change ?? 0,
  }));
}

export async function getLiveMarketQuotes(): Promise<MarketQuote[]> {
  const { CacheKeys, TTL, cached } = await import("@/lib/cache");

  return cached(CacheKeys.market, TTL.market, async () => {
    const [stocks, crypto] = await Promise.all([
      fetchStockQuotes(),
      fetchCryptoQuotes(),
    ]);

    return [...crypto, ...stocks].filter((quote) => quote.price > 0);
  });
}
