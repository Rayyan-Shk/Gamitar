import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RedisService, initRedis } from './services/redis'
import { GridCell, GridState, HistoryEntry } from './types';

export const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

let gridState: GridState = {
  cells: Array(10)
    .fill(null)
    .map(() => Array(10).fill({ value: '', lastUpdated: 0, updatedBy: '' })),
  onlinePlayers: 0
};

let onlinePlayers = 0;

(async () => {
  try {
    await initRedis();
    
    // Fetch previous grid state from Redis if available
    const savedState = await RedisService.getGridState();
    if (savedState) {
      gridState.cells = savedState;
    }
  } catch (error) {
    console.error('Server initialization error:', error);
  }
})();

io.on('connection', (socket) => {
  // Handle new connection
  onlinePlayers++;
  io.emit('playerCount', onlinePlayers);

  socket.emit('gridUpdate', {
    cells: gridState.cells,
    onlinePlayers
  });

  // Handle initial state request
  socket.on('requestInitialState', async () => {
    socket.emit('gridUpdate', {
      cells: gridState.cells,
      onlinePlayers
    });
  });

  // Handle history request
  socket.on('requestHistory', async () => {
    try {
      const history = await RedisService.getHistory();
      socket.emit('historicalUpdates', history);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  });

  // Handle historical state request
  socket.on('requestStateAtTimestamp', async (timestamp) => {
    try {
      const historicalState = await RedisService.getHistoryAtTimestamp(timestamp);
      if (historicalState) {
        // Send the complete historical state structure
        socket.emit('historicalState', {
          cells: historicalState.state,
          onlinePlayers: gridState.onlinePlayers,
          timestamp: historicalState.timestamp
        });
      }
    } catch (error) {
      console.error('Error fetching historical state:', error);
    }
  });

  socket.on('updateCell', async (update) => {
    const { row, col, value, playerId, timestamp } = update;

    //Validate update
    if (row < 0 || row >= 10 || col < 0 || col >= 10 || !value) return;
    if (gridState.cells[row][col].value !== '') return;

    //Update grid state
    gridState.cells[row][col] = {
      value,
      lastUpdated: timestamp,
      updatedBy: playerId
    };

    try {
      await RedisService.saveGridState(gridState.cells);

      //Create and save history entry
      const historyEntry: HistoryEntry & { onlinePlayers: number } = {
        timestamp,
        state: JSON.parse(JSON.stringify(gridState.cells)),
        updates: [{
          row,
          col,
          value,
          playerId,
          timestamp
        }],
        onlinePlayers: gridState.onlinePlayers  //Include current online players count
      };
  

      await RedisService.saveHistoryEntry(historyEntry);

      //Broadcast update to all clients
      io.emit('gridUpdate', {
        cells: gridState.cells,
        onlinePlayers: gridState.onlinePlayers
      });
    } catch (error) {
      console.error('Error handling cell update:', error);
    }
  });

  socket.on('requestPlayerCount', () => {
    //current online player count
    io.emit('playerCount', onlinePlayers);
  });

  socket.on('disconnect', () => {
    onlinePlayers--;
    io.emit('playerCount', onlinePlayers);
  });
});

httpServer.on('error', (error) => {
  console.error('Server error:', error);
});


const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;