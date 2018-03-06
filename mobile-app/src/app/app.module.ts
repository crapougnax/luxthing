import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { DetailPage } from '../pages/detail/detail';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BackgroundMode } from '@ionic-native/background-mode';

import { AuthProvider } from '../providers/auth/auth';
import { MeasureProvider } from '../providers/measure/measure';
import { ProfileProvider } from '../providers/profile/profile';

import { BLE } from '@ionic-native/ble';
import { Geolocation } from '@ionic-native/geolocation';

import { FormatTemperaturePipe } from '../pipes/format-temperature/format-temperature';
import { FormatTemperatureCPipe } from '../pipes/format-temperature-c/format-temperature-c';
import { FormatTemperatureFPipe } from '../pipes/format-temperature-f/format-temperature-f';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    DetailPage,
    HomePage,
    TabsPage,
    FormatTemperaturePipe,
    FormatTemperatureCPipe,
    FormatTemperatureFPipe
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    DetailPage,
    HomePage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BackgroundMode,
    BLE,
    Geolocation,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
    MeasureProvider,
    ProfileProvider
  ]
})
export class AppModule {}
