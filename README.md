# TypinVibin - Mindful Typing Practice

A minimal, distraction-free typing practice website designed for focused, contemplative typing sessions. Each topic comes with a meaningful context that encourages reflection and presence while practicing typing.

## Features

- **8 Meaningful Topics**: Nature, City, Night, Waterfall, Ocean, Forest, Desert, Mountain
- **Real-time Feedback**: Visual indicators for correct/incorrect typing
- **Progress Tracking**: Character count and completion percentage with animated progress bar
- **Auto-Advance**: Automatically moves to the next topic when current one is completed
- **Minimal Design**: Clean, distraction-free interface inspired by meditation apps
- **Responsive**: Works seamlessly on desktop and mobile devices
- **Hot Reload**: Development server with instant updates

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/typinvibin.git
cd typinvibin
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The app will open automatically at `http://localhost:5174`

## Usage

1. Start typing the context text for the current topic
2. Watch the progress bar fill as you type
3. Complete the context perfectly to auto-advance to the next topic
4. Continue through all 8 topics

## Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── TopicDisplay.jsx      # Shows current topic name and counter
│   ├── ContextDisplay.jsx    # Displays text with typed/untyped feedback
│   ├── TypingInput.jsx       # Input field for typing
│   └── Progress.jsx          # Progress bar and statistics
├── data/
│   └── topics.js             # Topic and context data
├── styles/
│   └── globals.css           # Minimal theme styling
├── App.jsx                   # Main app component
└── main.jsx                  # Entry point
```

## Technologies Used

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Styling with CSS variables for theming

## Features to Come

- WPM (Words Per Minute) tracking
- Session statistics and history (localStorage)
- Dark mode toggle
- Custom topic upload
- Backend API for topic management

## License

MIT

## Contributing

Feel free to fork this project and submit pull requests!

---

Made with ❤️ for mindful typing practice
