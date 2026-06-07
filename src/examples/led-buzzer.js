/**
 * External LED + Buzzer example
 *
 * Alternates: LED on with a high beep → LED off with a low beep.
 * Upload arduino/led-buzzer/led-buzzer.ino before running.
 *
 * Usage: node src/examples/led-buzzer.js [port] [intervalMs]
 *   e.g. node src/examples/led-buzzer.js /dev/tty.usbmodem1101 800
 */
const Arduino = require('../arduino');

const PORT     = process.argv[2] || process.env.ARDUINO_PORT;
const INTERVAL = parseInt(process.argv[3] || '1000', 10);

const HIGH_FREQ = 1047; // C6
const LOW_FREQ  = 523;  // C5

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
  console.log(`Connected. Running LED + buzzer every ${INTERVAL}ms. Press Ctrl-C to stop.`);

  board.on('data', (line) => console.log('Arduino >', line));

  let ledOn = false;

  const cycle = setInterval(async () => {
    ledOn = !ledOn;
    if (ledOn) {
      await board.send('LED_ON');
      await board.send(`BUZZ:${HIGH_FREQ}`);
      console.log(`Sent: LED_ON  BUZZ:${HIGH_FREQ}`);
    } else {
      await board.send('LED_OFF');
      await board.send(`BUZZ:${LOW_FREQ}`);
      console.log(`Sent: LED_OFF BUZZ:${LOW_FREQ}`);
    }
  }, INTERVAL);

  process.on('SIGINT', async () => {
    clearInterval(cycle);
    await board.send('LED_OFF');
    await board.send('BUZZ_OFF');
    await board.disconnect();
    console.log('\nStopped.');
    process.exit(0);
  });
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
