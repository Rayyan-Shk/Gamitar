# Grid Multiplayer

## Overview

Grid Multiplayer is a real-time collaborative web application where players can interact on a shared 10x10 grid. Players can place Unicode characters in grid blocks while seeing other players' updates in real-time.

## Screenshots

![Grid Multiplayer Screenshot 1](/frontend/public/Main.png)
*Main game interface showing the 10x10 grid and online players*

![Grid Multiplayer Screenshot 2](/frontend/public/History.png)
*Historical view showing previous grid states*

## Features

### Core Features
- ✅ 10x10 interactive grid with Unicode character placement
- ✅ Real-time updates across all connected players
- ✅ Live player count display
- ✅ Shared grid state among all players
- ✅ One-minute cooldown timer between moves
- ✅ Historical view of all grid updates

### Technical Features
-  Real-time synchronization using Socket.IO
-  Redis for state management
-  Modern UI with shadcn/ui and Tailwind CSS
-  TypeScript implementation (frontend and backend)
-  Comprehensive testing with Jest
-  Continuous Integration pipeline

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Socket.IO Client

### Backend
- Node.js
- Express
- TypeScript
- Socket.IO
- Redis
- Jest

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Docker
- npm or yarn

### Environment Setup

1. Clone the repository
```bash
git clone https://github.com/Rayyan-Shk/Gamitar.git
cd Gamitar
```

2. Start Redis using Docker
```bash
docker run --name redis -d -p 6379:6379 redis
```

### Backend Setup

1. Navigate to backend directory
```bash
cd backend
```

3. change env.example to .env
```bash
cp .env.example .env
# change env.example file to .env
```

2. Run tests to ensure everything is working
```bash
npm run test
```

5. Start the backend server
```bash
npm start
```

### Frontend Setup

1. Navigate to frontend directory
```bash
cd frontend
```

3. Set up environment variables
```bash
cp .env.example .env
# change env.example file to .env
```

4. Start the frontend development server
```bash
npm start
```

## Continuous Integration

This project uses GitHub Actions for Continous Integration

Check `.github/workflows` directory for CI configuration details.

## Project Structure

```
grid-multiplayer/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── types/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── __test__/
│   │   ├── services/
│   │   └── types/
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
