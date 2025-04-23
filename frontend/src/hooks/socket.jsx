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
      autoConnect:false
  })
  }

  return socket;
};

export const getSocket = () => socket;