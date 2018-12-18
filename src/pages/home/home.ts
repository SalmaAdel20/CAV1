import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import 'rxjs/add/operator/filter';
import { Device } from '@ionic-native/device';
import { AngularFireDatabase } from '@angular/fire/database';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoogleMap } from "@ionic-native/google-maps";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})

export class HomePage {
  @ViewChild('Note') Note;
  private myForm: FormGroup;
  public lat : number=0;
  public long:number=0;
  watch:any;
  map: GoogleMap;
  constructor(public navCtrl: NavController, public backgroundGeolocation:BackgroundGeolocation,
              public formBuilder: FormBuilder, public geolocation: Geolocation,public af:AngularFireDatabase,
              public device: Device) {
    this.myForm = formBuilder.group({
      Note: ['', [Validators.required,Validators.minLength(10)] ]   
    });
  }
///////////////////////////////////////////////////////////////////////////////////////////
  startGps() {
    var config = {
      desiredAccuracy: 0,
      stationaryRadius: 50,
      distanceFilter: 10,
      debug: true,
      startOnBoot: true,
      interval: 20000,
    }
    this.backgroundGeolocation.configure(config).subscribe((location)=>{
        this.lat=location.coords.latitude;
        this.long=location.coords.longitude;
       // console.log(location.coords.longitude + '~' + location.coords.latitude);
     
    });
    this.backgroundGeolocation.start();
    var options ={
      frequency:3000,
      enableHighAccuracy:true
    };
    this.watch=this.geolocation.watchPosition(options).filter((pos:any)=>pos.code===undefined)
      .subscribe((position)=>{
          this.lat=position.coords.latitude;
          this.long=position.coords.longitude;
         // console.log(this.lat+'~'+this.long);
          this.af.list("/currentLocation").update(
            "-LSnlQbCkj9yZspisJJG",{lat:this.lat,long:this.long});
    })
  }
//////////////////////////////////////////////////////////////////////////////////////////////////////////
  stopGps(){
    this.backgroundGeolocation.finish();
    this.watch.unsubscribe();
    console.log("the GPS stoped");
  }
  fun=setInterval(this.startGps.bind(this), 3000);
  ionViewDidLoad(){
    this.startGps();
    this.fun;
  }

  SendNote(){
    this.af.list("/Notes").push({Note:this.Note.value,SeenByParent:0});
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
  }
}
