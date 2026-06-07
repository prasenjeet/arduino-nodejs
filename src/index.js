const Arduino = require('./arduino');

const PORT = process.env.ARDUINO_PORT || '/dev/ttyACM0';
const BAUD_RATE = parseInt(process.env.BAUD_RATE || '9600', 10);

async function main() {
  console.log('Arduino Node.js Bridge');
  console.log('======================');

  // Auto-detect port if default is not specified
  let portPath = PORT;
  if (!process.env.ARDUINO_PORT) {
    const ports = await Arduino.listPorts();
    if (ports.length === 0) {
      console.error('No Arduino found. Connect your Arduino and try again.');
      console.error('Run `npm run list-ports` to see available ports.');
      process.exit(1);
    }
    portPath = ports[0].path;
    console.log(`Auto-detected Arduino on: ${portPath}`);
  }

  const board = new Arduino({ baudRate: BAUD_RATE });

  board.on('connected', (path) => console.log(`Connected to Arduino on ${path} at ${BAUD_RATE} baud`));
  board.on('disconnected', () => console.log('Arduino disconnected.'));
  board.on('error', (err) => console.error('Arduino error:', err.message));
  board.on('data', (line) => console.log('Arduino >', line));

  try {
    await board.connect(portPath);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  // Keep process alive; Ctrl-C to exit
  process.on('SIGINT', async () => {
    console.log('\nClosing connection...');
    await board.disconnect();
    process.exit(0);
  });
}

main();
