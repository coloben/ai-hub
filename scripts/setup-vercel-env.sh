#!/usr/bin/env bash
# À lancer depuis la racine du repo après: vercel link --project ai-hub-cnb3
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Exporte DATABASE_URL (Supabase → Database → Connection string, mode Transaction)"
  echo "Exemple: postgresql://postgres.khkxpfherpyugfdecmrv:[MOT_DE_PASSE]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"
  exit 1
fi

vercel env rm DATABASE_URL production --yes 2>/dev/null || true
vercel env add DATABASE_URL production <<< "$DATABASE_URL"
vercel env add DATABASE_URL preview <<< "$DATABASE_URL"
vercel env add DATABASE_URL development <<< "$DATABASE_URL"

vercel env add NEXT_PUBLIC_APP_URL production <<< "https://ai-hub-cnb3.vercel.app"

echo "OK — redéploie: git push origin main  (ou vercel deploy --prod)"
