import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import firebase from 'firebase';
import { Chart } from 'chart.js';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})

export class ContactPage {

    @ViewChild('barCanvas') barCanvas;

    graphData = {};
    barChart: any;


    constructor(public navCtrl: NavController) {

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                var measuresRef = firebase.database().ref(`/userProfile/${user.uid}/measures/2018-02-16`).orderByChild('time');
                measuresRef.once('value').then(function(data) {
                    //console.log(JSON.stringify(data.val()));
                    var data = data.val();
                    var gd = {};
                    for (var i in data) {
                        var hour = data[i].time.substring(0,2);
                        if (! gd[hour]) {
                            gd[hour] = 0;
                        }

                        gd[hour] += data[i].value;
                    }

                    this.barChart = new Chart(this.barCanvas.nativeElement, {

                        type: 'line',
                        data: {
                            labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                            datasets: [{
                                label: 'lux / heure',
                                data: gd,
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)',
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)',
                                    'rgba(75, 192, 192, 0.2)',
                                    'rgba(153, 102, 255, 0.2)',
                                    'rgba(255, 159, 64, 0.2)'
                                ],
                                borderColor: [
                                    'rgba(255,99,132,1)',
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(255, 206, 86, 1)',
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(153, 102, 255, 1)',
                                    'rgba(255, 159, 64, 1)'
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        beginAtZero:true
                                    }
                                }]
                            }
                        }

                    });
                });
            }
        });
    }

    makeChart(data) {
        console.log(JSON.stringify(data));


        this.barChart = new Chart(this.barCanvas.nativeElement, {

            type: 'line',
            data: {
                labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                datasets: [{
                    label: 'lux / heure',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }

        });

    }
}
