import { Suspense } from 'react'
import AlertsClient from './AlertsClient'

export default function AlertsPage() {
  return (
    <Suspense>
      <AlertsClient />
    </Suspense>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _unused_end() {
}
