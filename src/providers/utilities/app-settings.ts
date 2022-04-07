/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
/***************************************************
 * App settings for API, S3, GoogleAnalytics, etc. *
 ***************************************************/

import { Injectable } from '@angular/core';
import { Platform } from '../platform';

@Injectable()
export class Settings {
  constructor(private platform: Platform) {}

  private readonly baseUrl: string = this.platform.is('cordova')
    ? 'https://boostme.trimbos.nl'
    : 'https://boostme.trimbos.nl';

  // private readonly baseUrl: string = (
  // 	this.platform.is('cordova')
  // 	? 'https://ti-boostmev2.e-dev.nl'
  // 	: 'https://ti-boostmev2.e-dev.nl'
  // );

  private readonly baseQuestionnaireUrl: string = this.platform.is('cordova')
    ? 'https://ti-vragenlijst.e-dev.nl'
    : 'https://ti-vragenlijst.e-dev.nl';

  public readonly appId: string = 'bfec50b7-4f05-4ba6-a2ec-13d7ce70e55f';
  public readonly apiEndpoint: string = this.baseUrl + '/api/index.cfm?act=';
  public readonly apiQuestionnaireEndpoint: string =
    this.baseQuestionnaireUrl + '/api/index.cfm?act=';
  public readonly imgBasePath: string =
    'https://images.e-vision.nl/trimbos/boostme_v2/images/optimized/';
  public readonly mediaBasePath: string =
    'https://media.e-vision.nl/trimbos/boostme_v2/docs/';
  public readonly oAuth: any = {
    consumer: {
      key: 'TRIMBOS-BoostME-App',
      secret: 'SZvD8oKlQ2bq6YEPSrB7n552vvMRGhjk4tj2GyGMlzYaXzke4E',
    },
    signatureMethod: 'HMAC-SHA1',
    version: '1.0',
  };
  public readonly s3: any = {
    endpoint: '',
    accesskey: '',
  };
  public readonly gaId: string = '';

  public static ImgEndpoint =
    'https://images.e-vision.nl/trimbos/boostme_v2/images/optimized/';
  public static VideoEndpoint =
    'https://media.e-vision.nl/trimbos/boostme_v2/video/transcodes/';
  public static FileEndpoint =
    'https://media.e-vision.nl/trimbos/boostme_v2/docs/';
}
