/* eslint-disable @typescript-eslint/no-empty-interface */
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

  public async get(hideLoader?: boolean): Promise<Observable<ITips>> {
    const method = 'tips.get';
    return await this.apiGateway.get(
      this.settings.apiEndpoint + method,
      { appid: this.settings.appId },
      hideLoader
    );
  }
}
