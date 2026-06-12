import { useState, useEffect } from 'react';

interface Layer {
  url: string;
  id: number;
}

/**
 * Stacks background images and crossfades when the URL changes:
 * each new image fades in over the previous one, which is removed
 * once the fade finishes.
 */
function BackgroundFader({ url }: { url: string | null }) {
  const [layers, setLayers] = useState<Layer[]>([]);

  useEffect(() => {
    if (!url) return;
    // Keep at most two layers: the outgoing one and the incoming one
    setLayers((prev) => [...prev, { url, id: Date.now() }].slice(-2));
  }, [url]);

  const handleFadeEnd = (id: number) => {
    // The new layer is fully opaque — drop the old one behind it
    setLayers((prev) => (prev.length > 1 ? prev.filter((l) => l.id === id) : prev));
  };

  return (
    <div className="bg-stack" aria-hidden="true">
      {layers.map((layer) => (
        <div
          key={layer.id}
          className="bg-layer"
          style={{ backgroundImage: `url(${layer.url})` }}
          onAnimationEnd={() => handleFadeEnd(layer.id)}
        />
      ))}
    </div>
  );
}

export default BackgroundFader;
