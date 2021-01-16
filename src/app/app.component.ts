

import {Component } from '@angular/core';
import { MapService } from './services/map.service';


declare const ol:any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{

  constructor(public mapService: MapService){

  }

  public onMapReady(e: any) {
    console.log("Map Ready")
    // this.mapService.getAllGraveyards().subscribe(
    //   (response: any) => {
    //     console.log(response)
    //   }
    // );
  }
  
}
