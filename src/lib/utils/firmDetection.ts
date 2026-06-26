const FIRM_MAP: Record<string, string> = {
  'goldman sachs': 'Goldman Sachs',
  'goldman': 'Goldman Sachs',
  'morgan stanley': 'Morgan Stanley',
  'bofa': 'Bank of America',
  'bank of america': 'Bank of America',
  'citi': 'Citi',
  'citigroup': 'Citi',
  'jpmorgan': 'JPMorgan',
  'j.p. morgan': 'JPMorgan',
  'jp morgan': 'JPMorgan',
  'ubs': 'UBS',
  'jefferies': 'Jefferies',
  'evercore': 'Evercore',
  'evercore isi': 'Evercore',
  'rbc': 'RBC',
  'rbc capital markets': 'RBC',
  'bernstein': 'Bernstein',
  'barclays': 'Barclays',
  'deutsche bank': 'Deutsche Bank',
  'deutsche': 'Deutsche Bank',
  'wells fargo': 'Wells Fargo',
  'mizuho': 'Mizuho',
  'td cowen': 'TD Cowen',
  'piper sandler': 'Piper Sandler',
  'william blair': 'William Blair',
  'wedbush': 'Wedbush',
  'blackrock': 'BlackRock',
  'pimco': 'PIMCO',
  'fidelity': 'Fidelity',
  't. rowe price': 'T. Rowe Price',
  't rowe price': 'T. Rowe Price',
  'amundi': 'Amundi',
  'schroders': 'Schroders',
  'franklin templeton': 'Franklin Templeton',
  'hsbc': 'HSBC',
  'bny mellon': 'BNY Mellon',
  'state street': 'State Street',
  'nomura': 'Nomura',
  'macquarie': 'Macquarie',
}

export function detectFirm(text: string): string | undefined {
  const lower = text.toLowerCase()
  for (const [key, value] of Object.entries(FIRM_MAP)) {
    if (lower.includes(key)) return value
  }
  return undefined
}
