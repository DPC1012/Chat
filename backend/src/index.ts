import { WebSocket, WebSocketServer } from "ws";

const PORT = Number(process.env.PORT) || 5050;
const MAX_USERS_PER_ROOM = 2;
const wss = new WebSocketServer({ port: PORT });

type ClientMessage =
  | { type: "join"; payload: { roomId: string; intent?: "join" | "create" } }
  | { type: "chat"; payload: { message: string } }
  | { type: "typing"; payload: { isTyping: boolean } };

type ServerMessage =
  | { type: "chat"; payload: { message: string } }
  | { type: "room"; payload: { roomId: string; count: number } }
  | {
      type: "presence";
      payload: { roomId: string; status: "joined" | "left"; count: number };
    }
  | { type: "typing"; payload: { isTyping: boolean } }
  | { type: "error"; payload: { message: string } };

type User = {
  socket: WebSocket;
  roomId: string;
};

let users: User[] = [];

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    const parsedMessage = parseClientMessage(message.toString());

    if (!parsedMessage) {
      sendToSocket(socket, {
        type: "error",
        payload: { message: "Invalid message format." },
      });
      return;
    }

    if (parsedMessage.type === "join") {
      joinRoom(socket, parsedMessage.payload.roomId, parsedMessage.payload.intent);
      return;
    }

    if (parsedMessage.type === "typing") {
      const currentUser = users.find((u) => u.socket === socket);
      if (currentUser) {
        broadcastToRoom(
          currentUser.roomId,
          { type: "typing", payload: { isTyping: parsedMessage.payload.isTyping } },
          socket
        );
      }
      return;
    }

    sendChatMessage(socket, parsedMessage.payload.message);
  });

  socket.on("close", () => {
    leaveCurrentRoom(socket);
  });

  socket.on("error", () => {
    leaveCurrentRoom(socket);
  });
});

function joinRoom(socket: WebSocket, roomIdInput: string, intent: "join" | "create" = "join") {
  const roomId = normalizeRoomId(roomIdInput);

  if (!roomId) {
    sendToSocket(socket, {
      type: "error",
      payload: { message: "Room code is required." },
    });
    return;
  }

  const existingUsers = getRoomUsers(roomId);

  if (intent === "join" && existingUsers.length === 0) {
    sendToSocket(socket, {
      type: "error",
      payload: { message: "Room not found. Please check the code or create a new room." },
    });
    setTimeout(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    }, 100);
    return;
  }

  leaveCurrentRoom(socket);

  if (existingUsers.length >= MAX_USERS_PER_ROOM) {
    sendToSocket(socket, {
      type: "error",
      payload: { message: "This room is full. Only 2 people can join." },
    });
    // Brief delay to allow error message to be sent
    setTimeout(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    }, 100);
    return;
  }

  users.push({ socket, roomId });
  const count = getRoomUsers(roomId).length;

  sendToSocket(socket, {
    type: "room",
    payload: { roomId, count },
  });

  broadcastToRoom(
    roomId,
    {
      type: "presence",
      payload: { roomId, status: "joined", count },
    },
    socket
  );
}

function sendChatMessage(socket: WebSocket, messageInput: string) {
  const currentUser = users.find((user) => user.socket === socket);
  const message = messageInput.trim();

  if (!currentUser || !message) {
    return;
  }

  broadcastToRoom(
    currentUser.roomId,
    {
      type: "chat",
      payload: { message },
    },
    socket
  );
}

function leaveCurrentRoom(socket: WebSocket) {
  const index = users.findIndex((user) => user.socket === socket);
  if (index === -1) return;

  const { roomId } = users[index];
  users.splice(index, 1);

  const remainingCount = getRoomUsers(roomId).length;
  broadcastToRoom(roomId, {
    type: "presence",
    payload: {
      roomId,
      status: "left",
      count: remainingCount,
    },
  });
}

function parseClientMessage(message: string): ClientMessage | null {
  try {
    const parsedMessage = JSON.parse(message) as ClientMessage;

    if (
      parsedMessage.type === "join" &&
      typeof parsedMessage.payload?.roomId === "string"
    ) {
      return parsedMessage;
    }

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

    return null;
  } catch {
    return null;
  }
}

function broadcastToRoom(
  roomId: string,
  message: ServerMessage,
  excludeSocket?: WebSocket
) {
  getRoomUsers(roomId).forEach((user) => {
    if (user.socket !== excludeSocket) {
      sendToSocket(user.socket, message);
    }
  });
}

function sendToSocket(socket: WebSocket, message: ServerMessage) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function getRoomUsers(roomId: string) {
  return users.filter(
    (user) => user.roomId === roomId && user.socket.readyState === WebSocket.OPEN
  );
}

function normalizeRoomId(roomId: string) {
  return roomId.trim().toUpperCase();
}

// Periodic cleanup of stale connections
setInterval(() => {
  users = users.filter((user) => user.socket.readyState === WebSocket.OPEN);
}, 30000);

console.log(`WebSocket server running on port ${PORT}`);
