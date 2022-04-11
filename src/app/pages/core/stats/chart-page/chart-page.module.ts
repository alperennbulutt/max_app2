import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ChartPage } from './chart-page';
import { SharedModule } from '../../../../app/shared.module';

@NgModule({
	declarations: [
		ChartPage,
	],
	imports: [
		IonicPageModule.forChild(ChartPage),
		SharedModule,
	],
	exports: [
		ChartPage,
	]
})
export class ChartPageModule {}
