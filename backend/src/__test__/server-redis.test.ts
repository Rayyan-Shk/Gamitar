// server.test.ts

import Redis from 'ioredis';
import { io } from 'socket.io-client';

describe('Redis and Socket Connectivity', () => {
  
  // Test Redis connection
  it('should connect to Redis server successfully', async () => {
    const redis = new Redis({
      host: 'localhost', // or use your Redis host
      port: 6379, // default Redis port
    });

    await redis.ping()
      .then((response) => {
        expect(response).toBe('PONG'); // Expect PONG response from Redis
        redis.disconnect();
      })
      .catch((error) => {
        console.error('Redis connection failed:', error);
        throw error;
      });
  });

  // Test Socket.io connection
  it('should connect to WebSocket server successfully', (done) => {
    const socket = io('http://localhost:3002'); // Adjust to your socket server URL

    socket.on('connect', () => {
      expect(socket.connected).toBe(true); // Check that socket is connected
      socket.disconnect();
      done();
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      done(error); // Pass error to Jest
    });
  });
});
