const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const Arduino = require('./arduino');

const app = express();
const PORT = 3000;

// One process slot and one SSE client set per example
const processes = { blink: null, ledBuzzer: null };
const sseClients = { blink: new Set(), ledBuzzer: new Set() };

app.use(express.static(path.join(__dirname, '../public')));

// ── helpers ──────────────────────────────────────────────────────────────────

function broadcast(example, data) {
  for (const client of sseClients[example]) {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}

function sseEndpoint(example) {
  return (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    sseClients[example].add(res);
    req.on('close', () => sseClients[example].delete(res));
  };
}

async function spawnExample(example, scriptName, res) {
  if (processes[example]) {
    return res.status(400).json({ error: `${example} already running` });
  }

  let portPath;
  try {
    const ports = await Arduino.listPorts();
    if (ports.length === 0) return res.status(500).json({ error: 'No Arduino found' });
    portPath = ports[0].path;
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  const proc = spawn('node', [path.join(__dirname, `examples/${scriptName}`), portPath], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  processes[example] = proc;
  broadcast(example, { type: 'status', running: true });

  proc.stdout.on('data', (chunk) =>
    chunk.toString().split('\n').filter(Boolean).forEach((line) =>
      broadcast(example, { type: 'log', text: line })
    )
  );

  proc.stderr.on('data', (chunk) =>
    chunk.toString().split('\n').filter(Boolean).forEach((line) =>
      broadcast(example, { type: 'log', text: `ERROR: ${line}` })
    )
  );

  proc.on('close', () => {
    processes[example] = null;
    broadcast(example, { type: 'status', running: false });
    broadcast(example, { type: 'log', text: `--- ${example} stopped ---` });
  });

  res.json({ ok: true, port: portPath });
}

function stopExample(example, res) {
  if (!processes[example]) {
    return res.status(400).json({ error: `${example} is not running` });
  }
  processes[example].kill('SIGINT');
  res.json({ ok: true });
}

// ── blink routes ──────────────────────────────────────────────────────────────

app.get('/blink/status', (req, res) => res.json({ running: processes.blink !== null }));
app.get('/blink/logs', sseEndpoint('blink'));
app.post('/blink/start', (req, res) => spawnExample('blink', 'blink.js', res));
app.post('/blink/stop',  (req, res) => stopExample('blink', res));

// ── led-buzzer routes ─────────────────────────────────────────────────────────

app.get('/led-buzzer/status', (req, res) => res.json({ running: processes.ledBuzzer !== null }));
app.get('/led-buzzer/logs', sseEndpoint('ledBuzzer'));
app.post('/led-buzzer/start', (req, res) => spawnExample('ledBuzzer', 'led-buzzer.js', res));
app.post('/led-buzzer/stop',  (req, res) => stopExample('ledBuzzer', res));

// ─────────────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
