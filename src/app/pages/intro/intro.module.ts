import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { Intro } from './intro';
import { SharedModule } from '../../app/shared.module';

@NgModule({
	declarations: [
		Intro,
	],
	imports: [
		IonicPageModule.forChild(Intro),
		SharedModule,
	],
	exports: [
		Intro,
	]
})
export class IntroModule {}
