import { Component } from '@angular/core';
import { IonicPage, NavController, Events, AlertController, Alert, Platform } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from 'ng2-translate';
import moment from 'moment';

import { FormValidator } from '../../../providers/utilities/form-validator';

import { AuthorizationProvider } from '../../../providers/authorization-provider';
import { UserProvider, IUser } from '../../../providers/user-provider';
import { BoostMeAnalyticsProvider } from '../../../providers/boost-me-analytics-provider';
import { Device } from '@ionic-native/device';
import { AppVersion } from '@ionic-native/app-version';

@IonicPage({
	name: 'Settings'
})
@Component({
	selector: 'page-settings',
	templateUrl: 'settings.html',
	host: {
		'class': 'coloured-background one-page'
	}
})
export class Settings {
	public user: IUser;
	public isEditing: boolean = false;
	public userForm: FormGroup;
	public recievingHour: any;

	public appName: string = '';
	public appVersionNumber: string = '';
	public appVersionCode: string = '';
	public appPlatformName: string = '';
	public appPlatformVersion: string = '';

	constructor(
		private nav: NavController,
		private alertController: AlertController,
		private events: Events,
		private translate: TranslateService,
		private formBuilder: FormBuilder,
		private formValidator: FormValidator,
		private userProvider: UserProvider,
		private bmAnalytics: BoostMeAnalyticsProvider,

		public authorizationProvider: AuthorizationProvider,
		private appVersion: AppVersion,
		private platform: Platform,
		private device: Device,
	) {
		this.userProvider.fetch().then((data: IUser) => {
			if (data) {
				this.user = data;
				if (!this.user.notification_hour) {
					this.user.notification_hour = 22;
				}
				this.recievingHour = moment().hours(this.user.notification_hour).format()
			}
		}).catch((error: any) => {
			console.log('error', error);
		});

		this.appVersion.getAppName().then( (name: any) => {
			this.appName = name;
		});
		this.appVersion.getVersionNumber().then( (versionNumber: any) => {
			this.appVersionNumber = versionNumber;
		});
		this.appVersion.getVersionCode().then( (versionCode: any) => {
			this.appVersionCode = versionCode;
		});
		this.platform.ready().then(() => {
			this.appPlatformName = this.device.platform;
			this.appPlatformVersion = this.device.version;
		});
	}

	ionViewWillEnter(): void {
		this.bmAnalytics.track({ name: 'SETTINGS' });
	}

	public toggleEditProfile(): void {
		this.isEditing = !this.isEditing;
	}

	public onNotificationToggle(value: any, isDaily?: boolean): void {
		let otherValue: boolean;
		if (isDaily) {
			otherValue = this.user.notification_others;
		} else {
			otherValue = this.user.notification_daily;
		}

		if (isDaily !== undefined) {
			this.bmAnalytics.track({ name: 'NOTIFICATION_DAILY', value: value ? 1 : 2 });
		} else {
			this.bmAnalytics.track({ name: 'NOTIFICATION_OTHERS', value: value ? 1 : 2 });
		}

		this.userProvider.setNotification({
			notification_daily: value,
			notification_others: otherValue,
			notification_hour: moment(this.recievingHour).hours()
		}).subscribe((data: any) => {
			// @NOTE: Successfully updated notification settings
		}, (error: any) => {
			this.translate.get('GENERAL.default-alert').subscribe((translation: any) => {
				let alert: Alert = this.alertController.create({
					title: translation.title,
					subTitle: translation.subtitle,
					buttons: [{
						text: 'Ok',
						role: 'cancel'
					}]
				});
				alert.present();
			});
			setTimeout(() => {
				this.user.notification_daily = !value;
			});
			console.log('error', error);
		});
	}

	public logout(): void {
		this.translate.get('GENERAL').subscribe((translations: any) => {
			let alert: Alert = this.alertController.create({
				title: 'Uitloggen',
				subTitle: 'Weet je zeker dat je wil uitloggen?',
				buttons: [{
					text: translations['reject-text'],
					role: 'cancel'
				}, {
					text: translations['confirm-text'],
					handler: () => {
						this.events.publish('user:logout');
					}
				}]
			});
			alert.present();
		});
	}
}
