const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://socket-frontend-eta.vercel.app", // Update this based on your frontend URL
    methods: ["GET", "POST"],
  },
});

app.get("/test", (req, res) => {
  res.json({ message: "working" });
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("message", (data) => {
    console.log("message received:", data);
    socket.broadcast.emit("received", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
