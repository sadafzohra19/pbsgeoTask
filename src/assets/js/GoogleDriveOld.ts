import { from } from 'rxjs/internal/observable/from';


  declare var gapi: any;
  // declare var zone: NgZone;

  export const GoogleDriveAPI = function(){
    return{
      init: function(){
        var myCallbackO = function (data) {
        };
        gapi.load('client', () => 
            gapi.client.load('drive', 'v3', myCallbackO)
        );
      },
      getGoogleRootFiles: function(token, zone){
        const instance = this;

        const interval =setInterval(() => {
          try {
            if(gapi.client.drive){
              clearInterval(interval);
              const promise = gapi.client.drive.files.list({
                'access_token':token,
                'pageSize': 10,
                "q":"'root' in parents and trashed=false",
                'fields': "nextPageToken, files(id, kind, name, mimeType,iconLink, modifiedTime, createdTime, owners, ownedByMe)"
              }).then((res) => {
                console.log(res)
                return res.result.files;
              });
              return this.inObservable(promise, zone);
            }
          } catch(error) {
          }
        }, 100 );

      },
      inObservable: function(promise, zone) {
        return from(
          new Promise((resolve, reject) => {
            zone.run(() => {
              promise.then(resolve, reject);
            });
          })
        );
      },
      myDateTime : function(){
        return Date();
      },
      createFolder: function(){},
      
    };//End return
				
}();//end map	