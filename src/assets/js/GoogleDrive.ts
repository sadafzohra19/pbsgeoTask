import { Injectable, NgZone } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, from } from 'rxjs';
declare var gapi: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {

  constructor( protected cookie: CookieService,
    public zone: NgZone) {

        var myCallbackO = function (data) {
        };
        gapi.load('client', () => 
            gapi.client.load('drive', 'v3', myCallbackO)
        );
  }

  public getGoogleRootFiles(token): Observable<any>{
    const instance = this;
    const interval =setInterval(() => {
      try {
        if(gapi.client.drive){
          clearInterval(interval);
        }
      } catch(error) {
      }
    }, 100 );
    const promise = gapi.client.drive.files.list({
        'access_token':token,
        'pageSize': 10,
        "q":"'root' in parents and trashed=false",
        'fields': "nextPageToken, files(id, kind, name, mimeType,iconLink, modifiedTime, createdTime, owners, ownedByMe)"
      }).then((res) => {
        console.log(res)
        return res.result.files;
      });
      return this.inObservable(promise);
    }

    public inObservable(promise) {
        return from(
          new Promise((resolve, reject) => {
            this.zone.run(() => {
              promise.then(resolve, reject);
            });
          })
        );
      }

  }



