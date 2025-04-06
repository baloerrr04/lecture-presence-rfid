"use client"

// /lib/socket/index.ts
import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';

// Create a socket instance that we'll reuse
let socket: any;

export const initializeSocket = async () => {
  // Connect to socket if not already connected
  if (!socket) {
    // Make sure to call this first to set up the server-side socket
    await fetch('/api/socket');
    socket = io();
  }
  
  return socket;
};

export const useSocket = () => {
  const [socketInstance, setSocketInstance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const init = async () => {
      const socketIo = await initializeSocket();
      
      socketIo.on('connect', () => {
        setIsConnected(true);
      });
      
      socketIo.on('disconnect', () => {
        setIsConnected(false);
      });
      
      setSocketInstance(socketIo);
    };

    init();

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return { socket: socketInstance, isConnected };
};