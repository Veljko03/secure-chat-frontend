import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_BACKEND_APP_API_URL;

//const URL = "https://secure-chat-backend-production.up.railway.app";
const URL = API_URL;

export const socket = io(URL, {
  auth: {
    serverOffset: 0,
  },
});
