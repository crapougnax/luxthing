#include <Wire.h>
#include <SPI.h>
#include <Arduino.h>
#include "LuxUtils.h"
#include "Luxmeter.h"
#include "LuxBLE.h"

// measures buffer size
const unsigned short BSIZE = 100;

// measures acceptable delta (in lux)
const byte BDELTA = 5;

// mean interval between measures (15 sec)
const unsigned short MEANINTER = 15;

// max interval between measures (180 sec)
const byte MAXINTER = 180;

// BLE offset unit
const byte OFFUNIT = 5;

// index arrays
unsigned short index = 0;

// Spool data
uint16_t measures[BSIZE];
byte offsets[BSIZE];

void setup(void) 
{
  setupSerial();
  setupBluetooth();
  setGattService();
  setupSensor();

  log(F("Setup finished"));
}

void loop(void) 
{
  static unsigned long previousMillis = 0;

  // limit how often we read the sensor
  // @todo replace with a sleep mode ?
  byte offset = (millis() - previousMillis) / 1000;
  
  if (offset > MEANINTER) {
    if (! spoolData(pollLightSensor(), offset)) {
      error(F("Unable to spool data, is memory full?"));
    }
    previousMillis = millis();
  }
}

bool spoolData(int _value, byte _offset)
{
  // store data
  addData(_value, _offset);

  if (ble.isConnected() == 1) {
    log(sprintf("Connected, let's send %d measure(s)", index));
    // transmission data ok. Let's try to empty the spool
    for (int i = index-1 ; i >= 0 ; i--) {
      transmitData(i);
    }
    index = 0;
  }

  return true;
}

bool addData(int _value, byte _offset)
{
  static unsigned short globalOffset = 0;

  // check if measure may or must be added as a new indexed value
  if (index > 0 && globalOffset < MAXINTER && abs(_value - measures[index-1]) < BDELTA) {
    log("Value within +/-" + String(BDELTA) + " delta of previous value, adding +" + String(convertOffset(_offset)) + " to global offset");
    globalOffset += _offset; // add latest offset to global sum of previous offsets
    
    return false;
  }
  
  measures[index] = _value;
  offsets[index]  = convertOffset(globalOffset + _offset); // offset since last measure (in seconds multiples of offsetUnit)
  globalOffset = 0;
  log("Added value " + String(_value) + " at index #" + String(index) + " with offset " + String(offsets[index]));
  
  // Protect buffer against overflow - unshift oldest value if max has been reached 
  if (index == BSIZE - 1) {
    log(F("Buffer almost full, removing oldest value"));
    for (byte i = 0 ; i < BSIZE-1 ; i++) {
      measures[i] = measures[i+1];
      offsets[i] = offsets[i+1];
    }

    return false;
  }
  
  index++;
  
  return true;
}

int convertOffset(unsigned short _offset)
{
  return (int) (_offset / OFFUNIT);
}

bool transmitData(unsigned short _index)
{
  String data = String(measures[_index]) + ".";
  if (_index == index - 1) { // real time measure, ignore offset
    data += "0";
  } else {
    data += String(offsets[_index]);
  }

  return sendGattData(gattNotifiableCharId, data);
}

