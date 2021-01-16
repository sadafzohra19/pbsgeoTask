import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class MapService extends BaseService{

  constructor(protected http: HttpClient, ) {
    super(http);
  }

  public getAllAvailableGraveyards(): any {
    return this.get(`friedhof`);
  }

  public getAllAvailableGraves(friedhofId : Text):any{
    return this.get(`grab`, {friedhofId});
  }

  public getAllAvailableGravePlots(friedhofId : Text):any{
    return this.get(`grabstelle`, {friedhofId});
  }

  public getAllAvailableGravePlotsWithNoData(friedhofId : Text):any{
    return this.get(`grabstelle/unverknuepft`,  {friedhofId});
  }

}
