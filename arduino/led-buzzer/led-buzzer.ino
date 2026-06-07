// External LED + Buzzer sketch – controlled by Node.js via serial
//
// Wiring:
//   External LED : Anode → 220Ω resistor → Pin 8, Cathode → GND
//   Piezo buzzer : Positive → Pin 9, Negative → GND
//
// Commands accepted over serial:
//   LED_ON          – turn external LED on
//   LED_OFF         – turn external LED off
//   BUZZ:<freq>     – play tone at <freq> Hz  (e.g. BUZZ:1000)
//   BUZZ_OFF        – stop tone

const int LED_PIN  = 8;
const int BUZZ_PIN = 9;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZ_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("LED-Buzzer ready");
}

void loop() {
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "LED_ON") {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED ON");

    } else if (cmd == "LED_OFF") {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED OFF");

    } else if (cmd.startsWith("BUZZ:")) {
      int freq = cmd.substring(5).toInt();
      if (freq > 0) {
        tone(BUZZ_PIN, freq);
        Serial.print("BUZZ ");
        Serial.println(freq);
      } else {
        Serial.println("Invalid frequency");
      }

    } else if (cmd == "BUZZ_OFF") {
      noTone(BUZZ_PIN);
      Serial.println("BUZZ OFF");

    } else {
      Serial.print("Unknown: ");
      Serial.println(cmd);
    }
  }
}
