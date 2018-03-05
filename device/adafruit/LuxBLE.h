#include "Adafruit_BLE.h"
#include "Adafruit_BluefruitLE_UART.h"
#include "Adafruit_BluefruitLE_SPI.h"
#include "BluefruitConfig.h"

// Create the bluefruit object
Adafruit_BluefruitLE_UART ble(BLUEFRUIT_HWSERIAL_NAME, BLUEFRUIT_UART_MODE_PIN);

/* The service information */
int32_t gattServiceId;
int32_t gattNotifiableCharId;

void setBLEDeviceName(String prefix)
{
  // build device (pseudo) unique name from MAC Address
  ble.println(F("AT+BLEGETADDR"));
  ble.readline();
  String macAddr = ble.buffer;
  String name = String(prefix + "-" + macAddr.substring(12,14) + macAddr.substring(15,17));
  
  /* Change the device name to make it easier to find */
  log("Setting device name to: " + name);

  String command = String("AT+GAPDEVNAME=" + name);
  char bleCommand[28];
  command.toCharArray(bleCommand,28);
  
  if (! ble.sendCommandCheckOK(bleCommand)) {
    error(F("Could not set device name?"));
  }
}

void setupBluetooth(void)
{
  boolean success;
    
    /* Initialise the module */
  log(F("Initialising the Bluefruit LE module: "));

  if ( !ble.begin(VERBOSE_MODE) ) {
    error(F("Couldn't find Bluefruit, make sure it's in CoMmanD mode & check wiring?"));
  }
  log("OK!");

  /* Perform a factory reset to make sure everything is in a known state */
  log(F("Performing a factory reset: "));
  if (! ble.factoryReset() ) {
    error(F("Couldn't factory reset"));
  }

  /* Disable command echo from Bluefruit */
  ble.echo(false);

  ble.verbose(false);
  
  /* Print Bluefruit information */
  // Serial.println("Requesting Bluefruit info:");
  //ble.info();

  ble.setInterCharWriteDelay(5); // 5 ms
  setBLEDeviceName("LUXMETER"); // Name will be suffixed with end of MAC address
}

void setGattService(void)
{
  // LUX/HOUR unit is 0x27C0

  /* Remove all custom services and characteristics */
  log(F("Removing all custom services and characteristics : "));
  if (! ble.sendCommandWithIntReply( F("AT+GATTCLEAR"), &gattServiceId)) {
    error(F("Could not add Custom GATT service"));
  }
  
  /* Add the Custom GATT Service definition - Service ID should be 1 */
  log(F("Adding the Custom GATT Service definition: "));
  if (! ble.sendCommandWithIntReply(F("AT+GATTADDSERVICE=UUID=0x0001"), &gattServiceId)) {
    error(F("Could not add Custom GATT service"));
  }

  /* Add the Notifiable characteristic - Chars ID should be 1 */
  log(F("Adding the Read+Notifiable characteristic: "));
  if (! ble.sendCommandWithIntReply(F("AT+GATTADDCHAR=UUID=0x0002,PROPERTIES=0x12,MIN_LEN=1, MAX_LEN=10, VALUE=0,DATATYPE=1,DESCRIPTION=LUX Value"), &gattNotifiableCharId)) {
    error(F("Could not add Custom Read+Notifiable characteristic"));
  }
  
  /* Reset the device for the new service setting changes to take effect */
//  log(F("Performing a SW reset (service changes require a reset): "));
  ble.reset();
}

bool sendGattData(byte characteristic, String value)
{
  /* Command is sent when \n (\r) or println is called */
  /* AT+GATTCHAR=CharacteristicID,value */
  ble.print(F("AT+GATTCHAR="));
  ble.print(characteristic);
  ble.print(F(","));
  ble.println(value);

  /* Check if command executed OK */
  return ble.waitForOK();
}

