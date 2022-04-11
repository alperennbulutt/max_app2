import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { PasswordForgot } from './password-forgot';
import { SharedModule } from '../../../app/shared.module';

@NgModule({
	declarations: [
		PasswordForgot,
	],
	imports: [
		IonicPageModule.forChild(PasswordForgot),
		SharedModule,
	],
	exports: [
		PasswordForgot,
	]
})
export class PasswordForgotModule {}
