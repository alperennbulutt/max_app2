/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular/';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/finally';

import { Oauth } from './oauth';
import { AuthToken } from './auth-token';

import 'rxjs/add/operator/map';

export class ApiGatewayOptions {
  method: string;
  url: string;
  headers: any;
  params = {};
  data = {};
}

@Injectable()
export class ApiGateway {
  // Define the internal Subject we'll use to push errors
  private errorsSubject = new Subject<any>();

  // Provide the *public* Observable that clients can subscribe to
  errors$: Observable<any>;

  // Define the internal Subject we'll use to push the command count
  private pendingCommandsSubject = new Subject<number>();
  private pendingCommandCount = 0;

  private pendingRequestsCount = 0;
  private loader: HTMLIonLoadingElement;

  // Provide the *public* Observable that clients can subscribe to
  pendingCommands$: Observable<number>;

  constructor(
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private authToken: AuthToken,
    private oauth: Oauth
  ) {
    // Create our observables from the subjects
    this.errors$ = this.errorsSubject.asObservable();
    this.pendingCommands$ = this.pendingCommandsSubject.asObservable();

    // this.loader = await this.loadingCtrl.create({
    //   showBackdrop: false,
    //   spinner: 'circles',
    // });
  }

  defaultErrorHandler(error: any) {
    console.group('HttpErrorHandler');
    console.log(error.status, 'status code detected.');
    console.dir(error);
    console.groupEnd();

    if (error.status === 400) {
      console.log('Bad Request');
    }
    if (error.status === 401) {
      console.log('Not Authorized');
    }
    // @TODO: send error to api
  }

  // I perform a GET request to the API, appending the given params
  // as URL search parameters. Returns a stream.
  get(
    url: string,
    params: any,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    const options = new ApiGatewayOptions();
    options.method = 'get';
    options.url = url;
    options.params = params;
    options.headers = params.headers;
    delete params.headers;

    return this.request(options, hideLoader);
  }

  // I perform a POST request to the API. If both the params and data
  // are present, the params will be appended as URL search parameters
  // and the data will be serialized as a JSON payload. If only the
  // data is present, it will be serialized as a JSON payload. Returns
  // a stream.
  post(
    url: string,
    params: any,
    data: any,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    if (!data) {
      data = params;
      params = {};
    }
    const options = new ApiGatewayOptions();
    options.method = 'post';
    options.url = url;
    options.params = params;
    options.data = data;

    return this.request(options, hideLoader);
  }

  // I perform a PUT request to the API. If both the params and data
  // are present, the params will be appended as URL search parameters
  // and the data will be serialized as a JSON payload. If only the
  // data is present, it will be serialized as a JSON payload. Returns
  // a stream.
  put(
    url: string,
    params: any,
    data: any,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    if (!data) {
      data = params;
      params = {};
    }
    const options = new ApiGatewayOptions();
    options.method = 'put';
    options.url = url;
    options.params = params;
    options.data = data;
    return this.request(options, hideLoader);
  }

  // I perform a DELETE request to the API. If both the params and data
  // are present, the params will be appended as URL search parameters
  // and the data will be serialized as a JSON payload. If only the
  // data is present, it will be serialized as a JSON payload. Returns
  // a stream.
  delete(
    url: string,
    params: any,
    data: any,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    if (!data) {
      data = params;
      params = {};
    }
    const options = new ApiGatewayOptions();
    options.method = 'delete';
    options.url = url;
    options.params = params;
    options.data = data;

    return this.request(options, hideLoader);
  }

