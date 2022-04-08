/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { NgModule } from '@angular/core';

// API providers
import { Oauth } from './utilities/api/oauth';
import { AuthToken } from './utilities/api/auth-token';
import { HttpErrorHandler } from './utilities/api/http-error-handler';
import { ApiGateway } from './utilities/api/api-gateway';
// Utility providers
import { Settings } from './utilities/app-settings';
import { Config } from './utilities/app-configuration';
import { Utilities } from './utilities/app-utilities';
import { StorageProvider } from './utilities/storage-provider';
import { CacheRequest } from './utilities/cache-request';
// import { GAProvider } from './utilities/ga-provider';
import { WebPopup } from './utilities/web-popup';
import { FormValidator } from './utilities/form-validator';
// Other providers
import { ProgressProvider } from './progress-provider';
import { MenuProvider } from './menu-provider';
import { LoginProvider } from './login-provider';
import { UserProvider } from './user-provider';
import { SurveyProvider } from './survey-provider';
import { MotivatorsProvider } from './motivators-provider';
import { StrategyProvider } from './strategy-provider';
import { TipsProvider } from './tips-provider';
import { InfoProvider } from './info-provider';
import { LessonProvider } from './lesson-provider';
import { AuthorizationProvider } from './authorization-provider';
import { SessionProvider } from './session-provider';
import { DiaryProvider } from './diary-provider';
import { FavoriteProvider } from './favorite-provider';
import { BoostMeAnalyticsProvider } from './boost-me-analytics-provider';
import { FCMProvider } from './fcm-provider';
import { FileProvider } from './file-provider';
import { NotificationProvider } from './notification-provider';
import { SituationsProvider } from './situations-provider';
import { MessageProvider } from './message-provider';
import { PodcastProvider } from './podcast-provider';
import { RewardProvider } from './reward-provider';
import { StatusBar } from '@ionic-native/status-bar/ngx';

export function httpErrorHandler(httpErrorHandler: HttpErrorHandler): any {
  return (): any => {};
}

@NgModule({
  providers: [
    // API providers
    Oauth,
    AuthToken,
    HttpErrorHandler,
    ApiGateway,
    // Utility providers
    Settings,
    Config,
    Utilities,
    StorageProvider,
    CacheRequest,
    // GAProvider,
    WebPopup,
    FormValidator,
    // Other providers
    StatusBar,
    ProgressProvider,
    MenuProvider,
    LoginProvider,
    UserProvider,
    SurveyProvider,
    MotivatorsProvider,
    StrategyProvider,
    TipsProvider,
    InfoProvider,
    LessonProvider,
    AuthorizationProvider,
    SessionProvider,
    FavoriteProvider,
    BoostMeAnalyticsProvider,
    FCMProvider,
    DiaryProvider,
    MotivatorsProvider,
    FileProvider,
    NotificationProvider,
    SituationsProvider,
    MessageProvider,
    PodcastProvider,
    RewardProvider,
  ],
})
export class ProvidersModule {}
