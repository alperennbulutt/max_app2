import { NgModule } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage-angular';
import { HttpModule } from '@angular/http';
import { DragulaModule } from 'ng2-dragula';

// Ionic native
import { MockCamera } from './mocks/mock-camera';
import { SplashScreen } from '@ionic-native/splash-screen/';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Device } from '@ionic-native/device/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { FCM } from '@ionic-native/fcm/';
import { Camera } from '@ionic-native/camera/ngx/index';
import { File } from '@ionic-native/file/ngx/index';
import { Media } from '@ionic-native/media/ngx/index';
import { SafariViewController } from '@ionic-native/safari-view-controller/ngx/index';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx/index';

// Translate
import {
  TranslateModule,
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
} from 'ng2-translate';

// Dragula

// Modules
import { PipesModule } from '../pipes/pipes.module';
import { DirectivesModule } from '../directives/directives.module';
import { ComponentsModule } from '../components/components.module';
import { HttpClientModule } from '@angular/common/http';

export class MyMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    console.warn('Missing translation', params);
    return '...';
  }
}

@NgModule({
  declarations: [],
  providers: [
    // Ionic native
    SplashScreen,
    StatusBar,
    Keyboard,
    Device,
    AppVersion,
    LocalNotifications,
    FCM,
    MockCamera,
    Camera,
    File,
    Media,
    SafariViewController,
    InAppBrowser,

    {
      provide: MissingTranslationHandler,
      useClass: MyMissingTranslationHandler,
    },
  ],
  imports: [
    DragulaModule,

    PipesModule,
    ComponentsModule,
    DirectivesModule,

    HttpClientModule,
    IonicStorageModule.forRoot(),
  ],
  exports: [
    DragulaModule,

    PipesModule,
    ComponentsModule,
    DirectivesModule,

    TranslateModule,
  ],
})
export class SharedModule {
  static forRoot(): any {
    return {
      ngModule: SharedModule,
    };
  }
}
