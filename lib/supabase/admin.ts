import { createClient } from '@supabase/supabase-js'

// Client admin avec service role — utilisé SEULEMENT côté serveur (cron, API routes)
// N'expose JAMAIS cette clé au client

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY

export const supabaseAdmin = (url && serviceKey)
  ? createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null

export function isSupabaseConfigured(): boolean {
  return !!supabaseAdmin
}
