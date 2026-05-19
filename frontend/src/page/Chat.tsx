import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { InputBox } from "../components/InputBox";
import { Static } from "../components/Static";
import { ChatIcon } from "../icons/ChatIcon";

type Message = {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
};

type Toast = {
  id: string;
  message: string;
  tone: "success" | "warning" | "error";
};

type ConnectionStatus = "connecting" | "connected" | "disconnected";

type ServerMessage =
  | { type: "chat"; payload: { message: string } }
  | { type: "room"; payload: { roomId: string; count: number } }
  | {
      type: "presence";
      payload: { roomId: string; status: "joined" | "left"; count: number };
    }
  | { type: "typing"; payload: { isTyping: boolean } }
  | { type: "error"; payload: { message: string } };

const socketUrl = import.meta.env.VITE_WS_URL ?? "ws://localhost:5050";

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [roomCount, setRoomCount] = useState(0);
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fatalErrorRef = useRef(false);
  const typingTimeoutRef = useRef<number>(0);
  const { roomId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const normalizedRoomId = useMemo(() => roomId.trim().toUpperCase(), [roomId]);
  const isConnected = status === "connected";

  const intent = (location.state?.intent as "join" | "create") ?? "join";

  useEffect(() => {
    if (!normalizedRoomId) {
      navigate("/");
      return;
    }

    let reconnectTimeout: number;
    const maxReconnectDelay = 30000;
    const baseDelay = 1000;

    const connect = () => {
      const ws = new WebSocket(socketUrl);
      socketRef.current = ws;
      setStatus("connecting");

      ws.onopen = () => {
        if (socketRef.current !== ws) {
          ws.close();
          return;
        }

        setStatus("connected");
        setReconnectDelay(baseDelay);
        ws.send(
          JSON.stringify({
            type: "join",
            payload: { roomId: normalizedRoomId, intent },
          })
        );
      };

      ws.onmessage = (event) => {
        if (socketRef.current !== ws) {
          return;
        }

        const serverMessage = parseServerMessage(String(event.data));

        if (!serverMessage) {
          return;
        }

        if (serverMessage.type === "chat") {
          addMessage(serverMessage.payload.message, "other");
          setIsOtherTyping(false);
          return;
        }

        if (serverMessage.type === "typing") {
          setIsOtherTyping(serverMessage.payload.isTyping);
          return;
        }

        if (serverMessage.type === "room") {
          if (serverMessage.payload.roomId !== normalizedRoomId) {
            return;
          }

          setRoomCount(serverMessage.payload.count);
          showToast("Joined room.", "success");
          return;
        }

        if (serverMessage.type === "presence") {
          if (serverMessage.payload.roomId !== normalizedRoomId) {
            return;
          }

          setRoomCount(serverMessage.payload.count);
          showToast(
            `Other person ${serverMessage.payload.status}.`,
            serverMessage.payload.status === "joined" ? "success" : "warning"
          );
          return;
        }

        if (serverMessage.type === "error") {
          showToast(serverMessage.payload.message, "error");
          const msg = serverMessage.payload.message.toLowerCase();
          
          if (msg.includes("room is full") || msg.includes("room not found")) {
            fatalErrorRef.current = true;
            window.setTimeout(() => navigate("/"), 2000);
          }
          return;
        }
      };

      ws.onclose = () => {
        if (socketRef.current !== ws) {
          return;
        }

        setStatus("disconnected");
        setRoomCount(0);
        setIsOtherTyping(false);

        if (!fatalErrorRef.current) {
          reconnectTimeout = window.setTimeout(() => {
            setReconnectDelay((prev) => Math.min(prev * 2, maxReconnectDelay));
            setConnectionAttempt((attempt) => attempt + 1);
          }, reconnectDelay);
        }
      };

      ws.onerror = () => {
        if (socketRef.current !== ws) {
          return;
        }
        setStatus("disconnected");
      };
    };

    connect();

    return () => {
      window.clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connectionAttempt, navigate, normalizedRoomId, intent]);

  const [reconnectDelay, setReconnectDelay] = useState(1000);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOtherTyping]);

  function generateId() {
    try {
      return crypto.randomUUID();
    } catch {
      return Math.random().toString(36).substring(2, 15);
    }
  }

  function addMessage(text: string, sender: Message["sender"]) {
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        text,
        sender,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  }

  function showToast(message: string, tone: Toast["tone"]) {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2800);
  }

  async function copyRoomLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Room link copied.", "success");
    } catch {
      showToast("Could not copy room link.", "error");
    }
  }

  function handleReconnect() {
    socketRef.current?.close();
    setConnectionAttempt((attempt) => attempt + 1);
  }

  function handleSend() {
    const message = input.trim();

    if (!message || !isConnected) {
      return;
    }

    socketRef.current?.send(
      JSON.stringify({
        type: "chat",
        payload: { message },
      })
    );

    addMessage(message, "me");
    setInput("");
    
    socketRef.current?.send(
      JSON.stringify({
        type: "typing",
        payload: { isTyping: false },
      })
    );
  }

  function handleInputChange(val: string) {
    setInput(val);
    
    if (isConnected) {
      socketRef.current?.send(
        JSON.stringify({
          type: "typing",
          payload: { isTyping: true },
        })
      );

      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = window.setTimeout(() => {
        socketRef.current?.send(
          JSON.stringify({
            type: "typing",
            payload: { isTyping: false },
          })
        );
      }, 2000);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white selection:bg-white selection:text-black">
      <ToastStack toasts={toasts} />

      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center animate-in fade-in duration-700">
        <div className="flex h-[calc(100vh-4rem)] max-h-[760px] min-h-[560px] w-full flex-col rounded-xl border-2 border-stone-800 bg-zinc-950/50 backdrop-blur-sm px-4 py-5 sm:px-6 shadow-2xl font-sans">
          <Static />

          <div className="mt-4 grid gap-3 border-y border-stone-800 py-3 text-xs text-slate-300 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0 flex items-center gap-2 font-mono uppercase tracking-tighter">
              <span className="opacity-60 text-[10px]">Room</span>
              <span className="font-bold tracking-widest text-white bg-stone-800 px-2 py-0.5 rounded text-[11px]">
                {normalizedRoomId}
              </span>
              <span className="ml-1 text-slate-500 flex items-center gap-1.5 text-[10px]">
                <span className="h-1 w-1 rounded-full bg-slate-600" />
                {roomCount} online
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono">
              <div className="flex items-center gap-2 bg-stone-900/50 px-2 py-1 rounded border border-stone-800/50">
                <span
                  className={`h-2 w-2 rounded-full shadow-[0_0_8px] ${
                    isConnected ? "bg-emerald-400 shadow-emerald-400/50" : "bg-amber-400 shadow-amber-400/50"
                  } ${status === 'connecting' ? 'animate-pulse' : ''}`}
                />
                <span className="capitalize text-[10px] tracking-wider">{status}</span>
              </div>
              <Button title="Copy Link" variants="md" onClick={copyRoomLink} />
              {status === "disconnected" && (
                <Button
                  title="Reconnect"
                  variants="md"
                  onClick={handleReconnect}
                />
              )}
            </div>
          </div>

          <div
            ref={scrollRef}
            className="my-4 min-h-0 flex-1 overflow-y-auto rounded-md border-2 border-stone-800/50 bg-black/40 p-4 custom-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center space-y-2 opacity-40 font-mono">
                <ChatIcon />
                <p className="text-xs tracking-widest">ENCRYPTED CHANNEL OPEN</p>
                <p className="text-[10px] text-slate-500 uppercase">Wait for someone to join</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col animate-in slide-in-from-bottom-2 duration-300 ${
                      msg.sender === "me" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] break-words px-4 py-2.5 text-[15px] leading-relaxed shadow-sm ${
                        msg.sender === "me"
                          ? "rounded-t-2xl rounded-bl-2xl bg-white text-black font-medium"
                          : "rounded-t-2xl rounded-br-2xl bg-stone-800 text-stone-100 border border-stone-700/50"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="mt-1 text-[9px] uppercase tracking-tighter text-stone-500 px-1 font-mono">
                      {msg.time}
                    </span>
                  </div>
                ))}
                
                {isOtherTyping && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="bg-stone-800 border border-stone-700/50 rounded-full px-4 py-2 flex gap-1 items-center">
                      <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end font-sans">
            <div className="relative group">
              <InputBox
                placeholder={isConnected ? "Type a message..." : "Waiting for connection..."}
                size="w-full transition-all duration-300 group-hover:border-stone-600 text-[15px]"
                value={input}
                disabled={!isConnected}
                onChange={(event) => handleInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSend();
                  }
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-20 group-hover:opacity-40 transition-opacity font-mono">
                <span className="text-[10px] border border-stone-700 px-1 rounded">⌘</span>
                <span className="text-[10px] border border-stone-700 px-1 rounded">↵</span>
              </div>
            </div>
            <Button
              title={isConnected ? "Send" : "Wait"}
              variants="sm"
              loading={!isConnected}
              onClick={handleSend}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed right-4 top-4 z-50 grid w-[calc(100%-2rem)] max-w-sm gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-md border-l-4 px-4 py-3 text-sm shadow-2xl backdrop-blur-md animate-in slide-in-from-right-full duration-500 ${
            toast.tone === "success"
              ? "border-emerald-500 bg-emerald-950/90 text-emerald-100"
              : toast.tone === "warning"
                ? "border-amber-500 bg-amber-950/90 text-amber-100"
                : "border-red-500 bg-red-950/90 text-red-100"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function parseServerMessage(message: string): ServerMessage | null {
  try {
    const parsedMessage = JSON.parse(message) as ServerMessage;

    if (
      parsedMessage.type === "chat" &&
      typeof parsedMessage.payload?.message === "string"
    ) {
      return parsedMessage;
    }

    if (
      parsedMessage.type === "typing" &&
      typeof parsedMessage.payload?.isTyping === "boolean"
    ) {
      return parsedMessage;
    }

    if (
      parsedMessage.type === "room" &&
      typeof parsedMessage.payload?.roomId === "string" &&
      typeof parsedMessage.payload.count === "number"
    ) {
      return parsedMessage;
    }

    if (
      parsedMessage.type === "presence" &&
      typeof parsedMessage.payload?.roomId === "string" &&
      (parsedMessage.payload.status === "joined" ||
        parsedMessage.payload.status === "left") &&
      typeof parsedMessage.payload.count === "number"
    ) {
      return parsedMessage;
    }

    if (
      parsedMessage.type === "error" &&
      typeof parsedMessage.payload?.message === "string"
    ) {
      return parsedMessage;
    }

    return null;
  } catch {
    return null;
  }
}
