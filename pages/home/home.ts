import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { DetailPage } from '../detail/detail';
import { BLE } from '@ionic-native/ble';
import { ProfileProvider } from '../../providers/profile/profile';
import firebase from 'firebase';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  device = null;
  devices: any[] = [];
  statusMessage: string;

  constructor(public navCtrl: NavController,
              private toastCtrl: ToastController,
              private ble: BLE,
              private ngZone: NgZone,
              private pp: ProfileProvider) {
  }

  ionViewDidEnter() {
    this.scan();
  }

  scan() {
    this.setStatus('Scanning for Bluetooth LE Devices');
    this.devices = [];  // clear list

    this.ble.scan([], 5).subscribe(
      device => this.onDeviceDiscovered(device),
      error => this.scanError(error)
    );

    setTimeout(this.setStatus.bind(this), 5000, 'Scan complete');
  }

  onDeviceDiscovered(device) {
    if (device.name && device.name.substr(0, 9) == 'LUXMETER-') {

        console.log('Découverte de ' + device.name);

        if (this.pp.device && this.pp.device.id == device.id) {
            console.log("Tentative de connexion automatique à ", device.id);
            this.navCtrl.push(DetailPage, { device: device });
        } else {
            this.ngZone.run(() => {
                this.devices.push(device);
            });
        }
    }
  }

  // If location permission is denied, you'll end up here
  scanError(error) {
    this.setStatus('Error ' + error);
    let toast = this.toastCtrl.create({
      message: 'Error scanning for Bluetooth low energy devices',
      position: 'middle',
      duration: 5000
    });
    toast.present();
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  deviceSelected(device) {
    console.log(JSON.stringify(device) + ' selected');
    this.pp.updateDevice(device);
    this.navCtrl.push(DetailPage, {
      device: device
    });
  }

}
