"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 5050 });
let AllSockets = [];
wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        //@ts-expect-error
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === "join") {
            AllSockets.push({
                socket,
                room: parsedMessage.payload.roomId
            });
        }
        if (parsedMessage.type === "chat") {
            let currentRoom = null;
            for (let i = 0; i < AllSockets.length; i++) {
                if (AllSockets[i].socket === socket) {
                    currentRoom = AllSockets[i].room;
                }
            }
            for (let i = 0; i < AllSockets.length; i++) {
                if (AllSockets[i].room === currentRoom && AllSockets[i].socket !== socket) {
                    AllSockets[i].socket.send(parsedMessage.payload.message);
                }
            }
        }
    });
});
