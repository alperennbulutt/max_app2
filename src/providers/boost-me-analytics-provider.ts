import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { ApiGateway } from './utilities/api/api-gateway';

import { Settings } from './utilities/app-settings';
import { Platform } from '@ionic/angular';

export interface IAnalyticEvent {
  name: string;
  value?: any;
  date?: string;
}

@Injectable()
export class BoostMeAnalyticsProvider {
  private debounceTimeouts: any = {};

  constructor(
    private apiGateway: ApiGateway,
    private settings: Settings,
    public platform: Platform
  ) {}

  public async track(
    data: IAnalyticEvent,
    hideLoader?: boolean
  ): Promise<void> {
    if (this.platform.is('cordova')) {
      if (hideLoader === undefined) {
        hideLoader = true;
      }
      data.date = moment().toISOString();

      const method = 'events.save';
      (
        await this.apiGateway.post(
          this.settings.apiEndpoint + method,
          {},
          data,
          hideLoader
        )
      ).subscribe();
    }
  }

  public trackWithDebounce(data: IAnalyticEvent): void {
    if (this.debounceTimeouts[data.name]) {
      clearTimeout(this.debounceTimeouts[data.name]);
    }
    this.debounceTimeouts[data.name] = setTimeout(() => {
      this.track(data);
    }, 1000);
  }
}
