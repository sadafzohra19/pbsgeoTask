import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BaseService {

  
 public url = 'https://wipperfuerth.pgconnect.de/api/v1/webgis'
 protected endpoint = '';

 constructor(protected http: HttpClient) {}

 /**
  * @author Sadaf Zohra
  * @param action string
  * @param params {}
  */
 protected get(action: string, params?: {}, headers?: {}): Observable<any> {
   return this.http.get(this.getRestURL(action), {
     params,
     headers
   });
 }

 /**
  * @author Sadaf Zohra
  * @param action string
  * @param data {}
  */
 protected post(
   action: string,
   data?: any,
   params?: any,
   headers?: any
 ): Observable<any> {
   return this.http.post(this.getRestURL(action), data, {
     params,
     headers
   });
 }

 /**
  * @author Sadaf Zohra
  * @param action string
  * @param data {}
  */
 protected put(action: string, data?: any, params?: any, headers?: any): Observable<any> {
   return this.http.put(this.getRestURL(action), data, {
     params,
     headers
   });
 }

 /**
  * @author Sadaf Zohra
  * @param action string
  */
 protected delete(action: string, data?: any, params?: any, headers?: any): Observable<any> {
   return this.http.request('delete', this.getRestURL(action), {
     body: data,
     params: params,
     headers
   });
 }

 /**
  * @author Sadaf Zohra
  */
 private getRestURL(action: string): string {
  //  console.log(action)
   return this.endpoint.length > 0
     ? `${this.url}/${this.endpoint}/${action}`
     : `${this.url}/${action}`;
 }




}
