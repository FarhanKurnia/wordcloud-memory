# WordCloud Memory 🧠

A fun and interactive memory game where you memorize words from a dynamically generated word cloud, then recall them during the guessing phase.

![Game Preview](https://img.shields.io/badge/status-live-success) 
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18.0-cyan)

## 🎮 How to Play

1. **Memorize Phase**: Study the word cloud displayed on screen during the countdown timer
2. **Guessing Phase**: Type words you remember from the cloud
3. **Win**: Find all the words to complete the game!

## ✨ Features

- 🎯 **Adaptive Word Cloud** - Responsive layout that works on any screen size
- ⏱️ **Customizable Timer** - Set your own memorization duration
- 🎨 **Beautiful UI** - Smooth animations with Framer Motion
- 🔊 **Sound Effects** - Optional audio feedback for better game experience
- 📊 **Progress Tracking** - Real-time statistics and completion percentage
- 🌙 **Fullscreen Mode** - Immersive gaming experience
- ⌨️ **Keyboard Shortcuts** - Quick access to game controls
- 📱 **Mobile Friendly** - Works perfectly on touch devices

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion
- **State Management**: React Hooks (useState, useCallback, useEffect, useRef)
- **Deployment**: GitHub Pages with GitHub Actions

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/FarhanKurnia/wordcloud-memory.git
cd wordcloud-memory

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open automatically at `http://localhost:3000`

## 📦 Project Structure

```
wordcloud-memory/
├── src/
│   ├── components/      # Reusable UI components
│   ├── features/        # Game-specific components and hooks
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Page layouts
│   ├── pages/          # Route pages
│   ├── services/       # Business logic services
│   ├── storage/        # Local storage utilities
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions
├── public/             # Static assets
└── docs/              # Documentation
```

## 🎯 Game Features Explained

### Word Cloud Generation
- Dynamically positions words to minimize overlap
- Supports horizontal and vertical text orientations
- Responsive sizing based on available screen space

### Memory System
- Preserves word positions between memorization and guessing phases
- Maintains consistent visual layout for memory retention

### Sound System
- Countdown beeps when time is running low
- Success/failure audio feedback
- Easy toggle on/off

### Scoring & Statistics
- Tracks found vs remaining words
- Calculates completion percentage
- Displays time taken to complete

## 🔧 Development

### Branch Strategy
- `main` - Production branch (auto-deploys to GitHub Pages)
- `develop` - Development branch (testing and features)

### Workflow
1. Create feature branch from `develop`
2. Make changes and test locally
3. Push to `develop` (no deployment triggered)
4. Merge to `main` when ready (triggers deployment)

### Code Quality
- ESLint for code linting
- TypeScript for type safety
- Prettier for code formatting (optional)

## 🌐 Deployment

This project uses GitHub Actions for automatic deployment to GitHub Pages.

**Deployment Process:**
1. Push changes to `main` branch
2. GitHub Actions automatically builds the project
3. Deploys to GitHub Pages
4. Live at: https://farhankurnia.github.io/wordcloud-memory/

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🎮 Keyboard Shortcuts

- `Enter` - Submit guess
- `Escape` - Cancel/Go back
- `F` - Toggle fullscreen
- `S` - Toggle sound
- `R` - Reset game

## 📝 Customization

### Change Word List
Edit `sample-words.txt` to add your own words (one word per line)

### Adjust Timer
Modify `DEFAULT_DURATION` in `src/constants/game.ts`

### Customize Colors
Update Tailwind config in `tailwind.config.js`

## 🐛 Known Issues

None currently! Report issues at: https://github.com/FarhanKurnia/wordcloud-memory/issues

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Farhan Kurnia**

- GitHub: [@FarhanKurnia](https://github.com/FarhanKurnia)
- Project: [WordCloud Memory](https://github.com/FarhanKurnia/wordcloud-memory)

## 🙏 Acknowledgments

- Inspired by classic memory games
- Built with modern web technologies
- Deployed using GitHub Actions

---

**Enjoy the game! 🎉**

Made with ❤️ and TypeScript
