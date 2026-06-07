// Analog sensor sketch – streams A0 readings to Node.js via serial
// Connect a potentiometer or LDR between A0, 5V, and GND.

const int SENSOR_PIN = A0;
const int INTERVAL_MS = 100;

unsigned long lastRead = 0;

void setup() {
  Serial.begin(9600);
  Serial.println("Sensor ready");
}

void loop() {
  unsigned long now = millis();
  if (now - lastRead >= INTERVAL_MS) {
    lastRead = now;
    int value = analogRead(SENSOR_PIN);
    Serial.println(value);
  }
}
