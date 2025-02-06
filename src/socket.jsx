import { io } from "socket.io-client";

const URL = "https://secure-chat-backend-production.up.railway.app";

export const socket = io(URL, {
  auth: {
    serverOffset: 0,
  },
});
