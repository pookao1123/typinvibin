import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { topics } from '../data/topics';

interface UseTopicContextsResult {
  contexts: string[];
  loading: boolean;
  error: string | null;
}

function staticFallback(topicName: string): string[] {
  const topic = topics.find((t) => t.name === topicName);
  return topic ? [topic.context] : [];
}

/**
 * Fetches all stored contexts for a topic from Supabase.
 * Falls back to the static context from src/data/topics.ts when
 * Supabase is unconfigured, errors, or has no rows for the topic.
 */
export function useTopicContexts(topicName: string): UseTopicContextsResult {
  const [contexts, setContexts] = useState<string[]>(() => staticFallback(topicName));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchContexts = async () => {
      if (!supabase) {
        setContexts(staticFallback(topicName));
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Inner join on topic_table via the topic_id FK, filtered by topic name
        const { data, error: fetchError } = await supabase
          .from('context_table')
          .select('context, topic_table!inner(topic_name)')
          .eq('topic_table.topic_name', topicName)
          .order('created_at', { ascending: true });

        if (fetchError) throw new Error(fetchError.message);
        if (cancelled) return;

        const fetched = (data ?? [])
          .map((row) => row.context as string | null)
          .filter((context): context is string => Boolean(context));
        setContexts(fetched.length > 0 ? fetched : staticFallback(topicName));
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        setContexts(staticFallback(topicName));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchContexts();
    return () => {
      cancelled = true;
    };
  }, [topicName]);

  return { contexts, loading, error };
}
