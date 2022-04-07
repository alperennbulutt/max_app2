import { Pipe, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';

@Pipe({
  name: 'URLSanitizer',
})
@Injectable()
export class PipeURLSanitizer {
  constructor(public sanitizer: DomSanitizer, public platform: Platform) {}

  transform(url: string): any {
    if (this.platform.is('cordova')) {
      const win: any = window;
      const fixedURL: any = win.Ionic.WebView.convertFileSrc(url);
      return this.sanitizer.bypassSecurityTrustUrl(fixedURL);
    } else {
      return url;
    }
  }
}
