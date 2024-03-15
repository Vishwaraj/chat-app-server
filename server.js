import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
app.use(bodyParser.json());

wss.on("connection", function connection(ws) {
  ws.on("errorrrrrrr", console.error);

  // Generate a unique client ID for this connection
  const clientId = uuidv4();

  ws.on("message", function message(data) {
    console.log("receivedd: %s", data);
    const newData = JSON.parse(data); // Assuming message is sent in the request body

    const newReplyMessage = newData?.content;

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            content: newReplyMessage,
            sentByClient: false,
            clientId: clientId, // Send the client ID to the client
          })
        );
      }
    });
  });

  ws.send(
    JSON.stringify({
      content: "Hi from server, let's chat!",
      sentByClient: false,
      clientId: clientId, // Send the client ID to the client
    })
  );
});

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/update-reply", (req, res) => {
  // Retrieve the new reply message from the request body or query parameters
  console.log(req.body);

  const newReplyMessage = req.body.message; // Assuming message is sent in the request body

  // Update the reply message variable

  // Broadcast the updated reply message to all connected WebSocket clients

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          content: newReplyMessage,
          sentByClient: false,
        })
      );
    }
  });

  // Send a success response
  res.send("Reply message updated successfully");
});

app.post("/broadcast-message", (req, res) => {
  // Retrieve the message content from the request body
  const messageContent = req.body.message;

  // Broadcast the message to all connected WebSocket clients except the sender
  wss.clients.forEach((client) => {
    // Check if the client is in open state
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          content: messageContent,
          sentByClient: false,
        })
      );
    }
  });

  // Send a success response
  res.send("Message broadcasted successfully");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
