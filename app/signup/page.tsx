'use client'

import { useState } from 'react'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { saveLocalProfile } from '@/lib/social/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [handle, setHandle] = useState('')

  function save() {
    if (!displayName.trim() || !handle.trim()) return
    saveLocalProfile({
      displayName: displayName.trim(),
      handle: handle.trim().replace(/[^a-zA-Z0-9_]/g, '_'),
    })
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="max-w-md mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Profil communauté</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pas de mot de passe pour l&apos;instant — choisissez un pseudo pour publier et commenter.
              Compte complet (karma, OAuth) bientôt.
            </p>
            <input
              type="text"
              placeholder="Nom affiché"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted text-sm"
            />
            <input
              type="text"
              placeholder="handle (ex: marie_dev)"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted text-sm font-mono"
            />
            <Button className="w-full" onClick={save} disabled={!displayName.trim() || !handle.trim()}>
              Enregistrer et aller au feed
            </Button>
            <Link href="/" className="block text-center text-sm text-muted-foreground hover:text-accent">
              Retour au feed
            </Link>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
