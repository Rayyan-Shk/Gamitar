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