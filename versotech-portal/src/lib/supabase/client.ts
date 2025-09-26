import { createBrowserClient } from '@supabase/ssr'

const SESSION_MARKER_KEY = 'verso-session-id'

const clearStoredAuth = () => {
  if (typeof window === 'undefined') return

  const removeKeys = (storage: Storage) => {
    Object.keys(storage).forEach((key) => {
      if (key.includes('supabase') || key.includes('sb-')) {
        storage.removeItem(key)
      }
    })
  }

  removeKeys(window.localStorage)
  removeKeys(window.sessionStorage)
}

const shouldDiscardSession = (value: string) => {
  if (typeof window === 'undefined') return false

  try {
    const parsed = JSON.parse(value)

    if (parsed?.expires_at && parsed.expires_at * 1000 < Date.now()) {
      return true
    }

    if (typeof parsed?.access_token === 'string') {
      const tokenParts = parsed.access_token.split('.')

      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(window.atob(tokenParts[1]))
          if (payload?.exp && payload.exp * 1000 < Date.now()) {
            return true
          }
        } catch {
          return true
        }
      }
    }
  } catch {
    return true
  }

  return false
}

// Client-side Supabase client with session-scoped storage
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: (key) => {
            if (typeof window === 'undefined') {
              return null
            }

            const sessionMarker = sessionStorage.getItem(SESSION_MARKER_KEY)
            if (!sessionMarker) {
              console.info('[auth] No active session marker detected - clearing cached credentials')
              clearStoredAuth()
              return null
            }

            const sessionValue = sessionStorage.getItem(key)
            if (sessionValue) {
              if (shouldDiscardSession(sessionValue)) {
                sessionStorage.removeItem(key)
                return null
              }

              return sessionValue
            }

            const legacyValue = localStorage.getItem(key)
            if (legacyValue) {
              if (shouldDiscardSession(legacyValue)) {
                localStorage.removeItem(key)
                return null
              }

              sessionStorage.setItem(key, legacyValue)
              localStorage.removeItem(key)
              return legacyValue
            }

            return null
          },
          setItem: (key, value) => {
            if (typeof window === 'undefined') {
              return
            }

            if (key.includes('supabase') && value) {
              sessionStorage.setItem(SESSION_MARKER_KEY, Date.now().toString())
            }

            sessionStorage.setItem(key, value)
            localStorage.removeItem(key)
          },
          removeItem: (key) => {
            if (typeof window === 'undefined') {
              return
            }

            sessionStorage.removeItem(key)
            localStorage.removeItem(key)
          },
        },
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
        storageKey: 'supabase.auth.token',
      },
    }
  )
}

// Default client instance
export const supabase = createClient()
