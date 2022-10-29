// A custom next.js server for the app, allowing us to implement our own
// WebSocket API endpoint.

import http from 'http';
import next from 'next';
import { parse } from 'url';
import { WebSocket, RawData, WebSocketServer } from 'ws';

const hostname = 'localhost';
const port = 3000;

// Prepare the next.js app.
const app = next({ dev: process.env.NODE_ENV !== 'production', hostname, port });
const handle = app.getRequestHandler();

// Prepare the WebSocket servers.
const poseServer = new WebSocketServer({ noServer: true, path: '/api/pose' });
const pausedServer = new WebSocketServer({ noServer: true, path: '/api/paused' });

void app.prepare().then(() => {
  const server = http.createServer(async (req, res) => {
    await handle(req, res);
  }).listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  server.on('upgrade', (req, socket, head) => {
    if (!req.url) return;

    const { pathname } = parse(req.url);

    switch (pathname) {
    case poseServer.options.path:
      return poseServer.handleUpgrade(req, socket, head, handlePoseConnection);
    case pausedServer.options.path:
      return pausedServer.handleUpgrade(req, socket, head, handlePausedConnection);
    default:
      return;
    }
  });
});

// Prepare the data – the current pose of the robot as it moves around.
const pose = {
  x: 60,
  y: 40,
  angle: 1.5707,
};

const speed = 0.1;
const distance = 1;
const period = 50;

// A flag indicating whether the robot is currently paused.
let paused = false;

// Start a loop that will update the position of the robot, if it is currently
// moving.
setInterval(() => {
  if (paused) return;

  const ts = new Date().getTime();
  pose.x += distance * Math.sin(speed*ts*0.01);
}, period);

const handlePoseConnection = (ws: WebSocket, req: http.IncomingMessage) => {
  console.log(`> New incoming WebSocket pose connection from ${req.socket.remoteAddress}`);

  setInterval(() => {
    ws.send(JSON.stringify(pose));
  }, period);

  ws.on('message', (data: RawData) => {
    console.debug(`<-- Incoming WebSocket pose message: ${data}`);
    const newPose = JSON.parse(data.toString()) as Partial<{ x: number; y: number; angle: number }>;
    if (newPose.x !== undefined) pose.x = newPose.x;
    if (newPose.y !== undefined)  pose.y = newPose.y;
    if (newPose.angle !== undefined) pose.angle = newPose.angle;
  });

  ws.on('close', () => {
    console.log(`> WebSocket pose connection closed by ${req.socket.remoteAddress}`);
  });
};

const handlePausedConnection = (ws: WebSocket, req: http.IncomingMessage) => {
  console.log(`> New incoming WebSocket paused connection from ${req.socket.remoteAddress}`);

  setInterval(() => {
    ws.send(JSON.stringify({ paused }));
  }, period);

  ws.on('message', (data: RawData) => {
    console.debug(`<-- Incoming WebSocket paused message: ${data}`);
    paused = (JSON.parse(data.toString()) as { paused: boolean }).paused;
  });

  ws.on('close', () => {
    console.log(`> WebSocket paused connection closed by ${req.socket.remoteAddress}`);
  });
};
