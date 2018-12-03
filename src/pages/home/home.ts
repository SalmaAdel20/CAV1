import { Component,NgZone, ViewChild,ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation ,Geoposition} from '@ionic-native/geolocation';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import 'rxjs/add/operator/filter';
import{Observable} from"rxjs/Observable";
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  Environment
} from '@ionic-native/google-maps';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { AngularFireDatabase,AngularFireList } from '@angular/fire/database';
import { analyzeFile } from '@angular/compiler';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',


})
export class HomePage {
  @ViewChild('Note') Note;
  private myForm: FormGroup;
 coords: AngularFireList<any[]>;
 currentLocation={};
@ViewChild('map') mapElement: ElementRef;
lat : number=0;
long:number=0;
watch:any;
map:any;
  constructor(public navCtrl: NavController,public zone:NgZone,
    public backgroundGeolocation:BackgroundGeolocation,public formBuilder: FormBuilder,public  geolocation: Geolocation,public af:AngularFireDatabase ) {
    //this.coords=af.list("/currentLocation");
    this.myForm = formBuilder.group({
      Note: ['', [Validators.required,Validators.minLength(10)] ]   
  });
  }

///////////////////////////////////////////////////////////////////////////////////////////
startGps(){
var config ={

  desiredAccuracy:0,
  stationaryRadius:20,
  distanceFilter:9,
  debug:true,
  interval:2000
}
//------------------------------------------------------------------------
this.backgroundGeolocation.configure(config).subscribe((location)=>{

console.log("background :" +location.latitude +","+ location.longitude);

this.zone.run(()=>{

  this.lat=location.latitude;
  this.long-location.longitude;

});

},(error)=>{
console.log(error);

});
//-------------------------------------------------------------------------
this.backgroundGeolocation.start();

var options ={
  frequency:3000,
  enableHighAccuracy:true
};
this.watch=this.geolocation.watchPosition(options).filter((pos:any)=>pos.code===undefined).subscribe((position: Geoposition)=>{
  console.log(position);
  this.zone.run(()=>{
this.lat=position.coords.latitude;
this.long=position.coords.longitude;
this.currentLocation={lat:this.lat,long:this.long};
this.af.list("/currentLocation").update(
  "-LSnlQbCkj9yZspisJJG",{lat:this.lat,long:this.long});
  })
})



} 
//////////////////////////////////////////////////////////////////////////////////////////////////////////
stopGps(){
this.backgroundGeolocation.finish();
this.watch.unsubscribe();
console.log("the gps stoped");

} 
 fun=setInterval(this.startGps.bind(this), 3000);
ionViewDidLoad(){
//this.loadmap();
this.startGps();
this.fun;
} 

/*loadmap(){

  this.geolocation.getCurrentPosition().then((position=>{
    var latLong=new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
    var options={
      center:latLong,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoom:30
    }
    this.map=new google.maps.Map(this.mapElement.nativeElement,options);
    var marker = new google.maps.Marker({position:latLong, map: this.map},(error)=>{
    console.log(error);
  });
    
 } ))
    
    

}*/
SendNote(){
this.af.list("/Notes").push({Note:this.Note.value,SeenByParent:0});
this.navCtrl.setRoot(this.navCtrl.getActive().component);
}
}
