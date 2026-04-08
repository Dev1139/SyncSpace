import { createContext, useContext, useEffect, useRef, useState } from "react";

type WSContextType = {
  ws: WebSocket | null;
  addListener: (cb: (msg: any) => void) => void;
  removeListener: (cb: (msg: any) => void) => void;
  send: (data: any) => void;
};

const WSContext = createContext<WSContextType | null>(null);

export const useWS = () => useContext(WSContext);

export const WebSocketProvider = ({ children }: any) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const listeners = useRef<((msg: any) => void)[]>([]);

  useEffect(() => {
  let socket: WebSocket;

  const connect = () => {
    socket = new WebSocket("ws://127.0.0.1:3001");

    socket.onopen = () => {
      console.log("WS connected");
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      listeners.current.forEach((cb) => cb(msg));
    };

    socket.onclose = () => {
      console.log("WS disconnected... reconnecting");
      setTimeout(connect, 2000);
    };
  };

  connect();

  return () => socket?.close();
}, []);

  const addListener = (cb: (msg: any) => void) => {
    listeners.current.push(cb);
  };

  const removeListener = (cb: (msg: any) => void) => {
    listeners.current = listeners.current.filter((l) => l !== cb);
  };

  const send = (data: any) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
};

  return (
    <WSContext.Provider value={{ ws, addListener, removeListener, send }}>
      {children}
    </WSContext.Provider>
  );
};