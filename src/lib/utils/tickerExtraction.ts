const KNOWN_TICKERS = new Set([
  'SNOW', 'DDOG', 'MDB', 'FROG', 'TWLO', 'DINO', 'COP', 'EQT', 'VNOM',
  'FANG', 'KMI', 'LNG', 'GLNG', 'HAL', 'VST', 'ARES', 'KKR', 'OWL', 'BX',
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM',
  'V', 'MA', 'UNH', 'HD', 'DIS', 'NFLX', 'ADBE', 'CRM', 'INTC', 'AMD',
  'PYPL', 'SQ', 'UBER', 'LYFT', 'SNAP', 'PINS', 'RIVN', 'LCID',
])

export function extractTickers(text: string): string[] {
  const found = new Set<string>()

  // $TICKER pattern
  const dollarMatches = text.matchAll(/\$([A-Z]{1,5})\b/g)
  for (const m of dollarMatches) found.add(m[1])

  // EXCHANGE:TICKER pattern
  const exchangeMatches = text.matchAll(/\b(NYSE|NASDAQ|AMEX|TSX|LSE):\s*([A-Z]{1,5})\b/g)
  for (const m of exchangeMatches) found.add(m[2])

  // Uppercase words with known ticker check
  const upperWords = text.matchAll(/\b([A-Z]{1,5})\b/g)
  for (const m of upperWords) {
    if (KNOWN_TICKERS.has(m[1])) found.add(m[1])
  }

  // Ticker-like words in parentheses
  const parenMatches = text.matchAll(/\(([A-Z]{1,5})\)/g)
  for (const m of parenMatches) {
    if (/^[A-Z]{1,5}$/.test(m[1])) found.add(m[1])
  }

  return Array.from(found)
}

export function extractCompanyNames(text: string): string[] {
  const names: string[] = []
  const patterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*\((NYSE|NASDAQ|AMEX|TSX|LSE):\s*[A-Z]{1,5}\)/g,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*\([A-Z]{1,5}\)/g,
  ]
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern)
    for (const m of matches) names.push(m[1].trim())
  }
  return names
}

export function addKnownTicker(ticker: string): void {
  KNOWN_TICKERS.add(ticker.toUpperCase())
}
