import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // Return a mock client that does nothing (for file-based mode)
    return {
      auth: {
        signInWithOAuth: async () => ({ data: null, error: null }),
        signInWithOtp: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        exchangeCodeForSession: async () => ({ data: { session: null, user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), data: null }), order: () => ({ data: [], error: null }), single: async () => ({ data: null, error: null }), data: null }), data: null }),
        insert: async () => ({ data: null, error: null }),
        update: () => ({ eq: () => ({ data: null, error: null }) }),
        delete: () => ({ eq: () => ({ data: null, error: null }) }),
      }),
      channel: () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}) }),
      removeChannel: () => {},
      rpc: async () => ({ data: null, error: null }),
    } as unknown as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
