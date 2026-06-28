import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL || process.env.STORAGE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set. STORAGE_URL is only used as a fallback.')
}

const sql = neon(databaseUrl)

const [sourceTotals] = await sql`
  select
    count(*)::int as total,
    count(*) filter (where enabled)::int as enabled,
    count(*) filter (where enabled and source_tier = 'core')::int as enabled_core,
    count(*) filter (where enabled and source_tier = 'secondary')::int as enabled_secondary,
    count(*) filter (where enabled and source_tier = 'archive')::int as enabled_archive
  from sources
`

const enabledSources = await sql`
  select name, domain, source_class, source_tier
  from sources
  where enabled = true
  order by source_tier, name
`

const articleBySource = await sql`
  select
    s.name,
    s.domain,
    s.source_class,
    s.source_tier,
    a.status,
    count(*)::int as count
  from articles a
  left join sources s on s.id = a.source_id
  group by s.name, s.domain, s.source_class, s.source_tier, a.status
  order by count desc, s.name
`

const latestRuns = await sql`
  select *
  from scan_runs
  order by started_at desc
  limit 3
`

const latestScanResults = await sql`
  select distinct on (source_id)
    source_name, source_domain, source_tier, status, urls_found, urls_attempted,
    saved_count, rejected_count, failed_count, error, started_at, finished_at, scan_run_id
  from source_scan_results
  order by source_id, started_at desc
`

const sourceIdsWithArticles = await sql`
  select distinct source_id
  from articles
  where status = 'saved' and source_id is not null
`
const sourceIdsWithScans = new Set(latestScanResults.map((row) => String(row.source_domain).toLowerCase()))
const articleSourceIds = new Set(sourceIdsWithArticles.map((row) => String(row.source_id)))
const sourcesWithNoArticles = await sql`
  select id, name, domain, source_tier, enabled
  from sources
  where enabled = true
  order by source_tier, name
`

const mediaEnabled = enabledSources.filter((row) => isMediaSource(String(row.name), String(row.domain)))
const duplicateDomains = await sql`
  select lower(domain) as domain, count(*)::int as count
  from sources
  group by lower(domain)
  having count(*) > 1
`

printSection('Source totals')
console.table([sourceTotals])

printSection('Enabled sources')
console.table(enabledSources)

printSection('Enabled source issues')
console.table([
  { check: 'media/news enabled sources', count: mediaEnabled.length },
  { check: 'duplicate domains', count: duplicateDomains.length },
])
if (mediaEnabled.length) console.table(mediaEnabled)
if (duplicateDomains.length) console.table(duplicateDomains)

printSection('Articles by source/status')
console.table(articleBySource)

printSection('Latest scan runs')
console.table(latestRuns)

printSection('Latest per-source scan summary')
console.table(latestScanResults)

printSection('Enabled sources with no saved articles')
console.table(sourcesWithNoArticles.filter((source) => !articleSourceIds.has(String(source.id))))

printSection('Enabled sources never scanned')
console.table(sourcesWithNoArticles.filter((source) => !sourceIdsWithScans.has(String(source.domain).toLowerCase())))

printSection('Sources with latest scan error')
console.table(latestScanResults.filter((scan) => scan.status === 'failed' || scan.error))

function printSection(title) {
  console.log(`\n=== ${title} ===`)
}

function isMediaSource(name, domain) {
  const text = `${name} ${domain}`.toLowerCase()
  return [
    'cnbc', 'benzinga', 'seeking alpha', 'seekingalpha', 'yahoo finance',
    'marketwatch', 'reuters', 'investing.com', 'tipranks', 'the fly',
    'stockanalysis', 'marketbeat', 'streetinsider', 'gurufocus',
  ].some((blocked) => text.includes(blocked))
}
