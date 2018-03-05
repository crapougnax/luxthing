#include <Adafruit_Sensor.h>
#include <Adafruit_TSL2561_U.h>

// Lux sensor
Adafruit_TSL2561_Unified tsl = Adafruit_TSL2561_Unified(TSL2561_ADDR_FLOAT, 12345);



/**************************************************************************/
/*
    Configures the gain and integration time for the TSL2561
*/
/**************************************************************************/
void configureSensor(void)
{
  tsl.enableAutoRange(true); /* Auto-gain ... switches automatically between 1x and 16x */
  
  /* Changing the integration time gives you better sensor resolution (402ms = 16-bit data) */
  tsl.setIntegrationTime(TSL2561_INTEGRATIONTIME_402MS); /* medium resolution and speed   */
}

/**************************************************************************/
/*
    Displays some basic information on this sensor from the unified
    sensor API sensor_t type (see Adafruit_Sensor for more information)
*/
/**************************************************************************/
void displaySensorDetails(void)
{
  sensor_t sensor;
  tsl.getSensor(&sensor);
  log("------------------------------------");
  log("Sensor:       " + String(sensor.name));
  log("Driver Ver:   " + String(sensor.version));
  log("Unique ID:    " + String(sensor.sensor_id));
  log("Max Value:    " + String(sensor.max_value) + " lux");
  log("Min Value:    " + String(sensor.min_value) + " lux");
  log("Resolution:   " + String(sensor.resolution) + " lux");  
  log("------------------------------------");
  delay(200);
}

void setupSensor(void)
{
  /* Initialise the sensor */
  if (! tsl.begin()) {
    /* There was a problem detecting the TSL2561 ... check your connections */
    error(F("Ooops, no TSL2561 detected ... Check your wiring or I2C ADDR!"));
  }
  
  /* Display some basic information on this sensor */
  displaySensorDetails();
  
  /* Setup the sensor gain and integration time */
  configureSensor();
}

int pollLightSensor()
{ 
  /* Get a new sensor event */ 
  sensors_event_t event;
  tsl.getEvent(&event);
 
  if (event.light) {
    return (int) event.light;
  } else {
    log(F("Sensor overload"));
    return 40000;
  }  
}

