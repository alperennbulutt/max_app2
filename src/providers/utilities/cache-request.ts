/***************************
 * Requires:               *
 * - ./api-gateway.ts      *
 * - ./storage-provider.ts *
 ***************************/

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiGateway } from './api/api-gateway';
import { StorageProvider } from './storage-provider';

@Injectable()
export class CacheRequest {
  private storageKey = 'cacheData';
  private requests: any = {};
  private debug = false;

  constructor(
    private apiGateway: ApiGateway,
    private storageProvider: StorageProvider
  ) {}

  public fetch(
    endpoint: string,
    method: string,
    params: any,
    fresh?: boolean,
    hideLoader?: boolean,
    ttl?: number
  ): Promise<any> {
    const key: string = method.split('&')[0];
    return new Promise(async (resolve: any, reject: any) => {
      if (fresh) {
        (
          await this.serverRequest(endpoint, method, params, hideLoader)
        ).subscribe((data: any) => {
          if (data) {
            if (this.debug) {
              console.log('from server:', method);
            }
            this.requests[key] = {
              data,
              lifetime: ttl * 1000,
              timestamp: Date.now(),
            };
            this.save();
            resolve(this.requests[key].data);
          }
        });
      } else {
        let isDead = false;

        if (this.requests[key]) {
          if (
            this.requests[key].ttl >
            Date.now() - this.requests[key].timestamp
          ) {
            if (this.debug) {
              console.log('from cache:', method);
            }
            resolve(this.requests[key].data);
            return;
          } else {
            if (this.debug) {
              console.log('cache is pronounced dead:', method);
            }
            isDead = true;
          }
        }

        this.storageProvider
          .getItem(this.storageKey)
          .then(async (storageData: any) => {
            if (!isDead && storageData && storageData[key]) {
              if (this.debug) {
                console.log('from storage:', method);
              }
              this.requests = storageData || {};
              resolve(this.requests[key].data);
            } else {
              if (this.debug) {
                console.log('from server:', method);
              }
              (
                await this.serverRequest(endpoint, method, params, hideLoader)
              ).subscribe((data: any) => {
                if (data) {
                  this.requests[key] = {
                    data,
                    lifetime: ttl * 1000,
                    timestamp: Date.now(),
                  };
                  this.save();
                  resolve(this.requests[key].data);
                }
              });
            }
          });
      }
    });
  }

  /**
   * Clear all cached requests
   */
  public clear(): void {
    this.storageProvider.deleteItem(this.storageKey);
    this.requests = {};
  }

  public clearRequestCache(method: string): void {
    delete this.requests[method];
    this.save();
  }

  private async serverRequest(
    endpoint: string,
    method: string,
    params: any,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    return await this.apiGateway.get(endpoint + method, params, hideLoader);
  }

  /**
   * Save the cache
   */
  private save(): void {
    this.storageProvider.setItem(this.storageKey, this.requests);
  }
}
