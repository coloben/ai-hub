'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function LiveStatusBar() {
  const [pulse, setPulse] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => !prev)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-bg/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Simple Live Indicator - no details */}
          <div className="flex items-center gap-2">
            <span 
              className={`relative flex h-2 w-2 rounded-full ${
                pulse ? 'bg-success' : 'bg-success/60'
              }`}
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
            </span>
            <span className="text-xs font-medium text-success">LIVE</span>
          </div>

          {/* Minimal text */}
          <span className="text-xs text-text-faint">Intelligence en continu</span>
        </div>

        {/* Hidden circle - no text, discrete */}
        <Link 
          href="/sys"
          className="h-3 w-3 rounded-full bg-white/10 transition-all hover:bg-white/20 hover:scale-110"
          title=""
        />
      </div>
    </div>
  )
}
