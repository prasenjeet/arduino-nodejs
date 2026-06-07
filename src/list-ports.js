const Arduino = require('./arduino');

(async () => {
  console.log('Scanning for serial ports...\n');
  const ports = await Arduino.listPorts();

  if (ports.length === 0) {
    console.log('No Arduino/serial devices found.');
    console.log('Make sure your Arduino is plugged in via USB.');
    return;
  }

  console.log(`Found ${ports.length} device(s):\n`);
  ports.forEach((port, i) => {
    console.log(`[${i + 1}] Path:         ${port.path}`);
    console.log(`     Manufacturer: ${port.manufacturer || 'N/A'}`);
    console.log(`     Vendor ID:    ${port.vendorId || 'N/A'}`);
    console.log(`     Product ID:   ${port.productId || 'N/A'}`);
    console.log(`     Serial #:     ${port.serialNumber || 'N/A'}`);
    console.log('');
  });
})();
