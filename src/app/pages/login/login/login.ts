/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @angular-eslint/no-host-metadata-property */
/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, ViewChild } from '@angular/core';
import {
  NavController,
  NavParams,
  AlertController,
  ToastController,
} from '@ionic/angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AuthToken } from 'src/providers/utilities/api/auth-token';
import { EventService } from 'src/app/events-service';
import { FormValidator } from 'src/providers/utilities/form-validator';
import { AuthorizationProvider } from 'src/providers/authorization-provider';
import { ILogin, LoginProvider } from 'src/providers/login-provider';
import { ProgressProvider } from 'src/providers/progress-provider';
import { BoostMeAnalyticsProvider } from 'src/providers/boost-me-analytics-provider';
import { FCMProvider } from 'src/providers/fcm-provider';
import { UserProvider } from 'src/providers/user-provider';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  host: {
    class: 'coloured-background',
  },
})
export class Login {
  @ViewChild(Content) content: Content;

  public showLogin: boolean =
    this.navParams.get('showRegister') === 'true' ? false : true;
  public loginForm: FormGroup;
  public isLoginSubmitted = false;
  public registerForm: FormGroup;
  public isRegisterSubmitted = false;
  public maxBirthDate: string = moment().format('YYYY-MM-DD');
  public minAgeDate: string = moment().year(18).format();
  public noAgeSelected = true;

  constructor(
    private nav: NavController,
    private navParams: NavParams,
    private events: EventService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private alertController: AlertController,
    private authToken: AuthToken,
    private formValidator: FormValidator,
    private authorizationProvider: AuthorizationProvider,
    private loginProvider: LoginProvider,
    private progressProvider: ProgressProvider,
    private bmAnalytics: BoostMeAnalyticsProvider,
    private fcmProvider: FCMProvider,
    private userProvider: UserProvider,
    private toastController: ToastController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, this.formValidator.emailValidator()]],
      password: ['', Validators.required],
    });

    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, this.formValidator.emailValidator()]],
      password: [
        '',
        [Validators.required, this.formValidator.passwordValidator()],
      ],
      gender: [
        'n',
        [Validators.required, this.formValidator.buttonSelectedValidator('n')],
      ],
      age: [
        '',
        [Validators.required, this.formValidator.minimumAgeValidator(18)],
      ],
      terms: [
        false,
        [Validators.required, this.formValidator.checkboxCheckedValidator()],
      ],
    });
  }

  ionViewWillEnter(): void {
    setTimeout(async () => {
      this.events.subscribe('password+requested', () => {
        const toast: any = this.toastController.create({
          message:
            'Je wachtwoord is succesvol aangevraagd. Er is een mail gestuurd met instructies om deze opnieuw in te stellen',
          duration: 6000,
          position: 'bottom',
        });
        toast.present();
      });
    }, 300);
  }

  public formSwitch(event: any): void {
    this.loginForm.patchValue({ password: '' });
    this.registerForm.patchValue({ password: '' });
    if (event) {
      this.loginForm.patchValue({
        email: this.registerForm.value.email,
      });
    } else {
      this.registerForm.patchValue({
        email: this.loginForm.value.email,
      });
    }
  }

  private async loginUser(userData: ILogin, isLogin?: boolean): Promise<void> {
    (await this.loginProvider.login(userData)).subscribe(
      (serverData: any) => {
        if (serverData && serverData.status === 'success') {
          this.authToken.setToken(serverData.token);
          this.authToken.setUserId(serverData.userid);

          this.userProvider.setRegistrationDate();

          // Save FCM token on server-side
          // Token can only be saved server-side after login
          this.fcmProvider.updateToken();

          if (isLogin) {
            this.bmAnalytics.track({ name: 'LOGIN' });
          } else {
            this.bmAnalytics.track({ name: 'SIGNUP' });
          }
          this.nav.navigateRoot('Home');
        } else if (serverData && serverData.message) {
          this.alertUser(serverData.message);
        } else {
          this.alertUser();
        }
      },
      (error: any) => {
        console.log('error', error);
        this.alertUser();
      }
    );
  }

  public login(event: any): void {
    if (event) {
      event.preventDefault();
    }
    this.isLoginSubmitted = true;

    if (this.loginForm.valid) {
      this.loginUser(
        {
          email: this.loginForm.value.email,
          password: this.loginForm.value.password,
        },
        true
      );
    } else {
      this.content.scrollToTop();
    }
  }

  public async register(event: any): Promise<void> {
    if (event) {
      event.preventDefault();
    }
    this.isRegisterSubmitted = true;
    const newAge: string = this.registerForm.value.age.slice(-2);
    if (this.registerForm.valid) {
      (
        await this.loginProvider.register({
          email: this.registerForm.value.email,
          password: this.registerForm.value.password,
          gender: this.registerForm.value.gender,
          custom_data: JSON.stringify({
            age: newAge,
          }),
        })
      ).subscribe(
        (serverData: any) => {
          this.bmAnalytics.track({
            name: 'GENDER',
            value: this.registerForm.value.gender,
          });
          this.bmAnalytics.track({
            name: 'Age',
            value: moment(this.registerForm.value.age).year().toString(),
          });

          if (serverData && serverData.status === 'success') {
            this.loginUser(
              {
                email: this.registerForm.value.email,
                password: this.registerForm.value.password,
              },
              false
            );
          } else if (serverData && serverData.message) {
            this.alertUser(serverData.message);
          } else {
            this.alertUser();
          }
        },
        (error: any) => {
          console.log('error', error);
          this.alertUser();
        }
      );
    } else {
      this.content.scrollToTop();
    }
  }

  private alertUser(message?: string): void {
    this.translate
      .get('GENERAL.default-alert')
      .subscribe((translation: any) => {
        const alert: any = this.alertController.create({
          header: translation.title,
          subHeader: message || translation.subtitle,
          buttons: [
            {
              text: 'Ok',
              role: 'cancel',
            },
          ],
        });
        alert.present();
      });
  }
}
