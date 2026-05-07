'use client'
import { createBrowserClient } from '@supabase/ssr'

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

const dummyClient = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    signInWithOAuth: () => Promise.resolve({ data: { url: '' }, error: new Error('Supabase non configuré') }),
    signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase non configuré') }),
    signUp: () => Promise.resolve({ data: null, error: new Error('Supabase non configuré') }),
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ error: new Error('Supabase non configuré') }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
  from: () => createChainable(),
  rpc: () => Promise.resolve({ data: null, error: null }),
} as any

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    if (typeof window === 'undefined') {
      // SSG/prerender : retourne un dummy pour ne pas casser le build
      return dummyClient
    }
    throw new Error('Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createBrowserClient(url, key, {
    cookies: {
      getAll() {
        return document.cookie.split(';').filter(c => c.trim()).map(c => {
          const [name, ...rest] = c.trim().split('=')
          return { name: name.trim(), value: rest.join('=') }
        })
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          let cookie = `${name}=${value}`
          if (options?.path) cookie += `; path=${options.path}`
          if (options?.maxAge) cookie += `; max-age=${options.maxAge}`
          if (options?.expires) cookie += `; expires=${new Date(options.expires).toUTCString()}`
          if (options?.domain) cookie += `; domain=${options.domain}`
          if (options?.secure) cookie += '; secure'
          if (options?.sameSite) cookie += `; samesite=${options.sameSite}`
          if (options?.httpOnly) cookie += '; httponly'
          document.cookie = cookie
        })
      },
    },
  })
}
