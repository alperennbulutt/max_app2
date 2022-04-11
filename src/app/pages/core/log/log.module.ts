import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { Log } from './log';
import { SharedModule } from '../../../app/shared.module';

@NgModule({
	declarations: [
		Log,
	],
	imports: [
		IonicPageModule.forChild(Log),
		SharedModule,
	],
	exports: [
		Log,
	]
})
export class LogModule {}
