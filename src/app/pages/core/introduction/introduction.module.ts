import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { IntroductionPage } from './introduction';
import { SharedModule } from '../../../app/shared.module';

@NgModule({
	declarations: [
		IntroductionPage,
	],
	imports: [
		IonicPageModule.forChild(IntroductionPage),
		SharedModule,
	],
	exports: [
		IntroductionPage,
	]
})
export class IntroductionPageModule {}
