# TypinVibin - Typing Practice Application

## Project Goal

TypinVibin is a minimal, distraction-free typing practice website. Users type topic names to unlock contextual passages, then type those passages word-by-word with real-time character-level feedback. The experience is ambient — background photos, per-topic BGM playlists, and smooth animations make practice feel like vibing, not drilling.

**Repository:** https://github.com/pookao1123/typinvibin

---

## Technology Stack

### Frontend
- **React 19** — UI framework
- **TypeScript** — strict mode (`tsc --noEmit && vite build`)
- **Vite 8** — build tool & dev server (dev port **5180** via `.claude/launch.json`)
- **Tailwind CSS 4.3** — utility-first CSS (`@tailwind` directives in `src/styles/globals.css`)

### External Services
- **Supabase** — PostgreSQL DB (topics + contexts) + Storage (BGM audio files)
- **Unsplash** — background photos (demo key: 50 req/hr; cached to `localStorage`)
- **Google Gemini** — daily context generation via `scripts/generate-contexts.mjs`

### Environment Variables
| Variable | Used by | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | frontend | Supabase anon (read-only) key |
| `VITE_UNSPLASH_ACCESS_KEY` | frontend | Unsplash API key |
| `GEMINI_API_KEY` | script only | Gemini text generation |
| `SUPABASE_SERVICE_KEY` | script only | Supabase write access |

---

## Project Structure

```
TypinVibin/
├── src/
│   ├── components/
│   │   ├── TopicNameInput.tsx        # Phase 1: type topic name
│   │   ├── WordProgressionInput.tsx  # Phase 2: type context word-by-word
│   │   ├── CharacterDisplay.tsx      # single character + feedback
│   │   ├── BackgroundFader.tsx       # crossfading background photo layers
│   │   └── SettingsPanel.tsx         # gear-icon settings dropdown
│   ├── data/
│   │   └── topics.ts                 # static fallback (9 topics + contexts)
│   ├── hooks/
│   │   ├── useTopics.ts              # topic list from Supabase (falls back to topics.ts)
│   │   ├── useTopicContexts.ts       # context pool per topic from Supabase
│   │   └── useTopicBgm.ts            # BGM playlist per topic from Supabase Storage
│   ├── lib/
│   │   └── supabase.ts               # Supabase client (null when unconfigured)
│   ├── utils/
│   │   ├── unsplash.ts               # Unsplash fetch + localStorage cache
│   │   ├── wordDetection.ts          # splitContextIntoWords()
│   │   └── wordProgression.ts        # getCurrentWord/Char, hasMoreChars/Words, etc.
│   ├── styles/
│   │   └── globals.css               # Tailwind + all custom CSS / animations
│   ├── settings.ts                   # Settings type, loadSettings, saveSettings
│   ├── App.tsx                       # root component — state, routing, BGM, BG
│   └── main.tsx                      # React entry point
├── scripts/
│   └── generate-contexts.mjs         # daily Gemini → Supabase context generation
├── public/
├── .claude/
│   └── launch.json                   # dev server config (port 5180)
├── .env.example
├── tsconfig.json
├── vite.config.js
├── package.json
└── CLAUDE.md
```

---

## Supabase Schema

```
topic_table                     context_table
-----------                     -------------
id          int8 pk             id          int8 pk
created_at  timestamptz         created_at  timestamptz
topic_name  text                context     text
                                topic_id    int8 fk -> topic_table.id
```

- RLS enabled; `anon` role is read-only. Script uses service key to write.
- Max 10 contexts per topic (oldest deleted on insert of 11th).
- BGM audio lives in Supabase Storage bucket `BGM`, folder `{TopicName}-BGM/` (e.g. `Nature-BGM/`).

### Topics (9 in DB)
Nature, City, Night, Waterfall, Ocean, Forest, Desert, Mountain, Hills

---

## Hooks

### `useTopics()` → `{ topics, loading, error }`
- Fetches `topic_table` ordered by `id`; maps rows → `{ id, name }`.
- Starts with `loading: true`, empty array → UI shows "Loading…" until resolved.
- Falls back to `staticFallback()` (maps `src/data/topics.ts`) when Supabase is null, errors, or returns 0 rows.
- `cancelled` cleanup pattern prevents state updates after unmount.

### `useTopicContexts(topicName)` → `{ contexts }`
- Fetches context pool for a topic from `context_table`.
- Empty string input → returns static fallback immediately (called unconditionally with `currentTopic?.name ?? ''`).

### `useTopicBgm(topicName)` → `{ tracks }`
- Lists `{TopicName}-BGM/` in Supabase Storage; returns `{ name, url }` tracks.
- Cleans display names (strips `.mp3`, `(freetouse.com)`, `( Music by ... )`).
- Empty/missing folder or unconfigured Supabase → empty array, header shows `—`.

---

## App.tsx — Key State & Flow

```
topics (from useTopics) → currentTopic = topics[currentTopicIndex]
  ↓
stage: 'topic'  →  user types topic name character-by-character
  ↓ (length matches + contexts loaded)
stage: 'context'  →  selectedContext (rotates through pool per visit)
  ↓ (all words typed)
handleContextComplete() → advance topic (loop / shuffle / lock)
```

