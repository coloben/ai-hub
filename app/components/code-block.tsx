'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <pre className="bg-[#0a0a10] border border-border rounded-lg p-3 overflow-x-auto text-xs font-mono text-muted-foreground">
        <code>{code}</code>
      </pre>
      <button
        className="absolute top-2 right-2 p-1.5 rounded-md bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
        aria-label={copied ? 'Copié !' : 'Copier'}
      >
        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-muted-foreground" />}
      </button>
    </div>
  )
}
