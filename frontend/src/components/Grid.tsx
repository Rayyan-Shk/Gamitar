import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GridState, HistoryEntry, HistoricalState, GridProps } from '../types';
import * as React from 'react'
import HistoryPanel from './HistoryPanel';
import { Trophy } from 'lucide-react';

const Grid: React.FC<GridProps> = ({ socket, playerId }) => {
  const [gridState, setGridState] = useState<GridState>({
    cells: Array(10).fill(null).map(() => 
      Array(10).fill({ value: '', lastUpdated: 0, updatedBy: '' })
    ),
    onlinePlayers: 1
  });
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [canUpdate, setCanUpdate] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [viewingHistoricalState, setViewingHistoricalState] = useState(false);
  const [currentState, setCurrentState] = useState<GridState | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const [historicalState, setHistoricalState] = useState<HistoricalState | null>(null);

  //clean up
  useEffect(() => {
    socket.emit('requestInitialState');
    socket.emit('requestHistory');
    socket.emit('requestPlayerCount');

    const handleGridUpdate = (newState: GridState) => {
      if (!viewingHistoricalState) {
        setGridState(prevState => ({
          ...newState,
          onlinePlayers: prevState.onlinePlayers //Preserve player
        }));
        setCurrentState(newState);
      }
    };

    const handlePlayerCount = (count: number) => {
      setGridState(prev => ({ ...prev, onlinePlayers: count }));
    };

    const handleHistoricalState = (historical: HistoricalState) => {
      if (historical && historical.cells) {
        setHistoricalState(historical);
        setGridState(prevState => ({
          cells: historical.cells,
          onlinePlayers: prevState.onlinePlayers //preserve
        }));
        setViewingHistoricalState(true);
      }
    };

    socket.on('gridUpdate', handleGridUpdate);
    socket.on('historicalState', handleHistoricalState);
    socket.on('playerCount', handlePlayerCount);
    socket.on('historicalUpdates', setHistory);

    return () => {
      socket.off('gridUpdate', handleGridUpdate);
      socket.off('historicalState', handleHistoricalState);
      socket.off('playerCount', handlePlayerCount);
      socket.off('historicalUpdates');
    };
  }, [socket]);

  //effect for countdown timer and API call
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            fetchPlayerCount();
            setCanUpdate(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  // Separate function for API call
  const fetchPlayerCount = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      socket.emit('requestPlayerCount'); 
    } catch (error) {
      console.error('Error hitting the server:', error);
    }
  };


  useEffect(() => {
    const now = Date.now();
    if (lastUpdateTime > 0 && now - lastUpdateTime < 60000) {
      setCanUpdate(false);
      setTimeLeft(60 - Math.floor((now - lastUpdateTime) / 1000));
    } else {
      setCanUpdate(true);
      setTimeLeft(0);
    }
  }, [lastUpdateTime]);

  const handleCellClick = (row: number, col: number) => {
    if (!canUpdate || viewingHistoricalState) return;
    setSelectedCell({ row, col });
  };

  const handleSubmit = () => {
    if (!selectedCell || !inputValue || !canUpdate || viewingHistoricalState) return;

    const update = {
      row: selectedCell.row,
      col: selectedCell.col,
      value: inputValue,
      playerId,
      timestamp: Date.now()
    };

    socket.emit('updateCell', update);
    setInputValue('');
    setSelectedCell(null);
    setCanUpdate(false);
    setLastUpdateTime(Date.now());
    setTimeLeft(60);
  };

  const handleHistorySelect = (timestamp: number) => {
    if (viewingHistoricalState && historicalState?.timestamp === timestamp) {
      return;
    }
    socket.emit('requestStateAtTimestamp', timestamp);
  };

  const handleReturnToPresent = () => {
    setHistoricalState(null);
    if (currentState) {
      setGridState(prevState => ({
        ...currentState,
        onlinePlayers: prevState.onlinePlayers //Preserve player count when returning to present
      }));
    } else {
      socket.emit('requestInitialState');
    }
    setViewingHistoricalState(false);
  };

  const getCellColor = (value: string) => {
    if (!value) return 'bg-white hover:bg-gray-50';
    const colors = [
      'bg-blue-100 hover:bg-blue-200',
      'bg-green-100 hover:bg-green-200',
      'bg-purple-100 hover:bg-purple-200',
      'bg-pink-100 hover:bg-pink-200',
      'bg-yellow-100 hover:bg-yellow-200',
      'bg-red-100 hover:bg-red-200',
    ];
    return colors[value.charCodeAt(0) % colors.length];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Gamitar
        </h1>
        <p className="text-gray-600 mt-2">Collaborate and create together!</p>
      </div>

      <Card className="w-full bg-white shadow-xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Trophy className="text-yellow-500" />
              <span className="text-lg font-semibold">
                Players Online: {gridState.onlinePlayers}
              </span>
            </div>
            {!canUpdate && timeLeft > 0 && (
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                Next move in: {timeLeft}s
              </div>
            )}
            <div className="flex gap-2">
              {viewingHistoricalState && (
                <Button 
                  variant="outline"
                  className="bg-purple-100 hover:bg-purple-200 text-purple-800"
                  onClick={handleReturnToPresent}
                >
                  Return to Present
                </Button>
              )}
              <HistoryPanel 
                history={history}
                onSelectTimestamp={handleHistorySelect}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-10 gap-2 mb-6">
            {gridState.cells.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <Button
                  key={`${rowIndex}-${colIndex}`}
                  variant="outline"
                  className={`w-12 h-12 text-xl font-bold transition-all duration-200 ${
                    selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                      ? 'ring-2 ring-blue-500 shadow-lg'
                      : ''
                  } ${getCellColor(cell.value)}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  disabled={!canUpdate || viewingHistoricalState || cell.value !== ''}
                >
                  {cell.value || ''}
                </Button>
              ))
            ))}
          </div>

          {selectedCell && !viewingHistoricalState && (
            <div className="flex gap-2 justify-center">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                maxLength={1}
                placeholder="Enter a character"
                className="w-32 text-center text-xl"
              />
              <Button 
                onClick={handleSubmit}
                disabled={!inputValue}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                Submit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Grid;