**Guards for async topic load:**
- `currentTopic` can be `undefined` during initial load; all accesses use `currentTopic?.name` or `if (!currentTopic) return`.
- `contexts.length > 0` required before advancing to context stage (ensures context hook has resolved).
- Arrow buttons and BGM skip disabled when `topics.length === 0`.

**Playback modes** (persisted in `localStorage` key `typinvibin_settings`):
| Mode | Behavior |
|---|---|
| loop | Advance to next topic in sequence after context complete |
| shuffle | Jump to random different topic |
| lock | Stay on current topic; only ‹ › change it |

---

## WordProgressionInput.tsx — Word Animation System

### Exit animation (`.word-exit`)
When the user completes a word, the finished word is kept mounted briefly as an `exiting` ghost:
```typescript
const [exiting, setExiting] = useState<{
  word: string;
  correctness: Record<number, boolean>;
  id: number;
} | null>(null);
```
- Set `exiting` with the completed word's final correctness map before advancing `wordIndex`.
- Ghost renders with `.word-display.word-exit` — plays `wordExit` keyframe (pan up + fade out, 0.5s).
- Cleared on `animationend` OR by a 700ms `setTimeout` fallback (hidden tabs never fire `animationend`).

### Enter animation (`.word-display` / `wordRise`)
- New current word slides up from the preview position/size (`translateY(45%) scale(0.55)` → origin).
- Duration: **0.5s** `ease-out`.

### Next-word preview (`.word-next`)
- Shown below current word at **55%** of the main font size, dimmed.
- Plays `nextWordIn` (slide up from 40%, 0.5s) on each new word.

### `completeWord(finalCorrectness)` pattern
- Accepts the final correctness map (including current char) as a parameter — avoids stale closure on `charCorrectness`.
- Caller: `completeWord({ ...charCorrectness, [charIndex]: isCorrect })`.

---

## Background System (`src/utils/unsplash.ts`)

- `fetchTopicImage(query)` — returns cached URL if available, else fetches and caches.
- `fetchFreshTopicImage(query)` — bypasses cache (used by periodic bg randomizer).
- Cache persisted to `localStorage` key `typinvibin_bg_cache` as a JSON object `{ [query]: url }`.
- Unsplash demo key limit: 50 req/hr. localStorage cache prevents re-fetching on reload.
- Background crossfades via `BackgroundFader` component with `bgFadeIn` keyframe.

---

## CSS Animation Reference (`src/styles/globals.css`)

| Class / Keyframe | Duration | Purpose |
|---|---|---|
| `wordRise` | 0.5s | New word enters from preview position |
| `wordExit` | 0.5s | Finished word pans up + fades out |
| `nextWordIn` | 0.5s | Next-word preview slides in from below |
| `topicBegin` | 0.6s | Topic name entry animation |
| `bgFadeIn` | 0.8s | Background photo crossfade |
| `blink` | 1s loop | Cursor underline blink |
| `slideIn` | 0.2s | Cursor slide on advance |
| `marquee` | 10s loop | BGM track name scrolling |

### CSS custom properties
```css
--bg, --panel, --border, --text, --dim  /* theme tokens */
--font-scale   /* multiplied into all font-size clamps */
--bg-opacity   /* background photo opacity */
```

---

## Settings

Persisted to `localStorage` key `typinvibin_settings`:

| Setting | Type | Default | Notes |
|---|---|---|---|
| `theme` | `'light' \| 'dark'` | `'light'` | Sets `data-theme` on `<html>` |
| `fontScale` | number | `1` | Multiplied into `clamp()` font sizes |
| `bgOpacity` | number | `0.2` | Background photo opacity |
| `bgInterval` | number | `0` | Seconds between background refreshes (0 = off) |
| `bgmOn` | boolean | `true` | BGM on/off |
| `bgmVolume` | number | `0.4` | BGM volume (0–1) |
| `bgmFade` | number | `2` | Fade in/out duration in seconds |
| `playback` | `'loop' \| 'shuffle' \| 'lock'` | `'loop'` | Topic progression mode |

---

## Daily Context Generation Script

```bash
# From project root — uses .env automatically
node scripts/generate-contexts.mjs
```

- Reads topics from `topic_table`; skips any topic that already has a context with today's date.
- Calls Gemini (`gemini-flash-latest` default; override with `GEMINI_MODEL` env var).
- Enforces 10-row cap per topic (deletes oldest by `created_at`).
- Requires: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.

---

## Development

```bash
npm install
npm run dev      # Vite dev server — port 5180
npm run build    # tsc --noEmit && vite build
npm run preview
```

Build check is `tsc --noEmit && vite build` — both must pass.

---

## Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| Background not showing | Unsplash 403 rate limit | Wait ~1hr; localStorage cache will serve stale URLs |
| Exit animation stuck | Hidden tab suppresses `animationend` | 700ms fallback timeout clears `exiting` state |
| Topics not loading | Supabase unconfigured | App falls back to `src/data/topics.ts` automatically |
| Backspace not working | Stale closure on handler | Verify `handleBackspace` is in `useCallback` |
| `tsc` fails after edits | `currentTopic` may be undefined | Use optional chaining `currentTopic?.name`; guard effects with `if (!currentTopic) return` |

---

## Future Enhancements

- [ ] WPM / accuracy tracking
- [ ] Score leaderboard
- [ ] Custom topic creation
- [ ] User accounts & history
- [ ] Multi-language support
