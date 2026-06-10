# TypinVibin - Typing Practice Application

## Project Overview

TypinVibin is a minimal, distraction-free typing practice website designed to help users improve their typing speed and accuracy. The application features a two-phase typing system where users first type topic names, then type contextual passages word-by-word with real-time character-level feedback.

**Key Features:**
- Two-phase typing system (topic → context)
- Character-level feedback (green for correct, red for incorrect)
- Typo tolerance (users can complete words with mistakes)
- Current topic display in navbar
- Instant word/topic transitions
- Minimalist, clean UI
- Tailwind CSS styling

**Live Demo:** http://localhost:5174 (dev) or deployed URL
**Repository:** https://github.com/pookao1123/typinvibin

---

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite 8.0.16** - Build tool & dev server
- **Tailwind CSS 4.3.0** - Utility-first CSS framework
- **Node.js** - JavaScript runtime

### Backend (New)
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **PostgreSQL/SQLite** - Database (optional)
- **RESTful API** - Backend communication

---

## Project Structure

```
TypinVibin/
├── src/
│   ├── components/
│   │   ├── TopicNameInput.jsx       # Phase 1: Type topic name
│   │   ├── WordProgressionInput.jsx  # Phase 2: Type context word-by-word
│   │   └── CharacterDisplay.jsx      # Individual character with feedback
│   ├── data/
│   │   └── topics.js                 # All 8 typing topics & contexts
│   ├── utils/
│   │   ├── wordDetection.js          # Word boundary detection
│   │   └── wordProgression.js        # Character progression helpers
│   ├── styles/
│   │   └── globals.css               # Tailwind + custom styles
│   ├── App.jsx                       # Main app component & routing
│   └── main.jsx                      # React entry point
├── public/
│   └── index.html                    # HTML template
├── backend/                          # NEW: Node.js backend
│   ├── server.js                     # Express server entry
│   ├── routes/
│   │   └── topics.js                 # Topic API endpoints
│   ├── controllers/
│   │   └── topicController.js        # Topic business logic
│   └── models/
│       └── Topic.js                  # Topic data model
├── tailwind.config.js                # Tailwind theme config
├── postcss.config.js                 # PostCSS pipeline
├── vite.config.js                    # Vite build config
├── package.json                      # Project dependencies
└── CLAUDE.md                         # This file
```

---

## Component Architecture

### App.jsx (Main Component)
- **Role:** Root component managing application state and routing
- **State:**
  - `currentTopicIndex` - Current topic being practiced
  - `stage` - Current typing phase ('topic', 'context', 'completed')
  - `topicInput` - User input for topic name
- **Flow:** topic → context → completed → next topic (cycles through 8 topics)

### TopicNameInput.jsx (Phase 1)
- **Role:** Handles typing of topic names
- **Features:**
  - Global window keydown listener
  - Character-by-character input validation
  - Red/green feedback for incorrect/correct input
  - Backspace support
  - Typo tolerance (can complete with typos)
- **Props:** `topicName`, `userInput`, `onInputChange`, `isComplete`

### WordProgressionInput.jsx (Phase 2)
- **Role:** Handles word-by-word context typing
- **State Management:**
  - `wordIndex` - Current word position
  - `charIndex` - Current character position
  - `userInput` - Character being typed at current position
  - `charCorrectness` - Tracks correct/incorrect for all positions
  - `isWordComplete` - Visual feedback when word is done
- **Features:**
  - Character position tracking
  - Persistent red/green feedback for all typed characters
  - Automatic word boundary detection
  - Special character auto-skip (spaces, punctuation)
  - Instant word transitions (no delay)
  - Instant topic advancement
  - Unified backspace handling
- **Key Logic:**
  - `handleCharacterInput()` - Process typed characters
  - `handleBackspace()` - Handle deletions
  - `completeWord()` - Move to next word/topic
  - `renderWord()` - Display current word with feedback

### CharacterDisplay.jsx
- **Role:** Render individual character with visual feedback
- **Props:**
  - `char` - Character to display
  - `status` - 'correct' | 'incorrect' | 'untyped'
  - `isCursor` - Show cursor under character
