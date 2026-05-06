import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Dummy client qui ne casse pas le build/SSG quand les env vars sont absentes

function createChainable(finalResult: any = { data: [], error: null }): any {
  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === 'then') {
        return (onFulfilled: any) => Promise.resolve(finalResult).then(onFulfilled)
      }
      return createChainable(finalResult)
    },
    apply(target, thisArg, args) {
      return createChainable(finalResult)
    }
  }
  return new Proxy(() => {}, handler)
}

const dummyServerClient = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  },
  from: () => createChainable(),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ error: new Error('Supabase non configuré') }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
  rpc: () => Promise.resolve({ data: null, error: null }),
} as any

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    // SSG/prerender : retourne un dummy pour ne pas casser le build
    return dummyServerClient
  }
  const cookieStore = await cookies()
  return createServerClient(url, key,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
