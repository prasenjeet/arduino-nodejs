const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { EventEmitter } = require('events');

class Arduino extends EventEmitter {
  constructor(options = {}) {
    super();
    this.port = null;
    this.parser = null;
    this.connected = false;
    this.options = {
      baudRate: options.baudRate || 9600,
      dataBits: options.dataBits || 8,
      stopBits: options.stopBits || 1,
      parity: options.parity || 'none',
    };
  }

  async connect(path) {
    return new Promise((resolve, reject) => {
      this.port = new SerialPort({
        path,
        baudRate: this.options.baudRate,
        dataBits: this.options.dataBits,
        stopBits: this.options.stopBits,
        parity: this.options.parity,
        autoOpen: false,
      });

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));

      this.port.open((err) => {
        if (err) {
          reject(new Error(`Failed to open port ${path}: ${err.message}`));
          return;
        }
        this.connected = true;
        this.emit('connected', path);
        resolve();
      });

      this.parser.on('data', (line) => {
        const trimmed = line.trim();
        this.emit('data', trimmed);
      });

      this.port.on('error', (err) => {
        this.emit('error', err);
      });

      this.port.on('close', () => {
        this.connected = false;
        this.emit('disconnected');
      });
    });
  }

  send(message) {
    return new Promise((resolve, reject) => {
      if (!this.connected || !this.port) {
        reject(new Error('Not connected to Arduino'));
        return;
      }
      const data = message.endsWith('\n') ? message : `${message}\n`;
      this.port.write(data, (err) => {
        if (err) {
          reject(new Error(`Write failed: ${err.message}`));
          return;
        }
        this.port.drain(resolve);
      });
    });
  }

  // Send a command and wait for a single-line response
  sendAndReceive(message, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.removeListener('data', handler);
        reject(new Error('Response timeout'));
      }, timeoutMs);

      const handler = (line) => {
        clearTimeout(timer);
        resolve(line);
      };

      this.once('data', handler);
      this.send(message).catch((err) => {
        clearTimeout(timer);
        this.removeListener('data', handler);
        reject(err);
      });
    });
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      if (!this.port || !this.connected) {
        resolve();
        return;
      }
      this.port.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        this.connected = false;
        resolve();
      });
    });
  }

  static async listPorts() {
    const ports = await SerialPort.list();
    return ports.filter(
      (p) =>
        p.manufacturer ||
        p.vendorId ||
        (p.path && (p.path.includes('ttyUSB') || p.path.includes('ttyACM') || p.path.includes('COM')))
    );
  }
}

module.exports = Arduino;
