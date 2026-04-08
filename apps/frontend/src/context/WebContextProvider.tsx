import { createContext, useContext, useEffect, useState } from "react";

const WSContext = createContext<WebSocket | null>(null);

export const useWS = () => useContext(WSContext);

export const WebSocketProvider = ({ children }: any) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:3001");

    socket.onopen = () => {
      console.log("WS connected (global)");
      setWs(socket); // ✅ THIS is important
    };

    socket.onclose = () => {
      console.log("WS disconnected");
    };

    return () => socket.close();
  }, []);

  return <WSContext.Provider value={ws}>{children}</WSContext.Provider>;
};