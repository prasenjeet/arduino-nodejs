/**
 * Analog sensor reader example
 *
 * Reads analog values from Arduino pin A0 (e.g. a potentiometer or LDR).
 * Upload arduino/read-sensor/read-sensor.ino before running this script.
 *
 * Usage: node src/examples/read-sensor.js [port]
 */
const Arduino = require('../arduino');

const PORT = process.argv[2] || process.env.ARDUINO_PORT;
const SAMPLES = [];

async function run() {
  const board = new Arduino({ baudRate: 9600 });

  let portPath = PORT;
  if (!portPath) {
    const ports = await Arduino.listPorts();
    if (ports.length === 0) {
      console.error('No Arduino found. Pass the port as the first argument.');
      process.exit(1);
    }
    portPath = ports[0].path;
  }

  console.log(`Connecting to ${portPath}...`);
  await board.connect(portPath);
  console.log('Reading sensor data. Press Ctrl-C to stop.\n');

  board.on('data', (line) => {
    const value = parseInt(line, 10);
    if (!isNaN(value)) {
      SAMPLES.push(value);
      const voltage = ((value / 1023) * 5).toFixed(3);
      process.stdout.write(`\rRaw: ${String(value).padStart(4)}  Voltage: ${voltage} V  Samples: ${SAMPLES.length}`);
    }
  });

  process.on('SIGINT', async () => {
    await board.disconnect();
    if (SAMPLES.length > 0) {
      const avg = (SAMPLES.reduce((a, b) => a + b, 0) / SAMPLES.length).toFixed(1);
      const min = Math.min(...SAMPLES);
      const max = Math.max(...SAMPLES);
      console.log(`\n\nSession summary:`);
      console.log(`  Samples : ${SAMPLES.length}`);
      console.log(`  Min     : ${min}`);
      console.log(`  Max     : ${max}`);
      console.log(`  Average : ${avg}`);
    }
    process.exit(0);
  });
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
