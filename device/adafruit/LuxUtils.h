
const byte DEBUG = 8;


// A small helper
void error(const __FlashStringHelper*err) {
  Serial.println(err);
  while (1);
  // @todo blinky red led
}

void setupSerial(void)
{ 
  Serial.begin(9600);
}

void log(String message)
{
  String ts = String(millis());
  while (ts.length() < 12) {
    ts = '0' + ts;
  }
  Serial.print(ts.substring(0,9) + '.' + ts.substring(10));
  Serial.print(F(" : "));
  Serial.println(message);
}


