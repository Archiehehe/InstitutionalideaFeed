const target = process.env.SCAN_URL || 'https://wallstreetscout.vercel.app/api/scan/trigger'
const headers = { 'Content-Type': 'application/json' }

if (process.env.CRON_SECRET) {
  headers.Authorization = `Bearer ${process.env.CRON_SECRET}`
}

const response = await fetch(target, {
  method: 'POST',
  headers,
})

const text = await response.text()
console.log(`Scan target: ${target}`)
console.log(`Status: ${response.status}`)
console.log(text)

if (!response.ok) {
  process.exitCode = 1
}
