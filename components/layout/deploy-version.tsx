export function DeployVersion() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7)
  if (!sha) return null
  return (
    <span className="font-mono text-[9px] text-muted-foreground/40" title="Version déployée">
      · {sha}
    </span>
  )
}
