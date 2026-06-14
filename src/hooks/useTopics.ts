import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { topics as staticTopics } from '../data/topics';

export interface TopicSummary {
  id: number;
  name: string;
}

interface UseTopicsResult {
  topics: TopicSummary[];
  loading: boolean;
  error: string | null;
}

/** Static topic list (id + name) used when Supabase is unavailable. */
function staticFallback(): TopicSummary[] {
  return staticTopics.map((t) => ({ id: t.id, name: t.name }));
}

/**
 * Fetches the topic list from Supabase `topic_table`, ordered by id.
 * Starts in a loading state so the UI can show loading text, and falls
 * back to the static topics from src/data/topics.ts when Supabase is
 * unconfigured, errors, or returns no rows.
 */
export function useTopics(): UseTopicsResult {
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTopics = async () => {
      if (!supabase) {
        setTopics(staticFallback());
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('topic_table')
          .select('id, topic_name')
          .order('id', { ascending: true });

        if (fetchError) throw new Error(fetchError.message);
        if (cancelled) return;

        const fetched = (data ?? [])
          .map((row) => ({ id: row.id as number, name: row.topic_name as string }))
          .filter((t) => Boolean(t.name));
        setTopics(fetched.length > 0 ? fetched : staticFallback());
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        setTopics(staticFallback());
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTopics();
    return () => {
      cancelled = true;
    };
  }, []);

  return { topics, loading, error };
}
