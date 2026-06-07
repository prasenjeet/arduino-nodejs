# Arduino Node.js Bridge

Connect and communicate with an Arduino Uno from Node.js over USB serial.

## Prerequisites

- Node.js >= 16
- Arduino IDE (to upload sketches)
- Arduino Uno connected via USB

## Installation

```bash
npm install
```

## Quick Start

### 1. Find your Arduino port

```bash
npm run list-ports
```

Common port names:
- Linux: `/dev/ttyACM0` or `/dev/ttyUSB0`
- macOS: `/dev/tty.usbmodem*`
- Windows: `COM3`, `COM4`, …

### 2. Upload a sketch

Open the Arduino IDE and upload one of the sketches from the `arduino/` directory.

### 3. Run an example

```bash
# Stream serial output (generic)
ARDUINO_PORT=/dev/ttyACM0 npm start

# Blink the built-in LED (upload arduino/blink/blink.ino first)
node src/examples/blink.js /dev/ttyACM0

# Read an analog sensor (upload arduino/read-sensor/read-sensor.ino first)
node src/examples/read-sensor.js /dev/ttyACM0
```

## Project Structure

```
arduino-nodejs/
├── src/
│   ├── arduino.js          # Arduino class (EventEmitter wrapper)
│   ├── index.js            # Generic serial monitor
│   ├── list-ports.js       # Port scanner
│   └── examples/
│       ├── blink.js        # LED blink via serial commands
│       └── read-sensor.js  # Analog sensor reader
└── arduino/
    ├── blink/
    │   └── blink.ino       # Arduino sketch for blink example
    └── read-sensor/
        └── read-sensor.ino # Arduino sketch for sensor example
```

## Arduino Class API

```js
const Arduino = require('./src/arduino');

const board = new Arduino({ baudRate: 9600 });

await board.connect('/dev/ttyACM0');  // open serial port
await board.send('COMMAND');          // write a line
const reply = await board.sendAndReceive('PING', 3000); // write + wait for one line back
await board.disconnect();             // close port

// Events
board.on('connected', (path) => { });
board.on('data', (line) => { });      // every newline from Arduino
board.on('error', (err) => { });
board.on('disconnected', () => { });

// Static helper
const ports = await Arduino.listPorts(); // [{ path, manufacturer, vendorId, … }]
```

## Environment Variables

| Variable       | Default     | Description      |
|----------------|-------------|------------------|
| `ARDUINO_PORT` | auto-detect | Serial port path |
| `BAUD_RATE`    | `9600`      | Baud rate        |
