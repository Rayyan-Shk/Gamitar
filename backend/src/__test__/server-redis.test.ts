// @ts-nocheck
import Redis from 'ioredis';
import { io } from 'socket.io-client';

describe('Redis and Socket Connectivity', () => {
  
  
  it('should connect to Redis server successfully', async () => {
    const redis = new Redis({
      host: 'localhost',
      port: 6379, //default Redis port
    });

    await redis.ping()
      .then((response) => {
        expect(response).toBe('PONG');
        redis.disconnect();
      })
      .catch((error) => {
        console.error('Redis connection failed:', error);
        throw error;
      });
  });

  
  it('should connect to WebSocket server successfully', (done) => {
    const socket = io('http://localhost:3002');

    socket.on('connect', () => {
      expect(socket.connected).toBe(true); //Check that socket is connected
      socket.disconnect();
      done();
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      done(error); 
    });
  });
});
