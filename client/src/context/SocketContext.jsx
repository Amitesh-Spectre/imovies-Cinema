import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinShowRoom = (showId, userId) => {
    if (socket && showId) {
      socket.emit('join_show_room', { showId, userId });
    }
  };

  const lockSeat = (showId, seatNumber, userId) => {
    if (socket && showId && seatNumber) {
      socket.emit('seat_lock_request', { showId, seatNumber, userId });
    }
  };

  const unlockSeat = (showId, seatNumber, userId) => {
    if (socket && showId && seatNumber) {
      socket.emit('seat_unlock_request', { showId, seatNumber, userId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinShowRoom,
        lockSeat,
        unlockSeat,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
