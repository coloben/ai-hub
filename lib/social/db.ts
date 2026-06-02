import { ensureAllSchemas, getPool as baseGetPool, hasDatabase } from '@/lib/db'

export { hasDatabase }

export function getPool() {
  return baseGetPool()
}

export async function ensureSocialSchema(): Promise<void> {
  return ensureAllSchemas()
}
