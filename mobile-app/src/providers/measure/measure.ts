import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { Reference, ThenableReference } from '@firebase/database-types';
import { Geolocation } from '@ionic-native/geolocation';

@Injectable()
export class MeasureProvider {

  public measuresRef; //: Reference;

  protected today: string;

  protected data;

  constructor(
      private geolocation: Geolocation
  ) {
    // @todo vérifier si la date a changé de temps en temps ?
    this.today = (new Date()).toISOString().slice(0, 10);
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.measuresRef = firebase.database().ref(`/userProfile/${user.uid}/measures/${this.today}`);
      }
    });
  }

  createMeasure(data: array) {

      this.data = {
          time: (new Date()).toISOString().slice(11, 19),
          value: parseInt(data[0]),
          offset: parseInt(data[1]) * 5, // unit is 5 sec
          parsed: (parseInt(data[1]) == 0) // is record already parsed?
      };

      if (parseInt(data[1]) == 0) { // real time measure where offset = 0
          this.geolocation.getCurrentPosition().then((resp) => {
              this.data['position'] = {
                  longitude: resp.coords.longitude,
                  latitude: resp.coords.latitude,
                  altitude: resp.coords.altitude,
                  accuracy: resp.coords.accuracy
              };
              return this.measuresRef.push(this.data);
          }).catch((error) => {
              console.log('Error getting location', error.message);
              return this.measuresRef.push(this.data);
          });
      } else {
          return this.measuresRef.push(this.data);
      }
  }

  getMeasureList(): Reference {
    return this.measuresRef;
  }

  getMeasureDetail(measureId: string): Reference {
    return this.measuresRef.child(measureId);
  }
}
