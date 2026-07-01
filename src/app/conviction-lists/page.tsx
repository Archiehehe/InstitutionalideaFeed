import { ConvictionListsPage } from './ConvictionListsPageContent'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default function ConvictionLists() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConvictionListsPage />
    </Suspense>
  )
}
