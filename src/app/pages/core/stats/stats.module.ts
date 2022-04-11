import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { Stats } from './stats';
import { SharedModule } from '../../../app/shared.module';

@NgModule({
	declarations: [
		Stats,
	],
	imports: [
		IonicPageModule.forChild(Stats),
		SharedModule,
	],
	exports: [
		Stats,
	]
})
export class StatsModule {}
