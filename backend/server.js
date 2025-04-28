const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

const NUM_RACERS = 10;

const racers = [];

// Initialize racers with random speeds
for (let i = 1; i <= NUM_RACERS; i++) {
  racers.push({
    id: i,
    name: `Racer ${i}`,
    distance: 0,
    speed: Math.random() * 5 + 5 // speed between 5 and 10 units/sec
  });
}

// Update racers' positions
function updateRacers() {
    racers.forEach(racer => {
      racer.distance += racer.speed;
    });
}

// Broadcast racers' positions to all clients
function broadcastRacers() {
    const sortedRacers = [...racers].sort((a, b) => b.distance - a.distance);
    const payload = JSON.stringify(sortedRacers);
  
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
}
  

// Handle new client connections
wss.on('connection', ws => {
    console.log('New client connected.');
  
    // Send current racers immediately when a client connects
    ws.send(JSON.stringify(racers));
});

// Update racers' positions and broadcast to all clients every second
setInterval(() => {
    updateRacers();
    broadcastRacers();
}, 1000); // every 1 second

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});