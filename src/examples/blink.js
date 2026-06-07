/**
 * Blink LED example
 *
 * Sends "ON" / "OFF" commands to toggle the Arduino's built-in LED (pin 13).
 * Upload arduino/blink/blink.ino to your board before running this script.
 *
 * Usage: node src/examples/blink.js [port] [intervalMs]
 *   e.g. node src/examples/blink.js /dev/ttyACM0 500
 */
const Arduino = require('../arduino');

const PORT = process.argv[2] || process.env.ARDUINO_PORT;
const INTERVAL = parseInt(process.argv[3] || '1000', 10);

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
  console.log(`Connected. Blinking LED every ${INTERVAL}ms. Press Ctrl-C to stop.`);

  let ledOn = false;
  const blink = setInterval(async () => {
    ledOn = !ledOn;
    const cmd = ledOn ? 'ON' : 'OFF';
    await board.send(cmd);
    console.log(`Sent: ${cmd}`);
  }, INTERVAL);

  board.on('data', (line) => console.log('Arduino >', line));

  process.on('SIGINT', async () => {
    clearInterval(blink);
    await board.send('OFF');
    await board.disconnect();
    console.log('\nStopped.');
    process.exit(0);
  });
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
