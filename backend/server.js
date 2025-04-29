// Distances are measured in meters. Speeds are meters per second (m/s).

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

const NUM_RACERS = 10;
const RACE_DISTANCE = 2000; // meters

const racers = [];
let raceFinished = false;
let raceStartTime = Date.now(); // Race start timestamp

// Initialize racers with random speeds and skills
for (let i = 1; i <= NUM_RACERS; i++) {
  racers.push({
    id: i,
    name: `Racer ${i}`,
    distance: 0,
    speed: Math.random() * 5 + 5,    // 5 to 10 m/s
    skill: Math.random() * 0.4 + 0.8, // 0.8 to 1.2
    finished: false,
    finishTime: null,    // Time they finished (timestamp)
    totalTime: null      // Time taken to complete race (in seconds)
  });
}

// Update racers' positions
function updateRacers() {
  racers.forEach(racer => {
    if (racer.finished) return; // Skip racers who already finished

    // Slight random fluctuation based on skill
    let randomChange = (Math.random() - 0.5) * 0.5; // -0.25 to +0.25
    racer.speed += randomChange * racer.skill;

    // Clamp speed between 5-10 m/s
    if (racer.speed < 5) racer.speed = 5;
    if (racer.speed > 10) racer.speed = 10;

    racer.distance += racer.speed;

    // Check if racer has finished
    if (racer.distance >= RACE_DISTANCE) {
      racer.distance = RACE_DISTANCE;
      racer.finished = true;
      racer.finishTime = Date.now(); // Record finish timestamp
      racer.totalTime = (racer.finishTime - raceStartTime) / 1000; // Time taken in seconds
    }
  });

  // Check if race is fully finished
  if (!raceFinished && racers.every(r => r.finished)) {
    raceFinished = true;
    console.log('🏁 All racers have finished!');
  }
}

// Broadcast racers' positions to all connected clients
function broadcastRacers() {
  // Separate finished and unfinished racers
  const finishedRacers = racers.filter(r => r.finished).sort((a, b) => a.finishTime - b.finishTime);
  const racingRacers = racers.filter(r => !r.finished).sort((a, b) => b.distance - a.distance);

  // Merge finished first, then racing
  const sortedRacers = [...finishedRacers, ...racingRacers];

  const payload = JSON.stringify({
    racers: sortedRacers,
    raceFinished: raceFinished
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Handle new client connections
wss.on('connection', ws => {
  console.log('New client connected.');
  ws.send(JSON.stringify({
    racers: racers,
    raceFinished: raceFinished
  }));
});

// Update every second
setInterval(() => {
  updateRacers();
  broadcastRacers();
}, 1000);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});