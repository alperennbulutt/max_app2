import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiGateway } from './utilities/api/api-gateway';
import { Settings } from './utilities/app-settings';

export interface ILogin {
  email: string;
  password: string;
  appid?: string;
}

export interface IRegister {
  email: string;
  password: string;
  gender: string;
  birthdate?: string;
  appid?: string;
  custom_data?: string;
  notification_hour?: number;
}

export interface IPassForgot {
  email: string;
  appid?: string;
}

@Injectable()
export class LoginProvider {
  constructor(private settings: Settings, private apiGateway: ApiGateway) {}

  public register(data: IRegister, hideLoader?: boolean): Observable<any> {
    let method: string = 'profile.register';
    data.appid = this.settings.appId;
    return this.apiGateway.post(
      this.settings.apiEndpoint + method,
      null,
      data,
      hideLoader
    );
  }

  public login(data: ILogin, hideLoader?: boolean): Observable<any> {
    let method: string = 'access.login';
    data.appid = this.settings.appId;
    return this.apiGateway.post(
      this.settings.apiEndpoint + method,
      null,
      data,
      hideLoader
    );
  }

  public forgotPassword(
    data: IPassForgot,
    hideLoader?: boolean
  ): Observable<any> {
    let method: string = 'access.resetPassword';
    data.appid = this.settings.appId;
    return this.apiGateway.post(
      this.settings.apiEndpoint + method,
      null,
      data,
      hideLoader
    );
  }

  public getPermissionGroup(hideLoader?: boolean): Observable<any> {
    let method: string = 'access.randomise';
    return this.apiGateway.get(
      this.settings.apiEndpoint + method,
      { appid: this.settings.appId },
      hideLoader
    );
  }
}
