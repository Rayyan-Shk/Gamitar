import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Grid from './components/Grid';
import * as React from 'react'

const socket = io('http://localhost:3002', {
  autoConnect: true, 
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

const App = () => {
  const [connected, setConnected] = useState(false);
  const [playerId] = useState(() => Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      setConnected(true);
      console.log('Connected to server');
      //Request initial state explicitly
      socket.emit('requestInitialState');
    };

    const handleDisconnect = () => {
      setConnected(false);
      console.log('Disconnected from server');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {!connected ? (
        <div className="text-center text-gray-600">
          Connecting to server...
        </div>
      ) : (
        <Grid socket={socket} playerId={playerId} />
      )}
    </div>
  );
};

export default App;