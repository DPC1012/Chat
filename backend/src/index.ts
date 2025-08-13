import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 5050 });

interface User {
  socket: WebSocket,
  room: string  
}
let AllSockets: User[] = [];

wss.on("connection", (socket) => {

  socket.on("message", (message) => {
    //@ts-expect-error
    const parsedMessage = JSON.parse(message) 
    if(parsedMessage.type === "join")
    {
      AllSockets.push({
        socket,
        room: parsedMessage.payload.roomId
      })
    }

    if(parsedMessage.type === "chat")
    {
      let currentRoom = null
      for(let i=0; i<AllSockets.length; i++)
      {
        if(AllSockets[i].socket === socket)
        {
          currentRoom = AllSockets[i].room
        }
      }

      for(let i=0; i<AllSockets.length; i++)
      {
        if(AllSockets[i].room === currentRoom && AllSockets[i].socket !== socket)
        { 
          AllSockets[i].socket.send(parsedMessage.payload.message)
        }
      }
    }
  });
});
