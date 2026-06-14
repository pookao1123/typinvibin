import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface BgmTrack {
  name: string;
  url: string;
}

const BUCKET = 'BGM';

/** "Lukrembo - Donut (freetouse.com).mp3" -> "Lukrembo - Donut" */
function cleanTrackName(filename: string): string {
  return filename
    .replace(/\.mp3$/i, '')
    .replace(/\s*\(\s*(freetouse\.com|music by[^)]*|from pixabay[^)]*)\s*\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Lists the BGM playlist for a topic from the Supabase Storage folder
 * `BGM/{topicName}-BGM/`. Returns an empty list when Supabase is
 * unconfigured, the folder is missing, or an error occurs.
 */
export function useTopicBgm(topicName: string): { tracks: BgmTrack[] } {
  const [tracks, setTracks] = useState<BgmTrack[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchTracks = async () => {
      if (!supabase) {
        setTracks([]);
        return;
      }

      try {
        const folder = `${topicName}-BGM`;
        const { data, error } = await supabase.storage.from(BUCKET).list(folder);
        if (error) throw new Error(error.message);
        if (cancelled) return;

        const mp3s = (data ?? []).filter((file) => /\.mp3$/i.test(file.name));
        setTracks(
          mp3s.map((file) => ({
            name: cleanTrackName(file.name),
            url: supabase!.storage.from(BUCKET).getPublicUrl(`${folder}/${file.name}`).data
              .publicUrl,
          }))
        );
      } catch (err) {
        if (!cancelled) {
          console.warn('BGM playlist unavailable:', (err as Error).message);
          setTracks([]);
        }
      }
    };

    fetchTracks();
    return () => {
      cancelled = true;
    };
  }, [topicName]);

  return { tracks };
}