  private async request(
    options: ApiGatewayOptions,
    hideLoader?: boolean
  ): Promise<Observable<ArrayBuffer>> {
    options.method = options.method || 'get';
    options.url = options.url || '';
    options.headers = options.headers || {};
    options.params = options.params || {};
    options.data = options.data || {};

    //add required Oauth parameters
    const oauthParams = this.oauth.addOauthParameters();
    for (const key in oauthParams) {
      options.params[key] = oauthParams[key];
    }

    //calculate signature and add to params
    const parsedUrl = this.oauth.parseUrl(options.url);
    options.params['oauth_signature'] = this.oauth.generateOauthSignature(
      options.method,
      parsedUrl.baseUrl,
      this.oauth.combineHash(options.params, parsedUrl.params)
    );

    this.interpolateUrl(options);
    //this.addXsrfToken(options);
    this.addContentType(options);

    const requestOptions: any = {};
    requestOptions.method = options.method;
    requestOptions.url = options.url;
    requestOptions.headers = options.headers;
    requestOptions.params = this.buildHttpParams(options.params);
    requestOptions.body = JSON.stringify(options.data);

    const token = this.authToken.getToken();
    if (token) {
      requestOptions.headers['Authorization'] = 'Bearer ' + token;
    }

    const isCommand = options.method !== 'get';

    if (isCommand) {
      this.pendingCommandsSubject.next(++this.pendingCommandCount);
    }

    if (this.pendingRequestsCount === 0) {
      if (!hideLoader && !this.loader) {
        this.loader = await this.loadingCtrl.create({
          showBackdrop: false,
          spinner: 'circles',
          duration: 5000,
        });
        await this.loader.present();
      }
    }
    this.pendingRequestsCount++;

    const stream = this.http
      .request(options.method, options.url, requestOptions)
      .catch((error: any) => {
        this.errorsSubject.next(error);
        this.defaultErrorHandler(error);
        return Observable.throw(this.unwrapHttpError(error));
      })
      .catch((error: any) => {
        return Observable.throw(error);
      })
      .finally(async () => {
        this.pendingRequestsCount--;
        if (this.pendingRequestsCount === 0) {
          if (!hideLoader && this.loader) {
            (await this.loader)
              .dismiss()
              .then(() => {
                this.loader = null;
              })
              .catch((err: any) => {});
          }
        }
        if (isCommand) {
          this.pendingCommandsSubject.next(--this.pendingCommandCount);
        }
      });

    return stream;
  }

  private addContentType(options: ApiGatewayOptions): ApiGatewayOptions {
    if (options.method !== 'get') {
      options.headers['Content-Type'] = 'application/json; charset=UTF-8';
    }
    return options;
  }

  private extractValue(collection: any, key: string): any {
    const value = collection[key];
    delete collection[key];
    return value;
  }

  /*
    private addXsrfToken(options: ApiGatewayOptions): ApiGatewayOptions {
        var xsrfToken = this.getXsrfCookie();
        if (xsrfToken) {
            options.headers["X-XSRF-TOKEN"] = xsrfToken;
        }
        return options;
    }
    */

  /*
    private getXsrfCookie(): string {
        var matches = document.cookie.match(/\bXSRF-TOKEN=([^\s;]+)/);
        try {
            return (matches && decodeURIComponent(matches[1]));
        } catch (decodeError) {
            return ("");
        }
    }
    */

  private buildHttpParams(params: any): any {
    const searchParams = {};
    for (const key in params) {
      searchParams[key] = params[key];
    }
    return searchParams;
  }

  private interpolateUrl(options: ApiGatewayOptions): ApiGatewayOptions {
    options.url = options.url.replace(/:([a-zA-Z]+[\w-]*)/g, ($0, token) => {
      // Try to move matching token from the params collection.
      if (options.params.hasOwnProperty(token)) {
        return this.extractValue(options.params, token);
      }
      // Try to move matching token from the data collection.
      if (options.data.hasOwnProperty(token)) {
        return this.extractValue(options.data, token);
      }
      // If a matching value couldn't be found, just replace
      // the token with the empty string.
      return '';
    });
    // Clean up any repeating slashes.
    //options.url = options.url.replace(/\/{2,}/g, "/");
    // Clean up any trailing slashes.
    options.url = options.url.replace(/\/+$/g, '');

    return options;
  }

  private unwrapHttpError(error: any): any {
    try {
      return {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
      };
    } catch (jsonError) {
      return {
        code: -1,
        message: 'An unexpected error occurred.',
      };
    }
  }
}
