import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CacheRequest } from './utilities/cache-request';

import { ApiGateway } from './utilities/api/api-gateway';
import { Settings } from './utilities/app-settings';

@Injectable()
export class SituationsProvider {
  constructor(
    private settings: Settings,
    private apiGateway: ApiGateway,
    private cacheRequest: CacheRequest
  ) {}

  public getSituations(hideLoader?: boolean): Observable<any> {
    let method: string = 'maxx.getSituations';
    return this.apiGateway.get(
      this.settings.apiEndpoint + method,
      {},
      hideLoader
    );
  }

  public fetch(hideLoader?: boolean): Promise<any[]> {
    hideLoader = hideLoader || true;
    let method: string = 'maxx.getSituations';
    return this.cacheRequest.fetch(
      this.settings.apiEndpoint,
      method,
      {},
      false,
      hideLoader,
      900 // 15 minutes
    );
  }
}
