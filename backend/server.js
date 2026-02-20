const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const cors = require("cors");

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

server.listen(3000, "0.0.0.0", () => {
  console.log("server is running...");
});

app.use(cors());

let clients = [];
let waiting = [];

function MakePartners() {
  while (waiting.length >= 2) {
    const client1 = waiting.shift();
    const client2 = waiting.shift();
    client1.partner = client2;
    client2.partner = client1;
  }
}

io.on("connection", (socket) => {
  waiting.push(socket);
  MakePartners();

  socket.on("stream", (data) => {
    if (socket.partner) {
      socket.partner.emit("stream", data);
    }
  });

  socket.on("Message", (data) => {
    if (socket.partner) {
      socket.partner.emit("Message", data);
    }
  });
  socket.on("disconnect", () => {
    waiting = waiting.filter((c) => c !== socket);
    if (socket.partner) {
      const waitingUser = socket.partner;
      waitingUser.partner = null;
      waiting.push(waitingUser);
    }
    MakePartners();
  });
});
