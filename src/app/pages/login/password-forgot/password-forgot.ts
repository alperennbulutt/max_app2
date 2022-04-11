import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content, AlertController, Alert, Events } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from 'ng2-translate';

import { FormValidator } from '../../../providers/utilities/form-validator';
import { LoginProvider } from '../../../providers/login-provider';

@IonicPage({
	name: 'PasswordForgot',
	segment: 'password-forgot'
})
@Component({
	selector: 'page-password-forgot',
	templateUrl: 'password-forgot.html',
	host: {
		'class': 'coloured-background'
	}
})
export class PasswordForgot {
	@ViewChild(Content) content: Content;

	public passwordForm: FormGroup;
	public isPasswordSubmitted: boolean = false;

	constructor(
		private nav: NavController,
		private navParams: NavParams,
		private formBuilder: FormBuilder,
		private translate: TranslateService,
		private alertController: AlertController,
		private formValidator: FormValidator,
		private loginProvider: LoginProvider,
		private events: Events
	) {
		this.passwordForm = this.formBuilder.group({
			email: [this.navParams.get('email') || '', [Validators.required, this.formValidator.emailValidator]],
		});
	}

	public requestPassword(event: any): void {
		if (event) {
			event.preventDefault();
		}
		this.isPasswordSubmitted = true;

		if (this.passwordForm.valid) {
			this.loginProvider.forgotPassword({
				email: this.passwordForm.value.email
			}).subscribe((serverData: any) => {
				if (serverData && serverData.status === 'success') {
					this.nav.pop();
					this.events.publish('password+requested');
				} else if (serverData && serverData.message) {
					this.alertUser(serverData.message);
				} else {
					this.alertUser('Dit e-mail adres is niet bij ons bekend.');
				}
			}, (error: any) => {
				console.log('error', error);
				this.alertUser();
			});
		} else {
			this.content.scrollToTop();
		}
	}

	private alertUser(message?: string): void {
		this.translate.get('GENERAL.default-alert').subscribe((translation: any) => {
			let alert: Alert = this.alertController.create({
				title: translation.title,
				subTitle: message || translation.subtitle,
				buttons: [{
					text: 'Ok',
					role: 'cancel'
				}]
			});
			alert.present();
		});
	}
}
