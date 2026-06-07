// Blink sketch – controlled by Node.js via serial
// Accepts "ON" or "OFF" commands to toggle the built-in LED (pin 13).

const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Arduino ready");
}

void loop() {
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "ON") {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED ON");
    } else if (cmd == "OFF") {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED OFF");
    } else {
      Serial.print("Unknown command: ");
      Serial.println(cmd);
    }
  }
}
