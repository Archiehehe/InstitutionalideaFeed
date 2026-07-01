import { neon } from '@neondatabase/serverless'
import { KNOWN_CANDIDATES } from '../src/lib/sellSideLists/seedKnownCandidates.ts'

const databaseUrl = process.env.DATABASE_URL || process.env.STORAGE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set. STORAGE_URL is only used as a fallback.')
}

const sql = neon(databaseUrl)

async function importSeed() {
  console.log(`Importing ${KNOWN_CANDIDATES.length} seed candidates...`)
  let count = 0
  
  for (const candidate of KNOWN_CANDIDATES) {
    const slug = slugify(`${candidate.institution} ${candidate.listName} ${candidate.year ?? ''}`)
    
    // Check if exists
    const existing = await sql`select id from conviction_lists where slug = ${slug}`
    
    if (existing.length > 0) {
      console.log(`Skipping ${slug}, already exists.`)
      continue
    }

    const rows = await sql`
      insert into conviction_lists (
        slug,
        institution,
        list_name,
        display_name,
        year,
        period,
        theme,
        sector,
        region,
        source_url,
        source_type,
        confidence,
        review_status,
        imported_from
      )
      values (
        ${slug},
        ${candidate.institution},
        ${candidate.listName},
        ${candidate.displayName},
        ${candidate.year ?? null},
        ${candidate.period ?? null},
        ${candidate.theme ?? null},
        ${candidate.sector ?? null},
        ${candidate.region ?? null},
        ${candidate.sourceUrl ?? null},
        ${candidate.sourceType},
        ${candidate.confidence},
        ${candidate.reviewStatus},
        'seed'
      )
      returning id
    `
    
    const listId = rows[0].id
    
    // Import members
    for (const [index, member] of candidate.members.entries()) {
        await sql`
            insert into conviction_list_members (conviction_list_id, ticker, rank, company_name, weight, action, note)
            values (${listId}, ${member.ticker.toUpperCase()}, ${member.rank ?? index + 1}, ${member.companyName ?? null}, ${member.weight ?? null}, ${member.action ?? null}, ${member.note ?? null})
            on conflict (conviction_list_id, ticker) do update set
            rank = excluded.rank,
            company_name = excluded.company_name,
            weight = excluded.weight,
            action = excluded.action,
            note = excluded.note
        `
    }
    
    console.log(`Imported ${slug} (ID: ${listId})`)
    count++
  }
  
  console.log(`Successfully imported ${count} new lists.`)
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

importSeed().catch(err => {
    console.error(err)
    process.exit(1)
})
