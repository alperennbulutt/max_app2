import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { Info } from './info';
import { SharedModule } from '../../../app/shared.module';

@NgModule({
	declarations: [
		Info,
	],
	imports: [
		IonicPageModule.forChild(Info),
		SharedModule,
	],
	exports: [
		Info,
	]
})
export class InfoModule {}
