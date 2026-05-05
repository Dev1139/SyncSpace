import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { WS_URL } from "../constants/appConfig";

export type WSContextType = {
  ws: WebSocket | null;
  addListener: (cb: (msg: any) => void) => void;
  removeListener: (cb: (msg: any) => void) => void;
  send: (data: any) => void;
};

const WSContext = createContext<WSContextType | null>(null);

export const useWS = () => useContext(WSContext);

type WebSocketProviderProps = {
  children: ReactNode;
};

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const listeners = useRef<((msg: any) => void)[]>([]);

  useEffect(() => {
    let socket: WebSocket;
    let reconnectTimer: number | undefined;
    let shouldReconnect = true;

    const connect = () => {
      const token = localStorage.getItem("token");

      if (!token || !shouldReconnect) return;

      socket = new WebSocket(`${WS_URL}?token=${token}`);

      socket.onopen = () => {
        console.log("WS connected");
        setWs(socket);
      };

      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        listeners.current.forEach((cb) => cb(msg));
      };

      socket.onclose = () => {
        setWs(null);

        if (!shouldReconnect) return;

        console.log("WS disconnected... reconnecting");
        reconnectTimer = window.setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      shouldReconnect = false;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
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
