import { Suspense } from 'react'
import { ConvictionListOverlapPageContent } from './ConvictionListOverlapPageContent'

export const dynamic = 'force-dynamic'

export default function ConvictionListOverlapPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConvictionListOverlapPageContent />
    </Suspense>
  )
}
