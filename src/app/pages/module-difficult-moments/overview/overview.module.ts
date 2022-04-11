import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ModuleDifficultMomentsOverview } from './overview';
import { SharedModule } from '../../../app/shared.module';

@NgModule({
	declarations: [
		ModuleDifficultMomentsOverview,
	],
	imports: [
		IonicPageModule.forChild(ModuleDifficultMomentsOverview),
		SharedModule,
	],
	exports: [
		ModuleDifficultMomentsOverview,
	]
})
export class ModuleDifficultMomentsOverviewModule {}
