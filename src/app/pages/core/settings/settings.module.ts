import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { Settings } from './settings';
import { SharedModule } from '../../../app/shared.module';

@NgModule({
	declarations: [
		Settings,
	],
	imports: [
		IonicPageModule.forChild(Settings),
		SharedModule,
	],
	exports: [
		Settings,
	]
})
export class SettingsModule { }
