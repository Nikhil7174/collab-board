// const { Server } = require("socket.io");
// const io = new Server({
//   cors: "http://localhost:5173/",
// });
// io.on("connection", function (socket) {
//   socket.on("canvasImage", (data) => {
//     socket.broadcast.emit("canvasImage", data);
//   });
// });

// io.listen(5000);

const { Server } = require("socket.io");
const io = new Server({
  cors: "https://collab-board-delta.vercel.app/",
});

io.on("connection", function (socket) {
  // Get the room ID from the URL
  const roomID = socket.handshake.query.roomID;

  // Join the room
  socket.join(roomID);

  socket.on("canvasImage", (data) => {
    // Broadcast to all clients in the room
    io.to(roomID).emit("canvasImage", data);
  });
});

io.listen(5000);
