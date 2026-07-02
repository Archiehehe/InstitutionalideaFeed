import { neon } from "@neondatabase/serverless";
import { SEED_CANDIDATES } from "../src/lib/sellSideLists/seedKnownCandidates.ts";
import { getDatabaseUrl, sanitizeUrl } from "./db-env.mjs";

const databaseUrl = getDatabaseUrl();
console.log(`Connecting to: ${sanitizeUrl(databaseUrl)}`);
const sql = neon(databaseUrl);

async function importSeed() {
  console.log(`Importing ${SEED_CANDIDATES.length} seed candidates...`);
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const candidate of SEED_CANDIDATES) {
    try {
      const slug = slugify(
        `${candidate.institution} ${candidate.listName} ${candidate.year ?? ""}`,
      );

      // Check if exists
      const existing =
        await sql`select id from conviction_lists where slug = ${slug}`;

      if (existing.length > 0) {
        // For seed, we might want to update or skip. Let's update to be idempotent but skip for now if no changes needed.
        // Actually, let's just update the members.
        const listId = existing[0].id;
        console.log(`Updating ${slug} (ID: ${listId})`);

        await sql`
          update conviction_lists
          set
            display_name = ${candidate.displayName},
            period = ${candidate.period ?? null},
            theme = ${candidate.theme ?? null},
            sector = ${candidate.sector ?? null},
            region = ${candidate.region ?? null},
            source_url = ${candidate.sourceUrl ?? null},
            source_type = ${candidate.sourceType},
            confidence = ${candidate.confidence},
            review_status = ${candidate.reviewStatus},
            updated_at = now()
          where id = ${listId}
        `;

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
          `;
        }
        updated++;
        continue;
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
      `;

      const listId = rows[0].id;

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
        `;
      }

      console.log(`Imported ${slug} (ID: ${listId})`);
      created++;
    } catch (err) {
      console.error(
        `Failed to import candidate ${candidate.institution} ${candidate.listName}:`,
        err.message,
      );
      failed++;
    }
  }

  console.log(`\nImport Summary:`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed:  ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

importSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
