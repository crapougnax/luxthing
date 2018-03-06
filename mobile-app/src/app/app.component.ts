import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BackgroundMode } from '@ionic-native/background-mode';

import firebase from 'firebase';
import { firebaseConfig } from './credentials';
import { Unsubscribe } from '@firebase/util';

import { TabsPage } from '../pages/tabs/tabs';
import { HomePage } from '../pages/home/home';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
//  rootPage: any;
  rootPage:any = TabsPage;


  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, backgroundMode: BackgroundMode) {
    firebase.initializeApp(firebaseConfig);

    // Redirect user ton login page if not identified
    const unsubscribe: Unsubscribe = firebase
      .auth()
      .onAuthStateChanged(user => {
        if (!user) {
          this.rootPage = 'LoginPage';
          unsubscribe();
        } else {
          this.rootPage = TabsPage;
          unsubscribe();
        }
      });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      backgroundMode.enable(); // app must continue to run while in background
    });
  }
}