- **Styles:** Green (#52b788) for correct, Red (#e63946) for incorrect, Gray for untyped

---

## Typing System Explanation

### Phase 1: Topic Input
1. User sees topic name (e.g., "Nature")
2. User types characters to match
3. Characters show:
   - Green if typed correctly
   - Red if typed incorrectly
   - Gray if not typed yet
4. User can type with typos (typo tolerance)
5. When character count matches topic length → auto-advance to Phase 2

### Phase 2: Context Progression
1. Context text split into words
2. User types current word character-by-character
3. Current character shows cursor
4. When typed (correct or incorrect):
   - Character feedback displays (green/red)
   - Cursor advances to next character
5. Special characters (spaces, punctuation) auto-skip
6. When all characters in word typed → auto-advance to next word
7. When all words in context typed → instantly jump to next topic

**Key Design Decisions:**
- Typo tolerance: Users complete words even with mistakes (red feedback)
- Instant transitions: No animation delays blocking input
- Character feedback: All positions show persistent red/green
- Global listeners: Keyboard capture works anywhere on page

---

## Data Structure

### Topics (8 Total)
Located in `src/data/topics.js`:

```javascript
{
  name: "Nature",        // 6 characters
  context: "Immerse yourself in the quiet power of..."  // Full context text
}
```

**Topics Included:**
1. Nature
2. City
3. Night
4. Waterfall
5. Ocean
6. Forest
7. Desert
8. Mountain

---

## Key Features & Implementation

### 1. Character-Level Feedback
- Real-time validation as user types
- Comparison: `userInput[charIndex] === currentChar`
- Visual feedback via CSS classes: `.char-correct`, `.char-incorrect`

### 2. Typo Tolerance
- Cursor advances regardless of character correctness
- `charCorrectness` state tracks all positions
- Display shows accurate red/green for each position
- Users can complete words/topics with mistakes

### 3. Word Boundary Detection
- `splitContextIntoWords()` splits on spaces & punctuation
- Handles: spaces, periods, commas, apostrophes, dashes, etc.
- Special character positions auto-skip without user input

### 4. Global Keyboard Capture
- Window-level `keydown` listener
- Captures input from anywhere on page
- Filters control key combos (Ctrl, Alt, Meta)
- Single character or Backspace processing

### 5. State Coordination
- `charIndex` - Position in current word
- `wordIndex` - Position in context
- `userInput` - Character being typed at current position
- `charCorrectness` - Maps charIndex → boolean (correct/incorrect)
- All updates coordinated through React state setters

### 6. Responsive Design
- Topic text: `clamp(3rem, 10vw, 8rem)` - scales with viewport
- Mobile: Reduced padding and font sizes
- Tablet: Optimized spacing
- Desktop: Full experience

---

## Recent Fixes & Improvements

### Critical Bugs Fixed
1. **Stale Closure Bug** (Commit 63d7282)
   - Context phase input completely broken
   - Fixed by wrapping handlers in `useCallback` with proper dependencies

2. **Typo Tolerance Implementation** (Commit 915968f)
   - Characters were blocking progression
   - Added `charCorrectness` state to track feedback
   - Cursor now advances regardless of correctness

3. **Backspace Double-Jump** (Commit 5743836)
   - Second backspace was jumping 2 characters
   - Unified backspace logic in single callback
   - Now moves exactly 1 position per press

4. **Input Blocking During Transitions** (Commit dc96dba)
   - setTimeout delays were blocking input
   - Removed all transition delays
   - Instant word/topic changes

5. **Tailwind CSS Migration** (Commit 88db3fe)
   - Refactored from custom CSS to Tailwind
   - Reduced CSS size (4.18 kB → 3.41 kB)
   - Better maintainability & consistency

### Feature Additions
- Current topic display under navbar (Commit 5ad3ac1)
- Instant topic transitions (Commit 7fd1711)
- Typo tolerance system (Commit 915968f)

---

## Styling System

### Tailwind CSS Setup
- **Framework:** Tailwind CSS v4.3.0
- **PostCSS:** `@tailwindcss/postcss` plugin
- **Config:** `tailwind.config.js` with custom theme

### Custom Colors
```javascript
colors: {
  success: '#52b788',  // Green - correct
  error: '#e63946',    // Red - incorrect
}
```

### Custom Animations
```javascript
animation: {
  blink: 'blink 1s infinite',        // Cursor blink
  slideIn: 'slideIn 0.2s ease-out',  // Cursor slide
  fadeInUp: 'fadeInUp 0.5s ease-out' // Completion fade
}
```

### Key Classes
- `.char-correct` - Green text with glow
- `.char-incorrect` - Red text with glow
- `.char-untyped` - Gray with opacity
- `.cursor` - Animated underline
- `.app-header` - Top navbar
- `.word-display` - Current word display

---

## Event Handling

### Window Keydown Listener
```javascript
useEffect(() => {
  const handleKeyDown = (event) => {
    // Filter control keys
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    
    const char = event.key;
    
    // Process character or backspace
    if (char.length === 1) {
      handleCharacterInput(char);
    } else if (char === 'Backspace') {
      handleBackspace();
    }
    
    event.preventDefault();
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleCharacterInput, handleBackspace]);
```

### Character Progression Logic
1. User presses key
2. `handleCharacterInput()` called with character
3. Compare with expected character
4. Update `charCorrectness[charIndex]`
5. Advance cursor if more characters
6. Or complete word/context if done
7. Display updates via re-render

---

## Backend Integration (Planned)

### API Endpoints
```
GET    /api/topics              # Get all topics
GET    /api/topics/:id          # Get single topic
POST   /api/scores              # Save user score
GET    /api/scores/:userId      # Get user's past scores
DELETE /api/scores/:id          # Delete score
```

### Data Models
- **Topic:** id, name, context, difficulty
- **Score:** id, userId, topicId, wpm, accuracy, timestamp

### Server Structure
- **Express.js** - HTTP server
- **Routes** - `/api/topics`, `/api/scores`
- **Controllers** - Business logic
- **Models** - Database schema
- **Middleware** - Error handling, logging

---

## Development Workflow

### Running Frontend Only
```bash
npm install
npm run dev    # Start Vite dev server (port 5174)
npm run build  # Build for production
npm run preview # Preview production build
```

### Running Frontend + Backend
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm install
npm run dev    # Start Express server (port 3000)
```

### Git Workflow
- Commit for each feature/fix
- Push to GitHub main branch
- Use conventional commit messages
- Include Co-Authored-By footer

---

## Configuration Files

### vite.config.js
- Vite bundler config
- React plugin
- Dev server port 5174

### tailwind.config.js
- Custom color theme
- Custom animations
- Font size extensions
- Content paths for CSS purging

### postcss.config.js
- Tailwind PostCSS plugin
- Autoprefixer for vendor prefixes

### package.json
- Frontend dependencies (React, Vite)
- Backend dependencies (Express, etc.)
- Scripts: dev, build, preview
- Version management

---

## Performance Considerations

### Bundle Size
- CSS: 3.41 kB (gzipped)
- JS: 63.07 kB (gzipped)
- Total: ~66 kB gzipped

### Optimization Techniques
- Tailwind CSS purging (unused styles removed)
- React 19 optimizations
- useCallback for stable function references
- No unnecessary re-renders
- Event delegation (single window listener)

### Responsive Design
- CSS Grid/Flexbox for layout
- clamp() for fluid typography
- Mobile-first media queries
- Touch-friendly interaction areas

---

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

**Requirements:**
- ES6+ JavaScript support
- CSS Grid & Flexbox
- Keyboard event support
- No IE11 support (uses modern syntax)

---

## Future Enhancements

### Possible Features
- [ ] User accounts & authentication
- [ ] Score tracking & leaderboard
- [ ] Custom topic creation
- [ ] WPM (words per minute) calculation
- [ ] Accuracy percentage tracking
- [ ] Practice history
- [ ] Difficulty levels
- [ ] Theme customization
- [ ] Sound feedback
- [ ] Dark mode
- [ ] Multi-language support

### Backend Expansion
- [ ] User management
- [ ] Score persistence
- [ ] Statistics & analytics
- [ ] Real-time multiplayer
- [ ] Cloud sync

---

## Troubleshooting

### Issue: Backspace not working
- **Check:** Event listener is attached (`window.addEventListener`)
- **Solution:** Verify `handleBackspace` callback is memoized

### Issue: Characters not showing correct color
- **Check:** `charCorrectness` state is being updated
- **Solution:** Verify comparison logic in `renderWord()`

### Issue: Word transition too slow
- **Check:** No setTimeout delays in word completion
- **Solution:** Confirm `completeWord()` calls state setters immediately

### Issue: Typing blocked during transitions
- **Check:** No long setTimeout/delays in handlers
- **Solution:** Ensure state updates happen synchronously

### Issue: Build fails with Tailwind
- **Check:** PostCSS & Tailwind installed correctly
- **Solution:** `npm install && npm run build`

---

## Documentation & Comments

### Code Comments
- Explain "why", not "what"
- Mark complex logic with comments
- Use JSDoc for functions
- Update comments when refactoring

### Commit Messages
- Use imperative mood ("Fix", not "Fixed")
- First line: 50 characters max
- Detailed explanation: Wrap at 72 characters
- Reference issues: "Closes #123"
- Include Co-Authored-By for pair programming

---

## Resources

- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Vite Docs:** https://vitejs.dev
- **JavaScript MDN:** https://developer.mozilla.org

---

## License

MIT License - See LICENSE file for details

---

## Author

Created with ❤️ for typing practice
