// WiFi Module
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>

// Constants and variables
const int sensorPin = A0;
const unsigned long interval = 3600000; // One hour
//const unsigned long interval = 21600000; // Six hours
unsigned long lastUpdate = millis() - interval;
int reading;
HTTPClient https;

// WiFi & Connectivity Settings
#include "secrets.h"
/*
  secrets.h contents:
    const char* wifi_ssid = "";
    const char* wifi_pass = "";
    const char* gcp_app_secret = "";
*/

void setup() {
  Serial.begin(115200);
  setup_wifi();
}

void setup_wifi() {
  delay(10);
  Serial.print("WiFi connecting to ");
  Serial.println(wifi_ssid);

  WiFi.begin(wifi_ssid, wifi_pass);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (millis() - lastUpdate >= interval) {
    lastUpdate = millis();

    Serial.print("Reading: ");
    reading = analogRead(sensorPin);
    Serial.println(reading);

    std::unique_ptr<BearSSL::WiFiClientSecure>client(new BearSSL::WiFiClientSecure);
    client->setInsecure();

    // Publish to GCP app
    if (https.begin(*client, "https://houseplantcloud.appspot.com/newreading?s=" + String(gcp_app_secret) + "&v=" + String(reading))) {
      int httpCode = https.GET();

      if (httpCode > 0) {
        if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
          String payload = https.getString();
          Serial.print("Response from server: ");
          Serial.println(payload);
        }
      } else {
        Serial.printf("Server connection failed: %s\n", https.errorToString(httpCode).c_str());
      }
    } else {
      Serial.println("Server connection failed");
    }

    // Publish to glitch app
    if (https.begin(*client, "https://jasonsplant.glitch.me/newreading?s=" + String(gcp_app_secret) + "&v=" + String(reading))) {
      int httpCode = https.GET();

      if (httpCode > 0) {
        if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
          String payload = https.getString();
          Serial.print("Response from server: ");
          Serial.println(payload);
        }
      } else {
        Serial.printf("Server connection failed: %s\n", https.errorToString(httpCode).c_str());
      }
    } else {
      Serial.println("Server connection failed");
    }
  }
}
