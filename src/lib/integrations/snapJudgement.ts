export function getSnapJudgementUrl(tickers: string | string[]): string {
  const base = process.env.NEXT_PUBLIC_SNAPJUDGEMENT_URL || 'https://snapjudgement.vercel.app'
  const arr = Array.isArray(tickers) ? tickers : [tickers]
  const valid = [...new Set(arr.map(t => t.trim().toUpperCase()).filter(Boolean))]
  if (valid.length === 0) return base
  if (valid.length === 1) return `${base}/?ticker=${valid[0]}`
  return `${base}/?tickers=${valid.join(',')}`
}
