/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpClientModule, HttpEvent } from '@angular/common/http';

import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  // TranslateLoader,
  // TranslateStaticLoader,
} from 'ng2-translate/src/translate.service';
import { HttpErrorHandler } from 'src/providers/utilities/api/http-error-handler';
import { ProvidersModule } from '../providers/providers.module';

import { AppComponent } from './app.component';
import { SharedModule } from './shared.module';
// import { TranslateModule } from 'ng2-translate';

// Modules

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function createHttpErrorHandler(_httpErrorHandler: HttpErrorHandler) {
  return () => {};
}

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n', '.json');
}

export class MyMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    console.warn('Missing translation', params);
    return '';
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot({
      mode: 'ios',
    }),
    SharedModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateHttpLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ProvidersModule,
  ],
  exports: [ProvidersModule],
  bootstrap: [AppComponent],
  entryComponents: [AppComponent],
  providers: [
    HttpErrorHandler,
    {
      provide: APP_INITIALIZER,
      useFactory: createHttpErrorHandler,
      deps: [HttpErrorHandler],
      multi: true,
    },
  ],
})
export class AppModule {}

// required for AOT compilation
// burası

// eslint-disable-next-line @typescript-eslint/naming-convention
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
