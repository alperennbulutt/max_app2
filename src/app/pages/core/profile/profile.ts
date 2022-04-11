import { Component } from '@angular/core';
import { IonicPage, NavController, Events, AlertController, Alert } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from 'ng2-translate';
import moment from 'moment';

import { FormValidator } from '../../../providers/utilities/form-validator';

import { AuthorizationProvider } from '../../../providers/authorization-provider';
import { UserProvider, IUser } from '../../../providers/user-provider';
import { BoostMeAnalyticsProvider } from '../../../providers/boost-me-analytics-provider';

@IonicPage({
	name: 'Profile'
})
@Component({
	selector: 'page-profile',
	templateUrl: 'profile.html',
	host: {
		'class': 'coloured-background one-page'
	}
})
export class Profile {
	public user: IUser;
	public isEditing: boolean = false;
	public userForm: FormGroup;
	private userAge: any;

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
	) {
		this.userProvider.fetch().then((data: IUser) => {
			if (data) {
				data.reg_date = moment(data.reg_date, 'MMMM, DD YYYY HH:mm:ss ZZ', 'en').format();
				if (data.custom_data) {
					const customData: any = JSON.parse(data.custom_data);
					this.userAge = customData.age;
				}
				this.user = data;
			}
		}).catch((error: any) => {
			console.log('error', error);
		});
	}

	public toggleEditProfile(): void {
		this.isEditing = ! this.isEditing;

		this.userForm = this.formBuilder.group({
			email: [this.user.email || '', [Validators.required, this.formValidator.emailValidator()]],
			gender: [this.user.gender || 'n', [Validators.required, this.formValidator.buttonSelectedValidator('n')]],
			age: [`00${this.userAge}` || undefined, [Validators.required, this.formValidator.minimumAgeValidator(18)]],
		});
	}

	public updateProfile(): void {
		this.bmAnalytics.track({ name: 'PROFILE_EDIT' });
		const newAge: string = this.userForm.value.age.slice(-2);
		this.userProvider.update({
			email: this.userForm.value.email,
			gender: this.userForm.value.gender,
			custom_data: JSON.stringify({
				age: newAge,
			}),
		}).subscribe((data: any) => {
			this.userProvider.fetch(true).then((data: IUser) => {
				if (data) {
					data.reg_date = moment(data.reg_date, 'MMMM, DD YYYY HH:mm:ss ZZ', 'en').format();
					const customData: any = JSON.parse(data.custom_data);
					this.userAge = customData.age;
					this.user = data;
					this.toggleEditProfile();
				}
			}).catch((error: any) => {
				console.log('error', error);
			});
		}, (error: any) => {
			console.log('error', error);
		});
	}

	public onNotificationToggle(value: any): void {
		this.userProvider.setNotification({
			notification_daily: value,
			notification_others: false,
			notification_hour: 20,
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

	public openFaq(): void {
		this.bmAnalytics.track({ name: 'FAQ_CHOSEN' });

		this.nav.push('Faq');
	}

	public openContact(): void {
		this.nav.push('Info', { pageCode: 'CONTACT' });
	}

	public logout(): void {
		this.bmAnalytics.track({ name: 'LOGOUT' });

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
