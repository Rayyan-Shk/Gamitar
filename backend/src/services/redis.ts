// @ts-nocheck
import { createClient } from 'redis';
import { GridCell, GridState, HistoryEntry } from '../types';

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', err => console.error('Redis Client Error', err));

export const initRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
  }
};

export const RedisService = {
  async saveGridState(state: GridCell[][]) {
    try {
      await redisClient.set('gridState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving grid state:', error);
    }
  },

  async getGridState(): Promise<GridCell[][] | null> {
    try {
      const state = await redisClient.get('gridState');
      return state ? JSON.parse(state) : null;
    } catch (error) {
      console.error('Error getting grid state:', error);
      return null;
    }
  },

  async saveHistoryEntry(entry: HistoryEntry) {
    try {
      await redisClient.zAdd('gridHistory', {
        score: entry.timestamp,
        value: JSON.stringify(entry)
      });
    } catch (error) {
      console.error('Error saving history entry:', error);
    }
  },

  async getHistory(): Promise<HistoryEntry[]> {
    try {
      const entries = await redisClient.zRange('gridHistory', 0, -1);
      return entries.map(entry => JSON.parse(entry));
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  },

  async getHistoryAtTimestamp(timestamp: number): Promise<HistoryEntry | null> {
    try {
      const entries = await redisClient.zRangeByScore(
        'gridHistory',
        0,
        timestamp,
        {
          REV: true,
          LIMIT: {
            offset: 0,
            count: 1
          }
        }
      );
      
      return entries.length > 0 ? JSON.parse(entries[0]) : null;
    } catch (error) {
      console.error('Error getting history at timestamp:', error);
      return null;
    }
  }
};