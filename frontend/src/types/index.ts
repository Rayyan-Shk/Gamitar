import { Socket } from "socket.io-client";

export interface GridCell {
  value: string;
  lastUpdated: number;
  updatedBy: string;
}

export interface GridState {
  cells: GridCell[][];
  onlinePlayers: number;
}

export interface GridUpdate {
  row: number;
  col: number;
  value: string;
  playerId: string;
  timestamp: number;
}

export interface HistoryEntry {
  timestamp: number;
  state: GridCell[][];
  onlinePlayers: number;
  updates: GridUpdate[];
}

export interface HistoricalState extends GridState {
  timestamp: number;
}

export interface GridProps {
  socket: Socket;
  playerId: string;
}