import { createContext, useContext, useEffect, useRef, useState } from "react";

type WSContextType = {
  ws: WebSocket | null;
  addListener: (cb: (msg: any) => void) => void;
  removeListener: (cb: (msg: any) => void) => void;
};

const WSContext = createContext<WSContextType | null>(null);

export const useWS = () => useContext(WSContext);

export const WebSocketProvider = ({ children }: any) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const listeners = useRef<((msg: any) => void)[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:3001");

    socket.onopen = () => {
      console.log("WS connected (global)");
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      listeners.current.forEach((cb) => cb(msg));
    };

    return () => socket.close();
  }, []);

  const addListener = (cb: (msg: any) => void) => {
    listeners.current.push(cb);
  };

  const removeListener = (cb: (msg: any) => void) => {
    listeners.current = listeners.current.filter((l) => l !== cb);
  };

  return (
    <WSContext.Provider value={{ ws, addListener, removeListener }}>
      {children}
    </WSContext.Provider>
  );
};