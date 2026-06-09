/** Human-readable Arena model label from slug or mirror string */

const TOKEN_LABELS: Record<string, string> = {
  claude: 'Claude',
  gpt: 'GPT',
  gemini: 'Gemini',
  grok: 'Grok',
  deepseek: 'DeepSeek',
  llama: 'Llama',
  qwen: 'Qwen',
  qwen3: 'Qwen3',
  muse: 'Muse',
  spark: 'Spark',
  opus: 'Opus',
  sonnet: 'Sonnet',
  haiku: 'Haiku',
  pro: 'Pro',
  flash: 'Flash',
  maverick: 'Maverick',
  scout: 'Scout',
  glm: 'GLM',
  meta: 'Meta',
}

function isDisplayName(raw: string): boolean {
  return /\s/.test(raw) && /[A-Z]/.test(raw)
}

function formatVersionTokens(tokens: string[], start: number): { text: string; end: number } {
  const nums: string[] = []
  let i = start
  while (i < tokens.length && /^\d+$/.test(tokens[i])) {
    nums.push(tokens[i])
    i++
  }
  if (nums.length === 0) return { text: '', end: start }
  if (nums.length >= 2) return { text: `${nums[0]}.${nums[1]}`, end: i }
  return { text: nums[0], end: i }
}

export function formatArenaModelName(raw: string): string {
  if (!raw) return raw
  if (isDisplayName(raw)) return raw

  let slug = raw.toLowerCase().trim()
  let suffix = ''

  if (slug.endsWith('-thinking')) {
    slug = slug.slice(0, -'-thinking'.length)
    suffix = ' (Thinking)'
  } else if (slug.endsWith('-high')) {
    slug = slug.slice(0, -'-high'.length)
    suffix = ' (High)'
  }

  const tokens = slug.split('-').filter(Boolean)
  const parts: string[] = []
  let i = 0

  while (i < tokens.length) {
    const t = tokens[i]

    if (t === 'preview' || t === 'beta' || t === 'beta1') {
      parts.push(t === 'beta1' ? 'Beta1' : t.charAt(0).toUpperCase() + t.slice(1))
      i++
      continue
    }

    if (TOKEN_LABELS[t]) {
      parts.push(TOKEN_LABELS[t])
      i++
      if (t === 'opus' || t === 'sonnet' || t === 'haiku') {
        const ver = formatVersionTokens(tokens, i)
        if (ver.text) {
          parts.push(ver.text)
          i = ver.end
        }
      }
      continue
    }

    if (/^\d+$/.test(t)) {
      const ver = formatVersionTokens(tokens, i)
      parts.push(ver.text)
      i = ver.end
      continue
    }

    parts.push(t.charAt(0).toUpperCase() + t.slice(1))
    i++
  }

  return `${parts.join(' ')}${suffix}`.replace(/\s+/g, ' ').trim()
}
