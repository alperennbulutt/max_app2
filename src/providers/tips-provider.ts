import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiGateway } from './utilities/api/api-gateway';
import { Settings } from './utilities/app-settings';

export interface ITip {}
export interface ITips {
  data: ITip;
  status: string;
}

@Injectable()
export class TipsProvider {
  constructor(private settings: Settings, private apiGateway: ApiGateway) {}

  public get(hideLoader?: boolean): Observable<ITips> {
    let method: string = 'tips.get';
    return this.apiGateway.get(
      this.settings.apiEndpoint + method,
      { appid: this.settings.appId },
      hideLoader
    );
  }
}
