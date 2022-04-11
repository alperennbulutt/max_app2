import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { RewardYourself } from './reward-yourself';
import { SharedModule } from '../../../app/shared.module';

@NgModule({
	declarations: [
		RewardYourself,
	],
	imports: [
		IonicPageModule.forChild(RewardYourself),
		SharedModule,
	],
	exports: [
		RewardYourself,
	]
})
export class RewardYourselfModule { }
