import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { MeasureProvider } from '../../providers/measure/measure';


// Bluetooth UUIDs
const LUXMETER_SERVICE = '0001';
const LUXMETER_CHARACTERISTIC = '0002';

@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {

  peripheral: any = {};
  light: string;
  last: string;
  statusMessage: string;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private ble: BLE,
              private alertCtrl: AlertController,
              private ngZone: NgZone,
              private mp: MeasureProvider) {

    let device = navParams.get('device');

    this.setStatus('Connexion à ' + device.name || device.id);

    // This is not a promise, the device can call disconnect after it connects, so it's an observable
    this.ble.connect(device.id).subscribe(
      peripheral => this.onConnected(peripheral),
      peripheral => this.showAlert('Disconnected', 'The peripheral unexpectedly disconnected')
    );

  }

  // the connection to the peripheral was successful
  onConnected(peripheral) {

    this.peripheral = peripheral;
    this.setStatus('Connecté à ' + (peripheral.name || peripheral.id));

    // Subscribe for notifications when the temperature changes
    this.ble.startNotification(this.peripheral.id, LUXMETER_SERVICE, LUXMETER_CHARACTERISTIC).subscribe(
      data => this.onLuminosityChange(data),
      () => this.showAlert('Unexpected Error', 'Failed to subscribe for luminosity changes')
    )

    // Read the current value of the lux characteristic
    this.ble.read(this.peripheral.id, LUXMETER_SERVICE, LUXMETER_CHARACTERISTIC).then(
      data => this.onLuminosityChange(data),
      () => this.showAlert('Unexpected Error', 'Failed to get luminosity')
    )

  }

  onLuminosityChange(buffer:ArrayBuffer) {

    // characteristic returns a string
    var data = String.fromCharCode.apply(null, new Uint8Array(buffer)).split('.');

    // save measure
    this.mp.createMeasure(data);

    this.ngZone.run(() => {
      this.light = data[0] + " Lux";
      this.last = new Date().toLocaleString('fr-FR', {hour12: false});
    });

  }

  // Disconnect peripheral when leaving the page
  ionViewWillLeave() {
    console.log('ionViewWillLeave disconnecting Bluetooth');
    this.ble.disconnect(this.peripheral.id).then(
      () => console.log('Disconnected ' + JSON.stringify(this.peripheral)),
      () => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))
    )
  }

  showAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

}
