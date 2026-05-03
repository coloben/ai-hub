import { Suspense } from 'react'
import FeedClient from './FeedClient'

export default function FeedPage() {
  return (
    <Suspense>
      <FeedClient />
    </Suspense>
  )
}
