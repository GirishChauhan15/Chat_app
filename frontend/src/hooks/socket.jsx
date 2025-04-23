// Frontend logic to connect and return socket info
import { io } from "socket.io-client";
import { config } from "../config";

let socket;

export const initializeSocket = (userId) => {
  if (!socket) {
    socket = io(config?.backendUrl, {
      query : {
          userId
      },
      reconnectionAttempts: 5,
      reconnectionDelayMax: 10000,
  })
  }

  return socket;
};

export const getSocket = () => socket;