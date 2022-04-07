import { Component, ViewChild } from '@angular/core';

import { SplashScreen } from '@ionic-native/splash-screen';
import { EventService } from './events-service';

import {
  Platform,
  NavController,
  AlertController,
  ModalController,
  MenuController,
} from '@ionic/angular';
import { Subject } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';
// import { TranslateService } from 'lib/ng2-translate';

import * as moment from 'moment';
import { BoostMeAnalyticsProvider } from 'src/providers/boost-me-analytics-provider';
import { FCMProvider } from 'src/providers/fcm-provider';
import { InfoProvider } from 'src/providers/info-provider';
import { MessageProvider } from 'src/providers/message-provider';
import { RewardProvider } from 'src/providers/reward-provider';
import { StrategyProvider } from 'src/providers/strategy-provider';
import { UserProvider } from 'src/providers/user-provider';
import { AuthToken } from 'src/providers/utilities/api/auth-token';
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const Keyboard: any;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  // burası
  @ViewChild(NavController) nav: NavController;

  public menuPages: any[] = [
    {
      title: 'Vorderingen',
      component: 'Stats',
      icon: 'custom',
      color: 'green',
    },
    {
      title: 'Veelgestelde vragen',
      component: 'Faq',
      icon: 'lnr-chat-question',
      color: 'red',
    },
    {
      title: 'Instellingen',
      component: 'Settings',
      icon: 'lnr-gear-many',
      color: 'pink',
    },
    {
      title: 'Mijn profiel',
      component: 'Profile',
      icon: 'lnr-person',
      color: 'blue',
    },
    {
      title: 'Gebruiksvoorwaarden',
      component: 'Info',
      icon: 'lnr-paper-document',
      params: { code: 'TERMS' },
      color: 'yellow',
    },
    {
      title: 'Introductie',
      component: 'IntroductionPage',
      icon: 'lnr-circle-exclamation',
      params: { fromMenu: 'true' },
      color: 'green',
    },
  ];

  public rootPage = '';
  public menuContent: any = {};

  constructor(
    private platform: Platform,
    private events: EventService,
    private alertController: AlertController,
    private modalController: ModalController,
    private storage: Storage,
    private translate: TranslateService,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private fcmProvider: FCMProvider,
    private authToken: AuthToken,
    private menuController: MenuController,
    private userProvider: UserProvider,
    private infoProvider: InfoProvider,
    private messageProvider: MessageProvider,
    private boostMeAnalyticsProvider: BoostMeAnalyticsProvider,
    private strategyProvider: StrategyProvider,
    private rewardProvider: RewardProvider
  ) {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova') && this.platform.is('ios')) {
        Keyboard.hideFormAccessoryBar(false);
      } else if (this.platform.is('cordova')) {
        Keyboard.hideKeyboardAccessoryBar(false);
      }
      moment.locale('nl');
      localStorage.setItem('activityDate', moment().startOf('day').format());
      // If user is logged in, continue where he/she left
      if (localStorage.getItem('auth-token')) {
        this.nav.setRoot('Home');
        this.boostMeAnalyticsProvider.track({ name: 'HOME' });
      } else {
        this.nav.setRoot('IntroductionPage');
      }
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.translate.setDefaultLang('nl');

      if (this.platform.is('cordova')) {
        this.fcmProvider.onNotification.subscribe(async (notification: any) => {
          const data: any = JSON.parse(notification.data);
          // id 4 is evaluation id, this alert is handled in message-provider
          if (notification.tapped && data.message_id !== 4) {
            // eslint-disable-next-line prefer-const
            const alert = await this.alertController.create({
              header: notification.title,
              subHeader: notification.body,
              // title: notification.title,
              // subTitle: notification.body,
              buttons: [
                {
                  text: 'sluiten',
                  role: 'cancel',
                },
              ],
            });
            await alert.present();
          }
          if (data.message_id === 1) {
            this.messageProvider.addLocalMessage(3);
          }
          this.messageProvider.fetchUnreadMessages(true);
          this.strategyProvider.getSituations();
        });
      }
      this.messageProvider.checkforFeedback(this.nav, true);
      setTimeout(() => {
        this.rewardProvider.getCurrentReward();
      }, 1000);
    });

    // When app is activated from background
    this.platform.resume.subscribe((e) => {
      this.strategyProvider.getSituations();
      this.messageProvider.fetchUnreadMessages(true);
      this.messageProvider.checkforFeedback(this.nav, true);
    });

    this.events.getObservable().subscribe((menuData: any) => {
      if (menuData) {
        this.menuContent = menuData;
      }
    });
  }

  public openPage(page: any): void {
    let navParams = {};
    if (page.params) {
      navParams = page.params;
    }

    const analyticsLabels: any = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Stats: { name: 'VORDERINGEN_CHOSEN', value: '1' },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Faq: { name: 'FAQ_CHOSEN' },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Settings: { name: 'INSTELLINGEN_CHOSEN' },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Profile: { name: 'PROFIEL_CHOSEN' },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Info: { name: 'VOORWAARDEN_CHOSEN' },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      IntroductionPage: { name: 'INTRODUCTIE_CHOSEN' },
    };

    if (page.hasOwnProperty('component') && analyticsLabels[page.component]) {
      this.boostMeAnalyticsProvider.track(analyticsLabels[page.component]);
    }

    this.nav.push(page.component, navParams);
    this.menuController.close();
  }

  public logOut(): void {
    this.boostMeAnalyticsProvider.track({ name: 'LOGOUT' });
    this.messageProvider.resetMessages(true);
    this.strategyProvider.resetExpiredSituations();
    this.authToken.setToken('');
    this.authToken.setUserId();
    this.nav.setRoot(
      'Login',
      { isLogin: 'true' },
      { animate: true, direction: 'back' }
    );
    this.menuController.close();
    this.userProvider.setRegistrationDate('');
  }

  public openMenu(): void {
    this.boostMeAnalyticsProvider.track({ name: 'MENU_CHOSEN' });
  }
}
