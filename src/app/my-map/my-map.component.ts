// import { Component, OnInit } from '@angular/core';
import {Component, NgZone, AfterViewInit, Output, Input, EventEmitter, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import {View, Feature, Map, Observable } from 'ol';
import {Coordinate} from 'ol/coordinate';
import { ScaleLine, defaults as DefaultControls} from 'ol/control';
import * as proj4x from 'proj4';
import VectorLayer from 'ol/layer/Vector';
import Projection from 'ol/proj/Projection';
import {register}  from 'ol/proj/proj4';
import {get as GetProjection} from 'ol/proj'
// import * as ol from 'ol';
// import ol from 'ol';
import {Extent} from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import Vector from 'ol/layer/VectorTile';
import OSM, {ATTRIBUTION} from 'ol/source/OSM';
import { MapService } from '../services/map.service';
import { HttpClient } from '@angular/common/http';
import VectorSource from 'ol/source/Vector';
// import * as GeoJSON from 'geojson';
import GeoJSON from 'ol/format/GeoJSON';
import {fromLonLat} from 'ol/proj';
import {Fill, RegularShape, Stroke, Style} from 'ol/style';

let proj4 = (proj4x as any).default;
// declare var instance: any;
interface Graveyard{
  friedhof: Text,
  friedhofId: Text,
  UnassignedPlots?: Number
}
@Component({
  selector: 'app-my-map',
  templateUrl: './my-map.component.html',
  styleUrls: ['./my-map.component.scss']
})
export class MyMapComponent implements AfterViewInit {

  @ViewChild('cover') cover: ElementRef | undefined;
  @ViewChild('arrowbtn') arrowbtn: ElementRef | undefined;


  // @Input() center: Coordinate =[16.7131176 , 49.6887424] ;
  @Input() center: Coordinate | undefined ;

  @Input() zoom: number | undefined;
  view: View | undefined;
  projection: Projection | undefined;
  extent: Extent = [-20026376.39, -20048966.10, 20026376.39, 20048966.10];
  Map: Map | undefined;
  @Output() mapReady : EventEmitter<any> = new EventEmitter<Map>();
  public instance = this;
  public allGraveYards: Graveyard[] = [];
  public allAvailableGraves= [];
  public allAvailableGravePlots= [];
  public allGravePlotsWithNoData= [];

  public currentGraveYard: any;
  public graveLayer: any;
  public gravePlotLayer: any;
  public unassignedLayer: any;

  public defaultPolygonStyle: any;

  public isOpen = true;
  public totalAvailableGraves = 0;
  public totalAvailableGravePlots = 0;

  public gravePlotDownloadInProgress = false
  public graveDownloadInProgress = false


  constructor(
    private zone: NgZone, 
    private cd: ChangeDetectorRef,
    private mapService: MapService,
    private http: HttpClient
    
    ) { 
    }


  ngAfterViewInit():void {
    if (! this.Map) {
      this.zone.runOutsideAngular(() => this.initMap())
    } 
    setTimeout(()=>this.mapReady.emit(this.Map));

    this.getAllGraveyard();

    this.defaultPolygonStyle = new Style({
      fill: new Fill({
        color: 'rgba(0, 0, 255, 0.1)',//'#ffffff'
      }),
      stroke: new Stroke({
        color: 'blue',
        width: 2
      })
    });

  }

  private initMap(): void{

    proj4.defs("EPSG:3857","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
    register(proj4)
    this.projection = GetProjection('EPSG:3857');
    this.projection.setExtent(this.extent);
    this.view = new View({
      center: this.center,
      zoom: this.zoom,
      projection: this.projection,
    });
    this.Map = new Map({
      layers: [new TileLayer({
        source: new OSM({})
      })],
      target: 'map',
      view: this.view,
      controls: DefaultControls().extend([
        new ScaleLine({}),
      ]),
    });
  }


  public getAllGraveyard(){
    
    this.mapService.getAllAvailableGraveyards().subscribe(
      (response: any) => {

        this.allGraveYards = response;
      }
    );
  }
  
  public getAllAvailableGraves() {
    this.removeLayers();
    this.graveDownloadInProgress = true;
    this.mapService.getAllAvailableGraves(this.currentGraveYard).subscribe(
      (response:any) => {
        
        this.totalAvailableGraves = response.features.length;
        var features = new GeoJSON().readFeatures(response, {
          featureProjection: 'EPSG:3857'
        });

        var vectorSource = new VectorSource({
          features: features
        });
        this.graveLayer = new VectorLayer({
          source: vectorSource,
          style: this.defaultPolygonStyle
        });
        this.Map?.addLayer(this.graveLayer)
        this.Map?.getView().fit(this.graveLayer.getSource().getExtent(), { duration: 1500 });  
        this.graveDownloadInProgress = false;  
      }
    )
  }

  public getAllAvailableGravePlots() {
    this.removeLayers();
    this.gravePlotDownloadInProgress = true;
    this.mapService.getAllAvailableGravePlots(this.currentGraveYard).subscribe(
      (response:any) => {
        
        this.totalAvailableGravePlots = response.features.length;
        var features = new GeoJSON().readFeatures(response, {
          featureProjection: 'EPSG:3857'
        });

        var vectorSource = new VectorSource({
          features: features
        });
        this.gravePlotLayer = new VectorLayer({
          source: vectorSource,
          style: this.defaultPolygonStyle
        });
        this.Map?.addLayer(this.gravePlotLayer)
        this.Map?.getView().fit(this.gravePlotLayer.getSource().getExtent(), { duration: 1500 });
        this.gravePlotDownloadInProgress = false;


      },
      (error:any) => {
        console.log(error)
        this.gravePlotDownloadInProgress = false;
      }
    )
  }

  public getAllUnassignedGravePlots(){
    this.removeLayers();
    this.allGraveYards.forEach(element => {
      // debugger
      this.getAllUnassignedGravePlotsCount(element)
    });

  }

  public getAllUnassignedGravePlotsCount(ele : Graveyard){
    this.mapService.getAllAvailableGravePlotsWithNoData(ele.friedhofId).subscribe(
      (response:any) => {
        var index = this.allGraveYards.findIndex(x => x.friedhofId == ele.friedhofId)
        this.allGraveYards[index].UnassignedPlots = response.features.length;

      }
    )
  }

  public changeGraveyard(event: any){
    this.currentGraveYard  = event.value;
  }
  public graveName(event: any){

    var oneDeceasedPerson= new Style({
      fill: new Fill({
        color: 'rgba(255, 126, 0, 0.5)',//'#ffffff'
      }),
      stroke: new Stroke({
        color: '#FF7E00',
        width: 2
      })
    });
    
    let allFeatures = this.graveLayer.getSource().getFeatures();
    if(event.checked){
      allFeatures.forEach((element: any) => {
        if(element.getProperties().nutzungsfristende != "buschhoven")
        {
          if(element.getProperties().grabname == 0  ){
            element.setStyle(oneDeceasedPerson);
          }

        }
      });
    }
  }

  
  public expiredGraves(event: any){
 
    var expired= new Style({
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.5)',//'#ffffff'
      }),
      stroke: new Stroke({
        color: '#FF0000',
        width: 2
      })
    });
    
    if(event.checked){
      let allFeatures = this.graveLayer.getSource().getFeatures();
      // debugger
      allFeatures.forEach((element:any) => {
        // debugger
        if(element.getProperties().nutzungsfristende != null)
        {
          if(new Date(element.getProperties().nutzungsfristende) < new Date()){
            element.setStyle(expired);
          }

        }
          
      });

    } else {
      let allFeatures = this.graveLayer.getSource().getFeatures();
      allFeatures.forEach((element:any) => {
        element.setStyle(this.defaultPolygonStyle);
      });
    }
  }
  public deceasedPersons(event: any){

    var oneDeceasedPerson= new Style({
      fill: new Fill({
        color: 'rgba(255, 126, 0, 0.5)',//'#ffffff'
      }),
      stroke: new Stroke({
        color: '#FF7E00',
        width: 2
      })
    });

    if(event.checked){
      let allFeatures = this.gravePlotLayer.getSource().getFeatures();
      // debugger
      allFeatures.forEach((element:any) => {
        if(element.getProperties().nutzungsfristende != null)
        {
          if(element.getProperties().verstorbene.length >0  ){
            element.setStyle(oneDeceasedPerson);
          }

        }
          
      });
    } else {
      let allFeatures = this.gravePlotLayer.getSource().getFeatures();
      allFeatures.forEach((element:any) => {
        element.setStyle(this.defaultPolygonStyle);
      });
    }
  }


  public removeLayers(){
    this.totalAvailableGraves = 0;
    this.totalAvailableGravePlots = 0;
    if(this.unassignedLayer){
      this.Map?.removeLayer(this.unassignedLayer);
    }
    if(this.graveLayer){
      this.Map?.removeLayer(this.graveLayer);
    }
    if(this.gravePlotLayer){
      this.Map?.removeLayer(this.gravePlotLayer);
    }
    
  }

  public resetMap(){
    this.totalAvailableGraves = 0;
    this.totalAvailableGravePlots = 0;
    this.removeLayers();
  }

  // At the end
  public showHideRightPanel() {
    // debugger
    var cover = this.cover?.nativeElement;
    var arrowBtn = this.arrowbtn?.nativeElement;

    if(this.isOpen){
      this.cover?.nativeElement.setAttribute("style", "width:  0px;right:  -45px;")
      // this.cover?.nativeElement.setAttribute("style", "")
    } else {
      this.cover?.nativeElement.setAttribute("style", "width:  300px;right:  0px;")
      // this.cover?.nativeElement.setAttribute("style", "")
    }
    this.isOpen = !this.isOpen

    // var rightPanelRight = parseFloat($("#cover").css("right").replace("px", ""));
    // var rightPanelWidth = $("#cover").css("width");

    // if (rightPanelRight != 0) {
    //     $("#cover").css("right", "0%");
    //     $("#arrow-btn").css("transform", "rotate(0deg)");
    // }
    // else {
    //     $("#cover").css("right", "-" + rightPanelWidth);
    //     $("#arrow-btn").css("transform", "rotate(180deg)");
    // }
  }

}
