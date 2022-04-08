/* eslint-disable @typescript-eslint/naming-convention */
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

  public async register(
    data: IRegister,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    const method = 'profile.register';
    data.appid = this.settings.appId;
    return await this.apiGateway.post(
      this.settings.apiEndpoint + method,
      null,
      data,
      hideLoader
    );
  }

  public async login(
    data: ILogin,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    const method = 'access.login';
    data.appid = this.settings.appId;
    return await this.apiGateway.post(
      this.settings.apiEndpoint + method,
      null,
      data,
      hideLoader
    );
  }

  public async forgotPassword(
    data: IPassForgot,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    const method = 'access.resetPassword';
    data.appid = this.settings.appId;
    return await this.apiGateway.post(
      this.settings.apiEndpoint + method,
      null,
      data,
      hideLoader
    );
  }

  public async getPermissionGroup(
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    const method = 'access.randomise';
    return await this.apiGateway.get(
      this.settings.apiEndpoint + method,
      { appid: this.settings.appId },
      hideLoader
    );
  }
}
