/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClient, HttpClientModule, HttpEvent } from '@angular/common/http';

import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// import {
//   MissingTranslationHandler,
//   MissingTranslationHandlerParams,
//   // TranslateLoader,
//   // TranslateStaticLoader,
// } from 'ng2-translate/src/translate.service';
import { HttpErrorHandler } from 'src/providers/utilities/api/http-error-handler';
import { ProvidersModule } from '../providers/providers.module';
import { RouteReuseStrategy } from '@angular/router';

import { AppComponent } from './app.component';
import { SharedModule } from './shared.module';
import { AppRoutingModule } from './app-routing.module';

// Modules

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function createHttpErrorHandler(_httpErrorHandler: HttpErrorHandler) {
  return () => {};
}

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n', '.json');
}

// export class MyMissingTranslationHandler implements MissingTranslationHandler {
//   handle(params: MissingTranslationHandlerParams): string {
//     console.warn('Missing translation', params);
//     return '';
//   }
// }

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    SharedModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateHttpLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ProvidersModule,
  ],
  exports: [ProvidersModule],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy,
    },
  ],
})
export class AppModule {}

// required for AOT compilation

export function httpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
