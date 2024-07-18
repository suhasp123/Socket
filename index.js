const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://socket-frontend-eta.vercel.app/",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

app.get("/test", (req, res) => {
  res.json({ message: "working" });
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("message", (data) => {
    console.log("message received:", data);
    socket.broadcast.emit("received", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
