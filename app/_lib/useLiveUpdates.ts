'use client';

import { useEffect, useRef } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;
function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: false } });
  return client;
}

/**
 * Sunucudan gelen "değişti" sinyalinde `onChange` çağrılır (Supabase Realtime Broadcast).
 * Yedek olarak `fallbackMs` aralıkla ve sekme tekrar öne geldiğinde de yenilenir.
 */
export function useLiveUpdates(topics: (string | null | undefined)[], onChange: () => void, fallbackMs = 30_000) {
  const cb = useRef(onChange);
  useEffect(() => {
    cb.current = onChange;
  });

  const key = topics.filter(Boolean).join('|');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const fire = () => {
      // Art arda gelen sinyalleri tek yenilemede birleştir
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => cb.current(), 250);
    };

    const sb = getClient();
    const channels = sb
      ? key
          .split('|')
          .filter(Boolean)
          .map((topic) => sb.channel(topic).on('broadcast', { event: 'changed' }, fire).subscribe())
      : [];

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') cb.current();
    }, fallbackMs);
    const onVisible = () => {
      if (document.visibilityState === 'visible') fire();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      if (timer) clearTimeout(timer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      channels.forEach((ch) => sb?.removeChannel(ch));
    };
  }, [key, fallbackMs]);
}
