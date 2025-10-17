// Using CommonJS require syntax for compatibility with Vercel Serverless Functions
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const path = require('path');

const app = express();

// Use CORS to allow requests from your frontend domain
app.use(cors());
// Middleware to parse JSON bodies, which is what QRbot sends
app.use(express.json());

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Create a WebSocket server and attach it to the HTTP server
const wss = new WebSocketServer({ server });

// This set will store all active WebSocket connections
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  clients.add(ws);

  ws.on('message', (message) => {
    // You can handle messages from the client here if needed
    console.log('received: %s', message);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// The API endpoint for QRbot
app.post('/api/scan', (req, res) => {
  const { contenu } = req.body;
  console.log(`Received scan from QRbot: ${contenu}`);

  if (!contenu) {
    return res.status(400).json({ error: 'Missing "contenu" in request body' });
  }

  // Broadcast the scanned content to all connected WebSocket clients
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(contenu);
    }
  });

  res.status(200).json({ message: 'Scan received and broadcasted' });
});

// Serve the frontend static files if this server is run directly
// In Vercel, this part is handled by vercel.json rewrites
const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (require.main === module) { // Checks if the script is being run directly
    app.use(express.static(frontendPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
}


// Vercel exports the Express app
// When running locally, we start the server manually
if (process.env.VERCEL) {
    module.exports = server;
} else {
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}
