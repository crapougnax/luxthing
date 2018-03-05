import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { User, AuthCredential } from '@firebase/auth-types';
import { Reference } from '@firebase/database-types';

@Injectable()
export class ProfileProvider {

  userProfile: Reference;

  currentUser: User;

  device;

  constructor() {
      this.loadProfile();
  }

  loadProfile() {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.currentUser = user;
          this.userProfile = firebase.database().ref(`/userProfile/${user.uid}`);
          this.userProfile.on('value', userProfileSnapshot => {
            this.device = userProfileSnapshot.val().device;
          });
          
          return this.userProfile;
        }
      });
  }

  getUserProfile() {
    return this.userProfile || this.loadProfile();
  }

  updateName(firstName: string, lastName: string): Promise<any> {
    return this.userProfile.update({ firstName, lastName });
  }

  updateDevice(device: string): Promise<any> {
    return this.userProfile.update({ device });
  }

  updateEmail(newEmail: string, password: string): Promise<any> {
    const credential: AuthCredential = firebase.auth.EmailAuthProvider.credential(
      this.currentUser.email,
      password
    );
    return this.currentUser
      .reauthenticateWithCredential(credential)
      .then(user => {
        this.currentUser.updateEmail(newEmail).then(user => {
          this.userProfile.update({ email: newEmail });
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  updatePassword(newPassword: string, oldPassword: string): Promise<any> {
    const credential: AuthCredential = firebase.auth.EmailAuthProvider.credential(
      this.currentUser.email,
      oldPassword
    );

    return this.currentUser
      .reauthenticateWithCredential(credential)
      .then(user => {
        this.currentUser.updatePassword(newPassword).then(user => {
          console.log('Password Changed');
        });
      })
      .catch(error => {
        console.error(error);
      });
  }
}
