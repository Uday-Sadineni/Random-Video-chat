const express = require("express");
const WebSocket = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));

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

wss.on("connection", (ws) => {
  waiting.push(ws);
  MakePartners();

  ws.on("message", (message) => {
    if (ws.partner && ws.partner.readyState === WebSocket.OPEN) {
      ws.partner.send(message.toString());
    }
  });

  ws.on("close", () => {
    waiting = waiting.filter((c) => c !== ws);
    if (ws.partner) {
      const waitingUser = ws.partner;
      waitingUser.partner = null;
      waiting.push(waitingUser);
    }
    MakePartners();
  });
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Server running...");
});
