/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { Settings } from '../app-settings';

@Injectable()
export class Oauth {
  constructor(private settings: Settings) {}

  parseUrl(url) {
    const urlParts = url.split('?');
    const baseUrl = urlParts[0];
    const params = {};

    if (urlParts.length > 1) {
      const pairs = urlParts[1].split('&');
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        params[pair[0]] = pair[1] ? pair[1] : '';
      }
    }
    return { baseUrl, params };
  }

  combineHash(origHash, newHash): Object {
    const hashString = JSON.stringify(origHash);
    const hash = JSON.parse(hashString);

    for (const key in newHash) {
      hash[key] = newHash[key];
    }
    return hash;
  }

  generateOauthSignature(httpMethod, url, params): string {
    let baseString = '';
    baseString += httpMethod.toUpperCase();
    baseString += '&' + this.Rfc3986(url);
    baseString += '&' + this.Rfc3986(this.normalize(params));

    const signingKey = this.settings.oAuth.consumer.secret + '&'; //no need for TOKEN_SECRET

    return CryptoJS.enc.Base64.stringify(
      CryptoJS.HmacSHA1(baseString, signingKey)
    );
  }

  normalize(params) {
    //sort the keys
    const sortedKeys = [];
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const encodedKey = this.Rfc3986(key);
        sortedKeys.push(encodedKey);
      }
      sortedKeys.sort();
    }

    //concatenate
    const normalizedParameters = [];
    for (let i = 0; i < sortedKeys.length; i++) {
      const key = decodeURIComponent(sortedKeys[i]);
      normalizedParameters.push(key + '=' + params[key]);
    }
    return normalizedParameters.join('&');
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  Rfc3986(decoded) {
    if (!decoded) {
      return '';
    }
    return encodeURIComponent(decoded)
      .replace(/!/g, '%21')
      .replace(/\*/g, '%2A')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\'/g, '%27');
  }

  addOauthParameters(): Object {
    const params = {};
    params['oauth_consumer_key'] = this.settings.oAuth.consumer.key;
    params['oauth_token'] = '';
    params['oauth_nonce'] = this.createNonce(32);
    params['oauth_signature_method'] = this.settings.oAuth.signatureMethod;
    params['oauth_timestamp'] = Math.round(new Date().getTime() / 1000);
    params['oauth_version'] = this.settings.oAuth.version;
    return params;
  }

  createNonce(howMany): string {
    howMany = howMany || 32;
    const res = [];
    const chars =
      'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789';

    for (let i = 0; i < howMany; i++) {
      res.push(chars[Math.round(Math.random() * chars.length)]);
    }

    return res.join('');
  }
}
